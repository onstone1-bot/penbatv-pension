import { getServerEnv } from "@/lib/env";

export function requireAdminToken(request: Request) {
  const configuredToken = getServerEnv().STAYLINK_ADMIN_API_TOKEN;

  if (!configuredToken) {
    throw new Error("STAYLINK_ADMIN_API_TOKEN is required for host API operations.");
  }

  const requestToken = request.headers.get("x-admin-token");

  if (requestToken !== configuredToken) {
    throw new Error("Invalid admin token.");
  }
}
