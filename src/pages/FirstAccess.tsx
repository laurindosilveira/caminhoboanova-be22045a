import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPasswordPolicyError } from "@/lib/passwordPolicy";

export default function FirstAccess() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const policyError = getPasswordPolicyError(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const {
          data: { session: refreshedSession },
        } = await supabase.auth.refreshSession();
        session = refreshedSession;
      }

      if (!session) {
        setError("Sua sessão expirou. Entre novamente para criar sua senha.");
        return;
      }

      const { data, error: functionError } = await supabase.functions.invoke("complete-first-access", {
        body: { password },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (functionError || data?.completed !== true) {
        const response = (functionError as { context?: Response } | null)?.context;
        const status = response?.status;

        if (status === 401) {
          setError("Sua sessão expirou. Entre novamente para criar sua senha.");
          return;
        }
        if (status === 409) {
          setError("Esta senha já foi criada. Saia e entre novamente com sua nova senha.");
          return;
        }

        throw functionError ?? new Error("Não foi possível concluir o primeiro acesso.");
      }

      setCompleted(true);

      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) {
        console.warn("[FIRST ACCESS] Password saved, but local sign-out failed", {
          name: signOutError.name,
        });
      }

      window.location.replace("/login?senha=criada");
    } catch (submitError) {
      console.error("[FIRST ACCESS] Unable to complete password setup", {
        name: submitError instanceof Error ? submitError.name : "UnknownError",
      });
      setError("Não foi possível salvar sua senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
      <section className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-2xl">
        <BrandLogo className="mb-7 justify-center" markClassName="h-14 w-14" />

        {completed ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10">
              <CheckCircle2 className="h-9 w-9 text-brand-green" />
            </div>
            <h1 className="font-montserrat text-2xl font-black text-foreground">Senha criada!</h1>
            <p className="mt-2 font-inter text-sm text-muted-foreground">Redirecionando para o login…</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <LockKeyhole className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-montserrat text-2xl font-black text-foreground">Crie sua senha de acesso</h1>
              <p className="mt-2 font-inter text-sm leading-6 text-muted-foreground">
                Bem-vindo ao Caminho 3M. Para proteger a conta de {user?.email ?? "sua igreja"}, escolha uma senha pessoal.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="first-access-password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="first-access-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-secondary"
                    placeholder="Mínimo 10 caracteres, com letra e número"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="first-access-confirmation" className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirmar senha
                </label>
                <input
                  id="first-access-confirmation"
                  type={showPassword ? "text" : "password"}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-secondary"
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="font-inter text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 font-montserrat text-base font-bold text-primary-foreground shadow-md transition active:scale-95 disabled:opacity-60"
                style={{ background: "var(--gradient-orange)" }}
              >
                {loading ? "Salvando sua senha…" : "Criar senha e acessar"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
