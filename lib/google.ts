/// <reference lib="dom" />

import { launch } from "cloakbrowser/puppeteer";
import type { Page } from "puppeteer-core";

import type { ProxyConfig } from "./proxy";
import { getDefaultProxyConfig } from "./proxy";

export type GoogleResult = {
  title: string;
  url: string;
  snippet: string;
};

export type SearchResponseType = "html" | "json" | "markdown" | "txt";

export type GoogleSearchPayload = {
  results: GoogleResult[];
  html: string;
  text: string;
};

type BaseGoogleSearchResult = GoogleResult;

const resultsPerPage = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildGoogleSearchUrl(query: string, region?: string) {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);

  const [gl, hl] = (region ?? "us-en").split("-");

  if (gl) {
    url.searchParams.set("gl", gl.toLowerCase());
  }

  if (hl) {
    url.searchParams.set("hl", hl.toLowerCase());
  }

  return url.toString();
}

async function waitForResults(page: Page) {
  try {
    await page.waitForFunction(
      () => {
        const resultBlocks = document.querySelectorAll("a h3");
        return resultBlocks.length > 0;
      },
      { timeout: 30000 },
    );
  } catch {
    await sleep(3000);
  }
}

async function extractPageResults(page: Page) {
  return page.evaluate<BaseGoogleSearchResult[]>(() => {
    const seen = new Set<string>();
    const items: BaseGoogleSearchResult[] = [];
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));

    for (const anchor of anchors) {
      const titleElement = anchor.querySelector("h3");
      const title = titleElement?.textContent?.trim();
      const href = anchor.getAttribute("href");

      if (!title || !href) {
        continue;
      }

      let resolvedUrl: string | null = null;

      try {
        const url = new URL(href, window.location.origin);

        if (url.pathname === "/url") {
          resolvedUrl = url.searchParams.get("q");
        } else if (url.protocol.startsWith("http")) {
          resolvedUrl = url.toString();
        }
      } catch {
        resolvedUrl = null;
      }

      if (!resolvedUrl) {
        continue;
      }

      if (
        resolvedUrl.startsWith("https://accounts.google.com/") ||
        resolvedUrl.startsWith("https://support.google.com/") ||
        resolvedUrl.includes("/search?")
      ) {
        continue;
      }

      if (seen.has(resolvedUrl)) {
        continue;
      }

      seen.add(resolvedUrl);

      const container =
        anchor.closest("div[data-snc]") ??
        anchor.closest("div.g") ??
        anchor.closest("div[data-hveid]") ??
        anchor.parentElement;

      const snippet =
        Array.from(container?.querySelectorAll<HTMLElement>("span, div") ?? [])
          .map((element) => element.innerText?.trim())
          .find((text) => Boolean(text) && text !== title) ?? "";

      items.push({
        title,
        url: resolvedUrl,
        snippet,
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
      anchors.find((anchor) => anchor.id === "pnnext");

    return nextLink ? new URL(nextLink.href, window.location.origin).toString() : null;
  });
}

export async function searchGoogle(
  query: string,
  limit: number,
  region?: string,
  proxyConfig?: ProxyConfig | null,
) {
  const resolvedProxyConfig = proxyConfig ?? getDefaultProxyConfig();
  const browser = await launch({
    headless: true,
    humanize: true,
    proxy: resolvedProxyConfig
      ? {
          server: resolvedProxyConfig.server,
          username: resolvedProxyConfig.username,
          password: resolvedProxyConfig.password,
          bypass: resolvedProxyConfig.bypass,
        }
      : undefined,
  });

  const allResults: GoogleResult[] = [];
  const seenUrls = new Set<string>();
  const htmlPages: string[] = [];
  const textPages: string[] = [];
  const maxPage = Math.max(1, Math.ceil(limit / resultsPerPage) + 1);
  let currentUrl: string | null = buildGoogleSearchUrl(query, region);

  try {
    const page = await browser.newPage();

    for (let pageNumber = 1; currentUrl && pageNumber <= maxPage; pageNumber += 1) {
      await page.goto(currentUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await sleep(3000);
      await waitForResults(page);

      htmlPages.push(await page.content());
      textPages.push(await page.evaluate(() => document.body.innerText.trim()));

      const pageResults = await extractPageResults(page);

      for (const result of pageResults) {
        if (seenUrls.has(result.url)) {
          continue;
        }

        seenUrls.add(result.url);
        allResults.push(result);

        if (allResults.length >= limit) {
          break;
        }
      }

      if (allResults.length >= limit) {
        break;
      }

      const nextPageUrl = await findNextPageUrl(page);

      if (!nextPageUrl || nextPageUrl === currentUrl) {
        break;
      }

      currentUrl = nextPageUrl;
    }

    return {
      results: allResults.slice(0, limit),
      html: htmlPages.join("\n<!-- page-break -->\n"),
      text: textPages.join("\n\n"),
    } satisfies GoogleSearchPayload;
  } finally {
    await browser.close();
  }
}
