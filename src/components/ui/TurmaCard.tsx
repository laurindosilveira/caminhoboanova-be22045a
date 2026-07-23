import React from "react";
import { ChevronRight } from "lucide-react";

type Turma = { id: string; name: string; area: string | null; year: number; is_active: boolean; description: string | null; church_id?: string | null };

type TurmaCardProps = {
  turma: Turma;
  participantCount: number;
  onSelect: () => void;
};

const TurmaCard: React.FC<TurmaCardProps> = ({ turma, participantCount, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 bg-card rounded-lg border border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
        <span className="text-lg">📚</span>
      </div>
      <div className="text-left flex-1">
        <p className="font-montserrat font-bold text-foreground text-sm">{turma.name}</p>
        {turma.description && (
          <p className="text-muted-foreground font-inter text-xs mt-0.5">{turma.description}</p>
        )}
        <p className="text-muted-foreground font-inter text-xs mt-0.5">
          {participantCount} participante{participantCount !== 1 ? "s" : ""}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
};

export default TurmaCard;
