import { getServerEnv } from "@/lib/env";

export type PenbaRole = "customer" | "host" | "operator";

export function getRequestRole(request: Request): PenbaRole {
  const role = request.headers.get("x-penbatv-role");

  if (role === "customer" || role === "host" || role === "operator") {
    return role;
  }

  return "customer";
}

export function requireAdminToken(request: Request, allowedRoles: PenbaRole[] = ["host", "operator"]) {
  const configuredToken = getServerEnv().STAYLINK_ADMIN_API_TOKEN;

  if (!configuredToken) {
    throw new Error("STAYLINK_ADMIN_API_TOKEN is required for host API operations.");
  }

  const requestToken = request.headers.get("x-admin-token");

  if (requestToken !== configuredToken) {
    throw new Error("Invalid admin token.");
  }

  const requestRole = getRequestRole(request);

  if (!allowedRoles.includes(requestRole)) {
    throw new Error(`Role ${requestRole} is not allowed for this operation. Set x-penbatv-role explicitly.`);
  }

  return { role: requestRole };
}

export function requireHostToken(request: Request) {
  return requireAdminToken(request, ["host", "operator"]);
}

export function requireOperatorToken(request: Request) {
  return requireAdminToken(request, ["operator"]);
}
