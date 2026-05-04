/// <reference lib="dom" />

import { launch } from "cloakbrowser/puppeteer";
import type { Page } from "puppeteer-core";

import type { ProxyConfig } from "./proxy";
import { getDefaultProxyConfig } from "./proxy";

export type SearchResponseType = "html" | "json" | "markdown" | "txt";

export type YelpReview = {
  author?: string;
  rating?: number;
  text?: string;
  date?: string;
};

export type YelpContact = {
  phone?: string;
  address?: string;
  website?: string;
};

export type YelpEnrichment = {
  email?: string;
  website?: string;
};

export type YelpResult = {
  name: string;
  url: string;
  contact?: YelpContact;
  reviews?: YelpReview[];
  enrichment?: YelpEnrichment;
};

export type YelpScraperEnrichmentOptions = {
  findEmail?: boolean;
  findWebsite?: boolean;
};

export type YelpScraperOptions = {
  limit?: number;
  includeReviews?: boolean;
  includeContact?: boolean;
  enrichment?: YelpScraperEnrichmentOptions;
  headless?: boolean;
  humanize?: boolean;
  waitMs?: number;
  proxy?: ProxyConfig | null;
};

export type YelpSearchPayload = {
  results: YelpResult[];
  html: string;
  text: string;
};

type BaseYelpResult = Omit<YelpResult, "contact" | "reviews" | "enrichment">;

const DEFAULT_OPTIONS: Required<Omit<YelpScraperOptions, "proxy">> = {
  limit: 10,
  includeReviews: false,
  includeContact: false,
  enrichment: {
    findEmail: false,
    findWebsite: false,
  },
  headless: true,
  humanize: true,
  waitMs: 3000,
};

const resultsPerPage = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildSearchUrl(query: string, location: string) {
  const url = new URL("https://www.yelp.com/search");
  url.searchParams.set("find_desc", query);
  url.searchParams.set("find_loc", location);
  return url.toString();
}

async function waitForResults(page: Page) {
  try {
    await page.waitForFunction(
      () => {
        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/biz/"]'));
        return links.some((link) => Boolean(link.textContent?.trim()));
      },
      { timeout: 30000 },
    );
  } catch {
    await sleep(3000);
  }
}

async function extractPageResults(page: Page) {
  return page.evaluate<BaseYelpResult[]>(() => {
    const seen = new Set<string>();
    const items: BaseYelpResult[] = [];
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/biz/"]'));

    for (const link of links) {
      const name = link.textContent?.trim();
      const href = link.getAttribute("href");

      if (!name || !href || href.includes("/adredir?")) {
        continue;
      }

      const url = new URL(href, "https://www.yelp.com");
      url.search = "";
      url.hash = "";

      const key = url.pathname.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push({
        name,
        url: url.toString(),
      });
    }

    return items;
  });
}

async function findNextPageUrl(page: Page) {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const nextLink =
      anchors.find((anchor) => anchor.getAttribute("aria-label")?.toLowerCase().includes("next")) ??
      anchors.find((anchor) => anchor.textContent?.trim().toLowerCase() === "next") ??
      anchors.find((anchor) => anchor.href.includes("/search?") && anchor.textContent?.trim() === ">");

    return nextLink ? new URL(nextLink.href, window.location.origin).toString() : null;
  });
}

