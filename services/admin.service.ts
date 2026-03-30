import { getSystemRequestMetrics, listRequestLogs } from "./log.service";

export function getAdminMetrics() {
  return getSystemRequestMetrics();
}

export function getAdminRequestLogs(limit = 100) {
  return listRequestLogs(limit);
}
