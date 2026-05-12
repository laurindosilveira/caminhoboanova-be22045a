import { AutomatedSystemUpdate } from "../components/home/discipleship/shared";

const BUILD_VERSION = (typeof window !== 'undefined' && (window as any).__APP_VERSION__) || "0.0.0";
const BUILD_DATE = (typeof window !== 'undefined' && (window as any).__APP_BUILD_DATE__) || new Date().toISOString();

export const AUTOMATED_SYSTEM_UPDATES: any[] = [
  {
    id: "build-current",
    title: "Build atual publicado automaticamente",
    summary: "A area do admin do sistema agora mostra a versao implantada sem depender de cadastro manual no app.",
    details:
      "Sempre que uma nova versao for publicada, o painel passa a refletir automaticamente a versao atual e a data do build. Assim, voce nao precisa mais abrir o formulario no app para introduzir as informacoes basicas da atualizacao.",
    version: `v${BUILD_VERSION}`,
    updateType: "comunicado",
    createdAt: BUILD_DATE,
    authorName: "Sistema",
    codeChanges: [
      { area: "Admin", description: "Versao automatica no painel" }
    ]
  }
];