async function extractBusinessDetails(page: Page) {
  return page.evaluate<Pick<YelpResult, "contact" | "reviews" | "enrichment">>(() => {
    const scripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    );
    const parsedJson = scripts.flatMap((script) => {
      try {
        const json = JSON.parse(script.textContent ?? "null");
        return Array.isArray(json) ? json : [json];
      } catch {
        return [];
      }
    });

    const flattened = parsedJson.flatMap((item) => {
      if (item && typeof item === "object" && Array.isArray((item as { "@graph"?: unknown[] })["@graph"])) {
        return (item as { "@graph": unknown[] })["@graph"];
      }

      return [item];
    });

    const businessNode =
      flattened.find(
        (item) =>
          item &&
          typeof item === "object" &&
          ["LocalBusiness", "HomeAndConstructionBusiness", "Organization"].includes(
            String((item as { "@type"?: string })["@type"] ?? ""),
          ),
      ) ?? null;

    const reviewNodes = flattened.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const itemRecord = item as {
        review?: unknown[] | unknown;
        "@type"?: unknown;
      };

      if (Array.isArray(itemRecord.review)) {
        return itemRecord.review;
      }

      if (itemRecord.review && typeof itemRecord.review === "object") {
        return [itemRecord.review];
      }

      if (String(itemRecord["@type"] ?? "") === "Review") {
        return [itemRecord];
      }

      return [];
    });

    const business = businessNode as
      | {
          telephone?: string;
          url?: string;
          address?:
            | string
            | {
                streetAddress?: string;
                addressLocality?: string;
                addressRegion?: string;
                postalCode?: string;
              };
        }
      | null;

    const contact: YelpContact = {};
    const enrichment: YelpEnrichment = {};

    if (business?.telephone) {
      contact.phone = business.telephone;
    }

    if (business?.url) {
      contact.website = business.url;
    }

    const externalWebsiteLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).find((anchor) => {
      const href = anchor.getAttribute("href") ?? "";
      return href.includes("/biz_redir?") || anchor.textContent?.trim().toLowerCase() === "business website";
    });

    const resolvedExternalWebsite = (() => {
      const href = externalWebsiteLink?.getAttribute("href");
      if (!href) {
        return undefined;
      }

      try {
        const url = new URL(href, window.location.origin);
        const redirectedUrl = url.searchParams.get("url");
        return redirectedUrl ? decodeURIComponent(redirectedUrl) : url.toString();
      } catch {
        return undefined;
      }
    })();

    if (resolvedExternalWebsite) {
      enrichment.website = resolvedExternalWebsite;
    }

    const emailHref = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]'))[0]?.href;
    if (emailHref) {
      enrichment.email = emailHref.replace(/^mailto:/i, "").trim() || undefined;
    }

    if (!enrichment.email) {
      const bodyText = document.body?.innerText ?? "";
      const emailMatch = bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if (emailMatch?.[0]) {
        enrichment.email = emailMatch[0];
      }
    }

    if (typeof business?.address === "string") {
      contact.address = business.address;
    } else if (business?.address) {
      const parts = [
        business.address.streetAddress,
        business.address.addressLocality,
        business.address.addressRegion,
        business.address.postalCode,
      ].filter(Boolean);

      if (parts.length > 0) {
        contact.address = parts.join(", ");
      }
    }

    const reviews = reviewNodes
      .map((review) => {
        if (!review || typeof review !== "object") {
          return null;
        }

        const item = review as {
          author?: { name?: string } | string;
          reviewRating?: { ratingValue?: string | number };
          description?: string;
          datePublished?: string;
          reviewBody?: string;
        };

        const author =
          typeof item.author === "string"
            ? item.author
            : typeof item.author?.name === "string"
              ? item.author.name
              : undefined;

        const ratingValue = item.reviewRating?.ratingValue;
        const rating =
          typeof ratingValue === "number"
            ? ratingValue
            : typeof ratingValue === "string"
              ? Number(ratingValue)
              : undefined;

        const text = item.description ?? item.reviewBody;

        if (!author && !text && rating === undefined) {
          return null;
        }

        return {
          author,
          rating: Number.isFinite(rating) ? rating : undefined,
          text,
          date: item.datePublished,
        } satisfies YelpReview;
      })
      .filter((review): review is YelpReview => review !== null)
      .slice(0, 5);

    return {
      contact: Object.keys(contact).length > 0 ? contact : undefined,
      reviews: reviews.length > 0 ? reviews : undefined,
      enrichment: Object.keys(enrichment).length > 0 ? enrichment : undefined,
    };
  });
}

