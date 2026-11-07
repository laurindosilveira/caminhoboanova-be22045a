import { AlertTriangle, CalendarDays, CheckCircle2, Unlock } from "lucide-react";

type Props = {
  courseName: string;
  open: boolean;
  hideNextTime: boolean;
  saving?: boolean;
  onHideNextTimeChange: (checked: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CourseOpenAccessDialog({
  courseName,
  open,
  hideNextTime,
  saving = false,
  onHideNextTimeChange,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="open-course-dialog-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-inter text-xs font-bold uppercase tracking-wider text-amber-700">
                Liberação sem restrições
              </p>
              <h2 id="open-course-dialog-title" className="mt-1 font-montserrat text-xl font-black text-foreground">
                Liberar todo o curso?
              </h2>
              <p className="mt-1 font-inter text-sm text-muted-foreground">
                {courseName}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex gap-3 rounded-2xl border border-brand-green/25 bg-brand-green/5 p-4">
              <Unlock className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
              <div>
                <p className="font-montserrat text-sm font-black text-foreground">O que acontecerá agora</p>
                <p className="mt-1 font-inter text-xs leading-5 text-muted-foreground">
                  Todas as lições e todos os devocionais deste curso ficarão disponíveis imediatamente. Os participantes poderão fazê-los em qualquer ordem e receberão a pontuação completa.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-montserrat text-sm font-black text-foreground">Quer controlar datas e prazos?</p>
                <p className="mt-1 font-inter text-xs leading-5 text-muted-foreground">
                  Cancele esta liberação e vincule as lições pela aba <strong>Agenda</strong>. Nesse modo, o curso seguirá as janelas oficiais, os prazos e as regras atuais de pontuação.
                </p>
              </div>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/40 p-3">
            <input
              type="checkbox"
              checked={hideNextTime}
              onChange={(event) => onHideNextTimeChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span className="font-inter text-xs leading-5 text-foreground">
              Não mostrar este aviso novamente neste dispositivo.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border bg-muted/30 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-border bg-card px-4 py-3 font-montserrat text-sm font-bold text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-montserrat text-sm font-bold text-primary-foreground shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {saving ? "Liberando…" : "Liberar tudo"}
          </button>
        </div>
      </div>
    </div>
  );
}
