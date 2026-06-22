export type LoginDiagnosticCode =
  | "OFFLINE"
  | "APP_UNREACHABLE"
  | "SUPABASE_UNREACHABLE"
  | "AUTH_TIMEOUT"
  | "AUTH_REQUEST_FAILED";

type ProbeResult = {
  ok: boolean;
  status: number | null;
  error: string | null;
};

export type LoginDiagnostic = {
  code: LoginDiagnosticCode;
  timestamp: string;
  online: boolean;
  app: ProbeResult;
  supabase: ProbeResult;
  authError: string;
  appVersion: string;
  userAgent: string;
};

const PROBE_TIMEOUT_MS = 6000;

function errorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`.slice(0, 300);
  }
  return String(error || "Erro desconhecido").slice(0, 300);
}

async function probe(url: string, headers?: Record<string, string>): Promise<ProbeResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers,
      signal: controller.signal,
    });

    // Any HTTP response proves that DNS, TLS and the destination server worked.
    return { ok: true, status: response.status, error: null };
  } catch (error) {
    return { ok: false, status: null, error: errorText(error) };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function classifyLoginDiagnostic(input: {
  online: boolean;
  appReachable: boolean;
  supabaseReachable: boolean;
  timedOut: boolean;
}): LoginDiagnosticCode {
  if (!input.online) return "OFFLINE";
  if (!input.appReachable) return "APP_UNREACHABLE";
  if (!input.supabaseReachable) return "SUPABASE_UNREACHABLE";
  if (input.timedOut) return "AUTH_TIMEOUT";
  return "AUTH_REQUEST_FAILED";
}

export async function diagnoseLoginFailure(
  authError: unknown,
  options: { timedOut?: boolean } = {},
): Promise<LoginDiagnostic> {
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "");
  const nonce = Date.now();

  const [app, supabase] = await Promise.all([
    probe(`${window.location.origin}/robots.txt?login-diagnostic=${nonce}`),
    supabaseUrl
      ? probe(`${supabaseUrl}/auth/v1/settings?login-diagnostic=${nonce}`, {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        })
      : Promise.resolve({
          ok: false,
          status: null,
          error: "VITE_SUPABASE_URL ausente",
        }),
  ]);

  const online = navigator.onLine;
  const code = classifyLoginDiagnostic({
    online,
    appReachable: app.ok,
    supabaseReachable: supabase.ok,
    timedOut: options.timedOut === true,
  });

  return {
    code,
    timestamp: new Date().toISOString(),
    online,
    app,
    supabase,
    authError: errorText(authError),
    appVersion: typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "desconhecida",
    userAgent: navigator.userAgent,
  };
}

export function formatLoginDiagnostic(diagnostic: LoginDiagnostic) {
  const formatProbe = (result: ProbeResult) =>
    result.ok
      ? `respondeu (HTTP ${result.status})`
      : `falhou (${result.error || "sem resposta"})`;

  return [
    `Diagnóstico de login: ${diagnostic.code}`,
    `Horário: ${diagnostic.timestamp}`,
    `Versão: ${diagnostic.appVersion}`,
    `Navegador online: ${diagnostic.online ? "sim" : "não"}`,
    `Site: ${formatProbe(diagnostic.app)}`,
    `Supabase: ${formatProbe(diagnostic.supabase)}`,
    `Erro de autenticação: ${diagnostic.authError}`,
    `Navegador: ${diagnostic.userAgent}`,
  ].join("\n");
}