async function enrichBusiness(page: Page, result: YelpResult, options: Required<Omit<YelpScraperOptions, "proxy">>) {
  if (
    !options.includeContact &&
    !options.includeReviews &&
    !options.enrichment.findEmail &&
    !options.enrichment.findWebsite
  ) {
    return result;
  }

  await page.goto(result.url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await sleep(options.waitMs);

  const details = await extractBusinessDetails(page);

  return {
    ...result,
    ...(options.includeContact ? { contact: details.contact } : {}),
    ...(options.includeReviews ? { reviews: details.reviews } : {}),
    ...(options.enrichment.findEmail || options.enrichment.findWebsite
      ? {
          enrichment:
            Object.keys({
              ...(options.enrichment.findEmail && details.enrichment?.email
                ? { email: details.enrichment.email }
                : {}),
              ...(options.enrichment.findWebsite && details.enrichment?.website
                ? { website: details.enrichment.website }
                : {}),
            }).length > 0
              ? {
                  ...(options.enrichment.findEmail && details.enrichment?.email
                    ? { email: details.enrichment.email }
                    : {}),
                  ...(options.enrichment.findWebsite && details.enrichment?.website
                    ? { website: details.enrichment.website }
                    : {}),
                }
              : undefined,
        }
      : {}),
  };
}

function toResultText(result: YelpResult, index: number) {
  const parts = [`${index + 1}. ${result.name}`, result.url];

  if (result.contact?.phone) {
    parts.push(`Phone: ${result.contact.phone}`);
  }

  if (result.contact?.address) {
    parts.push(`Address: ${result.contact.address}`);
  }

  if (result.contact?.website) {
    parts.push(`Website: ${result.contact.website}`);
  }

  if (result.enrichment?.email) {
    parts.push(`Email: ${result.enrichment.email}`);
  }

  if (result.enrichment?.website) {
    parts.push(`External Website: ${result.enrichment.website}`);
  }

  if (result.reviews?.length) {
    for (const review of result.reviews) {
      const reviewBits = [
        review.author ? `Author: ${review.author}` : null,
        review.rating !== undefined ? `Rating: ${review.rating}` : null,
        review.date ? `Date: ${review.date}` : null,
        review.text ? `Text: ${review.text}` : null,
      ].filter(Boolean);

      if (reviewBits.length > 0) {
        parts.push(`Review: ${reviewBits.join(" | ")}`);
      }
    }
  }

  return parts.join("\n");
}

export function formatYelpResultsAsMarkdown(results: YelpResult[]) {
  return results
    .map((result, index) => {
      const lines = [`${index + 1}. [${result.name}](${result.url})`];

      if (result.contact?.phone) {
        lines.push(`Phone: ${result.contact.phone}`);
      }

      if (result.contact?.address) {
        lines.push(`Address: ${result.contact.address}`);
      }

      if (result.contact?.website) {
        lines.push(`Website: ${result.contact.website}`);
      }

      if (result.enrichment?.email) {
        lines.push(`Email: ${result.enrichment.email}`);
      }

      if (result.enrichment?.website) {
        lines.push(`External Website: ${result.enrichment.website}`);
      }

      if (result.reviews?.length) {
        for (const review of result.reviews) {
          const reviewBits = [
            review.author ? `author: ${review.author}` : null,
            review.rating !== undefined ? `rating: ${review.rating}` : null,
            review.date ? `date: ${review.date}` : null,
            review.text ? review.text : null,
          ].filter(Boolean);

          if (reviewBits.length > 0) {
            lines.push(`Review: ${reviewBits.join(" | ")}`);
          }
        }
      }

      return lines.join("\n\n");
    })
    .join("\n\n");
}

export function formatYelpResultsAsText(results: YelpResult[]) {
  return results.map((result, index) => toResultText(result, index)).join("\n\n");
}

export async function searchYelp(query: string, location: string, options: YelpScraperOptions = {}) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    enrichment: {
      ...DEFAULT_OPTIONS.enrichment,
      ...options.enrichment,
    },
    limit: Math.max(1, Math.floor(options.limit ?? DEFAULT_OPTIONS.limit)),
  };

  const resolvedProxyConfig = options.proxy ?? getDefaultProxyConfig();
  const browser = await launch({
    headless: resolvedOptions.headless,
    humanize: resolvedOptions.humanize,
    proxy: resolvedProxyConfig
      ? {
          server: resolvedProxyConfig.server,
          username: resolvedProxyConfig.username,
          password: resolvedProxyConfig.password,
          bypass: resolvedProxyConfig.bypass,
        }
      : undefined,
  });

  const searchPage = await browser.newPage();
  const detailPage =
    resolvedOptions.includeContact ||
    resolvedOptions.includeReviews ||
    resolvedOptions.enrichment.findEmail ||
    resolvedOptions.enrichment.findWebsite
      ? await browser.newPage()
      : null;

  const allResults: YelpResult[] = [];
  const seenBusinesses = new Set<string>();
  const htmlPages: string[] = [];
  const textPages: string[] = [];
  const maxPage = Math.max(1, Math.ceil(resolvedOptions.limit / resultsPerPage) + 1);
  let currentUrl: string | null = buildSearchUrl(query, location);

  try {
    for (let pageNumber = 1; currentUrl && pageNumber <= maxPage; pageNumber += 1) {
      await searchPage.goto(currentUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await sleep(resolvedOptions.waitMs);
      await waitForResults(searchPage);

      htmlPages.push(await searchPage.content());
      textPages.push(await searchPage.evaluate(() => document.body.innerText.trim()));

      const pageResults = await extractPageResults(searchPage);

      for (const pageResult of pageResults) {
        if (seenBusinesses.has(pageResult.url)) {
          continue;
        }

        seenBusinesses.add(pageResult.url);

        const baseResult: YelpResult = {
          ...pageResult,
        };

        const enrichedResult =
          detailPage === null ? baseResult : await enrichBusiness(detailPage, baseResult, resolvedOptions);

        allResults.push(enrichedResult);

        if (allResults.length >= resolvedOptions.limit) {
          break;
        }
      }

      if (allResults.length >= resolvedOptions.limit) {
        break;
      }

      const nextPageUrl = await findNextPageUrl(searchPage);
      if (!nextPageUrl || nextPageUrl === currentUrl) {
        break;
      }

      currentUrl = nextPageUrl;
    }

    return {
      results: allResults.slice(0, resolvedOptions.limit),
      html: htmlPages.join("\n<!-- page-break -->\n"),
      text: textPages.join("\n\n"),
    } satisfies YelpSearchPayload;
  } finally {
    await browser.close();
  }
}
