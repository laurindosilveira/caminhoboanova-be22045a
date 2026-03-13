import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Users, MessageSquare, AlertTriangle, Lightbulb, Heart, Handshake } from "lucide-react";

type Section = {
  id: string;
  icon: typeof BookOpen;
  title: string;
  content: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: "intro",
    icon: BookOpen,
    title: "1. Introdução",
    content: (
      <div className="space-y-2 text-sm font-inter text-foreground/90">
        <p>Este guia foi desenvolvido para apoiar líderes e discipuladores do programa <strong>Caminho</strong> na tarefa de conduzir pessoas no crescimento espiritual.</p>
        <p>Liderar é servir, e servir exige preparo, empatia e disposição para aprender continuamente. O objetivo é oferecer ferramentas práticas que ajudem na gestão de equipes, comunicação eficaz e criação de ambientes colaborativos.</p>
      </div>
    ),
  },
  {
    id: "estilos",
    icon: Users,
    title: "2. Estilos de Liderança",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        <div>
          <p className="font-bold text-foreground mb-1">🤝 Liderança Servidora</p>
          <p className="text-muted-foreground text-xs mb-1">Inspirada em Marcos 10:45 — o líder coloca as necessidades dos outros em primeiro lugar.</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Escuta ativa e empatia genuína</li>
            <li>Foco no desenvolvimento das pessoas</li>
            <li>Humildade para reconhecer limitações</li>
            <li>Compromisso com o bem-estar integral</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🔥 Liderança Transformacional</p>
          <p className="text-muted-foreground text-xs mb-1">Focada em inspirar mudanças positivas pelo exemplo e visão compartilhada.</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Comunica uma visão clara e inspiradora</li>
            <li>Encoraja criatividade e pensamento crítico</li>
            <li>Investe no crescimento individual</li>
            <li>Celebra conquistas e aprende com fracassos</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🎯 Liderança Situacional</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li><strong>Direcionador:</strong> Para membros novos que precisam de orientação clara</li>
            <li><strong>Coach:</strong> Para quem tem experiência mas precisa de apoio</li>
            <li><strong>Apoiador:</strong> Para membros maduros que precisam de espaço</li>
            <li><strong>Delegador:</strong> Para líderes experientes com autonomia</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🌐 Liderança Colaborativa</p>
          <p className="text-xs text-foreground/80">Valoriza a participação de todos nas decisões, promovendo senso de pertencimento e corresponsabilidade.</p>
        </div>
      </div>
    ),
  },
  {
    id: "motivacao",
    icon: Heart,
    title: "3. Motivando Equipes",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        <div>
          <p className="font-bold text-foreground mb-1">🏆 Reconhecimento e Valorização</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Celebre publicamente as contribuições de cada membro</li>
            <li>Use o sistema de pontos do app como ferramenta de reconhecimento</li>
            <li>Envie mensagens pessoais de encorajamento via WhatsApp</li>
            <li>Compartilhe testemunhos de crescimento com o grupo</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">✝️ Propósito e Pertencimento</p>
          <p className="text-xs text-foreground/80 mb-1">Conecte cada atividade à visão 3M: <strong>Amar a Deus, Amar ao Próximo, Servir ao Mundo</strong>.</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Relembre regularmente a missão e os valores do grupo</li>
            <li>Crie momentos de partilha para expressar o chamado pessoal</li>
            <li>Desenvolva projetos de serviço comunitário em equipe</li>
            <li>Estabeleça metas coletivas alcançáveis e mensuráveis</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🛡️ Ambiente Seguro</p>
          <p className="text-xs text-foreground/80">Crie um espaço onde errar é permitido e vulnerabilidade é valorizada. Um ambiente psicologicamente seguro aumenta a confiança e a participação.</p>
        </div>
      </div>
    ),
  },
  {
    id: "comunicacao",
    icon: MessageSquare,
    title: "4. Comunicação e Feedback",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        <div>
          <p className="font-bold text-foreground mb-1">💬 Princípios de Comunicação Eficaz</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li><strong>Clareza:</strong> Seja direto e objetivo. Evite ambiguidades.</li>
            <li><strong>Consistência:</strong> Mantenha frequência regular (semanal é ideal).</li>
            <li><strong>Empatia:</strong> Antes de falar, ouça. Entenda o contexto.</li>
            <li><strong>Transparência:</strong> Compartilhe decisões e seus motivos.</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">📋 Modelo SCI para Feedback</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li><strong>Situação:</strong> "No encontro de terça-feira..."</li>
            <li><strong>Comportamento:</strong> "...percebi que você ficou em silêncio..."</li>
            <li><strong>Impacto:</strong> "...e senti que o grupo perdeu sua perspectiva."</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">👂 Escuta Ativa</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Mantenha contato visual e postura aberta</li>
            <li>Parafraseie para confirmar compreensão</li>
            <li>Faça perguntas abertas que convidem à reflexão</li>
            <li>Evite preparar sua resposta enquanto o outro fala</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "desafios",
    icon: AlertTriangle,
    title: "5. Situações Desafiadoras",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        {[
          { emoji: "📉", title: "Discípulo com Faltas Consecutivas", tip: "Entre em contato pessoalmente. Demonstre preocupação genuína, não cobrança. Use a Central de Alertas do app para monitorar." },
          { emoji: "⚔️", title: "Conflito entre Membros", tip: "Converse individualmente antes de reunir ambos. Facilite uma conversa mediada focada em reconciliação (Mateus 18:15-17)." },
          { emoji: "😔", title: "Queda de Engajamento Geral", tip: "Reavalie o formato dos encontros. Peça feedback honesto. Use os desafios comunitários do app para reacender a motivação." },
          { emoji: "🆘", title: "Membro em Crise", tip: "Acolha sem julgamento. Acione o pastor responsável pela área. Use a função 'Precisa do Pastor' no app." },
          { emoji: "🔄", title: "Resistência a Mudanças", tip: "Explique o porquê de forma transparente. Implemente gradualmente. Celebre os primeiros resultados positivos." },
        ].map(item => (
          <div key={item.title}>
            <p className="font-bold text-foreground mb-0.5 text-xs">{item.emoji} {item.title}</p>
            <p className="text-xs text-foreground/80">{item.tip}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "desenvolvimento",
    icon: Lightbulb,
    title: "6. Desenvolvendo Habilidades",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        <div>
          <p className="font-bold text-foreground mb-1">🪞 Autoconhecimento</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Identifique seus pontos fortes e áreas de melhoria</li>
            <li>Peça feedback regularmente aos liderados e pares</li>
            <li>Reflita semanalmente sobre suas ações e decisões</li>
            <li>Mantenha um diário de liderança com aprendizados</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">📖 Formação Contínua</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Participe de capacitações e retiros de líderes</li>
            <li>Leia livros sobre liderança cristã e secular</li>
            <li>Busque mentoria de líderes mais experientes</li>
            <li>Estude modelos bíblicos (Moisés, Neemias, Paulo)</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🎯 Prática Intencional</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Delegue tarefas para desenvolver novos líderes</li>
            <li>Prepare-se com antecedência usando o Guia do Líder</li>
            <li>Documente anotações pós-encontro no app</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "colaborativo",
    icon: Handshake,
    title: "7. Ambiente Colaborativo",
    content: (
      <div className="space-y-3 text-sm font-inter text-foreground/90">
        <div>
          <p className="font-bold text-foreground mb-1">🤝 Cultura de Confiança</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Seja vulnerável primeiro — compartilhe suas dificuldades</li>
            <li>Cumpra compromissos e prazos de forma consistente</li>
            <li>Trate informações pessoais com total confidencialidade</li>
            <li>Admita erros abertamente e mostre como aprendeu</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🙋 Participação Ativa</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Distribua responsabilidades entre todos os membros</li>
            <li>Alterne quem lidera orações, leituras e dinâmicas</li>
            <li>Use enquetes e votações para decisões do grupo</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">🎉 Celebração e Comunhão</p>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/80">
            <li>Reserve momentos para socialização</li>
            <li>Celebre aniversários, conquistas e marcos de fé</li>
            <li>Ore uns pelos outros de forma específica e intencional</li>
          </ul>
        </div>
        <p className="text-center italic text-muted-foreground text-xs pt-2 border-t border-border mt-3">
          "Apascenta as minhas ovelhas." — João 21:17
        </p>
      </div>
    ),
  },
];

export default function LeaderGuideContent() {
  const [openSection, setOpenSection] = useState<string | null>("intro");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="font-montserrat font-black text-foreground text-lg">Guia do Líder</h2>
      </div>
      <p className="text-muted-foreground font-inter text-xs">
        Estratégias, estilos e ferramentas práticas para o discipulado.
      </p>

      <div className="space-y-2">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-montserrat font-bold text-foreground text-sm flex-1">{section.title}</span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                }
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-0 border-t border-border animate-in slide-in-from-top-1 duration-200">
                  <div className="pt-2">{section.content}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
