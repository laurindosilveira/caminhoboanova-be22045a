import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Camera,
  ChevronDown,
  ChevronLeft,
  Church,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  User,
  Users,
} from "lucide-react";
import { z } from "zod";
import AvatarCropper from "@/components/home/AvatarCropper";
import WhatsAppPhoneInput from "@/components/ui/WhatsAppPhoneInput";
import { getAuthEmailFlowErrorMessage } from "@/lib/authErrorMessages";
import { type PhoneValidation, validateBRPhone } from "@/lib/phoneValidation";
import { AuthCaptcha, isAuthCaptchaEnabled } from "@/components/auth/AuthCaptcha";
import { strongPasswordSchema } from "@/lib/passwordPolicy";
import BrandLogo from "@/components/BrandLogo";

const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  fatherName: z.string().trim().max(100).optional(),
  motherName: z.string().trim().max(100).optional(),
  fatherPhone: z.string().trim().max(20).optional(),
  motherPhone: z.string().trim().max(20).optional(),
  email: z.string().trim().email("Email inválido").max(255),
  password: strongPasswordSchema,
  churchId: z.string().trim().min(1, "Selecione sua igreja"),
});

const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all";

type InviteInfo = {
  church_id: string;
  church_name: string;
  turma_id: string;
  turma_name: string;
  group_naming: string;
  expires_at: string;
};

