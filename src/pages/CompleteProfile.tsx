import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Calendar, Camera, ChevronDown, ChevronLeft, LogOut, Phone, User, Users } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AvatarCropper from "@/components/home/AvatarCropper";
import WhatsAppPhoneInput from "@/components/ui/WhatsAppPhoneInput";
import { type PhoneValidation, validateBRPhone } from "@/lib/phoneValidation";

const completeProfileSchema = z.object({
  fullName: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  churchId: z.string().trim().min(1, "Selecione sua igreja"),
  fatherName: z.string().trim().max(100).optional(),
  motherName: z.string().trim().max(100).optional(),
  fatherPhone: z.string().trim().max(20).optional(),
  motherPhone: z.string().trim().max(20).optional(),
});

const inputClass =
  "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, profile, profileLoaded, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [churchOptions, setChurchOptions] = useState<{ id: string; name: string }[]>([]);

  const googleFullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    "";
  const googleAvatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

  const [fullName, setFullName] = useState(googleFullName);
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation>(() => validateBRPhone(""));
  const [churchId, setChurchId] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [croppedPhoto, setCroppedPhoto] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(googleAvatarUrl);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (googleFullName && !fullName) {
      setFullName(googleFullName);
    }
    if (googleAvatarUrl && !photoPreview && !croppedPhoto) {
      setPhotoPreview(googleAvatarUrl);
    }
  }, [googleFullName, googleAvatarUrl, fullName, photoPreview, croppedPhoto]);

  useEffect(() => {
    let isMounted = true;

    async function loadChurches() {
      setLoadingChurches(true);
      try {
        const { data, error: churchesError } = await supabase
          .from("churches")
          .select("id, name")
          .eq("is_active", true)
          .order("name");

        if (churchesError) throw churchesError;
        if (isMounted) setChurchOptions(data || []);
      } catch (err) {
        console.error("Error loading churches:", err);
      } finally {
        if (isMounted) setLoadingChurches(false);
      }
    }

    loadChurches();
    return () => {
      isMounted = false;
    };
  }, []);

  if (authLoading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-3xl">✝️</span>
          </div>
          <p className="text-primary-foreground font-inter text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile) {
    return <Navigate to="/home" replace />;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("A foto deve ter no máximo 5MB.");
      return;
    }
    setError(null);
    setRawPhotoSrc(URL.createObjectURL(file));
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
    if (!churchId) {
      setError("Selecione sua igreja.");
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    const parsed = completeProfileSchema.safeParse({
      fullName,
      birthDate,
      phone,
      churchId,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data: statsArray } = await supabase.rpc("get_church_user_stats", {
        p_church_id: parsed.data.churchId as any,
      });
      const stats = statsArray && statsArray[0];

      if (stats && stats.member_limit && stats.total_users >= stats.member_limit) {
        const blockedReason = `Limite excedido: ${stats.total_users}/${stats.member_limit}`;
        setError(
          `Limite excedido: Esta igreja já possui ${stats.total_users} usuários (limite do plano: ${stats.member_limit}). Entre em contato com a liderança para upgrade.`,
        );

        void supabase.rpc("log_blocked_registration", {
          p_church_id: parsed.data.churchId,
          p_email: user.email ?? "",
          p_full_name: parsed.data.fullName,
          p_reason: blockedReason,
          p_current_count: Number(stats.total_users),
          p_limit: Number(stats.member_limit),
        });

        setLoading(false);
        return;
      }
    } catch (limitErr) {
      console.error("Error checking member limit:", limitErr);
    }

    let finalAvatarUrl: string | null = googleAvatarUrl;

    if (croppedPhoto) {
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, croppedPhoto, { upsert: true, contentType: "image/jpeg" });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        finalAvatarUrl = urlData.publicUrl;
      }
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      email: user.email ?? null,
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate,
      phone: parsed.data.phone,
      whatsapp_number: parsed.data.phone,
      whatsapp_validation_status: "valid",
      church_id: parsed.data.churchId,
      area: "Sem area",
      community: "Aguardando definicao",
      enrollment_status: "pending",
      role: "user",
      confirmation_year: 1,
      father_name: parsed.data.fatherName || "",
      mother_name: parsed.data.motherName || "",
      father_phone: parsed.data.fatherPhone || "",
      mother_phone: parsed.data.motherPhone || "",
      avatar_url: finalAvatarUrl,
    });

    if (insertError) {
      console.error("Error completing Google profile:", insertError);
      setError("Erro ao salvar cadastro: " + insertError.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("caminho_app_active", "true");
    await refreshProfile();
    setLoading(false);
    navigate("/home", { replace: true });
  }

  const stepTitles = ["Complete seus dados", "Família e foto"];

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
        <div className="w-full max-w-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate("/login", { replace: true });
                }}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"
                title="Sair e usar outra conta"
                aria-label="Sair e usar outra conta"
              >
                <LogOut className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="font-montserrat font-black text-primary-foreground text-xl">
                {stepTitles[step - 1]}
              </h1>
              <p className="text-primary-foreground/70 font-inter text-xs">
                Passo {step} de 2 · {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-sm transition-all ${
                    s < step
                      ? "bg-secondary text-white"
                      : s === step
                      ? "bg-white text-secondary ring-2 ring-secondary ring-offset-2 ring-offset-transparent"
                      : "bg-white/20 text-white/50"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 2 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                      s < step ? "bg-secondary" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-7">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <p className="text-muted-foreground font-inter text-xs">
                Sua conta Google foi conectada! Complete as informações abaixo para finalizar seu cadastro no Caminho.
              </p>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Data de nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Telefone / WhatsApp
                </label>
                <WhatsAppPhoneInput
                  value={phone}
                  onChange={(formatted, validation) => {
                    setPhone(formatted);
                    setPhoneValidation(validation);
                  }}
                  showValidationAlways={phone.length > 0}
                />
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Sua Igreja / Paróquia
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    value={churchId}
                    onChange={(e) => setChurchId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
                    required
                    disabled={loadingChurches}
                  >
                    <option value="">
                      {loadingChurches ? "Carregando igrejas..." : "Selecione sua igreja..."}
                    </option>
                    {churchOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-3">
                <p className="text-secondary font-inter text-xs font-medium">
                  Seu Grupo de Crescimento (GC) e sua comunidade serão designados pela liderança da igreja após o cadastro.
                </p>
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
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  {photoPreview ? "Toque para trocar a foto" : "Sua foto (opcional)"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Nome do pai (opcional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Nome completo do pai"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Telefone do pai (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    placeholder="(51) 9 9999-9999"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Nome da mãe (opcional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Nome completo da mãe"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-1.5">
                  Telefone da mãe (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    placeholder="(51) 9 9999-9999"
                    className={inputClass}
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
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 disabled:opacity-60 shadow-md"
                style={{ background: "var(--gradient-orange)" }}
              >
                {loading ? "Salvando cadastro..." : "Concluir cadastro ✝️"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
