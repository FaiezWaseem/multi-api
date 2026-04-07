import { crawlPage } from "../lib/crawl";
import { searchDuckDuckGo } from "../lib/duckduckgo";
import { AppError } from "../lib/app-error";

type ExtractedEmail = {
  email: string;
  sourceUrl: string;
  type: "business" | "other-public";
};

const blockedSearchHosts = new Set([
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wikipedia.org",
  "crunchbase.com",
  "zoominfo.com",
  "glassdoor.com",
  "indeed.com",
]);

const preferredLocalParts = new Set([
  "admin",
  "business",
  "careers",
  "contact",
  "hello",
  "help",
  "info",
  "legal",
  "media",
  "office",
  "partners",
  "press",
  "privacy",
  "sales",
  "security",
  "support",
  "team",
]);

const contactPathKeywords = [
  "about",
  "company",
  "contact",
  "leadership",
  "team",
];

function logCompanyContactStep(message: string, details?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();

  if (details) {
    console.log(`[company-contacts] ${timestamp} ${message}`, details);
    return;
  }

  console.log(`[company-contacts] ${timestamp} ${message}`);
}

function normalizeDomain(value: string) {
  return value.toLowerCase().replace(/^www\./, "");
}

function getHostname(value: string) {
  try {
    return normalizeDomain(new URL(value).hostname);
  } catch {
    return null;
  }
}

function getRootDomain(hostname: string) {
  const parts = normalizeDomain(hostname).split(".").filter(Boolean);

  if (parts.length <= 2) {
    return parts.join(".");
  }

  return parts.slice(-2).join(".");
}

function isOfficialHost(hostname: string, rootDomain: string) {
  return hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
}

function scoreDomainMatch(title: string, hostname: string) {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const hostnameText = hostname.replace(/\.[a-z]+$/i, "").replace(/[-.]/g, " ");
  const titleTokens = normalizedTitle.split(/\s+/).filter((token) => token.length >= 3);

  let score = 0;

  for (const token of titleTokens) {
    if (hostnameText.includes(token)) {
      score += token.length;
    }
  }

  return score;
}

function pickOfficialDomain(title: string, urls: string[]) {
  let bestMatch: { domain: string; score: number } | null = null;

  for (const url of urls) {
    const hostname = getHostname(url);

    if (!hostname) {
      continue;
    }

    const rootDomain = getRootDomain(hostname);
    const blocked = Array.from(blockedSearchHosts).some(
      (blockedHost) => rootDomain === blockedHost || rootDomain.endsWith(`.${blockedHost}`),
    );

    if (blocked) {
      continue;
    }

    const score = scoreDomainMatch(title, rootDomain);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        domain: rootDomain,
        score,
      };
    }
  }

  return bestMatch?.score ? bestMatch.domain : null;
}

function extractEmailsFromText(text: string) {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return matches.map((email) => email.toLowerCase());
}

function classifyEmail(localPart: string): ExtractedEmail["type"] {
  return preferredLocalParts.has(localPart) ? "business" : "other-public";
}

function collectEmails(sourceUrl: string, content: string, rootDomain: string, sink: Map<string, ExtractedEmail>) {
  for (const email of extractEmailsFromText(content)) {
    const [, domainPart = ""] = email.split("@");

    if (!isOfficialHost(domainPart, rootDomain)) {
      continue;
    }

    const [localPart = ""] = email.split("@");

    sink.set(email, {
      email,
      sourceUrl,
      type: classifyEmail(localPart),
    });
  }
}

function getCandidateUrls(baseUrl: string, links: Array<{ href: string; text: string }>, rootDomain: string) {
  const candidates = new Set<string>([baseUrl]);

  for (const link of links) {
    const hostname = getHostname(link.href);

    if (!hostname || !isOfficialHost(hostname, rootDomain)) {
      continue;
    }

    const text = `${link.text} ${link.href}`.toLowerCase();

    if (contactPathKeywords.some((keyword) => text.includes(keyword))) {
      candidates.add(link.href);
    }

    if (candidates.size >= 5) {
      break;
    }
  }

  for (const path of ["/contact", "/contact-us", "/about", "/about-us"]) {
    candidates.add(new URL(path, baseUrl).toString());
    if (candidates.size >= 7) {
      break;
    }
  }

  return Array.from(candidates).slice(0, 6);
}