export default function Register() {
  const navigate = useNavigate();
  const { inviteToken } = useParams<{ inviteToken?: string }>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [churchOptions, setChurchOptions] = useState<{ id: string; name: string }[]>([]);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation>(() => validateBRPhone(""));
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [croppedPhoto, setCroppedPhoto] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [churchId, setChurchId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRegistrationContext() {
      setLoadingChurches(true);
      setInviteError(null);
      try {
        if (inviteToken) {
          const { data, error: inviteLookupError } = await supabase.rpc(
            "get_turma_invite_info",
            { p_token: inviteToken },
          );

          if (inviteLookupError) throw inviteLookupError;

          const invite = data?.[0] as InviteInfo | undefined;
          if (!invite) {
            if (isMounted) {
              setInviteError("Este convite não é válido ou já expirou. Peça um novo link à liderança da igreja.");
            }
            return;
          }

          if (isMounted) {
            setInviteInfo(invite);
            setChurchId(invite.church_id);
            setChurchOptions([{ id: invite.church_id, name: invite.church_name }]);
          }
          return;
        }

        const { data, error } = await supabase
          .from("churches")
          .select("id, name")
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        if (isMounted) setChurchOptions(data || []);
      } catch (err) {
        console.error("Error loading registration context:", err);
        if (isMounted && inviteToken) {
          setInviteError("Não foi possível validar este convite agora. Atualize a página ou solicite um novo link.");
        }
      } finally {
        if (isMounted) setLoadingChurches(false);
      }
    }

    loadRegistrationContext();
    return () => { isMounted = false; };
  }, [inviteToken]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("A foto deve ter no máximo 5MB.");
      return;
    }
    setError(null);
    const src = URL.createObjectURL(file);
    setRawPhotoSrc(src);
    setShowCropper(true);
  }

  function handleCropComplete(blob: Blob) {
    setCroppedPhoto(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    setShowCropper(false);
    setRawPhotoSrc(null);
  }

  function handleCropCancel() {
    setShowCropper(false);
    setRawPhotoSrc(null);
  }

  function handleStep1(e: React.FormEvent) {
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
    if (!phoneValidation.valid) {
      setError(phoneValidation.hint || "Telefone inválido. Inclua o DDD e o número completo.");
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(3);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (inviteToken && !inviteInfo) {
      setError("Não foi possível validar o convite. Peça um novo link à liderança da igreja.");
      return;
    }

    if (!churchId) {
      setError("Selecione sua igreja.");
      return;
    }

    if (isAuthCaptchaEnabled && !captchaToken) {
      setError("Conclua a verificação de segurança.");
      return;
    }

    const parsed = registerSchema.safeParse({
      fullName, birthDate, phone, fatherName, motherName,
      fatherPhone, motherPhone, email, password, churchId,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data: availabilityRows, error: availabilityError } = await supabase.rpc(
        "get_public_church_registration_availability",
        { p_church_id: churchId },
      );

      if (availabilityError) throw availabilityError;

      const availability = availabilityRows?.[0];
      if (availability && !availability.can_register) {
        setError(
          availability.reason === "member_limit_reached"
            ? "Esta igreja atingiu o limite de usuários do plano. Entre em contato com a liderança."
            : "Esta igreja não está disponível para novos cadastros no momento.",
        );
        setLoading(false);
        return;
      }
    } catch (limitErr) {
      console.error("Error checking member limit:", limitErr);
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        captchaToken: captchaToken ?? undefined,
        data: {
          full_name: parsed.data.fullName,
          birth_date: parsed.data.birthDate,
          phone: parsed.data.phone,
          church_id: parsed.data.churchId,
          enrollment_status: "pending",
          role: "user",
          father_name: parsed.data.fatherName || "",
          mother_name: parsed.data.motherName || "",
          father_phone: parsed.data.fatherPhone || "",
          mother_phone: parsed.data.motherPhone || "",
          turma_invite_token: inviteToken || undefined,
        },
      },
    });

    if (authError) {
      setCaptchaToken(null);
      setCaptchaResetKey((current) => current + 1);
      if (authError.message?.toLowerCase().includes("already registered")) {
        setError("Este email já está cadastrado. Faça login ou use outro email.");
      } else {
        setError(getAuthEmailFlowErrorMessage(authError, "Erro ao criar conta"));
      }
      setLoading(false);
      return;
    }

    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      setError("Este email já está cadastrado. Faça login ou use outro email.");
      setLoading(false);
      return;
    }

    if (croppedPhoto && authData.user) {
      const path = `${authData.user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, croppedPhoto, { upsert: true, contentType: "image/jpeg" });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", authData.user.id);
      }
    }

    setLoading(false);
    navigate("/login?cadastro=sucesso");
  }

  const totalSteps = 3;
  const stepTitles = ["Seus dados", "Família e foto", "Acesso e comunidade"];
  const invitedGroupLabel = inviteInfo?.group_naming === "confirmation"
    ? "Turma de Ensino Confirmatório"
    : "Grupo de Crescimento";

  if (inviteToken && loadingChurches) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-secondary" />
          <h1 className="mt-5 font-montserrat text-xl font-black text-foreground">Validando seu convite</h1>
          <p className="mt-2 font-inter text-sm text-muted-foreground">
            Estamos confirmando sua igreja e sua turma.
          </p>
        </div>
      </div>
    );
  }

  if (inviteToken && inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <MessageCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="mt-5 font-montserrat text-xl font-black text-foreground">Convite indisponível</h1>
          <p className="mt-2 font-inter text-sm leading-6 text-muted-foreground">{inviteError}</p>
          <Link
            to="/cadastro"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-secondary px-4 py-3 font-montserrat text-sm font-bold text-secondary-foreground"
          >
            Fazer cadastro sem convite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      {showCropper && rawPhotoSrc && (
        <AvatarCropper
          imageSrc={rawPhotoSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <BrandLogo inverse className="mb-7" markClassName="h-14 w-14" />
        <div className="w-full max-w-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </button>
            ) : (
              <Link to="/login" className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </Link>
            )}
            <div className="flex-1">
              <h1 className="font-montserrat font-black text-primary-foreground text-xl">
                {stepTitles[step - 1]}
              </h1>
              <p className="text-primary-foreground/60 font-inter text-xs">Passo {step} de {totalSteps}</p>
            </div>
          </div>

          <div className="flex items-center gap-0">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-sm transition-all ${
                  s < step
                    ? "bg-secondary text-white"
                    : s === step
                    ? "bg-white text-secondary ring-2 ring-secondary ring-offset-2 ring-offset-transparent"
                    : "bg-white/20 text-white/50"
                }`}>
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                    s < step ? "bg-secondary" : "bg-white/20"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-7">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Data de nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Telefone / WhatsApp</label>
                <WhatsAppPhoneInput
                  value={phone}
                  onChange={(formatted, validation) => {
                    setPhone(formatted);
                    setPhoneValidation(validation);
                  }}
                  showValidationAlways={phone.length > 0}
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                  <p className="text-destructive font-inter text-sm">{error}</p>
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 shadow-md" style={{ background: "var(--gradient-orange)" }}>
                Continuar →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden hover:border-secondary transition-colors"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </button>
                <span className="text-xs text-muted-foreground font-inter">
                  {photoPreview ? "Toque para trocar" : "Sua foto (opcional)"}
                </span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nome do pai</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Nome completo do pai" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Telefone do pai</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)} placeholder="(51) 9 9999-9999" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nome da mãe</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Nome completo da mãe" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Telefone da mãe</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)} placeholder="(51) 9 9999-9999" className={inputClass} />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                  <p className="text-destructive font-inter text-sm">{error}</p>
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 shadow-md" style={{ background: "var(--gradient-orange)" }}>
                Continuar →
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} autoComplete="email" required />
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
                    placeholder="Mínimo 10 caracteres, com letra e número"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {inviteInfo ? (
                <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                  <p className="font-inter text-xs font-bold uppercase tracking-wide text-secondary">Convite confirmado</p>
                  <div className="mt-3 flex items-start gap-3">
                    <Church className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    <div>
                      <p className="font-montserrat text-sm font-bold text-foreground">{inviteInfo.church_name}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{invitedGroupLabel}: {inviteInfo.turma_name}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 font-inter text-xs leading-5 text-muted-foreground">
                    Ao concluir, seu acesso ficará vinculado automaticamente a esta turma.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Sua Igreja / Paróquia</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={churchId}
                        onChange={(e) => setChurchId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
                        required
                        disabled={loadingChurches}
                      >
                        <option value="">{loadingChurches ? "Carregando igrejas..." : "Selecione sua igreja..."}</option>
                        {churchOptions.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-3">
                    <p className="text-secondary font-inter text-xs font-medium">
                      Sua área e comunidade serão designadas pela liderança da igreja após o cadastro.
                    </p>
                  </div>
                </>
              )}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                  <p className="text-destructive font-inter text-sm">{error}</p>
                </div>
              )}
              <AuthCaptcha onTokenChange={setCaptchaToken} resetKey={captchaResetKey} />
              <button
                type="submit"
                disabled={loading || (isAuthCaptchaEnabled && !captchaToken)}
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
              <Link to="/login" className="text-secondary font-bold hover:underline">Entrar</Link>
            </p>
          </div>
        </div>

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

        <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur">
          <span className="text-primary-foreground font-inter text-sm">
            Caminho 3M
          </span>
        </div>
      </div>
    </div>
  );
}
