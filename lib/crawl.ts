import puppeteer, { type Page } from "puppeteer";

import { AppError } from "./app-error";
import { getDefaultProxyConfig, type ProxyConfig } from "./proxy";

export type CrawlResponseType = "html" | "json" | "markdown" | "txt";

export type CrawlPayload = {
  url: string;
  finalUrl: string;
  title: string;
  html: string;
  text: string;
  links: Array<{
    text: string;
    href: string;
  }>;
  executionResult: unknown;
};

const launchArgs = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function normalizeExecutionResult(value: unknown) {
  if (value === undefined) {
    return null;
  }

  return value;
}

async function executePageScript(page: Page, jsCode?: string) {
  if (!jsCode) {
    return null;
  }

  try {
    const result = await page.evaluate(async (source) => {
      const serialize = (value: unknown): unknown => {
        if (
          value === null ||
          value === undefined ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return value ?? null;
        }

        try {
          return JSON.parse(JSON.stringify(value));
        } catch {
          return String(value);
        }
      };

      const fn = new Function(source);
      const value = await fn();

      return serialize(value);
    }, jsCode);

    return normalizeExecutionResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "JavaScript execution failed.";
    throw new AppError(`JavaScript execution failed: ${message}`, 400);
  }
}

export async function crawlPage(
  url: string,
  jsCode?: string,
  proxyConfig?: ProxyConfig | null,
): Promise<CrawlPayload> {
  const resolvedProxyConfig = proxyConfig ?? getDefaultProxyConfig();
  const browserLaunchArgs = [...launchArgs];

  if (resolvedProxyConfig?.server) {
    browserLaunchArgs.push(`--proxy-server=${resolvedProxyConfig.server}`);
  }

  if (resolvedProxyConfig?.bypass) {
    browserLaunchArgs.push(`--proxy-bypass-list=${resolvedProxyConfig.bypass}`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: browserLaunchArgs,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(defaultUserAgent);

    if (resolvedProxyConfig?.server && resolvedProxyConfig.username) {
      await page.authenticate({
        username: resolvedProxyConfig.username,
        password: resolvedProxyConfig.password ?? "",
      });
    }

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const executionResult = await executePageScript(page, jsCode);

    const payload = await page.evaluate((inputUrl, scriptResult) => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
        .map((anchor) => ({
          text: anchor.innerText?.trim(),
          href: anchor.href,
        }))
        .filter((link) => link.href)
        .slice(0, 100);

      return {
        url: inputUrl,
        finalUrl: window.location.href,
        title: document.title?.trim(),
        html: document.documentElement.outerHTML,
        text: document.body?.innerText?.trim() ?? "",
        links,
        executionResult: scriptResult,
      };
    }, url, executionResult);

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Failed to crawl the requested page.";
    throw new AppError(message, 502);
  } finally {
    await browser.close();
  }
}
