import { CalendarDays, CheckCircle2, Unlock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  courseTitle: string;
  onCancel: () => void;
  onKeepOpen: () => void;
  onActivateControl: () => void;
};

export default function AgendaCourseControlDialog({
  open,
  courseTitle,
  onCancel,
  onKeepOpen,
  onActivateControl,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-xl font-black">
            Como deseja liberar este curso?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-6 text-muted-foreground">
          <strong className="text-foreground">{courseTitle}</strong> já está totalmente liberado pela Sala do Líder.
          Vincular uma lição à Agenda não mudará isso sem sua confirmação.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onKeepOpen}
            className="flex w-full items-start gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left hover:border-emerald-400"
          >
            <Unlock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <span>
              <span className="block text-sm font-black text-emerald-950">Manter tudo liberado</span>
              <span className="mt-1 block text-xs leading-5 text-emerald-800">
                A Agenda será salva, mas todas as lições e devocionais continuarão disponíveis com pontuação completa.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onActivateControl}
            className="flex w-full items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-left hover:border-amber-400"
          >
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <span>
              <span className="block text-sm font-black text-amber-950">Ativar controle pela Agenda</span>
              <span className="mt-1 block text-xs leading-5 text-amber-800">
                O curso passará a seguir as datas, janelas de estudo e regras oficiais de liberação programada.
              </span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          Esta escolha vale somente para o grupo selecionado.
        </div>
      </DialogContent>
    </Dialog>
  );
}
