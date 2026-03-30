export const llmGuide = `# duckduckgo-search API Guide for LLMs

Base URL
- Use the current server origin, for example: http://localhost:3000

Response Envelope
- All JSON APIs return:
  {
    "statusCode": number,
    "success": boolean,
    "message": string,
    "data": any | null
  }

Authentication Model
- Free tier:
  - No x-api-token header
  - Can use DuckDuckGo search endpoints
  - Cannot use /crawl
- Auth tier:
  - Valid x-api-token for a normal registered user
- Paid tier:
  - Valid x-api-token for a paid user
- Session auth:
  - Authorization: Bearer <sessionToken>
  - Used for account and token-management APIs

Important Headers
- x-api-token: API token for search, crawl, usage, and search-log access
- Authorization: Bearer <sessionToken> for account APIs and login logs
- Content-Type: application/json for POST/PATCH requests

Rate Limits
- Free: 5 requests/minute, 10 requests/day
- Auth: 10 requests/minute, 50 requests/day
- Paid: 30 requests/minute, 3000 requests/day
- Rate limit headers:
  - x-account-tier
  - x-ratelimit-minute-limit
  - x-ratelimit-minute-remaining
  - x-ratelimit-minute-reset
  - x-ratelimit-day-limit
  - x-ratelimit-day-remaining
  - x-ratelimit-day-reset

Auth Endpoints
- POST /auth/register
  - Body:
    {
      "email": "user@example.com",
      "password": "supersecret123"
    }
- POST /auth/login
  - Body:
    {
      "email": "user@example.com",
      "password": "supersecret123"
    }
  - Returns sessionToken and user info
- GET /auth/tokens
  - Requires Authorization: Bearer <sessionToken>
- POST /auth/tokens
  - Requires Authorization: Bearer <sessionToken>
  - Body:
    {
      "name": "My server token"
    }
- PATCH /auth/tokens/:id
  - Requires Authorization: Bearer <sessionToken>
  - Body:
    {
      "name": "Renamed token"
    }
- DELETE /auth/tokens/:id
  - Requires Authorization: Bearer <sessionToken>

Usage Endpoint
- GET /usage
  - Optional x-api-token
  - Without token: returns free-tier usage snapshot
  - With valid token: returns auth or paid usage snapshot

DuckDuckGo Search Endpoints
- GET /search/duckduckgo
- POST /search/duckduckgo

Search Input Fields
- query: string, required
- limit: integer, optional, 1 to 50
- region: string like us-en, uk-en, pk-en, wt-wt
- response_type: json | html | markdown | txt
- cursor: opaque string for pagination
- proxy: POST only, token users only

Search Behavior
- response_type defaults to json
- json returns structured results:
  - query
  - limit
  - region
  - responseType
  - nextCursor
  - count
  - results[]
- html returns rendered DuckDuckGo HTML as data.content
- markdown returns formatted markdown as data.content
- txt returns plain text as data.content
- nextCursor may be returned when more results are available
- Search logs are stored for authenticated x-api-token users

Search POST Example
- POST /search/duckduckgo
  - Headers:
    - x-api-token: <apiToken> optional but recommended
  - Body:
    {
      "query": "openai",
      "limit": 10,
      "region": "us-en",
      "response_type": "json"
    }

Custom Proxy Support
- Supported on POST /search/duckduckgo and POST /crawl
- Only available for authenticated x-api-token users
- If proxy is provided without a valid x-api-token, API returns 403
- Proxy body shape:
  {
    "proxy": {
      "server": "http://127.0.0.1:8080",
      "username": "proxy-user",
      "password": "proxy-pass",
      "bypass": "<-loopback>"
    }
  }
- Supported server schemes:
  - http://
  - https://
  - socks5://

Crawl Endpoints
- GET /crawl
- POST /crawl

Crawl Access Rules
- /crawl is not available for free-tier users
- A valid x-api-token is required
- Without x-api-token, /crawl returns:
  - statusCode: 403
  - message: "The /crawl endpoint is only available for authenticated API token users."

Crawl Input Fields
- url: absolute http or https URL, required
- response_type: json | html | markdown | txt
- js_code: optional JavaScript string executed in the browser page context after load
- proxy: POST only, token users only

Crawl Behavior
- json returns:
  - url
  - finalUrl
  - responseType
  - title
  - text
  - html
  - links[]
  - executionResult
- html returns rendered page HTML in data.content
- markdown returns a markdown summary in data.content
- txt returns a text summary in data.content
- js_code can read or mutate the page before output is captured
- executionResult is included in crawl responses

Crawl POST Example
- POST /crawl
  - Headers:
    - x-api-token: <apiToken>
  - Body:
    {
      "url": "https://example.com",
      "response_type": "json",
      "js_code": "return { title: document.title, linkCount: document.links.length };"
    }

Logs
- GET /log/searches
  - Supports either:
    - Authorization: Bearer <sessionToken>
    - x-api-token: <apiToken>
  - Returns only the authenticated user's search logs
- GET /log/logins
  - Requires Authorization: Bearer <sessionToken>

Docs and Discovery
- GET /docs for Swagger UI
- GET /openapi.json for OpenAPI JSON
- GET /llm.txt for this LLM-oriented guide

Error Handling Notes
- Invalid validation input returns 400
- Invalid x-api-token returns 401
- Missing free-tier access to /crawl returns 403
- Rate limit violations return 429
- Server or browser execution failures return 500 or 502 depending on the failure path

Best Practices for LLM Clients
- Prefer POST for complex requests
- Use x-api-token when possible so usage, logs, and higher limits are available
- Use response_type=json when structured parsing matters
- Use response_type=markdown or txt for direct model ingestion
- Use cursor for paginating search results
- Use js_code carefully because it executes in the crawled page context
- Treat proxy as an advanced token-only feature
`;
