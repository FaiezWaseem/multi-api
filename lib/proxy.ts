export type ProxyConfig = {
  server: string;
  username?: string;
  password?: string;
  bypass?: string;
};

export function getDefaultProxyConfig(): ProxyConfig | null {
  const server = process.env.PROXY_SERVER?.trim() || null;

  if (!server) {
    return null;
  }

  const username = process.env.PROXY_USERNAME?.trim() || undefined;
  const password = process.env.PROXY_PASSWORD || undefined;
  const bypass = process.env.PROXY_BYPASS?.trim() || undefined;

  return {
    server,
    username,
    password,
    bypass,
  };
}
