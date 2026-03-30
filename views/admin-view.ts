export const adminViewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Console</title>
  <style>
    :root {
      --bg: #f5efe4;
      --panel: #fffaf2;
      --ink: #1f1a17;
      --muted: #6e625a;
      --line: #d9cbbd;
      --accent: #0f766e;
      --accent-2: #b45309;
      --danger: #b91c1c;
      --shadow: 0 16px 40px rgba(49, 36, 21, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background:
        radial-gradient(circle at top left, rgba(180,83,9,0.12), transparent 28%),
        radial-gradient(circle at top right, rgba(15,118,110,0.12), transparent 24%),
        linear-gradient(180deg, #f9f4ec, var(--bg));
      color: var(--ink);
    }
    .shell {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }
    .hero {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
      margin-bottom: 24px;
    }
    .hero h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3.8rem);
      line-height: 0.95;
      letter-spacing: -0.04em;
    }
    .hero p {
      margin: 8px 0 0;
      max-width: 680px;
      color: var(--muted);
      font-size: 1rem;
    }
    .status {
      font-size: 0.95rem;
      color: var(--muted);
      text-align: right;
    }
    .grid {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 20px;
    }
    .panel {
      background: color-mix(in srgb, var(--panel) 92%, white);
      border: 1px solid var(--line);
      border-radius: 22px;
      box-shadow: var(--shadow);
      padding: 20px;
    }
    .panel h2, .panel h3 {
      margin: 0 0 14px;
      font-size: 1.1rem;
    }
    form {
      display: grid;
      gap: 10px;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 0.92rem;
      color: var(--muted);
    }
    input, textarea, button {
      font: inherit;
    }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      background: white;
      border-radius: 14px;
      padding: 12px 14px;
      color: var(--ink);
    }
    textarea { min-height: 90px; resize: vertical; }
    button {
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      background: var(--accent);
      color: white;
      cursor: pointer;
      transition: transform 140ms ease, opacity 140ms ease;
    }
    button.secondary { background: var(--accent-2); }
    button.danger { background: var(--danger); }
    button:hover { transform: translateY(-1px); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .stack { display: grid; gap: 16px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .stat {
      padding: 16px;
      border-radius: 18px;
      background: white;
      border: 1px solid var(--line);
    }
    .stat small {
      display: block;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .stat strong {
      font-size: 1.8rem;
      letter-spacing: -0.03em;
    }
    .table-wrap {
      overflow: auto;
      border-radius: 18px;
      border: 1px solid var(--line);
      background: white;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }
    th, td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid #eee2d4;
      vertical-align: top;
      font-size: 0.95rem;
    }
    th {
      position: sticky;
      top: 0;
      background: #fffaf4;
      color: var(--muted);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .note {
      color: var(--muted);
      font-size: 0.9rem;
    }
    .message {
      min-height: 22px;
      font-size: 0.95rem;
      color: var(--accent);
    }
    .message.error { color: var(--danger); }
    @media (max-width: 960px) {
      .grid { grid-template-columns: 1fr; }
      .hero { flex-direction: column; align-items: start; }
      .status { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="hero">
      <div>
        <h1>Admin Console</h1>
        <p>Login with your admin session, inspect traffic, review registered users, and manually top up user credits from one place.</p>
      </div>
      <div class="status" id="session-status">Not signed in</div>
    </div>

    <div class="grid">
      <div class="stack">
        <section class="panel">
          <h2>Admin Login</h2>
          <form id="login-form">
            <label>Email
              <input name="email" type="email" value="admin@local.dev" required />
            </label>
            <label>Password
              <input name="password" type="password" value="admin123456" required />
            </label>
            <button type="submit">Login</button>
          </form>
          <div class="message" id="login-message"></div>
        </section>

        <section class="panel">
          <div class="toolbar">
            <h2>Credit Grant</h2>
            <button class="danger" type="button" id="logout-button">Logout</button>
          </div>
          <form id="credit-form">
            <label>User
              <select id="credit-user" required></select>
            </label>
            <label>Credits
              <input id="credit-amount" type="number" min="1" step="1" value="10" required />
            </label>
            <label>Note
              <textarea id="credit-note" placeholder="Manual credit adjustment"></textarea>
            </label>
            <button class="secondary" type="submit">Add Credits</button>
          </form>
          <div class="message" id="credit-message"></div>
        </section>
      </div>

      <div class="stack">
        <section class="panel">
          <div class="toolbar">
            <h2>System Metrics</h2>
            <button type="button" id="refresh-button">Refresh</button>
          </div>
          <div class="stats">
            <div class="stat"><small>Daily Requests</small><strong id="daily-requests">0</strong></div>
            <div class="stat"><small>Monthly Requests</small><strong id="monthly-requests">0</strong></div>
          </div>
        </section>

        <section class="panel">
          <div class="toolbar">
            <h2>Registered Users</h2>
            <span class="note">Current balances, admin status, and paid plans.</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Credits</th>
                  <th>Paid</th>
                  <th>Admin</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody id="users-table"></tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="toolbar">
            <h2>Request Logs</h2>
            <span class="note">Method, endpoint, status, and IP.</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>IP</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody id="logs-table"></tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>

  <script>
    const sessionKey = "adminSessionToken";
    const loginForm = document.getElementById("login-form");
    const creditForm = document.getElementById("credit-form");
    const loginMessage = document.getElementById("login-message");
    const creditMessage = document.getElementById("credit-message");
    const sessionStatus = document.getElementById("session-status");
    const refreshButton = document.getElementById("refresh-button");
    const logoutButton = document.getElementById("logout-button");
    const creditUser = document.getElementById("credit-user");
    const usersTable = document.getElementById("users-table");
    const logsTable = document.getElementById("logs-table");
    const dailyRequests = document.getElementById("daily-requests");
    const monthlyRequests = document.getElementById("monthly-requests");

    function getToken() {
      return sessionStorage.getItem(sessionKey) || "";
    }

    function setToken(token) {
      if (!token) {
        sessionStorage.removeItem(sessionKey);
        return;
      }
      sessionStorage.setItem(sessionKey, token);
    }

    async function api(path, options = {}) {
      const token = getToken();
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set("Authorization", "Bearer " + token);
      }
      const response = await fetch(path, { ...options, headers });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();
      if (!response.ok) {
        throw new Error(payload.message || String(payload));
      }
      return payload;
    }

    function setMessage(node, text, isError = false) {
      node.textContent = text || "";
      node.className = "message" + (isError ? " error" : "");
    }

    function renderUsers(users) {
      usersTable.innerHTML = "";
      creditUser.innerHTML = '<option value="">Select a user</option>';

      for (const user of users) {
        const row = document.createElement("tr");
        row.innerHTML = \`
          <td>\${user.email}</td>
          <td>\${user.credits}</td>
          <td>\${user.isPaid ? "yes" : "no"}</td>
          <td>\${user.isAdmin ? "yes" : "no"}</td>
          <td>\${user.createdAt}</td>
        \`;
        usersTable.appendChild(row);

        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = \`\${user.email} (\${user.credits} credits)\`;
        creditUser.appendChild(option);
      }
    }

    function renderLogs(logs) {
      logsTable.innerHTML = "";
      for (const log of logs) {
        const row = document.createElement("tr");
        row.innerHTML = \`
          <td>\${log.method}</td>
          <td>\${log.endpoint}</td>
          <td>\${log.status_code}</td>
          <td>\${log.ip_address || "-"}</td>
          <td>\${log.created_at}</td>
        \`;
        logsTable.appendChild(row);
      }
    }

    async function refreshDashboard() {
      const [metricsRes, usersRes, logsRes] = await Promise.all([
        api("/admin/metrics"),
        api("/admin/users"),
        api("/admin/requests?limit=50")
      ]);

      dailyRequests.textContent = String(metricsRes.data.dailyRequests);
      monthlyRequests.textContent = String(metricsRes.data.monthlyRequests);
      renderUsers(usersRes.data);
      renderLogs(logsRes.data);
      sessionStatus.textContent = "Signed in as admin";
    }

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(loginMessage, "");
      try {
        const formData = new FormData(loginForm);
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password")
          })
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Login failed");
        }
        setToken(payload.data.sessionToken);
        await refreshDashboard();
        setMessage(loginMessage, "Admin session ready.");
      } catch (error) {
        setMessage(loginMessage, error.message || "Login failed", true);
      }
    });

    creditForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(creditMessage, "");
      try {
        const userId = creditUser.value;
        const amount = Number(document.getElementById("credit-amount").value);
        const note = document.getElementById("credit-note").value;
        if (!userId) {
          throw new Error("Select a user first.");
        }
        await api("/admin/users/" + encodeURIComponent(userId) + "/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, note })
        });
        await refreshDashboard();
        setMessage(creditMessage, "Credits added successfully.");
        creditForm.reset();
        document.getElementById("credit-amount").value = 10;
      } catch (error) {
        setMessage(creditMessage, error.message || "Failed to add credits", true);
      }
    });

    refreshButton.addEventListener("click", async () => {
      try {
        await refreshDashboard();
      } catch (error) {
        setMessage(loginMessage, error.message || "Refresh failed", true);
      }
    });

    logoutButton.addEventListener("click", () => {
      setToken("");
      sessionStatus.textContent = "Not signed in";
      setMessage(loginMessage, "Signed out.");
      setMessage(creditMessage, "");
    });

    if (getToken()) {
      refreshDashboard().catch((error) => {
        setToken("");
        setMessage(loginMessage, error.message || "Session expired", true);
        sessionStatus.textContent = "Not signed in";
      });
    }
  </script>
</body>
</html>
`;
