Preparei a base para a plataforma se tornar multi-igrejas com foco na autonomia dos líderes e na estabilidade das atualizações.

### O que foi feito:

#### 1. Estrutura de Banco de Dados (Multi-tenancy)
- Adicionei a coluna `church_id` em todas as tabelas principais de conteúdo e progresso (`activities`, `events`, `lessons`, `lesson_content`, `devotional_content`, `user_progress`, etc.).
- Migrei os dados existentes para a igreja padrão ("Igreja Boa Nova").
- Implementei **RLS (Row Level Security)** para isolar os dados: cada igreja só vê seus próprios conteúdos e os usuários só veem o que pertence à sua igreja.
- Garanti que **Cursos Oficiais** (onde `church_id` é nulo) continuem disponíveis para todas as igrejas na aba Caminho.

#### 2. Autonomia dos Líderes
- Atualizei os componentes de gerenciamento (`CoursesTab`, `AgendaTab`) para que líderes (`role = 'lider'`) possam editar conteúdos que pertençam à sua igreja.
- Agora, se uma lição ou curso for criado especificamente para uma igreja, o líder terá permissões totais de edição. Se for um conteúdo oficial da plataforma, o líder mantém a opção de "Personalizar" para sua turma sem afetar o original.
- A aba **Agenda** agora filtra e salva eventos vinculados automaticamente à igreja do líder.

#### 3. Super Admin e Estabilidade
- Criei o papel de `super_admin` no banco de dados. Este perfil terá visão global e poderá gerenciar os "Cursos Oficiais" que servem de base para todas as igrejas.
- A lógica de consulta foi centralizada para que atualizações no código do app reflitam de forma igual em todas as igrejas, buscando sempre o `church_id` do perfil do usuário logado.

### Próximos Passos recomendados:
- Criar uma interface para o Super Admin gerenciar as diferentes igrejas cadastradas.
- Adicionar um seletor de igreja no cadastro de novos usuários.
- Validar as personalizações de lição específicas por igreja.

Você pode testar agora as abas Caminho e Agenda como líder; elas já devem estar operando com isolamento por igreja.