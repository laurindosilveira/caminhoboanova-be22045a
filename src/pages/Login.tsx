import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Eye, EyeOff, Mail, Lock, Flame, MessageCircle, Fingerprint } from "lucide-react";
import { z } from "zod";
import {
  diagnoseLoginFailure,
  formatLoginDiagnostic,
  type LoginDiagnostic,
} from "@/lib/loginDiagnostics";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cadastroSucesso = searchParams.get("cadastro") === "sucesso";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
  const [loginDiagnostic, setLoginDiagnostic] = useState<LoginDiagnostic | null>(null);
  const [diagnosticCopied, setDiagnosticCopied] = useState(false);

  useEffect(() => {
    // Check for passkey support
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setPasskeySupported(available))
        .catch(() => setPasskeySupported(false));
    } else {
      setPasskeySupported(false);
    }
  }, []);

  async function handleBiometricLogin() {
    setError(null);
    setLoading(true);
    try {
      // @ts-ignore - experimental API
      const { data, error: authError } = await supabase.auth.signInWithPasskey();
      
      if (authError) {
        const isCancelled = authError.message?.toLowerCase().includes("cancelled") || 
                           authError.message?.toLowerCase().includes("user aborted") ||
                           authError.message?.toLowerCase().includes("notallowederror");

        if (isCancelled) {
          // Log cancellation
          await supabase.rpc('log_login_event', {
            p_email: email || null,
            p_method: 'passkey',
            p_status: 'cancelled'
          });
          setLoading(false);
          return;
        }
        throw authError;
      }

      if (data?.user) {
        await handlePostLogin(data.user, "passkey_success");
      }
    } catch (err: any) {
      console.error("Biometric login error:", err);
      setError("Erro ao entrar com biometria: " + (err.message || "Tente novamente."));
      
      // Log failure
      await supabase.rpc('log_login_event', {
        p_email: email || null,
        p_method: 'passkey',
        p_status: 'failure',
        p_details: { error: err.message }
      });
      setLoading(false);
    }
  }

  async function handlePostLogin(user: any, method: "password_success" | "passkey_success") {
    localStorage.setItem('caminho_app_active', 'true');

    // Race all DB queries against a 5s timeout — if DB is slow, go to /home anyway
    const withTimeout = <T,>(p: Promise<T>): Promise<T | null> =>
      Promise.race([p, new Promise<null>(res => setTimeout(() => res(null), 5000))]);

    const [profileRes, isAdminRes, isLiderRes] = await Promise.all([
      withTimeout(supabase.from('profiles').select('church_id').eq('id', user.id).single()),
      withTimeout(supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })),
      withTimeout(supabase.rpc("has_role", { _user_id: user.id, _role: "lider" })),
    ]);

    const isAdmin = (isAdminRes as any)?.data === true;
    const isLider = (isLiderRes as any)?.data === true;

    supabase.rpc('log_church_audit', {
      p_church_id: (profileRes as any)?.data?.church_id ?? null,
      p_action: method,
      p_details: { email: user.email, user_id: user.id, timestamp: new Date().toISOString() }
    }).catch(() => {});

    if (isAdmin || isLider) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  }

  async function handleForceReload() {
    setIsReloading(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
      }
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch {}
    window.location.reload();
  }

  async function showNetworkDiagnostic(error: unknown, timedOut = false) {
    setIsNetworkError(true);
    setError("Não foi possível concluir o login. Verifique o diagnóstico abaixo.");

    try {
      const diagnostic = await diagnoseLoginFailure(error, { timedOut });
      setLoginDiagnostic(diagnostic);
      console.error("[Login diagnostic]", diagnostic);
    } catch (diagnosticError) {
      console.error("[Login diagnostic failed]", diagnosticError);
    }
  }

  async function copyDiagnostic() {
    if (!loginDiagnostic) return;

    try {
      await navigator.clipboard.writeText(formatLoginDiagnostic(loginDiagnostic));
      setDiagnosticCopied(true);
      window.setTimeout(() => setDiagnosticCopied(false), 2000);
    } catch (copyError) {
      console.error("[Login diagnostic copy failed]", copyError);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsNetworkError(false);
    setLoginDiagnostic(null);
    setDiagnosticCopied(false);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    let loginTimeoutId: number | undefined;

    try {
      const loginTimeout = new Promise<never>((_, reject) => {
        loginTimeoutId = window.setTimeout(() => {
          const timeoutError = new Error("A autenticação excedeu 12 segundos");
          timeoutError.name = "AuthTimeoutError";
          reject(timeoutError);
        }, 12000);
      });

      const { data: authData, error: authError } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
        loginTimeout,
      ]);

      if (authError) {
        const msg = authError.message?.toLowerCase() || "";

        supabase.rpc('log_login_event', {
          p_email: email,
          p_method: 'password',
          p_status: 'failure',
          p_details: { error: authError.message }
        }).catch(() => {});

        if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch")) {
          await showNetworkDiagnostic(authError);
        } else if (msg.includes("invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique seus dados e tente novamente.");
        } else if (msg.includes("email not confirmed")) {
          setError("Seu email ainda não foi confirmado. Verifique sua caixa de entrada.");
        } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
          setError("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        } else {
          setError("Erro ao entrar: " + authError.message);
        }
        return;
      }

      if (authData.user) {
        handlePostLogin(authData.user, "password_success");
      }
    } catch (err: any) {
      console.error("Login exception:", err?.message || err);
      const errMsg = (err?.message || "").toLowerCase();
      if (errMsg.includes("invalid login") || errMsg.includes("invalid credentials")) {
        setError("Email ou senha incorretos. Verifique seus dados e tente novamente.");
      } else {
        await showNetworkDiagnostic(err, err?.name === "AuthTimeoutError");
      }
    } finally {
      if (loginTimeoutId !== undefined) {
        window.clearTimeout(loginTimeoutId);
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-4xl">✝️</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl text-primary-foreground">Caminho</h1>
          <p className="text-primary-foreground/70 font-inter text-sm mt-1">Crescendo na fé, juntos.</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-7">
          <h2 className="font-montserrat font-black text-foreground text-2xl mb-1">Entrar</h2>
          <p className="text-muted-foreground font-inter text-sm mb-6">Bem-vindo de volta à sua jornada!</p>

          {cadastroSucesso && (
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-brand-green font-inter text-sm font-medium">
                ✅ Conta criada com sucesso! Faça login para começar.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-inter font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-inter font-medium text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/recuperar-senha" className="text-secondary font-inter text-sm font-medium hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3" role="alert" id="login-error">
                <p className="text-destructive font-inter text-sm">{error}</p>
                {loginDiagnostic && (
                  <div className="mt-3 rounded-lg border border-destructive/20 bg-background/70 p-3 text-left">
                    <p className="font-montserrat text-xs font-black text-destructive">
                      Código: {loginDiagnostic.code}
                    </p>
                    <div className="mt-2 space-y-1 font-inter text-xs text-muted-foreground">
                      <p>Internet: {loginDiagnostic.online ? "detectada" : "não detectada"}</p>
                      <p>
                        Site: {loginDiagnostic.app.ok
                          ? `respondeu (HTTP ${loginDiagnostic.app.status})`
                          : "não respondeu"}
                      </p>
                      <p>
                        Servidor de login: {loginDiagnostic.supabase.ok
                          ? `respondeu (HTTP ${loginDiagnostic.supabase.status})`
                          : "não respondeu"}
                      </p>
                      <p>Horário: {new Date(loginDiagnostic.timestamp).toLocaleString("pt-BR")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={copyDiagnostic}
                      className="mt-3 w-full rounded-lg border border-destructive/30 px-3 py-2 font-montserrat text-xs font-bold text-destructive"
                    >
                      {diagnosticCopied ? "Diagnóstico copiado" : "Copiar diagnóstico técnico"}
                    </button>
                  </div>
                )}
                {isNetworkError && (
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setIsNetworkError(false);
                        setLoginDiagnostic(null);
                      }}
                      className="w-full py-2 rounded-lg border border-destructive/40 text-destructive font-montserrat font-bold text-sm transition-all active:scale-95"
                    >
                      Tentar de novo
                    </button>
                    <button
                      type="button"
                      onClick={handleForceReload}
                      disabled={isReloading}
                      className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground font-montserrat font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                    >
                      {isReloading ? "Atualizando..." : "Atualizar app"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 disabled:opacity-60 shadow-md"
                style={{ background: "var(--gradient-orange)" }}
              >
                {loading ? "Entrando..." : "Entrar na Jornada"}
              </button>

              <div className="relative flex items-center gap-3 my-4">
                <div className="h-[1px] flex-1 bg-border"></div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ou</span>
                <div className="h-[1px] flex-1 bg-border"></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  const result = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (result.error) {
                    setError("Erro ao entrar com Google: " + result.error.message);
                  }
                }}
                disabled={loading}
                className="w-full py-3 rounded-xl border-2 border-border bg-background font-montserrat font-bold text-foreground text-sm flex items-center justify-center gap-2 hover:bg-accent transition-all active:scale-95 disabled:opacity-50 mb-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>

              {passkeySupported !== false && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full py-3 rounded-xl border-2 border-primary/20 bg-primary/5 font-montserrat font-bold text-primary text-sm flex items-center justify-center gap-2 hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Fingerprint className="w-5 h-5" />
                  Entrar com Biometria
                </button>
              )}
            </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground font-inter text-sm">
              Ainda não tem conta?{" "}
              <Link to="/cadastro" className="text-secondary font-bold hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* WhatsApp help */}
        <a
          href="https://wa.me/5555984395290?text=Oi!%20Estou%20tentando%20usar%20o%20app%20do%20Ensino%20Confirmat%C3%B3rio%20e%20estou%20tendo%20dificuldade.%20Pode%20me%20ajudar%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 rounded-2xl px-5 py-3 backdrop-blur transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <span className="text-primary-foreground font-inter text-sm font-medium">
            Precisa de ajuda? Fale conosco
          </span>
        </a>

        {/* Bottom badge */}
        <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur">
          <span className="text-primary-foreground font-inter text-sm">
            Caminho — Plataforma de Discipulado
          </span>
        </div>
      </div>
    </div>
  );
}