export async function findCompanyContactEmails(title: string, domain?: string) {
  const startedAt = Date.now();
  let rootDomain = domain ? normalizeDomain(domain) : null;
  let searchResults: Awaited<ReturnType<typeof searchDuckDuckGo>>["results"] = [];

  logCompanyContactStep("request started", {
    title,
    domain: rootDomain,
  });

  if (!rootDomain) {
    logCompanyContactStep("resolving official domain from search", {
      title,
    });
    const searchPayload = await searchDuckDuckGo(`${title} official site`, 8);
    searchResults = searchPayload.results;
    logCompanyContactStep("search completed", {
      resultCount: searchResults.length,
      urls: searchResults.map((result) => result.url),
    });
    rootDomain = pickOfficialDomain(
      title,
      searchResults.map((result) => result.url),
    );
    logCompanyContactStep("domain resolution finished", {
      title,
      rootDomain,
    });
  }

  if (!rootDomain) {
    logCompanyContactStep("request failed: official domain not found", {
      title,
    });
    throw new AppError("Could not determine an official company domain from the provided title.", 404);
  }

  const homepageUrl = `https://${rootDomain}/`;
  const emails = new Map<string, ExtractedEmail>();
  const scannedPages: string[] = [];

  let homepage;

  try {
    logCompanyContactStep("crawling homepage", {
      url: homepageUrl,
    });
    homepage = await crawlPage(homepageUrl);
    scannedPages.push(homepage.finalUrl);
    collectEmails(homepage.finalUrl, `${homepage.html}\n${homepage.text}`, rootDomain, emails);
    logCompanyContactStep("homepage crawl completed", {
      requestedUrl: homepageUrl,
      finalUrl: homepage.finalUrl,
      emailCount: emails.size,
      linkCount: homepage.links.length,
    });
  } catch (error) {
    logCompanyContactStep("homepage crawl failed", {
      url: homepageUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    homepage = null;
  }

  const candidateUrls = homepage
    ? getCandidateUrls(homepage.finalUrl, homepage.links, rootDomain)
    : [homepageUrl, `https://${rootDomain}/contact`, `https://${rootDomain}/about`];

  logCompanyContactStep("candidate pages prepared", {
    count: candidateUrls.length,
    urls: candidateUrls,
  });

  for (const candidateUrl of candidateUrls) {
    if (scannedPages.includes(candidateUrl)) {
      logCompanyContactStep("skipping already scanned page", {
        url: candidateUrl,
      });
      continue;
    }

    try {
      logCompanyContactStep("crawling candidate page", {
        url: candidateUrl,
      });
      const page = await crawlPage(candidateUrl);
      scannedPages.push(page.finalUrl);
      collectEmails(page.finalUrl, `${page.html}\n${page.text}`, rootDomain, emails);
      logCompanyContactStep("candidate page crawl completed", {
        requestedUrl: candidateUrl,
        finalUrl: page.finalUrl,
        totalEmails: emails.size,
      });
    } catch (error) {
      logCompanyContactStep("candidate page crawl failed", {
        url: candidateUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
  }

  const sortedEmails = Array.from(emails.values()).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "business" ? -1 : 1;
    }

    return left.email.localeCompare(right.email);
  });

  logCompanyContactStep("request completed", {
    title,
    domain: rootDomain,
    emailCount: sortedEmails.length,
    scannedPageCount: scannedPages.length,
    durationMs: Date.now() - startedAt,
  });

  return {
    title,
    domain: rootDomain,
    officialWebsite: scannedPages[0] ?? homepageUrl,
    emails: sortedEmails,
    scannedPages,
    note:
      "This endpoint only returns publicly listed company-domain emails found on official pages. It does not infer or generate personal executive email addresses.",
    searchResultsUsed: searchResults.map((result) => ({
      title: result.title,
      url: result.url,
    })),
  };
}
