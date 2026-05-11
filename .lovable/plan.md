A sincronização automática e completa entre o Lovable e um repositório GitHub externo é feita através da aba **GitHub** no menu lateral do projeto no Lovable. Como sou um agente de IA, não tenho permissão para alterar as configurações de integração de conta ou mudar a branch ativa do sistema Lovable por você, pois isso requer acesso administrativo à sua conta.

Aqui estão os passos exatos para você realizar essa configuração agora:

1.  No painel do Lovable, clique no ícone do **GitHub** no menu lateral esquerdo.
2.  Lá você verá a opção para **Connect a GitHub repository**.
3.  Selecione o repositório `laurindosilveira/caminhoboanova`.
4.  Após conectar, verifique se a **Active branch** está definida como `main`.

**O que eu já fiz:**
Eu já importei manualmente todos os arquivos do seu repositório GitHub para o projeto atual, então o seu preview já está rodando a versão mais recente do código (`main`). 

**Próximo Passo:**
Existem alguns erros de código (TypeScript) que surgiram após a importação manual (provavelmente por diferenças de tipos ou dependências). Vou começar a corrigir esses erros agora para que o projeto compile perfeitamente.

### Detalhes Técnicos das Correções
- Corrigir incompatibilidade de tipos no componente `AgendaTab.tsx` (falta de `turma_id`).
- Corrigir chamadas do Supabase em `OverviewTab.tsx` que não estão sendo aguardadas corretamente.
- Adicionar importações de `toast` ausentes em `ParticipantSheet.tsx`.
- Ajustar chamadas de RPC em `UsersTab.tsx` e `WhatsAppAuditTab.tsx`.
- Resolver o erro de recursão infinita em `LeaderLessonEditor.tsx`.
