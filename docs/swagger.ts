import swaggerJSDoc, { type OAS3Definition, type Options } from "swagger-jsdoc";

const swaggerDefinition: OAS3Definition = {
  openapi: "3.0.0",
  info: {
    title: "DuckDuckGo Search API",
    version: "1.0.0",
    description:
      "DuckDuckGo search API with SQLite-backed accounts, login sessions, API tokens, and tiered rate limits.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Register, login, and manage API tokens.",
    },
    {
      name: "DuckDuckGo Search",
      description: "Search DuckDuckGo with GET or POST requests.",
    },
    {
      name: "Usage",
      description: "Inspect current rate-limit tier and remaining usage.",
    },
    {
      name: "Logs",
      description: "Review login and search activity for the authenticated user.",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
      apiTokenAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-token",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Request completed successfully" },
          data: { nullable: true },
        },
        required: ["statusCode", "success", "message", "data"],
      },
      ErrorResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApiResponse" },
          {
            type: "object",
            properties: {
              data: {
                oneOf: [
                  { type: "null" },
                  {
                    type: "array",
                    items: { $ref: "#/components/schemas/ValidationIssue" },
                  },
                  {
                    type: "object",
                  },
                ],
              },
            },
          },
        ],
      },
      ValidationIssue: {
        type: "object",
        properties: {
          code: { type: "string", example: "invalid_type" },
          path: {
            type: "array",
            items: {
              oneOf: [{ type: "string" }, { type: "integer" }],
            },
            example: ["email"],
          },
          message: { type: "string", example: "Invalid email address" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "f6f66cf1-7e87-4b8a-b9d0-a6ce3f1b1111" },
          email: { type: "string", example: "user@example.com" },
          isPaid: { type: "boolean", example: false },
          createdAt: { type: "string", example: "2026-03-30T10:00:00.000Z" },
        },
        required: ["id", "email", "isPaid", "createdAt"],
      },
      LoginData: {
        type: "object",
        properties: {
          sessionToken: { type: "string", example: "sess_0123456789abcdef" },
          expiresAt: { type: "string", example: "2026-04-06T10:00:00.000Z" },
          user: { $ref: "#/components/schemas/User" },
        },
        required: ["sessionToken", "expiresAt", "user"],
      },
      ApiToken: {
        type: "object",
        properties: {
          id: { type: "string", example: "9f0a0f6d-9cac-48a3-93db-0e8f35095a9c" },
          name: { type: "string", example: "My server token" },
          token: { type: "string", example: "ddg_0123456789abcdef" },
          tokenPrefix: { type: "string", example: "ddg_01234567" },
        },
        required: ["id", "name", "token", "tokenPrefix"],
      },
      StoredApiToken: {
        type: "object",
        properties: {
          id: { type: "string", example: "9f0a0f6d-9cac-48a3-93db-0e8f35095a9c" },
          name: { type: "string", example: "My server token" },
          token_prefix: { type: "string", example: "ddg_01234567" },
          last_used_at: { type: "string", nullable: true, example: "2026-03-30 12:34:56" },
          created_at: { type: "string", example: "2026-03-30 12:00:00" },
        },
        required: ["id", "name", "token_prefix", "last_used_at", "created_at"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "user@example.com" },
          password: { type: "string", example: "supersecret123" },
        },
        required: ["email", "password"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "user@example.com" },
          password: { type: "string", example: "supersecret123" },
        },
        required: ["email", "password"],
      },
      CreateApiTokenRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "My server token" },
        },
        required: ["name"],
      },
      DuckDuckGoResult: {
        type: "object",
        properties: {
          title: { type: "string", example: "OpenAI" },
          url: { type: "string", example: "https://openai.com/" },
          snippet: { type: "string", example: "OpenAI builds safe and useful AI systems." },
        },
        required: ["title", "url", "snippet"],
      },
      DuckDuckGoSearchData: {
        type: "object",
        properties: {
          query: { type: "string", example: "openai" },
          limit: { type: "integer", example: 10 },
          region: { type: "string", nullable: true, example: "us-en" },
          count: { type: "integer", example: 2 },
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/DuckDuckGoResult" },
          },
        },
        required: ["query", "limit", "region", "count", "results"],
      },
      RateLimitErrorData: {
        type: "object",
        properties: {
          tier: {
            type: "string",
            enum: ["free", "auth", "paid"],
            example: "auth",
          },
          identity: {
            type: "string",
            example: "user:f6f66cf1-7e87-4b8a-b9d0-a6ce3f1b1111",
          },
          window: {
            type: "string",
            enum: ["minute", "day"],
            example: "minute",
          },
          limit: {
            type: "integer",
            example: 20,
          },
        },
        required: ["tier", "identity", "window", "limit"],
      },
      UsageSnapshot: {
        type: "object",
        properties: {
          tier: {
            type: "string",
            enum: ["free", "auth", "paid"],
            example: "free",
          },
          identity: {
            type: "string",
            example: "ip:::1",
          },
          authenticated: {
            type: "boolean",
            example: false,
          },
          limits: {
            type: "object",
            properties: {
              minute: { type: "integer", example: 2 },
              day: { type: "integer", example: 100 },
            },
            required: ["minute", "day"],
          },
          usage: {
            type: "object",
            properties: {
              minute: {
                type: "object",
                properties: {
                  used: { type: "integer", example: 1 },
                  remaining: { type: "integer", example: 1 },
                  resetInSeconds: { type: "integer", example: 42 },
                },
                required: ["used", "remaining", "resetInSeconds"],
              },
              day: {
                type: "object",
                properties: {
                  used: { type: "integer", example: 1 },
                  remaining: { type: "integer", example: 99 },
                  resetInSeconds: { type: "integer", example: 86312 },
                },
                required: ["used", "remaining", "resetInSeconds"],
              },
            },
            required: ["minute", "day"],
          },
        },
        required: ["tier", "identity", "authenticated", "limits", "usage"],
      },
      LoginLog: {
        type: "object",
        properties: {
          id: { type: "string" },
          user_id: { type: "string" },
          email: { type: "string", example: "user@example.com" },
          ip_address: { type: "string", nullable: true, example: "::1" },
          user_agent: { type: "string", nullable: true, example: "Mozilla/5.0" },
          created_at: { type: "string", example: "2026-03-30 12:00:00" },
        },
        required: ["id", "user_id", "email", "ip_address", "user_agent", "created_at"],
      },
      SearchLog: {
        type: "object",
        properties: {
          id: { type: "string" },
          user_id: { type: "string" },
          api_token_id: { type: "string", nullable: true },
          query: { type: "string", example: "openai" },
          region: { type: "string", nullable: true, example: "us-en" },
          result_count: { type: "integer", example: 1 },
          requested_limit: { type: "integer", example: 10 },
          ip_address: { type: "string", nullable: true, example: "::1" },
          user_agent: { type: "string", nullable: true, example: "Mozilla/5.0" },
          created_at: { type: "string", example: "2026-03-30 12:10:00" },
        },
        required: [
          "id",
          "user_id",
          "api_token_id",
          "query",
          "region",
          "result_count",
          "requested_limit",
          "ip_address",
          "user_agent",
          "created_at",
        ],
      },
    },
  },
  paths: {
    "/log/searches": {
      get: {
        tags: ["Logs"],
        summary: "List search logs for the logged-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", default: 50, minimum: 1, maximum: 100 },
            description: "Maximum number of log entries to return.",
          },
        ],
        responses: {
          "200": {
            description: "Search logs fetched successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/SearchLog" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Missing or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/log/logins": {
      get: {
        tags: ["Logs"],
        summary: "List login logs for the logged-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", default: 50, minimum: 1, maximum: 100 },
            description: "Maximum number of log entries to return.",
          },
        ],
        responses: {
          "200": {
            description: "Login logs fetched successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/LoginLog" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Missing or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/usage": {
      get: {
        tags: ["Usage"],
        summary: "Get the current rate-limit usage snapshot",
        security: [{ apiTokenAuth: [] }],
        parameters: [
          {
            in: "header",
            name: "x-api-token",
            required: false,
            schema: { type: "string" },
            description:
              "Optional API token. No token = free tier snapshot. Valid token = auth or paid snapshot depending on the user subscription.",
          },
        ],
        responses: {
          "200": {
            description: "Usage fetched successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/UsageSnapshot" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid x-api-token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Invalid request data.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a session token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/LoginData" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Invalid request data.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/tokens": {
      get: {
        tags: ["Auth"],
        summary: "List API tokens for the logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Token list fetched successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/StoredApiToken" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Missing or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Create an API token for the logged-in user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateApiTokenRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "API token created.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ApiToken" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Invalid request data.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/search/duckduckgo": {
      get: {
        tags: ["DuckDuckGo Search"],
        summary: "Search DuckDuckGo with query parameters",
        security: [{ apiTokenAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "query",
            required: true,
            schema: { type: "string" },
            description: "Search text to send to DuckDuckGo.",
          },
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            description: "Maximum number of results to return.",
          },
          {
            in: "query",
            name: "region",
            required: false,
            schema: { type: "string", example: "us-en" },
            description: "DuckDuckGo region, for example us-en, uk-en, pk-en, wt-wt.",
          },
          {
            in: "header",
            name: "x-api-token",
            required: false,
            schema: { type: "string" },
            description:
              "Optional API token. No token = free tier. Valid token = auth or paid tier depending on the user subscription.",
          },
        ],
        responses: {
          "200": {
            description: "Search completed successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/DuckDuckGoSearchData" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Invalid request data.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid x-api-token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "429": {
            description: "Too many requests.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ErrorResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/RateLimitErrorData" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "500": {
            description: "Internal server error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["DuckDuckGo Search"],
        summary: "Search DuckDuckGo with a JSON body",
        security: [{ apiTokenAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            description: "Optional fallback limit in the query string.",
          },
          {
            in: "query",
            name: "region",
            required: false,
            schema: { type: "string", example: "us-en" },
            description: "Optional fallback region in the query string.",
          },
          {
            in: "header",
            name: "x-api-token",
            required: false,
            schema: { type: "string" },
            description:
              "Optional API token. No token = free tier. Valid token = auth or paid tier depending on the user subscription.",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: { type: "string", example: "openai" },
                  limit: { type: "integer", example: 10 },
                  region: { type: "string", example: "us-en" },
                },
                required: ["query"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Search completed successfully.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/DuckDuckGoSearchData" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Invalid request data.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid x-api-token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "429": {
            description: "Too many requests.",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ErrorResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/RateLimitErrorData" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "500": {
            description: "Internal server error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions: Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
