import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type BootstrapProfile = {
  id: string;
  user_id: string;
  full_name: string;
  birth_date: string;
  phone: string;
  whatsapp_number?: string | null;
  community: string;
  area: string;
  church_id?: string | null;
  churches?: { name: string | null } | null;
  turma_id?: string | null;
  father_name?: string;
  mother_name?: string;
  father_phone?: string;
  mother_phone?: string;
  address?: string;
  avatar_url?: string;
  confirmation_year?: number | null;
  enrollment_status?: "pending" | "approved" | "rejected";
  requires_password_setup?: boolean;
};

export type BootstrapRole = {
  role: "admin" | "lider";
  admin_area: string | null;
  church_id: string | null;
};

export type BootstrapSubscription = {
  subscription_status: string | null;
  trial_ends_at: string | null;
  is_active: boolean | null;
};

export type AppBootstrap = {
  profile: BootstrapProfile | null;
  roles: BootstrapRole[];
  is_super: boolean;
  subscription: BootstrapSubscription | null;
};

type CacheEntry = {
  data: AppBootstrap;
  expiresAt: number;
};

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();
const requests = new Map<string, Promise<AppBootstrap>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBootstrap(value: Json | null): AppBootstrap {
  if (!isRecord(value)) {
    return { profile: null, roles: [], is_super: false, subscription: null };
  }

  return {
    profile: isRecord(value.profile) ? value.profile as BootstrapProfile : null,
    roles: Array.isArray(value.roles)
      ? value.roles.filter(isRecord).map((role) => role as BootstrapRole)
      : [],
    is_super: value.is_super === true,
    subscription: isRecord(value.subscription)
      ? value.subscription as BootstrapSubscription
      : null,
  };
}

async function fetchLegacyBootstrap(userId: string): Promise<AppBootstrap> {
  const [profileResult, roleResult, superResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_roles").select("role, admin_area, church_id").eq("user_id", userId).in("role", ["admin", "lider"]),
    supabase.rpc("is_super_admin", { _user_id: userId }),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (roleResult.error) throw roleResult.error;

  let profile = profileResult.data as BootstrapProfile | null;
  if (profile?.church_id) {
    const { data: church } = await supabase
      .from("churches")
      .select("name")
      .eq("id", profile.church_id)
      .maybeSingle();
    profile = { ...profile, churches: church ?? null };
  }

  const { data: subscription } = profile?.church_id
    ? await supabase
      .from("church_subscriptions")
      .select("subscription_status,trial_ends_at,is_active")
      .eq("church_id", profile.church_id)
      .maybeSingle()
    : { data: null };

  return {
    profile,
    roles: (roleResult.data ?? []) as BootstrapRole[],
    is_super: superResult.data === true,
    subscription: subscription as BootstrapSubscription | null,
  };
}

export function invalidateAppBootstrap(userId?: string | null) {
  if (userId) {
    cache.delete(userId);
    requests.delete(userId);
    return;
  }
  cache.clear();
  requests.clear();
}

export async function getAppBootstrap(userId: string, force = false): Promise<AppBootstrap> {
  if (!force) {
    const cached = cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    const pending = requests.get(userId);
    if (pending) return pending;
  }

  const request = (async () => {
    const { data, error } = await supabase.rpc("get_my_app_bootstrap");
    const bootstrap = error
      ? await fetchLegacyBootstrap(userId)
      : parseBootstrap(data);
    cache.set(userId, { data: bootstrap, expiresAt: Date.now() + CACHE_TTL_MS });
    return bootstrap;
  })().finally(() => {
    requests.delete(userId);
  });

  requests.set(userId, request);
  return request;
}
