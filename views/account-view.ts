export const accountViewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Account Portal</title>
  <style>
    :root {
      --bg-start: #2667ff;
      --bg-end: #6a2dfc;
      --text: #f7f8ff;
      --muted: rgba(247, 248, 255, 0.76);
      --panel: rgba(255, 255, 255, 0.12);
      --line: rgba(255, 255, 255, 0.16);
      --accent: #3ce2a2;
      --accent-dark: #082c1f;
      --danger: #ff8a8a;
      --shadow: 0 28px 60px rgba(12, 18, 40, 0.28);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", Inter, Arial, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 24%),
        radial-gradient(circle at 80% 20%, rgba(60,226,162,0.14), transparent 18%),
        linear-gradient(135deg, var(--bg-start), var(--bg-end));
    }

    a { color: inherit; text-decoration: none; }

    .shell {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 36px;
    }

    .brand {
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: -0.05em;
    }

    .brand span { color: #b9fff0; }

    .nav-links {
      display: flex;
      gap: 18px;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .hero {
      text-align: center;
      margin-bottom: 32px;
    }

    .hero h1 {
      margin: 0;
      font-size: clamp(2.6rem, 6vw, 4.8rem);
      letter-spacing: -0.06em;
      line-height: 0.96;
    }

    .hero p {
      width: min(760px, 100%);
      margin: 16px auto 0;
      color: var(--muted);
      line-height: 1.7;
      font-size: 1.05rem;
    }

    .auth-shell {
      display: grid;
      grid-template-columns: 0.95fr 1.05fr;
      gap: 24px;
      align-items: stretch;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 28px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(16px);
      padding: 26px;
    }

    .panel h2, .panel h3 {
      margin: 0 0 10px;
      letter-spacing: -0.03em;
    }

    .panel p {
      margin: 0 0 16px;
      color: var(--muted);
      line-height: 1.65;
    }

    .auth-copy {
      display: grid;
      gap: 16px;
      align-content: center;
      min-height: 100%;
    }

    .eyebrow {
      display: inline-flex;
      width: fit-content;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.14);
      color: #dffff5;
      font-size: 0.86rem;
    }

    .auth-copy ul {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.7;
    }

    .auth-card {
      background: rgba(255,255,255,0.14);
    }

    .segmented {
      display: inline-grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      padding: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      margin-bottom: 20px;
    }

    .segmented button {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      background: transparent;
      color: var(--muted);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .segmented button.active {
      background: white;
      color: #1b2442;
    }

    .auth-panel {
      display: none;
    }

    .auth-panel.active {
      display: block;
    }

    form {
      display: grid;
      gap: 12px;
    }

    label {
      display: grid;
      gap: 7px;
      color: var(--muted);
      font-size: 0.92rem;
    }

    input, button {
      font: inherit;
    }

    input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.94);
      color: #18203b;
      outline: none;
    }

    button, .button-link {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      background: linear-gradient(135deg, var(--accent), #0cc486);
      color: var(--accent-dark);
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .button-muted {
      background: rgba(255,255,255,0.12);
      color: white;
      border: 1px solid rgba(255,255,255,0.16);
      font-weight: 700;
    }

    .button-danger {
      background: rgba(255,138,138,0.16);
      color: #ffe3e3;
      border: 1px solid rgba(255,138,138,0.3);
      font-weight: 700;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .inline-link {
      color: #d9fff2;
      font-weight: 700;
    }

    .message {
      min-height: 22px;
      color: #d9fff2;
      font-size: 0.94rem;
    }

    .message.error { color: #ffd7d7; }

    .hidden {
      display: none !important;
    }

    .dashboard {
      display: grid;
      gap: 22px;
    }

    .console-grid {
      display: grid;
      grid-template-columns: 0.92fr 1.08fr;
      gap: 22px;
    }

    .console-list {
      display: grid;
      gap: 16px;
    }

    .console-card {
      padding: 18px;
      border-radius: 22px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.08);
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
    }

    .console-card.active {
      background: rgba(255,255,255,0.14);
      border-color: rgba(60,226,162,0.4);
      transform: translateY(-1px);
    }

    .console-card h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .console-card p {
      margin: 0;
      font-size: 0.92rem;
    }

    .console-detail {
      display: grid;
      gap: 18px;
    }

    .console-head {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 16px;
    }

    .method-switch {
      display: inline-grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      padding: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
    }

    .method-switch button {
      border: 0;
      border-radius: 999px;
      padding: 8px 12px;
      font: inherit;
      font-weight: 700;
      color: var(--muted);
      background: transparent;
      cursor: pointer;
    }

    .method-switch button.active {
      background: white;
      color: #1b2442;
    }

    .console-helper {
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.65;
    }

    .console-helper code {
      color: #d4fff1;
      word-break: break-all;
    }

    .console-form {
      display: grid;
      gap: 14px;
    }

    .form-section {
      display: grid;
      gap: 14px;
    }

    .form-section.hidden {
      display: none;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    select, textarea {
      width: 100%;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.94);
      color: #18203b;
      outline: none;
      font: inherit;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    .response-box {
      border-radius: 22px;
      border: 1px solid rgba(60,226,162,0.18);
      background: rgba(8, 10, 24, 0.72);
      overflow: hidden;
    }

    .response-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .response-box pre {
      margin: 0;
      padding: 18px;
      max-height: 480px;
      overflow: auto;
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 0.9rem;
      line-height: 1.7;
      color: #9efdcf;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 0.92fr 1.08fr;
      gap: 22px;
    }

    .stack {
      display: grid;
      gap: 22px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 14px;
    }

    .stat {
      border-radius: 18px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.08);
      padding: 18px;
    }

    .stat small {
      display: block;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .stat strong {
      font-size: 1.5rem;
      letter-spacing: -0.04em;
    }

    .session-box {
      margin-top: 14px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--line);
    }

    .token-list {
      display: grid;
      gap: 14px;
      margin-top: 18px;
    }

    .token-item {
      border-radius: 20px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.08);
      padding: 18px;
    }

    .token-item h4 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .token-meta {
      display: grid;
      gap: 4px;
      color: var(--muted);
      font-size: 0.9rem;
      margin-bottom: 14px;
    }

    .token-secret {
      margin-top: 16px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(12, 196, 134, 0.12);
      border: 1px solid rgba(60,226,162,0.22);
    }

    .token-secret code {
      word-break: break-all;
      color: #d4fff1;
    }

    .muted {
      color: var(--muted);
    }

    @media (max-width: 980px) {
      .auth-shell, .dashboard-grid, .console-grid, .field-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .shell {
        width: min(100% - 20px, 1180px);
        padding-top: 20px;
      }

      .nav {
        flex-direction: column;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }

      .stats {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="nav">
      <a class="brand" href="/">Duck<span>Stack</span></a>
      <nav class="nav-links">
        <a href="/">Landing</a>
        <a href="/docs">Docs</a>
        <a href="/openapi.json">OpenAPI</a>
        <a href="/admin">Admin</a>
      </nav>
    </header>

    <section class="hero">
      <h1>User Access and Token Portal</h1>
      <p>Sign in to manage tokens and inspect rate limits. New users can create an account from the same screen and will be signed in automatically.</p>
    </section>

    <section id="auth-shell" class="auth-shell">
      <article class="panel auth-copy">
        <span class="eyebrow">Developer access</span>
        <h2>One clean place for account setup and API access.</h2>
        <p>The page now opens directly on login for a more professional first step. Registration is still available, but it stays secondary until someone needs it.</p>
        <ul>
          <li>Login is the default view</li>
          <li>Registration auto-signs the new user in</li>
          <li>After authentication, the auth flow is hidden and the usage dashboard takes over</li>
        </ul>
      </article>

      <article class="panel auth-card">
        <div class="segmented">
          <button id="show-login" class="active" type="button">Login</button>
          <button id="show-register" type="button">Register</button>
        </div>

        <div id="login-panel" class="auth-panel active">
          <h2>Welcome back</h2>
          <p>Sign in with your account to manage API tokens and inspect usage.</p>
          <form id="login-form">
            <label>Email
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>Password
              <input name="password" type="password" placeholder="Your password" required />
            </label>
            <button type="submit">Sign In</button>
            <div class="message" id="login-message"></div>
          </form>
          <p style="margin-top:12px;">Need an account? <a class="inline-link" href="#" id="switch-to-register">Create one here</a></p>
        </div>

        <div id="register-panel" class="auth-panel">
          <h2>Create your account</h2>
          <p>Register once and we’ll sign you in automatically so you can move straight into token management.</p>
          <form id="register-form">
            <label>Email
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>Password
              <input name="password" type="password" placeholder="At least 8 characters" required />
            </label>
            <button type="submit">Create Account</button>
            <div class="message" id="register-message"></div>
          </form>
          <p style="margin-top:12px;">Already registered? <a class="inline-link" href="#" id="switch-to-login">Back to login</a></p>
        </div>
      </article>
    </section>

    <section id="dashboard" class="dashboard hidden">
      <div class="dashboard-grid">
        <div class="stack">
          <section class="panel">
            <div class="row" style="justify-content:space-between;">
              <div>
                <h2>Session Overview</h2>
                <p>Your authenticated account is active and ready for token-based usage.</p>
              </div>
              <button class="button-muted" id="logout-button" type="button">Logout</button>
            </div>

            <div class="session-box">
              <strong>Session Status</strong>
              <div class="muted" id="session-summary" style="margin-top:8px;">Not signed in</div>
              <div class="muted" id="session-expiry" style="margin-top:6px;"></div>
            </div>
          </section>

          <section class="panel">
            <h2>Usage View</h2>
            <p>Inspect the current minute and day limits. Use your selected API token if you want token-based usage, or fall back to the current browser IP tier.</p>
            <label>Manual x-api-token Override
              <input id="usage-token" type="text" placeholder="Paste a token here to inspect token usage" />
            </label>
            <div class="row">
              <button id="refresh-usage" type="button">Refresh Usage</button>
              <button class="button-muted" id="use-latest-token" type="button">Use Latest Created Token</button>
            </div>
            <div class="message" id="usage-message"></div>
            <div class="stats">
              <div class="stat"><small>Tier</small><strong id="usage-tier">-</strong></div>
              <div class="stat"><small>Identity</small><strong id="usage-identity">-</strong></div>
              <div class="stat"><small>Minute</small><strong id="usage-minute">-</strong></div>
              <div class="stat"><small>Day</small><strong id="usage-day">-</strong></div>
            </div>
          </section>
        </div>

        <div class="stack">
          <section class="panel">
            <h2>Token Management</h2>
            <p>Create, rename, revoke, and inspect API tokens for the signed-in account.</p>

            <form id="create-token-form">
              <label>Token Name
                <input name="name" type="text" placeholder="Production crawler" required />
              </label>
              <button type="submit">Create API Token</button>
              <div class="message" id="create-token-message"></div>
            </form>

            <div class="token-secret" id="latest-token-box" style="display:none;">
              <strong>Latest Created Token</strong>
              <div class="muted" style="margin:8px 0 10px;">Copy and store this now. For safety, the full token is only shown at creation time.</div>
              <code id="latest-token-value"></code>
            </div>

            <div class="token-list" id="token-list">
              <div class="muted">Sign in to load your tokens.</div>
            </div>
          </section>
        </div>
      </div>

      <section class="panel">
        <div class="console-head">
          <div>
            <h2>API Console</h2>
            <p>Plug in values, switch between GET and POST, optionally attach your latest API token, and inspect the live response for every available endpoint.</p>
          </div>
          <div class="method-switch">
            <button id="method-get" class="active" type="button">GET</button>
            <button id="method-post" type="button">POST</button>
          </div>
        </div>

        <div class="console-grid">
          <div class="console-list" id="console-list">
            <article class="console-card active" data-console="search">
              <h3>DuckDuckGo Search</h3>
              <p>Test /search/duckduckgo with query, region, limit, and response type.</p>
            </article>
            <article class="console-card" data-console="crawl">
              <h3>Page Crawl</h3>
              <p>Test /crawl with URL, response type, JavaScript, and optional proxy config.</p>
            </article>
            <article class="console-card" data-console="company">
              <h3>Company Contacts</h3>
              <p>Test /search/company-contacts with job title and optional company domain.</p>
            </article>
            <article class="console-card" data-console="usage">
              <h3>Usage Snapshot</h3>
              <p>Test /usage using the session or an explicit x-api-token header.</p>
            </article>
          </div>

          <div class="console-detail">
            <div class="console-helper">
              <div><strong id="console-title">DuckDuckGo Search</strong></div>
              <div id="console-description" style="margin-top:8px;">Use your session by default, or attach an API token for token-based requests and crawl access.</div>
              <div style="margin-top:10px;">Endpoint: <code id="console-endpoint">/search/duckduckgo</code></div>
            </div>

            <form class="console-form" id="console-form">
              <div id="search-fields" class="form-section">
                <div class="field-grid">
                  <label>Query
                    <input id="console-query" type="text" placeholder="Open source AI agents" />
                  </label>
                  <label>Region
                    <input id="console-region" type="text" placeholder="us-en" />
                  </label>
                </div>

                <div class="field-grid">
                  <label>Limit
                    <input id="console-limit" type="number" min="1" max="50" value="8" />
                  </label>
                  <label>Response Type
                    <select id="console-response-type">
                      <option value="json">json</option>
                      <option value="markdown">markdown</option>
                      <option value="txt">txt</option>
                      <option value="html">html</option>
                    </select>
                  </label>
                </div>
              </div>

              <div id="crawl-fields" class="form-section hidden">
                <label>URL
                  <input id="console-url" type="text" placeholder="https://example.com" />
                </label>

                <div class="field-grid">
                  <label>Response Type
                    <select id="console-crawl-response-type">
                      <option value="json">json</option>
                      <option value="markdown">markdown</option>
                      <option value="txt">txt</option>
                      <option value="html">html</option>
                    </select>
                  </label>
                  <div></div>
                </div>

                <label>JavaScript for Crawl
                  <textarea id="console-js-code" placeholder="document.body.innerText"></textarea>
                </label>

                <label>Proxy JSON
                  <textarea id="console-proxy" placeholder='{"server":"http://proxy-host:8080","username":"user","password":"pass"}'></textarea>
                </label>
              </div>

              <div id="company-fields" class="form-section hidden">
                <div class="field-grid">
                  <label>Company Title
                    <input id="console-title-input" type="text" placeholder="Head of Marketing" />
                  </label>
                  <label>Company Domain
                    <input id="console-domain" type="text" placeholder="example.com" />
                  </label>
                </div>
              </div>

              <div id="usage-fields" class="form-section hidden">
                <div class="console-helper">
                  Usage snapshot does not need a request body. Run it with your logged-in session or provide an API token override below.
                </div>
              </div>

              <label>Manual x-api-token Override
                <input id="console-token" type="text" placeholder="Leave empty to use the signed-in session only" />
              </label>

              <div class="row">
                <button type="submit">Run Request</button>
                <button class="button-muted" id="console-use-latest-token" type="button">Use Latest Token</button>
                <button class="button-muted" id="console-copy-curl" type="button">Copy cURL</button>
              </div>
              <div class="message" id="console-message"></div>
            </form>

            <div class="response-box">
              <div class="response-head">
                <strong>Live Response</strong>
                <span class="muted" id="console-response-meta">Ready</span>
              </div>
              <pre id="console-response">{
  "message": "Select an API and run a request."
}</pre>
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>

  <script>
    const sessionKey = "portalSessionToken";
    const latestApiTokenKey = "portalLatestApiToken";

    const authShell = document.getElementById("auth-shell");
    const dashboard = document.getElementById("dashboard");
    const showLoginButton = document.getElementById("show-login");
    const showRegisterButton = document.getElementById("show-register");
    const switchToRegister = document.getElementById("switch-to-register");
    const switchToLogin = document.getElementById("switch-to-login");
    const loginPanel = document.getElementById("login-panel");
    const registerPanel = document.getElementById("register-panel");

    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const createTokenForm = document.getElementById("create-token-form");
    const logoutButton = document.getElementById("logout-button");
    const refreshUsageButton = document.getElementById("refresh-usage");
    const useLatestTokenButton = document.getElementById("use-latest-token");
    const usageTokenInput = document.getElementById("usage-token");

    const registerMessage = document.getElementById("register-message");
    const loginMessage = document.getElementById("login-message");
    const createTokenMessage = document.getElementById("create-token-message");
    const usageMessage = document.getElementById("usage-message");
    const sessionSummary = document.getElementById("session-summary");
    const sessionExpiry = document.getElementById("session-expiry");
    const tokenList = document.getElementById("token-list");
    const latestTokenBox = document.getElementById("latest-token-box");
    const latestTokenValue = document.getElementById("latest-token-value");

    const usageTier = document.getElementById("usage-tier");
    const usageIdentity = document.getElementById("usage-identity");
    const usageMinute = document.getElementById("usage-minute");
    const usageDay = document.getElementById("usage-day");
    const consoleCards = Array.from(document.querySelectorAll(".console-card"));
    const methodGetButton = document.getElementById("method-get");
    const methodPostButton = document.getElementById("method-post");
    const consoleTitle = document.getElementById("console-title");
    const consoleDescription = document.getElementById("console-description");
    const consoleEndpoint = document.getElementById("console-endpoint");
    const consoleForm = document.getElementById("console-form");
    const consoleMessage = document.getElementById("console-message");
    const consoleResponse = document.getElementById("console-response");
    const consoleResponseMeta = document.getElementById("console-response-meta");
    const consoleUseLatestToken = document.getElementById("console-use-latest-token");
    const consoleCopyCurl = document.getElementById("console-copy-curl");
    const consoleTokenInput = document.getElementById("console-token");
    const searchFields = document.getElementById("search-fields");
    const crawlFields = document.getElementById("crawl-fields");
    const companyFields = document.getElementById("company-fields");
    const usageFields = document.getElementById("usage-fields");
    const consoleQueryInput = document.getElementById("console-query");
    const consoleRegionInput = document.getElementById("console-region");
    const consoleLimitInput = document.getElementById("console-limit");
    const consoleResponseTypeInput = document.getElementById("console-response-type");
    const consoleCrawlResponseTypeInput = document.getElementById("console-crawl-response-type");
    const consoleUrlInput = document.getElementById("console-url");
    const consoleTitleInput = document.getElementById("console-title-input");
    const consoleDomainInput = document.getElementById("console-domain");
    const consoleJsCodeInput = document.getElementById("console-js-code");
    const consoleProxyInput = document.getElementById("console-proxy");

    let currentConsole = "search";
    let currentMethod = "GET";

    const consoleConfigs = {
      search: {
        title: "DuckDuckGo Search",
        description: "Search DuckDuckGo with query, optional region, limit, and response type.",
        endpoint: "/search/duckduckgo"
      },
      crawl: {
        title: "Page Crawl",
        description: "Crawl a page with URL, response type, optional JavaScript, and optional proxy for token users.",
        endpoint: "/crawl"
      },
      company: {
        title: "Company Contacts",
        description: "Look up likely company contact emails with a job title and optional company domain.",
        endpoint: "/search/company-contacts"
      },
      usage: {
        title: "Usage Snapshot",
        description: "Inspect usage for the current signed-in user or a pasted API token.",
        endpoint: "/usage"
      }
    };

    function setMessage(node, text, isError) {
      node.textContent = text || "";
      node.className = "message" + (isError ? " error" : "");
    }

    function setConsoleMode(name) {
      currentConsole = name;
      const config = consoleConfigs[name];
      consoleTitle.textContent = config.title;
      consoleDescription.textContent = config.description;
      consoleEndpoint.textContent = config.endpoint;
      for (const card of consoleCards) {
        card.classList.toggle("active", card.dataset.console === name);
      }
      consoleResponseMeta.textContent = "Ready";
      setMessage(consoleMessage, "");
      searchFields.classList.toggle("hidden", name !== "search");
      crawlFields.classList.toggle("hidden", name !== "crawl");
      companyFields.classList.toggle("hidden", name !== "company");
      usageFields.classList.toggle("hidden", name !== "usage");
    }

    function setRequestMethod(method) {
      currentMethod = method;
      methodGetButton.classList.toggle("active", method === "GET");
      methodPostButton.classList.toggle("active", method === "POST");
    }

    function setAuthMode(mode) {
      const showLogin = mode === "login";
      loginPanel.classList.toggle("active", showLogin);
      registerPanel.classList.toggle("active", !showLogin);
      showLoginButton.classList.toggle("active", showLogin);
      showRegisterButton.classList.toggle("active", !showLogin);
      setMessage(loginMessage, "");
      setMessage(registerMessage, "");
    }

    function showDashboard(isAuthenticated) {
      authShell.classList.toggle("hidden", isAuthenticated);
      dashboard.classList.toggle("hidden", !isAuthenticated);
    }

    function getSessionToken() {
      return sessionStorage.getItem(sessionKey) || "";
    }

    function setSessionToken(token) {
      if (!token) {
        sessionStorage.removeItem(sessionKey);
        return;
      }
      sessionStorage.setItem(sessionKey, token);
    }

    function getLatestApiToken() {
      return sessionStorage.getItem(latestApiTokenKey) || "";
    }

    function setLatestApiToken(token) {
      if (!token) {
        sessionStorage.removeItem(latestApiTokenKey);
        return;
      }
      sessionStorage.setItem(latestApiTokenKey, token);
    }

    async function api(path, options) {
      const headers = new Headers((options && options.headers) || {});
      const sessionToken = getSessionToken();

      if (sessionToken) {
        headers.set("Authorization", "Bearer " + sessionToken);
      }

      const response = await fetch(path, { ...(options || {}), headers });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(payload.message || String(payload));
      }

      return payload;
    }

    function renderSession(user, expiresAt) {
      if (!user) {
        sessionSummary.textContent = "Not signed in";
        sessionExpiry.textContent = "";
        return;
      }

      const tier = user.isPaid ? "paid" : "auth";
      sessionSummary.textContent = user.email + " signed in as " + tier + " user";
      sessionExpiry.textContent = expiresAt ? "Session expires at " + expiresAt : "";
    }

    function renderTokens(tokens) {
      tokenList.innerHTML = "";

      if (!Array.isArray(tokens) || tokens.length === 0) {
        tokenList.innerHTML = '<div class="muted">No API tokens yet. Create one above.</div>';
        return;
      }

      for (const token of tokens) {
        const wrapper = document.createElement("article");
        wrapper.className = "token-item";
        wrapper.innerHTML = \`
          <h4>\${token.name}</h4>
          <div class="token-meta">
            <span>Prefix: \${token.token_prefix}</span>
            <span>Created: \${token.created_at}</span>
            <span>Last used: \${token.last_used_at || "never"}</span>
            <span>Status: \${token.revoked_at ? "revoked" : "active"}</span>
          </div>
          <div class="row">
            <button class="button-muted" type="button" data-action="rename" data-id="\${token.id}" data-name="\${token.name}">Rename</button>
            <button class="button-danger" type="button" data-action="revoke" data-id="\${token.id}">Revoke</button>
          </div>
        \`;
        tokenList.appendChild(wrapper);
      }
    }

    async function loadTokens() {
      const payload = await api("/auth/tokens");
      renderTokens(payload.data);
    }

    async function refreshUsage() {
      setMessage(usageMessage, "");
      const headers = {};
      const tokenOverride = usageTokenInput.value.trim();
      const sessionToken = getSessionToken();

      if (sessionToken) {
        headers["Authorization"] = "Bearer " + sessionToken;
      }

      if (tokenOverride) {
        headers["x-api-token"] = tokenOverride;
      }

      try {
        const response = await fetch("/usage", { headers });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Unable to load usage");
        }

        const data = payload.data;
        usageTier.textContent = data.tier;
        usageIdentity.textContent = data.identity;
        usageMinute.textContent = data.usage.minute.used + " / " + data.limits.minute;
        usageDay.textContent = data.usage.day.used + " / " + data.limits.day;
        setMessage(usageMessage, "Usage loaded successfully.");
      } catch (error) {
        setMessage(usageMessage, error.message || "Unable to load usage", true);
      }
    }

    async function handleAuthenticatedSession(sessionData) {
      setSessionToken(sessionData.sessionToken);
      renderSession(sessionData.user, sessionData.expiresAt);
      showDashboard(true);
      await loadTokens();
      await refreshUsage();
    }

    function buildConsoleRequest() {
      const tokenOverride = consoleTokenInput.value.trim();
      const sessionToken = getSessionToken();
      const headers = {};

      if (sessionToken) {
        headers["Authorization"] = "Bearer " + sessionToken;
      }

      if (tokenOverride) {
        headers["x-api-token"] = tokenOverride;
      }

      if (currentConsole === "usage") {
        return {
          url: "/usage",
          options: { headers }
        };
      }

      if (currentConsole === "search") {
        const payload = {
          query: consoleQueryInput.value.trim(),
          region: consoleRegionInput.value.trim(),
          limit: consoleLimitInput.value,
          response_type: consoleResponseTypeInput.value
        };

        if (currentMethod === "GET") {
          const params = new URLSearchParams();
          if (payload.query) params.set("query", payload.query);
          if (payload.region) params.set("region", payload.region);
          if (payload.limit) params.set("limit", payload.limit);
          if (payload.response_type) params.set("response_type", payload.response_type);
          return { url: "/search/duckduckgo?" + params.toString(), options: { headers } };
        }

        headers["Content-Type"] = "application/json";
        return {
          url: "/search/duckduckgo",
          options: {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
          }
        };
      }

      if (currentConsole === "crawl") {
        const proxyText = consoleProxyInput.value.trim();
        let proxy;
        if (proxyText) {
          proxy = JSON.parse(proxyText);
        }

        const payload = {
          url: consoleUrlInput.value.trim(),
          response_type: consoleCrawlResponseTypeInput.value,
          js_code: consoleJsCodeInput.value.trim(),
          proxy
        };

        if (currentMethod === "GET") {
          const params = new URLSearchParams();
          if (payload.url) params.set("url", payload.url);
          if (payload.response_type) params.set("response_type", payload.response_type);
          if (payload.js_code) params.set("js_code", payload.js_code);
          return { url: "/crawl?" + params.toString(), options: { headers } };
        }

        headers["Content-Type"] = "application/json";
        return {
          url: "/crawl",
          options: {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
          }
        };
      }

      const payload = {
        title: consoleTitleInput.value.trim(),
        domain: consoleDomainInput.value.trim()
      };

      if (currentMethod === "GET") {
        const params = new URLSearchParams();
        if (payload.title) params.set("title", payload.title);
        if (payload.domain) params.set("domain", payload.domain);
        return { url: "/search/company-contacts?" + params.toString(), options: { headers } };
      }

      headers["Content-Type"] = "application/json";
      return {
        url: "/search/company-contacts",
        options: {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        }
      };
    }

    function buildCurlPreview() {
      const request = buildConsoleRequest();
      const method = request.options.method || "GET";
      const parts = ['curl --request ' + method, '"http://localhost:3000' + request.url + '"'];
      const headers = request.options.headers || {};

      for (const key of Object.keys(headers)) {
        parts.push('-H "' + key + ': ' + String(headers[key]).replaceAll('"', '\\"') + '"');
      }

      if (request.options.body) {
        parts.push("--data '" + String(request.options.body).replaceAll(\"'\", \"'\\\\''\") + "'");
      }

      return parts.join(" ");
    }

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(registerMessage, "");

      try {
        const formData = new FormData(registerForm);
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        await api("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const loginPayload = await api("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        await handleAuthenticatedSession(loginPayload.data);
      } catch (error) {
        setMessage(registerMessage, error.message || "Registration failed", true);
      }
    });

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(loginMessage, "");

      try {
        const formData = new FormData(loginForm);
        const payload = await api("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password")
          })
        });

        await handleAuthenticatedSession(payload.data);
      } catch (error) {
        setMessage(loginMessage, error.message || "Login failed", true);
      }
    });

    logoutButton.addEventListener("click", () => {
      setSessionToken("");
      setLatestApiToken("");
      latestTokenBox.style.display = "none";
      usageTokenInput.value = "";
      renderSession(null, "");
      renderTokens([]);
      tokenList.innerHTML = '<div class="muted">Sign in to load your tokens.</div>';
      showDashboard(false);
      setAuthMode("login");
      setMessage(loginMessage, "Signed out.");
    });

    createTokenForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(createTokenMessage, "");

      try {
        const formData = new FormData(createTokenForm);
        const payload = await api("/auth/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name")
          })
        });

        latestTokenBox.style.display = "block";
        latestTokenValue.textContent = payload.data.token;
        setLatestApiToken(payload.data.token);
        usageTokenInput.value = payload.data.token;
        await loadTokens();
        await refreshUsage();
        setMessage(createTokenMessage, "API token created successfully.");
        createTokenForm.reset();
      } catch (error) {
        setMessage(createTokenMessage, error.message || "Token creation failed", true);
      }
    });

    tokenList.addEventListener("click", async (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const action = target.dataset.action;
      const tokenId = target.dataset.id;

      if (!action || !tokenId) {
        return;
      }

      if (action === "rename") {
        const currentName = target.dataset.name || "";
        const nextName = window.prompt("Enter a new token name:", currentName);

        if (!nextName || nextName.trim() === currentName) {
          return;
        }

        try {
          await api("/auth/tokens/" + encodeURIComponent(tokenId), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nextName.trim() })
          });
          await loadTokens();
          setMessage(createTokenMessage, "Token renamed successfully.");
        } catch (error) {
          setMessage(createTokenMessage, error.message || "Rename failed", true);
        }
      }

      if (action === "revoke") {
        if (!window.confirm("Revoke this API token?")) {
          return;
        }

        try {
          await api("/auth/tokens/" + encodeURIComponent(tokenId), {
            method: "DELETE"
          });
          await loadTokens();
          setMessage(createTokenMessage, "Token revoked successfully.");
        } catch (error) {
          setMessage(createTokenMessage, error.message || "Revoke failed", true);
        }
      }
    });

    refreshUsageButton.addEventListener("click", () => {
      refreshUsage();
    });

    useLatestTokenButton.addEventListener("click", () => {
      const token = getLatestApiToken();
      usageTokenInput.value = token;
      if (token) {
        refreshUsage();
      } else {
        setMessage(usageMessage, "No newly created token is stored in this browser session yet.", true);
      }
    });

    consoleForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(consoleMessage, "");
      consoleResponseMeta.textContent = "Request running";

      try {
        const request = buildConsoleRequest();
        const response = await fetch(request.url, request.options);
        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json") ? await response.json() : await response.text();

        if (!response.ok) {
          throw new Error(typeof payload === "string" ? payload : (payload.message || "Request failed"));
        }

        consoleResponse.textContent = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
        consoleResponseMeta.textContent = (request.options.method || "GET") + " " + request.url;
        setMessage(consoleMessage, "Request completed successfully.");
      } catch (error) {
        consoleResponse.textContent = JSON.stringify({
          error: error.message || "Request failed"
        }, null, 2);
        consoleResponseMeta.textContent = "Request failed";
        setMessage(consoleMessage, error.message || "Request failed", true);
      }
    });

    for (const card of consoleCards) {
      card.addEventListener("click", () => {
        setConsoleMode(card.dataset.console || "search");
      });
    }

    methodGetButton.addEventListener("click", () => setRequestMethod("GET"));
    methodPostButton.addEventListener("click", () => setRequestMethod("POST"));

    consoleUseLatestToken.addEventListener("click", () => {
      const token = getLatestApiToken();
      consoleTokenInput.value = token;
      if (!token) {
        setMessage(consoleMessage, "No newly created token is stored in this browser session yet.", true);
      }
    });

    consoleCopyCurl.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(buildCurlPreview());
        setMessage(consoleMessage, "cURL command copied to clipboard.");
      } catch {
        setMessage(consoleMessage, "Unable to copy automatically. Try again in a secure browser context.", true);
      }
    });

    showLoginButton.addEventListener("click", () => setAuthMode("login"));
    showRegisterButton.addEventListener("click", () => setAuthMode("register"));
    switchToRegister.addEventListener("click", (event) => {
      event.preventDefault();
      setAuthMode("register");
    });
    switchToLogin.addEventListener("click", (event) => {
      event.preventDefault();
      setAuthMode("login");
    });

    setAuthMode("login");
    setConsoleMode("search");
    setRequestMethod("GET");
    showDashboard(false);
  </script>
</body>
</html>
`;
