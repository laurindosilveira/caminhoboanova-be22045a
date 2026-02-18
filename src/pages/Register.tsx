import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, ChevronLeft, ChevronDown } from "lucide-react";
import { z } from "zod";

const COMMUNITIES = [
  "Bom Pastor",
  "Martim Lutero",
  "Rincão Fundo",
  "Rincão Frente",
  "Linha Brasil",
  "Iriá Pira 1",
  "Iriá Pira 2",
] as const;

type Community = typeof COMMUNITIES[number];

function getCommunityArea(community: Community): "Área 1" | "Área 2" {
  const area1 = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
  return area1.includes(community) ? "Área 1" : "Área 2";
}

const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128),
  community: z.enum(COMMUNITIES, { required_error: "Selecione sua comunidade" }),
});

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState<Community | "">("");

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("Nome deve ter pelo menos 3 caracteres.");
      return;
    }
    if (!birthDate) {
      setError("Informe sua data de nascimento.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError("Telefone inválido.");
      return;
    }
    setStep(2);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!community) {
      setError("Selecione sua comunidade.");
      return;
    }

    const parsed = registerSchema.safeParse({ fullName, birthDate, phone, email, password, community });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const area = getCommunityArea(community as Community);

    // Sign up
    const { data, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError("Erro ao criar conta: " + authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Insert profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: parsed.data.fullName,
        birth_date: parsed.data.birthDate,
        phone: parsed.data.phone,
        community: parsed.data.community,
        area: area,
      });

      if (profileError) {
        setError("Conta criada! Erro ao salvar perfil: " + profileError.message);
        setLoading(false);
        return;
      }
    }

    navigate("/verificar-email");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="w-full max-w-sm mb-6 flex items-center gap-3">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
          ) : (
            <Link to="/login" className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </Link>
          )}
          <div>
            <h1 className="font-montserrat font-black text-primary-foreground text-xl">
              {step === 1 ? "Seus dados" : "Acesso e comunidade"}
            </h1>
            <p className="text-primary-foreground/60 font-inter text-xs">Passo {step} de 2</p>
          </div>
          {/* Step indicator */}
          <div className="ml-auto flex gap-1.5">
            <div className={`h-2 rounded-full transition-all ${step === 1 ? "w-6 bg-secondary" : "w-3 bg-white/30"}`} />
            <div className={`h-2 rounded-full transition-all ${step === 2 ? "w-6 bg-secondary" : "w-3 bg-white/30"}`} />
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-7">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Data de nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(51) 9 9999-9999"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                  <p className="text-destructive font-inter text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 shadow-md"
                style={{ background: "var(--gradient-orange)" }}
              >
                Continuar →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Senha</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Sua comunidade</label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value as Community)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
                    required
                  >
                    <option value="">Selecione sua comunidade...</option>
                    {COMMUNITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {community && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getCommunityArea(community as Community) === "Área 1" ? "bg-brand-green" : "bg-primary"}`} />
                    <span className="text-muted-foreground font-inter text-xs">
                      Atribuído automaticamente à <strong className="text-foreground">{getCommunityArea(community as Community)}</strong>
                    </span>
                  </div>
                )}
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
                {loading ? "Criando conta..." : "Começar minha jornada ✝️"}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <p className="text-muted-foreground font-inter text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-secondary font-bold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
