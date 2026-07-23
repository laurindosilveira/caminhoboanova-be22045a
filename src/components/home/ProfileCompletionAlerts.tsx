import { useEffect, useRef, useState } from "react";
import { Camera, ChevronRight, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WhatsAppPhoneInput from "@/components/ui/WhatsAppPhoneInput";
import { validateBRPhone, type PhoneValidation } from "@/lib/phoneValidation";

type ProfileCompletionAlertsProps = {
  avatarUrl?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
};

function hasValidPhone(value?: string | null) {
  return validateBRPhone(value ?? "").valid;
}

export default function ProfileCompletionAlerts({ avatarUrl, phone, whatsappNumber }: ProfileCompletionAlertsProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoMissing, setPhotoMissing] = useState(!avatarUrl?.trim());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState(whatsappNumber ?? "");
  const [whatsappValidation, setWhatsappValidation] = useState<PhoneValidation>(() => validateBRPhone(whatsappNumber ?? ""));
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  useEffect(() => {
    const url = avatarUrl?.trim();
    if (!url) {
      setPhotoMissing(true);
      return;
    }

    let active = true;
    const image = new Image();
    image.onload = () => active && setPhotoMissing(false);
    image.onerror = () => active && setPhotoMissing(true);
    image.src = url;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [avatarUrl]);

  useEffect(() => {
    setWhatsapp(whatsappNumber ?? "");
    setWhatsappValidation(validateBRPhone(whatsappNumber ?? ""));
  }, [whatsappNumber]);

  const whatsappMissing = !hasValidPhone(whatsappNumber) && !hasValidPhone(phone);

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Escolha uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Foto muito grande", description: "Escolha uma imagem de até 5 MB.", variant: "destructive" });
      return;
    }

    setUploadingPhoto(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: newAvatarUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      setPhotoMissing(false);
      toast({ title: "Foto adicionada!", description: "Seu perfil foi atualizado." });
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      toast({ title: "Não foi possível adicionar a foto", description: "Tente novamente em alguns instantes.", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveWhatsapp() {
    if (!user?.id || !whatsappValidation.valid) return;
    setSavingWhatsapp(true);
    try {
      const { error } = await supabase.from("profiles").update({
        whatsapp_number: whatsapp,
        whatsapp_validation_status: "valid",
        whatsapp_last_blocked_reason: null,
        whatsapp_last_blocked_at: null,
      }).eq("user_id", user.id);
      if (error) throw error;

      await refreshProfile();
      setWhatsappOpen(false);
      toast({ title: "WhatsApp cadastrado!", description: "Seu número foi salvo com sucesso." });
    } catch (error) {
      console.error("Erro ao salvar WhatsApp:", error);
      toast({ title: "Não foi possível salvar", description: "Tente novamente em alguns instantes.", variant: "destructive" });
    } finally {
      setSavingWhatsapp(false);
    }
  }

  if (!photoMissing && !whatsappMissing) return null;

  return (
    <>
      <section className="space-y-3 px-5 pt-4" aria-label="Complete seu perfil">
        {photoMissing && (
          <div className="relative">
            <button type="button" disabled={uploadingPhoto} onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition-colors hover:bg-amber-100 disabled:opacity-70">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">{uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-montserrat text-sm font-bold text-amber-950">{uploadingPhoto ? "Enviando sua foto..." : "Adicione sua foto"}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-amber-800">Toque aqui para escolher uma imagem agora.</span>
              </span>
              {!uploadingPhoto && <ChevronRight className="h-5 w-5 shrink-0 text-amber-700" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label="Escolher foto do perfil" />
          </div>
        )}

        {whatsappMissing && (
          <button type="button" onClick={() => setWhatsappOpen(true)} className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm transition-colors hover:bg-emerald-100">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MessageCircle className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-montserrat text-sm font-bold text-emerald-950">Cadastre seu WhatsApp</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-emerald-800">Toque aqui para informar seu número agora.</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-emerald-700" />
          </button>
        )}
      </section>

      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-montserrat">Adicionar WhatsApp</DialogTitle>
            <DialogDescription>Informe o número que você usa no WhatsApp para receber lembretes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <WhatsAppPhoneInput
              value={whatsapp}
              onChange={(formatted, validation) => {
                setWhatsapp(formatted);
                setWhatsappValidation(validation);
              }}
              showValidationAlways
              id="journey-whatsapp"
              name="whatsapp_number"
            />
            <Button type="button" className="w-full" disabled={!whatsappValidation.valid || savingWhatsapp} onClick={() => void saveWhatsapp()}>
              {savingWhatsapp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
