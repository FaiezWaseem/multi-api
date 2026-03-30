#!/bin/bash

set -e

NODE_ENV="${NODE_ENV:-development}"

# Install dependencies
bun install

if [ "$NODE_ENV" = "production" ]; then
  bun run build
fi

if pm2 list | grep -q "duckduckgo-search"; then
  echo "Stopping existing pm2 process..."
  pm2 stop duckduckgo-search
  pm2 delete duckduckgo-search
fi

# Run the application with pm2 based on environment
if [ "$NODE_ENV" = "production" ]; then
  pm2 start bun --name duckduckgo-search --update-env -- dist/index.js
else
  pm2 start bun --name duckduckgo-search --update-env -- index.ts
fi
