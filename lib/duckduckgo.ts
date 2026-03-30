/// <reference lib="dom" />

import puppeteer from "puppeteer";

export type DuckDuckGoResult = {
  title: string;
  url: string;
  snippet: string;
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

export async function searchDuckDuckGo(query: string, limit: number, region?: string) {
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
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector(".result", {
      timeout: 10000,
    });

    const results = await page.evaluate(() => {
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

      return items;
    });

    const html = await page.content();

    return results.slice(0, limit).map((item) => ({
      title: item.title,
      url: getRealDuckDuckGoUrl(item.link),
      snippet: item.snippet,
    }));
  } finally {
    await browser.close();
  }
}
