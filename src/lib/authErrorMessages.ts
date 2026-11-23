const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

export const AUTH_EMAIL_RATE_LIMIT_MESSAGE =
  "Muitas solicitações de email no momento. Aguarde alguns minutos e tente novamente. Se persistir, avise a liderança.";

function normalizeErrorText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getErrorField(error: unknown, field: "message" | "code" | "status") {
  if (!error || typeof error !== "object") return "";
  return (error as Record<string, unknown>)[field];
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  const message = getErrorField(error, "message");
  return typeof message === "string" ? message : String(error || "Erro desconhecido");
}

export function isAuthNetworkError(error: unknown) {
  const message = normalizeErrorText(
    error instanceof Error ? error.message : getErrorField(error, "message"),
  );

  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed")
  );
}

export function isAuthRateLimitError(error: unknown) {
  const message = normalizeErrorText(
    error instanceof Error ? error.message : getErrorField(error, "message"),
  );
  const code = normalizeErrorText(getErrorField(error, "code"));
  const status = Number(getErrorField(error, "status"));

  return (
    status === 429 ||
    code.includes("rate_limit") ||
    code.includes("over_email_send_rate_limit") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("email rate") ||
    message.includes("over email send")
  );
}

export function getAuthEmailFlowErrorMessage(error: unknown, fallbackPrefix: string) {
  if (isAuthNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  if (isAuthRateLimitError(error)) return AUTH_EMAIL_RATE_LIMIT_MESSAGE;
  return `${fallbackPrefix}: ${getAuthErrorMessage(error)}`;
}
