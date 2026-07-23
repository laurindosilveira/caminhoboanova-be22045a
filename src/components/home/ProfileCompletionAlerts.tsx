import { useEffect, useState } from "react";
import { Camera, ChevronRight, MessageCircle } from "lucide-react";

type ProfileCompletionAlertsProps = {
  avatarUrl?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  onOpenProfile: () => void;
};

function hasValidPhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "").length >= 10;
}

export default function ProfileCompletionAlerts({ avatarUrl, phone, whatsappNumber, onOpenProfile }: ProfileCompletionAlertsProps) {
  const [photoMissing, setPhotoMissing] = useState(!avatarUrl?.trim());

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

  const whatsappMissing = !hasValidPhone(whatsappNumber) && !hasValidPhone(phone);
  if (!photoMissing && !whatsappMissing) return null;

  return (
    <section className="space-y-3 px-5 pt-4" aria-label="Complete seu perfil">
      {photoMissing && (
        <button type="button" onClick={onOpenProfile} className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition-colors hover:bg-amber-100">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Camera className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-montserrat text-sm font-bold text-amber-950">Adicione sua foto</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-amber-800">Ajude sua turma e seus líderes a reconhecerem você.</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-amber-700" />
        </button>
      )}

      {whatsappMissing && (
        <button type="button" onClick={onOpenProfile} className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm transition-colors hover:bg-emerald-100">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MessageCircle className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-montserrat text-sm font-bold text-emerald-950">Cadastre seu WhatsApp</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-emerald-800">Receba lembretes e mantenha seu contato atualizado.</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-emerald-700" />
        </button>
      )}
    </section>
  );
}
