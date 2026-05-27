import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";

const resetSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanupSub: (() => void) | null = null;
    const timeout = setTimeout(() => { if (!cancelled) setSessionChecked(true); }, 5000);

    async function check() {
      // Implicit flow: #type=recovery in hash
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.get("type") === "recovery") {
        if (!cancelled) { setValidSession(true); setSessionChecked(true); }
        clearTimeout(timeout);
        return;
      }

      // Primary check: session already established (Supabase auto-exchanges ?code= very early,
      // often before the component mounts — so we can't rely on ?code= still being in the URL)
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session) {
        setValidSession(true);
        setSessionChecked(true);
        clearTimeout(timeout);
        return;
      }

      // No session yet — check if a code is still in the URL and wait for exchange
      const hasCode = new URLSearchParams(window.location.search).has("code");
      if (!hasCode) {
        // No session, no hash, no code = definitely an invalid or expired link
        setSessionChecked(true);
        clearTimeout(timeout);
        return;
      }

      // Code is present but exchange hasn't completed yet — listen for the auth event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
        if (cancelled) return;
        if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && sess) {
          setValidSession(true);
          setSessionChecked(true);
          clearTimeout(timeout);
        }
      });
      cleanupSub = () => subscription.unsubscribe();
    }

    check();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanupSub?.();
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = resetSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });

      if (updateError) {
        setError("Erro ao redefinir senha: " + updateError.message);
        return;
      }

      setDone(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err: any) {
      setError("Ocorreu um erro inesperado: " + (err.message || "Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-7">
          {!sessionChecked ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-inter text-sm">Verificando link...</p>
            </div>
          ) : !validSession ? (
            <div className="text-center py-4">
              <h2 className="font-montserrat font-black text-foreground text-xl mb-2">Link inválido ou expirado</h2>
              <p className="text-muted-foreground font-inter text-sm mb-6">
                Este link de recuperação não é válido ou já expirou. Solicite um novo.
              </p>
              <a
                href="/recuperar-senha"
                className="inline-block w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base text-center transition-all active:scale-95 shadow-md"
                style={{ background: "var(--gradient-orange)" }}
              >
                Solicitar novo link
              </a>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-brand-green" />
              </div>
              <h2 className="font-montserrat font-black text-foreground text-xl mb-2">Senha redefinida!</h2>
              <p className="text-muted-foreground font-inter text-sm">Redirecionando para o app...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-montserrat font-black text-foreground text-xl mb-1">Nova senha</h2>
                <p className="text-muted-foreground font-inter text-sm">Escolha uma nova senha para sua conta.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                    <p className="text-destructive font-inter text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 disabled:opacity-60 shadow-md"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  {loading ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
