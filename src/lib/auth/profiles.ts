import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const normalized = stringValue(value);
    if (normalized) return normalized;
  }

  return null;
}

function getProvider(user: User) {
  return firstString(user.app_metadata.provider, user.identities?.[0]?.provider);
}

function getProviderUserId(user: User) {
  return firstString(
    user.identities?.[0]?.id,
    user.identities?.[0]?.identity_data?.sub,
    user.identities?.[0]?.identity_data?.id
  );
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata;

  return firstString(
    metadata.name,
    metadata.full_name,
    metadata.nickname,
    metadata.preferred_username,
    metadata.user_name,
    user.email?.split("@")[0],
    user.phone
  );
}

function getPhone(user: User) {
  const metadata = user.user_metadata;

  return firstString(user.phone, metadata.phone, metadata.phone_number, metadata.mobile);
}

function getAvatarUrl(user: User) {
  const metadata = user.user_metadata;

  return firstString(metadata.avatar_url, metadata.picture, metadata.profile_image_url);
}

export async function upsertCustomerProfileFromUser(user: User) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const profile: ProfileInsert = {
    id: user.id,
    role: "customer",
    provider: getProvider(user),
    provider_user_id: getProviderUserId(user),
    email: user.email ?? null,
    name: getDisplayName(user),
    phone: getPhone(user),
    avatar_url: getAvatarUrl(user),
    status: "active",
    last_sign_in_at: user.last_sign_in_at ?? now,
    updated_at: now
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (error) throw error;
}
