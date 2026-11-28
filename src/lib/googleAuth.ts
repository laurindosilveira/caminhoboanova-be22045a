import { supabase } from "@/integrations/supabase/client";

export function getGoogleOAuthRedirectUrl(origin?: string): string {
  const resolvedOrigin = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${resolvedOrigin.replace(/\/+$/, "")}/home`;
}

export function getGoogleAuthErrorMessage(error: { message?: string } | null | undefined): string {
  const raw = String(error?.message ?? "").trim();
  const lower = raw.toLowerCase();

  if (lower.includes("unsupported provider") || lower.includes("provider is not enabled")) {
    return "O login com Google ainda não foi ativado no servidor de autenticação.";
  }

  if (lower.includes("popup") && lower.includes("blocked")) {
    return "A janela do Google foi bloqueada pelo navegador. Permita pop-ups e tente novamente.";
  }

  if (lower.includes("cancel") || lower.includes("access_denied")) {
    return "O acesso com Google foi cancelado.";
  }

  return raw ? `Erro ao entrar com Google: ${raw}` : "Não foi possível entrar com Google. Tente novamente.";
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getGoogleOAuthRedirectUrl(),
      queryParams: {
        prompt: "select_account",
      },
    },
  });
}
