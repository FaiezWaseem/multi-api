/// <reference lib="dom" />

import puppeteer, { type Page } from "puppeteer";

export type DuckDuckGoResult = {
  title: string;
  url: string;
  snippet: string;
};

export type SearchResponseType = "html" | "json" | "markdown" | "txt";

export type DuckDuckGoSearchPayload = {
  results: DuckDuckGoResult[];
  html: string;
  text: string;
};

const launchArgs = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type DuckDuckGoPageResult = {
  title: string;
  link: string;
  snippet: string;
};

type DuckDuckGoNextPage = {
  action: string;
  params: Record<string, string>;
} | null;

function getRealDuckDuckGoUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const encodedDestination = parsedUrl.searchParams.get("uddg");

    if (parsedUrl.hostname !== "duckduckgo.com" || !encodedDestination) {
      return url;
    }

    return decodeURIComponent(encodedDestination);
  } catch {
    return url;
  }
}

function getAbsoluteDuckDuckGoUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, "https://html.duckduckgo.com").toString();
}

async function extractPageData(page: Page) {
  return page.evaluate(() => {
    const items: DuckDuckGoPageResult[] = [];

    document.querySelectorAll(".result").forEach((div) => {
      const titleEl = div.querySelector<HTMLAnchorElement>(".result__title a");
      const snippetEl = div.querySelector<HTMLElement>(".result__snippet");

      if (!titleEl) {
        return;
      }

      items.push({
        title: titleEl.innerText.trim(),
        link: titleEl.href,
        snippet: snippetEl ? snippetEl.innerText.trim() : "",
      });
    });

    const nextForm = document.querySelector<HTMLFormElement>(".nav-link form");

    if (!nextForm) {
      return { items, nextPage: null as DuckDuckGoNextPage };
    }

    const params: Record<string, string> = {};
    const formData = new FormData(nextForm);

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        params[key] = value;
      }
    }

    return {
      items,
      nextPage: {
        action: nextForm.getAttribute("action") ?? "/html/",
        params,
      } satisfies DuckDuckGoNextPage,
    };
  });
}

export async function searchDuckDuckGo(
  query: string,
  limit: number,
  region?: string,
): Promise<DuckDuckGoSearchPayload> {
  const searchParams = new URLSearchParams({
    q: query,
  });

  if (region) {
    searchParams.set("kl", region);
  }

  const url = `https://html.duckduckgo.com/html/?${searchParams.toString()}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: launchArgs,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(defaultUserAgent);
    const normalizedResults: DuckDuckGoResult[] = [];
    const seenUrls = new Set<string>();
    const htmlPages: string[] = [];
    const textPages: string[] = [];
    let nextPageUrl: string | null = url;
    let pageCount = 0;

    while (nextPageUrl && normalizedResults.length < limit && pageCount < 10) {
      await page.goto(nextPageUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForSelector(".result", {
        timeout: 10000,
      });

      const { items, nextPage } = await extractPageData(page);
      const html = await page.content();
      const text = await page.evaluate(() => document.body.innerText.trim());

      htmlPages.push(html);
      textPages.push(text);

      for (const item of items) {
        const realUrl = getRealDuckDuckGoUrl(item.link);

        if (seenUrls.has(realUrl)) {
          continue;
        }

        seenUrls.add(realUrl);
        normalizedResults.push({
          title: item.title,
          url: realUrl,
          snippet: item.snippet,
        });

        if (normalizedResults.length >= limit) {
          break;
        }
      }

      if (!nextPage || normalizedResults.length >= limit) {
        nextPageUrl = null;
      } else {
        nextPageUrl = `${getAbsoluteDuckDuckGoUrl(nextPage.action)}?${new URLSearchParams(nextPage.params).toString()}`;
      }

      pageCount += 1;
    }

    return {
      results: normalizedResults.slice(0, limit),
      html: htmlPages.join("\n<!-- page-break -->\n"),
      text: textPages.join("\n\n"),
    };
  } finally {
    await browser.close();
  }
}
