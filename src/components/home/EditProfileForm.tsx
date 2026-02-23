import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Save, X, User, Phone, Calendar, MapPin, ChevronDown, Home, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const COMMUNITIES = [
  "Martim Lutero",
  "Bom Pastor",
  "Rincão Fundo",
  "Rincão Frente",
  "Linha Brasil",
  "Iriá Pira 1",
  "Iriá Pira 2",
] as const;

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  community: z.enum(COMMUNITIES, { required_error: "Selecione uma comunidade" }),
  father_name: z.string().max(100).optional(),
  mother_name: z.string().max(100).optional(),
  father_phone: z.string().max(20).optional(),
  mother_phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfileForm() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      birth_date: profile?.birth_date ?? "",
      community: (profile?.community as (typeof COMMUNITIES)[number]) ?? undefined,
      father_name: profile?.father_name ?? "",
      mother_name: profile?.mother_name ?? "",
      father_phone: profile?.father_phone ?? "",
      mother_phone: profile?.mother_phone ?? "",
      address: profile?.address ?? "",
    },
  });

  function handleCancel() {
    reset({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      birth_date: profile?.birth_date ?? "",
      community: (profile?.community as (typeof COMMUNITIES)[number]) ?? undefined,
      father_name: profile?.father_name ?? "",
      mother_name: profile?.mother_name ?? "",
      father_phone: profile?.father_phone ?? "",
      mother_phone: profile?.mother_phone ?? "",
      address: profile?.address ?? "",
    });
    setIsEditing(false);
  }

  async function onSubmit(values: ProfileFormValues) {
    if (!user?.id) return;
    setSaving(true);
    try {
      const areaVal = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"].includes(values.community)
        ? "Área 1"
        : "Área 2";

      // Use upsert so it works whether or not a profile row exists yet
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            full_name: values.full_name,
            phone: values.phone,
            birth_date: values.birth_date,
            community: values.community,
            area: areaVal as "Área 1" | "Área 2",
            father_name: values.father_name ?? "",
            mother_name: values.mother_name ?? "",
            father_phone: values.father_phone ?? "",
            mother_phone: values.mother_phone ?? "",
            address: values.address ?? "",
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      // Refresh the profile in context so the header name updates
      await refreshProfile();

      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas com sucesso." });
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Erro ao salvar perfil:", err);
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="px-5 mt-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-montserrat font-bold text-foreground text-sm">Dados Pessoais</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-inter text-primary bg-primary/10 rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          </div>

          {/* Info list */}
          <div className="divide-y divide-border">
            <InfoRow icon={<User className="w-4 h-4 text-muted-foreground" />} label="Nome completo" value={profile?.full_name ?? "—"} />
            <InfoRow icon={<Phone className="w-4 h-4 text-muted-foreground" />} label="Telefone" value={profile?.phone ?? "—"} />
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
              label="Data de nascimento"
              value={
                profile?.birth_date
                  ? new Date(profile.birth_date + "T00:00:00").toLocaleDateString("pt-BR")
                  : "—"
              }
            />
            <InfoRow icon={<MapPin className="w-4 h-4 text-muted-foreground" />} label="Comunidade" value={profile?.community ?? "—"} />
            <InfoRow icon={<MapPin className="w-4 h-4 text-muted-foreground" />} label="Área" value={profile?.area ?? "—"} />
            <InfoRow icon={<Home className="w-4 h-4 text-muted-foreground" />} label="Endereço" value={profile?.address || "—"} />
            <InfoRow icon={<Users className="w-4 h-4 text-muted-foreground" />} label="Nome do pai" value={profile?.father_name || "—"} />
            <InfoRow icon={<Phone className="w-4 h-4 text-muted-foreground" />} label="Contato do pai" value={profile?.father_phone || "—"} />
            <InfoRow icon={<Users className="w-4 h-4 text-muted-foreground" />} label="Nome da mãe" value={profile?.mother_name || "—"} />
            <InfoRow icon={<Phone className="w-4 h-4 text-muted-foreground" />} label="Contato da mãe" value={profile?.mother_phone || "—"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            <span className="font-montserrat font-bold text-foreground text-sm">Editar Dados</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 text-xs font-inter text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Cancelar
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Nome completo</label>
            <input
              {...register("full_name")}
              placeholder="Seu nome completo"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.full_name && <p className="text-xs text-destructive font-inter">{errors.full_name.message}</p>}
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Telefone / WhatsApp</label>
            <input
              {...register("phone")}
              placeholder="(00) 00000-0000"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.phone && <p className="text-xs text-destructive font-inter">{errors.phone.message}</p>}
          </div>

          {/* Data de nascimento */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Data de nascimento</label>
            <input
              type="date"
              {...register("birth_date")}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.birth_date && <p className="text-xs text-destructive font-inter">{errors.birth_date.message}</p>}
          </div>

          {/* Comunidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Comunidade</label>
            <div className="relative">
              <select
                {...register("community")}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 pr-8 text-sm text-foreground appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione sua comunidade</option>
                {COMMUNITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.community && <p className="text-xs text-destructive font-inter">{errors.community.message}</p>}
          </div>

          {/* Endereço */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Endereço</label>
            <input
              {...register("address")}
              placeholder="Rua, nº, bairro, cidade"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Nome do Pai */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Nome do pai</label>
            <input
              {...register("father_name")}
              placeholder="Nome completo do pai"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Contato do Pai */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Contato do pai</label>
            <input
              {...register("father_phone")}
              placeholder="(00) 00000-0000"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Nome da Mãe */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Nome da mãe</label>
            <input
              {...register("mother_name")}
              placeholder="Nome completo da mãe"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Contato da Mãe */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-medium text-muted-foreground">Contato da mãe</label>
            <input
              {...register("mother_phone")}
              placeholder="(00) 00000-0000"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-montserrat font-bold text-sm text-primary-foreground transition-opacity disabled:opacity-60"
            style={{ background: "var(--gradient-hero)" }}
          >
            {saving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-xs font-inter">{label}</p>
        <p className="text-foreground text-sm font-inter font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
