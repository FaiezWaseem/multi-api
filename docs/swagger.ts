import swaggerJSDoc, { type OAS3Definition, type Options } from "swagger-jsdoc";

const swaggerDefinition: OAS3Definition = {
  openapi: "3.0.0",
  info: {
    title: "DuckDuckGo Search API",
    version: "1.0.0",
    description: "Express API for running DuckDuckGo searches with optional region support.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "DuckDuckGo Search",
      description: "Search DuckDuckGo with GET or POST requests.",
    },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "DuckDuckGo search completed successfully",
          },
          data: { nullable: true },
        },
        required: ["statusCode", "success", "message", "data"],
      },
      DuckDuckGoResult: {
        type: "object",
        properties: {
          title: { type: "string", example: "OpenAI" },
          url: { type: "string", example: "https://openai.com/" },
          snippet: {
            type: "string",
            example: "OpenAI builds safe and useful AI systems.",
          },
        },
        required: ["title", "url", "snippet"],
      },
      DuckDuckGoSearchData: {
        type: "object",
        properties: {
          query: { type: "string", example: "openai" },
          limit: { type: "integer", example: 10 },
          region: {
            type: "string",
            nullable: true,
            example: "us-en",
          },
          count: { type: "integer", example: 2 },
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/DuckDuckGoResult" },
          },
        },
        required: ["query", "limit", "region", "count", "results"],
      },
      DuckDuckGoSearchResponse: {
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
      ValidationIssue: {
        type: "object",
        properties: {
          code: { type: "string", example: "invalid_type" },
          path: {
            type: "array",
            items: {
              oneOf: [{ type: "string" }, { type: "integer" }],
            },
            example: ["query"],
          },
          message: { type: "string", example: "query is required" },
        },
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
                ],
              },
            },
          },
        ],
      },
      DuckDuckGoSearchRequestBody: {
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
  paths: {
    "/search/duckduckgo": {
      get: {
        tags: ["DuckDuckGo Search"],
        summary: "Search DuckDuckGo with query parameters",
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
        ],
        responses: {
          "200": {
            description: "Search completed successfully.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DuckDuckGoSearchResponse" },
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
          "429": {
            description: "Too many requests.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DuckDuckGoSearchRequestBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Search completed successfully.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DuckDuckGoSearchResponse" },
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
          "429": {
            description: "Too many requests.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
