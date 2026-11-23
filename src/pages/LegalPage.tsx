import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalDocument = {
  title: string;
  summary: string;
  sections: LegalSection[];
};

const updatedAt = "21 de julho de 2026";
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "contato@caminhoboanova.com.br";

const documents: Record<string, LegalDocument> = {
  "/privacidade": {
    title: "Política de Privacidade",
    summary: "Como o Caminho Boa Nova trata e protege os dados de igrejas, líderes e participantes.",
    sections: [
      {
        title: "Dados tratados",
        items: [
          "Dados de cadastro, contato, igreja, área, comunidade e turma.",
          "Registros de acesso, presença, progresso em lições e devocionais, respostas e pedidos de acompanhamento pastoral.",
          "Preferências de notificação e identificadores técnicos necessários para push, segurança e prevenção de abuso.",
          "Dados de cobrança e assinatura recebidos da Stripe. O Caminho Boa Nova não armazena números completos de cartão.",
        ],
      },
      {
        title: "Finalidades e bases legais",
        paragraphs: [
          "Os dados são usados para prestar o serviço contratado, autenticar usuários, manter a segurança, permitir o acompanhamento dentro da igreja, enviar comunicações autorizadas, cumprir obrigações legais e atender solicitações dos titulares.",
          "Cada igreja administra os dados de seus participantes dentro do seu ambiente. O acesso entre igrejas é bloqueado por controles de autorização no banco de dados.",
        ],
      },
      {
        title: "Compartilhamento e armazenamento",
        paragraphs: [
          "Usamos fornecedores necessários à operação, como Supabase, Vercel, Stripe, Resend, serviço de WhatsApp e monitoramento de erros. Eles recebem apenas os dados necessários para executar suas funções, conforme seus contratos e políticas.",
          "Os dados são mantidos pelo período necessário à prestação do serviço, ao cumprimento de obrigações legais e à defesa de direitos. Depois disso, são eliminados ou anonimizados quando aplicável.",
        ],
      },
      {
        title: "Seus direitos",
        paragraphs: [
          "Você pode pedir confirmação e acesso, correção, portabilidade quando aplicável, informação sobre compartilhamento, revisão de consentimento e eliminação nos casos previstos na LGPD. Usuários autenticados podem registrar pedidos na área Privacidade e dados.",
        ],
      },
      {
        title: "Contato",
        paragraphs: [`Para dúvidas ou exercício de direitos, escreva para ${supportEmail}. Podemos solicitar confirmação de identidade para proteger seus dados.`],
      },
    ],
  },
  "/termos": {
    title: "Termos de Uso",
    summary: "Regras para uso responsável da plataforma por igrejas, líderes e participantes.",
    sections: [
      {
        title: "Conta e acesso",
        items: [
          "Forneça informações corretas e mantenha sua senha e seus dispositivos protegidos.",
          "Não compartilhe contas administrativas nem tente acessar dados de outra igreja.",
          "A igreja é responsável por definir líderes, permissões, turmas e conteúdos disponibilizados aos seus participantes.",
        ],
      },
      {
        title: "Uso aceitável",
        paragraphs: [
          "É proibido usar a plataforma para atividades ilícitas, assédio, envio abusivo de mensagens, violação de direitos de terceiros, exploração de falhas ou tentativa de contornar limites e controles de segurança.",
          "Podemos restringir temporariamente uma conta quando isso for necessário para proteger usuários, investigar abuso, atender ordem legal ou resolver inadimplência, com comunicação ao responsável sempre que possível.",
        ],
      },
      {
        title: "Disponibilidade e conteúdo",
        paragraphs: [
          "Buscamos manter o serviço disponível e seguro, mas manutenções, falhas de fornecedores e eventos fora do nosso controle podem causar interrupções. Conteúdos e orientações pastorais inseridos pela igreja permanecem sob responsabilidade de seus administradores.",
        ],
      },
      {
        title: "Planos e alterações",
        paragraphs: [
          "Recursos, limites e preços seguem o plano contratado e as condições apresentadas antes do pagamento. Mudanças relevantes nestes termos serão comunicadas por meio adequado antes de produzirem efeitos quando exigido por lei.",
        ],
      },
    ],
  },
  "/cookies": {
    title: "Política de Cookies",
    summary: "Tecnologias locais usadas para login, preferências, segurança e funcionamento do PWA.",
    sections: [
      {
        title: "Tecnologias necessárias",
        paragraphs: [
          "A plataforma usa armazenamento local, cache do aplicativo e identificadores de sessão para manter o login, sincronizar atividades offline, lembrar preferências e permitir notificações. Esses recursos são essenciais para o funcionamento solicitado pelo usuário.",
        ],
      },
      {
        title: "Segurança e medição",
        paragraphs: [
          "Podemos usar mecanismos antifraude e CAPTCHA para proteger cadastro e login. Quando o monitoramento de erros estiver configurado, ele será usado para estabilidade e segurança sem envio intencional de conteúdo pessoal, senhas ou parâmetros sensíveis de URL.",
        ],
      },
      {
        title: "Como controlar",
        paragraphs: [
          "Você pode apagar dados do site nas configurações do navegador. Isso encerra sessões, remove preferências locais e pode desativar notificações e recursos offline até uma nova configuração.",
        ],
      },
    ],
  },
  "/cancelamento-e-reembolso": {
    title: "Cancelamento e Reembolso",
    summary: "Como cancelar a assinatura e solicitar análise de valores pagos.",
    sections: [
      {
        title: "Cancelamento",
        paragraphs: [
          `O responsável pela assinatura pode solicitar o cancelamento pelo canal ${supportEmail}. O acesso permanece disponível conforme o período já pago, salvo quando houver motivo de segurança, fraude ou determinação legal.`,
        ],
      },
      {
        title: "Direito de arrependimento",
        paragraphs: [
          "Contratações feitas pela internet podem ser canceladas dentro do prazo legal de sete dias, contado da contratação, com devolução dos valores aplicável nos termos da legislação brasileira.",
        ],
      },
      {
        title: "Reembolsos após o prazo legal",
        paragraphs: [
          "Pedidos posteriores são analisados conforme o ciclo contratado, eventual indisponibilidade comprovada, cobrança duplicada e demais direitos previstos em lei. Reembolsos aprovados seguem o meio de pagamento e os prazos operacionais da Stripe e da instituição financeira.",
        ],
      },
      {
        title: "Dados após o encerramento",
        paragraphs: [
          "O cancelamento da assinatura não implica eliminação imediata de todos os dados quando houver obrigação legal ou necessidade de preservação. Pedidos LGPD podem ser feitos separadamente na área Privacidade e dados.",
        ],
      },
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const document = documents[pathname] ?? documents["/privacidade"];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/apresentacao" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Caminho Boa Nova
          </Link>
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </header>

      <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold text-primary">Documento público</p>
        <h1 className="mt-2 font-montserrat text-3xl font-black sm:text-4xl">{document.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{document.summary}</p>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>

        <div className="mt-10 space-y-9">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-montserrat text-xl font-bold">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base leading-7 text-muted-foreground">{paragraph}</p>
              ))}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        {pathname === "/privacidade" && (
          <a
            href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Direitos dos titulares na ANPD <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </article>
    </main>
  );
}
