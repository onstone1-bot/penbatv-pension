import type { User } from "@supabase/supabase-js";
import { upsertCustomerProfileFromUser } from "@/lib/auth/profiles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type CustomerProfile = Database["public"]["Tables"]["profiles"]["Row"];

export type CurrentCustomer = {
  user: User;
  profile: CustomerProfile | null;
};

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile) {
      return {
        user: data.user,
        profile
      };
    }

    await upsertCustomerProfileFromUser(data.user);

    const { data: savedProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    return {
      user: data.user,
      profile: savedProfile ?? null
    };
  } catch {
    return {
      user: data.user,
      profile: null
    };
  }
}
