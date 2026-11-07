import { Turnstile } from "@marsidev/react-turnstile";

interface AuthCaptchaProps {
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
}

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

export const isAuthCaptchaEnabled = siteKey.length > 0;

export function AuthCaptcha({ onTokenChange, resetKey = 0 }: AuthCaptchaProps) {
  if (!isAuthCaptchaEnabled) return null;

  return (
    <div className="flex min-h-[65px] w-full items-center justify-center overflow-hidden" aria-label="Verificação de segurança">
      <Turnstile
        key={resetKey}
        siteKey={siteKey}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
        options={{ language: "pt-BR", theme: "auto", size: "flexible" }}
      />
    </div>
  );
}

