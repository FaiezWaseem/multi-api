export const landingViewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DuckDuckGo Search API</title>
  <style>
    :root {
      --bg-start: #2667ff;
      --bg-end: #6a2dfc;
      --panel: rgba(8, 10, 24, 0.78);
      --panel-soft: rgba(255, 255, 255, 0.1);
      --line: rgba(255, 255, 255, 0.14);
      --text: #f7f8ff;
      --muted: rgba(247, 248, 255, 0.76);
      --accent: #3ce2a2;
      --accent-strong: #0cc486;
      --shadow: 0 30px 80px rgba(9, 12, 32, 0.35);
      --radius-xl: 28px;
      --radius-lg: 22px;
      --radius-md: 16px;
    }

    * { box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      font-family: "Segoe UI", Inter, Arial, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 24%),
        radial-gradient(circle at 80% 20%, rgba(60,226,162,0.18), transparent 18%),
        linear-gradient(135deg, var(--bg-start), var(--bg-end));
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: linear-gradient(180deg, rgba(0,0,0,0.55), transparent 92%);
    }

    a { color: inherit; text-decoration: none; }

    .shell {
      width: min(1200px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 56px;
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 48px;
    }

    .brand {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.05em;
    }

    .brand span { color: #b9fff0; }

    .nav-links, .nav-actions {
      display: flex;
      align-items: center;
      gap: 22px;
    }

    .nav-links a, .nav-actions a {
      color: var(--muted);
      font-size: 0.96rem;
    }

    .pill-link {
      padding: 12px 18px;
      border-radius: 999px;

      font-weight: 700;
    }

    .hero {
      text-align: center;
      padding: 22px 0 10px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #dffef5;
      font-size: 0.88rem;
      margin-bottom: 18px;
    }

    .hero h1 {
      margin: 0;
      font-size: clamp(3rem, 8vw, 5.6rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    .hero p {
      width: min(720px, 100%);
      margin: 18px auto 0;
      color: var(--muted);
      font-size: 1.12rem;
      line-height: 1.7;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 14px;
      margin: 30px 0 0;
    }

    .hero-stats div {
      min-width: 140px;
      padding: 14px 18px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
    }

    .hero-stats strong {
      display: block;
      font-size: 1.3rem;
    }

    .hero-stats span {
      color: var(--muted);
      font-size: 0.92rem;
    }

    .search-box {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(180px, 0.75fr) auto;
      gap: 18px;
      align-items: end;
      width: min(980px, 100%);
      margin: 42px auto 28px;
    }

    .field {
      text-align: left;
    }

    .field label {
      display: block;
      margin-bottom: 10px;
      color: rgba(255,255,255,0.78);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .field input, .field select {
      width: 100%;
      padding: 16px 18px;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 16px;
      outline: none;
      background: rgba(255,255,255,0.96);
      color: #161b30;
      font-size: 1rem;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }

    .cta {
      height: 56px;
      padding: 0 28px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      color: #032817;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 16px 40px rgba(12, 196, 134, 0.28);
      transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
    }

    .cta:hover { transform: translateY(-1px); }
    .cta:disabled { opacity: 0.65; cursor: progress; transform: none; }

    .demo {
      position: relative;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 0;
      width: min(1140px, 100%);
      margin: 0 auto;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow);
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(18, 22, 49, 0.35);
      backdrop-filter: blur(16px);
    }

    .panel {
      min-height: 680px;
      padding: 0;
    }

    .surface-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .surface-head strong {
      font-size: 1rem;
      letter-spacing: -0.02em;
    }

    .chip {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: var(--muted);
      font-size: 0.84rem;
    }

    .preview-pane {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,244,255,0.98));
      color: #19213f;
      width : 30vw;
    }

    .browser {
      padding: 18px 18px 26px;
    }

    .browser-top {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 18px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #d0d8f3;
    }

    .searchbar {
      flex: 1;
      padding: 12px 16px;
      border-radius: 999px;
      background: white;
      border: 1px solid #dde4f4;
      color: #667195;
      font-size: 0.94rem;
      box-shadow: 0 12px 30px rgba(48, 70, 122, 0.08);
    }

    .result-list {
      display: grid;
      gap: 16px;
      max-height: 590px;
      overflow: auto;
      padding-right: 4px;
    }

    .result-card {
      padding: 18px;
      border-radius: 20px;
      background: rgba(255,255,255,0.84);
      border: 1px solid #dde4f4;
      box-shadow: 0 12px 26px rgba(37, 58, 111, 0.08);
    }

    .result-card small {
      display: block;
      color: #1c9d78;
      margin-bottom: 6px;
      word-break: break-all;
    }

    .result-card h3 {
      margin: 0 0 8px;
      font-size: 1.08rem;
      line-height: 1.35;
    }

    .result-card p {
      margin: 0;
      color: #53607f;
      line-height: 1.55;
      font-size: 0.95rem;
    }

    .result-empty {
      padding: 34px 20px;
      border-radius: 20px;
      border: 1px dashed #c7d3f1;
      text-align: center;
      color: #61708f;
      background: rgba(255,255,255,0.64);
    }

    .json-pane {
      background: rgba(10, 13, 22, 0.9);
    }

    pre {
      margin: 0;
      padding: 22px;
      min-height: 636px;
      max-height: 636px;
      overflow: auto;
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 0.9rem;
      line-height: 1.7;
      color: #9efdcf;
    }

    .highlights {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin: 28px auto 0;
      width: min(1140px, 100%);
    }

    .highlight {
      padding: 24px;
      border-radius: var(--radius-lg);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
    }

    .highlight h2 {
      margin: 0 0 10px;
      font-size: 1.15rem;
      letter-spacing: -0.03em;
    }

    .highlight p {
      margin: 0;
      color: var(--muted);
      line-height: 1.65;
    }

    .status {
      width: min(1140px, 100%);
      margin: 16px auto 0;
      color: #dcfff5;
      text-align: left;
      min-height: 24px;
      font-size: 0.94rem;
    }

    .status.error {
      color: #ffd2d2;
    }

    .content-section {
      margin: 64px auto 0;
      width: min(1140px, 100%);
      padding: 56px 28px;
      border-radius: 32px;
      background: linear-gradient(180deg, rgba(248, 250, 255, 0.98), rgba(238, 242, 252, 0.98));
      color: #17203d;
      box-shadow: 0 28px 60px rgba(14, 24, 54, 0.18);
    }

    .section-title {
      text-align: center;
      max-width: 760px;
      margin: 0 auto 28px;
    }

    .section-title h2 {
      margin: 0 0 10px;
      font-size: clamp(2rem, 5vw, 3rem);
      letter-spacing: -0.05em;
    }

    .section-title p {
      margin: 0;
      color: #667395;
      line-height: 1.7;
    }

    .code-block {
      border-radius: 22px;
      overflow: hidden;
      background: #171b29;
      box-shadow: 0 16px 36px rgba(15, 20, 36, 0.18);
      margin-top: 16px;
    }

    .code-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #2a303d;
      color: rgba(255,255,255,0.82);
      font-size: 0.88rem;
    }

    .code-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .code-tab {
      padding: 6px 10px;
      border-radius: 999px;
      border: 0;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.76);
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .code-tab.active {
      background: white;
      color: #16213f;
      font-weight: 700;
    }

    .code-block pre {
      min-height: unset;
      max-height: unset;
      padding: 20px;
      color: #d8f587;
      font-size: 0.92rem;
    }

    .feature-grid-extended {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 26px;
    }

    .feature-card-extended, .shield-card, .price-card, .faq-item {
      background: white;
      border: 1px solid #d9e2fb;
      border-radius: 22px;
      box-shadow: 0 16px 32px rgba(25, 37, 77, 0.08);
    }

    .feature-card-extended {
      padding: 24px;
      text-align: center;
    }

    .feature-icon {
      width: 76px;
      height: 76px;
      margin: 0 auto 18px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 2rem;
      color: white;
      background: linear-gradient(135deg, #1c325e, #4dcda4);
    }

    .feature-card-extended h3, .shield-card h3, .price-card h3 {
      margin: 0 0 10px;
      font-size: 1.12rem;
      letter-spacing: -0.03em;
    }

    .feature-card-extended p, .shield-card p, .price-card p, .pricing-note p, .faq-item p {
      margin: 0;
      color: #667395;
      line-height: 1.7;
    }

    .shield-card {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 20px;
      padding: 24px;
      margin-top: 18px;
      align-items: center;
    }

    .shield-badge {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 2rem;
      color: white;
      background: linear-gradient(135deg, #f56f5d, #ffcb57);
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 26px;
    }

    .price-card {
      padding: 24px;
      position: relative;
    }

    .price-card.featured {
      border-color: #3f79ff;
      box-shadow: 0 24px 42px rgba(63, 121, 255, 0.16);
      transform: translateY(-6px);
    }

    .price-badge {
      position: absolute;
      top: -12px;
      left: 22px;
      padding: 6px 12px;
      border-radius: 999px;
      background: #3f79ff;
      color: white;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .price-value {
      margin: 14px 0 16px;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #17203d;
    }

    .price-value span {
      font-size: 0.92rem;
      font-weight: 500;
      color: #667395;
    }

    .outline-button {
      display: inline-block;
      padding: 12px 18px;
      border-radius: 999px;
      border: 1px solid #d9e2fb;
      color: #17203d;
      font-weight: 700;
      background: transparent;
    }

    .price-list {
      list-style: none;
      margin: 18px 0 0;
      padding: 0;
      display: grid;
      gap: 12px;
      color: #17203d;
      font-size: 0.94rem;
    }

    .price-list li::before {
      content: "✓";
      color: #10b981;
      font-weight: 800;
      margin-right: 10px;
    }

    .faq-list {
      max-width: 760px;
      margin: 24px auto 0;
      display: grid;
      gap: 14px;
    }

    .faq-item {
      overflow: hidden;
    }

    .faq-question {
      width: 100%;
      padding: 18px 20px;
      text-align: left;
      border: 0;
      background: white;
      color: #17203d;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .faq-answer {
      display: none;
      padding: 0 20px 20px;
    }

    .faq-item.open .faq-answer {
      display: block;
    }

    @media (max-width: 1024px) {
      .nav {
        flex-wrap: wrap;
        justify-content: center;
      }

      .search-box {
        grid-template-columns: 1fr;
      }

      .demo, .highlights, .feature-grid-extended, .pricing-grid {
        grid-template-columns: 1fr;
      }

      .panel, pre {
        min-height: unset;
        max-height: unset;
      }

      .shield-card {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .shell {
        width: min(100% - 20px, 1200px);
        padding-top: 20px;
      }

      .nav-links {
        display: none;
      }

      .hero p {
        font-size: 1rem;
      }

      .hero-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .nav-actions {
        width: 100%;
        justify-content: center;
      }

      .content-section {
        padding: 48px 18px;
        border-radius: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="nav">
      <a class="brand" href="/">Duck<span>Stack</span></a>
      <nav class="nav-links">
        <a href="#demo">API Demo</a>
        <a href="#features">Features</a>
        <a href="/account">Account</a>
        <a href="/docs">Docs</a>
        <a href="/admin">Admin</a>
      </nav>
      <div class="nav-actions">
        <a href="/llm.txt">LLM Guide</a>
        <a class="pill-link" href="/openapi.json">OpenAPI</a>
      </div>
    </header>

    <section class="hero">
      <div class="eyebrow">Live DuckDuckGo scraping API with instant preview</div>
      <h1>Search the open web with a faster front door.</h1>
      <p>
        Turn your DuckDuckGo endpoint into a polished product page with a built-in demo, clean response preview,
        and developer-friendly entry points for docs, OpenAPI, and structured search results.
      </p>
      <div class="hero-stats">
        <div><strong>JSON</strong><span>Structured result payloads</span></div>
        <div><strong>50 max</strong><span>Results per request window</span></div>
        <div><strong>GET + POST</strong><span>Simple integration options</span></div>
      </div>

      <form class="search-box" id="search-form">
        <div class="field">
          <label for="query">Search Query</label>
          <input id="query" name="query" type="text" value="Open source AI agents" placeholder="Coffee shops in Austin" required />
        </div>
        <div class="field">
          <label for="region">Region</label>
          <select id="region" name="region">
            <option value="wt-wt">Global</option>
            <option value="us-en" selected>United States</option>
            <option value="uk-en">United Kingdom</option>
            <option value="de-de">Germany</option>
            <option value="fr-fr">France</option>
            <option value="pk-en">Pakistan</option>
          </select>
        </div>
        <button class="cta" id="search-button" type="submit">Test Search</button>
      </form>
    </section>

    <section class="demo" id="demo">
      <div class="panel preview-pane">
        <div class="surface-head">
          <strong>Search Preview</strong>
          <span class="chip" id="result-count">Waiting for search</span>
        </div>
        <div class="browser">
          <div class="browser-top">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <div class="searchbar" id="browser-query">Search results will appear here</div>
          </div>
          <div class="result-list" id="result-list">
            <div class="result-empty">Run a search to see live DuckDuckGo results rendered on the page.</div>
          </div>
        </div>
      </div>
      <div class="panel json-pane">
        <div class="surface-head">
          <strong>Response Payload</strong>
          <span class="chip">/search/duckduckgo</span>
        </div>
        <pre id="json-output">{
  "message": "Ready for a live request",
  "tips": [
    "Enter a query",
    "Choose a region",
    "Inspect the JSON response here"
  ]
}</pre>
      </div>
    </section>

    <div class="status" id="status"></div>

    <section class="highlights" id="features">
      <article class="highlight">
        <h2>Built for developer demos</h2>
        <p>The hero area turns your API into a product surface, so visitors can understand the value before they read a line of docs.</p>
      </article>
      <article class="highlight">
        <h2>Real response, not mock data</h2>
        <p>The page calls your live backend and mirrors both the human-readable results and the exact JSON returned by the endpoint.</p>
      </article>
      <article class="highlight">
        <h2>Fits the current app</h2>
        <p>Everything ships as a simple server-rendered view, which keeps deployment easy inside your existing Bun and Express setup.</p>
      </article>
    </section>

    <section class="content-section" id="integration">
      <div class="section-title">
        <h2>Easy Integration</h2>
        <p>Use the endpoint directly or switch through a few language examples, just like the reference layout, while keeping the examples aligned to this project.</p>
      </div>

      <div class="code-block">
        <div class="code-head">
          <strong>GET</strong>
          <span>Direct endpoint example</span>
        </div>
        <pre>GET /search/duckduckgo?query=coffee&region=us-en&limit=10&response_type=json</pre>
      </div>

      <div class="code-block">
        <div class="code-head">
          <strong>Code Integration</strong>
          <div class="code-tabs">
            <button class="code-tab active" type="button" data-lang="curl">cURL</button>
            <button class="code-tab" type="button" data-lang="node">Node</button>
            <button class="code-tab" type="button" data-lang="python">Python</button>
            <button class="code-tab" type="button" data-lang="php">PHP</button>
          </div>
        </div>
        <pre id="code-output"></pre>
      </div>
    </section>

    <section class="content-section">
      <div class="section-title">
        <h2>Advanced Features</h2>
        <p>Additional blocks modeled after the reference image, reframed around the strengths your backend already exposes.</p>
      </div>

      <div class="feature-grid-extended">
        <article class="feature-card-extended">
          <div class="feature-icon">🚀</div>
          <h3>Real Time Results</h3>
          <p>Run fresh searches on demand and surface them immediately in a developer-friendly payload or a visual preview on the page.</p>
        </article>
        <article class="feature-card-extended">
          <div class="feature-icon">🗺️</div>
          <h3>Accurate Locations</h3>
          <p>Region controls let you tune results for global or country-specific discovery without changing the endpoint shape.</p>
        </article>
        <article class="feature-card-extended">
          <div class="feature-icon">📦</div>
          <h3>JSON Results</h3>
          <p>Get normalized search results with titles, links, snippets, result counts, and cursors for pagination-aware integrations.</p>
        </article>
      </div>

      <article class="shield-card">
        <div class="shield-badge">🛡️</div>
        <div>
          <h3>U.S. Legal Shield</h3>
          <p>This support block mirrors the reassurance section from the reference page. It gives you a place to position compliance, operational trust, or enterprise language without changing the rest of the page structure.</p>
        </div>
      </article>
    </section>

    <section class="content-section" id="pricing">
      <div class="section-title">
        <h2>Simple Pricing</h2>
        <p>Pricing now matches the three actual access modes configured in the app: free, authenticated, and paid.</p>
      </div>

      <div class="pricing-grid">
        <article class="price-card">
          <h3>Free</h3>
          <div class="price-value">FREE <span>/ month</span></div>
       
          <ul class="price-list">
            <li>5 requests per minute</li>
            <li>10 requests per day</li>
            <li>Best for testing the API</li>
            <li>${10 * 30} requests /month</li>
            <li>NO API TOKEN REQUIRED</li>
          </ul>
        </article>
        <article class="price-card">
          <h3>Auth</h3>
          <div class="price-value">FREE <span>/ month</span></div>
          <a class="outline-button" href="/account">Sign In</a>
          <ul class="price-list">
            <li>10 requests per minute</li>
            <li>50 requests per day</li>
             <li>${50 * 30} requests /month</li>
            <li>For signed-in users</li>
          </ul>
        </article>
        <article class="price-card featured">
          <div class="price-badge">Most Popular</div>
          <h3>Paid</h3>
          <div class="price-value">$3.99 <span>/ month</span></div>
          <a class="outline-button" href="/account">Upgrade</a>
          <ul class="price-list">
            <li>30 requests per minute</li>
            <li>3000 requests per day</li>
             <li>${3000 * 30} requests /month</li>
            <li>Best value for production use</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="content-section" id="faq">
      <div class="section-title">
        <h2>FAQ</h2>
        <p>Common commercial and technical questions in the same spirit as the reference page.</p>
      </div>

      <div class="faq-list">
        <article class="faq-item open">
          <button class="faq-question" type="button">How are searches counted?</button>
          <div class="faq-answer"><p>Each successful request to the DuckDuckGo search endpoint counts as one search, no matter whether you display the response as cards or raw JSON.</p></div>
        </article>
        <article class="faq-item">
          <button class="faq-question" type="button">What if my quota reaches the limit?</button>
          <div class="faq-answer"><p>You can upgrade the plan, add internal credits, or expose the current admin tooling so usage can be managed for customers.</p></div>
        </article>
        <article class="faq-item">
          <button class="faq-question" type="button">What if I need more volume?</button>
          <div class="faq-answer"><p>Use the bigger plans as a baseline and turn enterprise into a custom engagement for higher throughput or support needs.</p></div>
        </article>
        <article class="faq-item">
          <button class="faq-question" type="button">Do you provide SLA guarantees?</button>
          <div class="faq-answer"><p>This template gives you the right section for it. You can replace this answer with your real uptime or support commitments once they are defined.</p></div>
        </article>
        <article class="faq-item">
          <button class="faq-question" type="button">What is your refund policy?</button>
          <div class="faq-answer"><p>Add your real billing policy here. For now the structure is ready and visually aligned with the reference.</p></div>
        </article>
      </div>
    </section>

  </div>

  <script>
    const form = document.getElementById("search-form");
    const queryInput = document.getElementById("query");
    const regionInput = document.getElementById("region");
    const searchButton = document.getElementById("search-button");
    const resultList = document.getElementById("result-list");
    const jsonOutput = document.getElementById("json-output");
    const browserQuery = document.getElementById("browser-query");
    const resultCount = document.getElementById("result-count");
    const statusNode = document.getElementById("status");
    const codeOutput = document.getElementById("code-output");
    const codeTabs = Array.from(document.querySelectorAll(".code-tab"));
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));

    const codeSamples = {
      curl: 'curl --request GET "http://localhost:3000/search/duckduckgo?query=coffee&region=us-en&limit=10&response_type=json"',
      node: 'const params = new URLSearchParams({\\n  query: "coffee",\\n  region: "us-en",\\n  limit: "10",\\n  response_type: "json"\\n});\\n\\nconst response = await fetch("http://localhost:3000/search/duckduckgo?" + params);\\nconst data = await response.json();\\nconsole.log(data);',
      python: 'import requests\\n\\nresponse = requests.get("http://localhost:3000/search/duckduckgo", params={\\n    "query": "coffee",\\n    "region": "us-en",\\n    "limit": 10,\\n    "response_type": "json"\\n})\\nprint(response.json())',
      php: '$params = http_build_query([\\n  "query" => "coffee",\\n  "region" => "us-en",\\n  "limit" => 10,\\n  "response_type" => "json"\\n]);\\n\\n$response = file_get_contents("http://localhost:3000/search/duckduckgo?" . $params);\\necho $response;'
    };

    function setStatus(text, isError) {
      statusNode.textContent = text || "";
      statusNode.className = "status" + (isError ? " error" : "");
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function renderResults(results) {
      if (!Array.isArray(results) || results.length === 0) {
        resultList.innerHTML = '<div class="result-empty">No results were returned for this query.</div>';
        return;
      }

      resultList.innerHTML = results.map((result) => {
        const safeTitle = escapeHtml(result.title || "Untitled result");
        const safeUrl = escapeHtml(result.url || "");
        const safeSnippet = escapeHtml(result.snippet || "No snippet available.");
        return \`
          <article class="result-card">
            <small>\${safeUrl}</small>
            <h3><a href="\${safeUrl}" target="_blank" rel="noreferrer">\${safeTitle}</a></h3>
            <p>\${safeSnippet}</p>
          </article>
        \`;
      }).join("");
    }

    function setCodeSample(language) {
      codeOutput.textContent = codeSamples[language] || codeSamples.curl;
      for (const tab of codeTabs) {
        tab.classList.toggle("active", tab.dataset.lang === language);
      }
    }

    async function runSearch() {
      const query = queryInput.value.trim();
      const region = regionInput.value;

      if (!query) {
        setStatus("Enter a search query first.", true);
        queryInput.focus();
        return;
      }

      searchButton.disabled = true;
      browserQuery.textContent = query;
      resultCount.textContent = "Searching...";
      setStatus("Running live search against /search/duckduckgo");

      try {
        const params = new URLSearchParams({
          query,
          region,
          limit: "8",
          response_type: "json"
        });

        const response = await fetch("/search/duckduckgo?" + params.toString());
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Search failed");
        }

        const results = payload.data?.results || [];
        renderResults(results);
        resultCount.textContent = results.length + " results";
        jsonOutput.textContent = JSON.stringify(payload, null, 2);
        setStatus("Live results loaded successfully.");
      } catch (error) {
        resultList.innerHTML = '<div class="result-empty">The request failed. Check the error details and try again.</div>';
        resultCount.textContent = "Request failed";
        jsonOutput.textContent = JSON.stringify({
          error: error && error.message ? error.message : "Unknown error"
        }, null, 2);
        setStatus(error && error.message ? error.message : "Search failed", true);
      } finally {
        searchButton.disabled = false;
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      runSearch();
    });

    for (const tab of codeTabs) {
      tab.addEventListener("click", () => {
        setCodeSample(tab.dataset.lang || "curl");
      });
    }

    for (const item of faqItems) {
      const button = item.querySelector(".faq-question");
      button.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    }

    setCodeSample("curl");
    runSearch();
  </script>
</body>
</html>
`;
