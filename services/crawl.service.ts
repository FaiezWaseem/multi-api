import { crawlPage, type CrawlPayload, type CrawlResponseType } from "../lib/crawl";
import type { ProxyConfig } from "../lib/proxy";

function serializeExecutionResult(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toMarkdown(payload: CrawlPayload) {
  const sections = [`# ${payload.title || "Untitled Page"}`, "", `Source: ${payload.finalUrl}`];

  if (payload.text) {
    sections.push("", payload.text);
  }

  if (payload.executionResult !== null) {
    sections.push("", "## JavaScript Result", "", "```json", serializeExecutionResult(payload.executionResult), "```");
  }

  if (payload.links.length > 0) {
    sections.push("", "## Links");
    for (const link of payload.links.slice(0, 20)) {
      const label = link.text || link.href;
      sections.push(`- [${label}](${link.href})`);
    }
  }

  return sections.join("\n");
}

function toText(payload: CrawlPayload) {
  const sections = [
    `Title: ${payload.title || "Untitled Page"}`,
    `URL: ${payload.finalUrl}`,
  ];

  if (payload.text) {
    sections.push("", payload.text);
  }

  if (payload.executionResult !== null) {
    sections.push("", "JavaScript Result:", serializeExecutionResult(payload.executionResult));
  }

  return sections.join("\n");
}

export async function getCrawlResults(
  url: string,
  responseType: CrawlResponseType = "json",
  jsCode?: string,
  proxy?: ProxyConfig,
) {
  const payload = await crawlPage(url, jsCode, proxy);

  if (responseType === "html") {
    return {
      url: payload.url,
      finalUrl: payload.finalUrl,
      responseType,
      content: payload.html,
      executionResult: payload.executionResult,
    };
  }

  if (responseType === "markdown") {
    return {
      url: payload.url,
      finalUrl: payload.finalUrl,
      responseType,
      content: toMarkdown(payload),
      executionResult: payload.executionResult,
    };
  }

  if (responseType === "txt") {
    return {
      url: payload.url,
      finalUrl: payload.finalUrl,
      responseType,
      content: toText(payload),
      executionResult: payload.executionResult,
    };
  }

  return {
    url: payload.url,
    finalUrl: payload.finalUrl,
    responseType,
    title: payload.title,
    text: payload.text,
    html: payload.html,
    links: payload.links,
    executionResult: payload.executionResult,
  };
}
