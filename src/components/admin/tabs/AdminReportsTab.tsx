import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, FileCode2, FolderGit2 } from "lucide-react";
import { appUpdateReports } from "@/data/appUpdateReports";

function formatReleaseDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminReportsTab() {
  const [expandedReportId, setExpandedReportId] = useState<string | null>(appUpdateReports[0]?.id ?? null);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FileCode2 className="w-5 h-5 text-primary" />
        <h2 className="font-montserrat font-black text-foreground text-lg">Relatorios de Atualizacao</h2>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="font-montserrat text-sm font-bold text-foreground">Historico do app</p>
        <p className="mt-1 text-xs font-inter text-muted-foreground">
          Cada atualizacao registrada aqui e gerada automaticamente a partir do historico Git do projeto.
        </p>
      </div>

      {appUpdateReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <FolderGit2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-montserrat text-sm font-bold text-foreground">Nenhum relatorio cadastrado</p>
          <p className="mt-1 text-xs font-inter text-muted-foreground">
            Faça um commit no projeto e rode o app novamente para gerar o proximo relatorio.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appUpdateReports.map((report) => {
            const isExpanded = expandedReportId === report.id;

            return (
              <article key={report.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                  className="w-full p-4 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <FileCode2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-inter font-bold text-primary">
                          {report.version}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-inter text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatReleaseDate(report.releasedAt)}
                        </span>
                      </div>
                      <p className="mt-2 font-montserrat text-sm font-bold text-foreground">{report.title}</p>
                      <p className="mt-1 text-xs font-inter leading-relaxed text-muted-foreground">{report.summary}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="mt-1 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="mt-1 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="space-y-2">
                      <p className="text-xs font-inter font-bold uppercase tracking-wide text-muted-foreground">
                        O que mudou
                      </p>
                      <div className="space-y-2">
                        {report.highlights.map((highlight) => (
                          <div key={highlight} className="rounded-xl bg-muted/40 px-3 py-2 text-xs font-inter text-foreground">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-inter font-bold uppercase tracking-wide text-muted-foreground">
                        Arquivos alterados
                      </p>
                      {report.codeChanges.map((change) => (
                        <section key={`${report.id}-${change.filePath}`} className="rounded-2xl border border-border bg-background/60 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-inter font-bold text-secondary-foreground">
                              {change.filePath}
                            </span>
                            <span className="text-[11px] font-inter text-muted-foreground">{change.summary}</span>
                          </div>
                          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-100">
                            <code>{change.snippet}</code>
                          </pre>
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
