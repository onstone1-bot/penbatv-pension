import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID: z.string().min(1).default("baebang-alps")
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STAYLINK_ADMIN_API_TOKEN: z.string().min(1).optional()
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID:
      process.env.NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID:
      process.env.NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STAYLINK_ADMIN_API_TOKEN: process.env.STAYLINK_ADMIN_API_TOKEN
  });
}
