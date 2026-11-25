# Ensaio do plano de atualização e reversão — 24/11/2026

**Situação: revisão; não executar em produção.** A candidata de produção e sua reversão foram exercitadas somente em uma cópia local descartável. A homologação tem uma configuração e um histórico próprios; não é prova de recuperação integral de produção.

## Ambiente identificado

- Projeto de produção do banco: `ktvdjrabetukptqduier`. A consulta de 24/11 encontrou as assinaturas esperadas das três funções de salvamento e da função de reinício, e não encontrou os objetos das novas proteções. Confirmar novamente imediatamente antes de qualquer aplicação.
- Domínio principal `www.caminhoboanova.com.br` apontava em 24/11 ao deployment `dpl_GwKXCTbHPAB8pDR1J1CxwWpCSHuf`, commit `8361c756120666a34d9a1b71718b7db98077a2ad`. Confirmar novamente o alias e a disponibilidade do deployment antes da janela; registrar também o deployment novo exato.
- O último backup integral local identificado é de 09/11/2026, coletado em momentos diferentes e sem snapshot transacional único. Ele não contém alterações posteriores. Antes da janela, gerar uma cópia atualizada e protegida, verificar sua integridade e sua restauração isolada, inclusive Auth, Storage, configuração e histórico necessário. PDFs não substituem backup do banco. O plano anterior está em `output/backups/PLANO-RECUPERACAO-2026-11-09.md` no checkout principal.

## Preparação e aplicação coordenada

1. Concluir a revisão da proposta, dos efeitos de área/turma, do CAPTCHA real e do atendimento de presenças retidas. Identificar responsáveis, janela, comunicação e contato para suporte. Não usar a prévia que estiver ligada ao banco errado.
2. Inventariar as origens reais dos aplicativos instalados e manter cada usuário no mesmo domínio e perfil de navegador: IndexedDB e filas não são compartilhados automaticamente entre domínios, navegadores ou reinstalações. Instruir a não limpar dados, não desinstalar e não trocar de conta com operações pendentes. A quantidade de itens em cada aparelho não pode ser inferida apenas do servidor.
3. Gerar os artefatos de revisão com `node scripts/build-learning-rollout.mjs` e `node scripts/build-production-rollout.mjs`. Conferir hashes do arquivo final, do app e do deploy aprovado; repetir os testes em cópia isolada. O SQL específico `supabase/rollout/production_coordinated_candidate_20261124.sql` faz pré-condições e salva, em tabelas privadas, metadados das políticas e impressões digitais do release na própria transação. Não executar lote histórico de migrações.
4. A ordem prevista instala a proteção do banco antes de publicar o app novo. Haverá uma janela em que versões antigas podem receber erro de atualização necessária e ficar com dados locais pendentes. O serviço deve comunicar essa indisponibilidade; não tratar erro como gravação concluída. A nova versão deve ser publicada para os mesmos domínios, sem apagar os dados dos aparelhos. A ativação do service worker e as filas devem ser observadas: a troca de app e banco não é instantânea para todos os usuários.
5. Validar imediatamente com conta sintética autorizada: login/CAPTCHA real configurado para o domínio, carregamento, leitura, salvamento, conflito, fila offline, presença pendente e acesso por área; conferir logs sem textos de respostas, erros e latência. Acompanhar as filas relatadas pelos usuários, com suporte para cada aparelho.

## Reversão e continuidade

1. Decidir com base em falha observada, preservar os dados existentes, interromper mudanças administrativas e coordenar a janela. Não restaurar automaticamente um dump antigo sobre os dados atuais: isso descartaria operações posteriores.
2. O arquivo `supabase/rollout/production_rollback_20261124.sql` exige bloqueio exclusivo temporário das seis tabelas, confere se funções, políticas e gatilhos ainda são os do release instalado e interrompe se houve alteração. Ele restaura as políticas capturadas, mantém o reinício destrutivo de turma suspenso, preserva os comprovantes de idempotência e instala uma pausa para gravações autenticadas de lições, devocionais, presenças e cultos. Essa pausa é deliberada: retornar ao app antigo sem ela permitiria que filas antigas sobrescrevessem dados novos.
3. O bloqueio atende gravações cujo papel de banco é `authenticated`; não se presume que pare trabalhos com `service_role`, jobs, Edge Functions ou acessos administrativos. Antes de reverter, identificar e pausar ou controlar esses escritores. Ainda não existe uma página de manutenção nem uma suspensão global de escritores validada. O script é uma peça do plano, não um botão de recuperação integral.
4. Só voltar ao deployment anterior confirmado depois que o banco estiver em estado compatível e a pausa estiver ativa. A fila deve ficar no mesmo aparelho; o app antigo pode apresentar erro, e não há garantia de que versões antigas expliquem a pausa adequadamente. Monitorar e comunicar a indisponibilidade.
5. Para retomar gravações, preparar e testar uma correção de avanço e a reconciliação dos comprovantes preservados; a candidata original bloqueia reaplicação quando existem arquivos de evidência, por isso não basta executá-la de novo. Não remover a pausa antes de restaurar a proteção completa e validar a sincronização.

## Evidências e limites

- Na cópia local do backup de 09/11, o artefato de produção foi aplicado e revertido; o ensaio comparou as políticas recuperadas, preservou os comprovantes e recusou reversão quando o release foi alterado. A cópia de revisão de uma versão antiga tentou sincronizar uma fila, recebeu erro e reteve o item; a origem exata do código publicado via CLI ainda precisa ser confirmada; o teste após a reversão cobriu o congelamento dos salvamentos.
- Na homologação, a proteção contra respostas antigas, troca de conta, conflitos e presenças foi testada com dados fictícios. No Android, a versão nova sincronizou lição, devocional e presença offline. Um teste adicional de atualização da versão antiga no mesmo aparelho está em andamento.
- Pendência de segurança: entradas antigas de lição/devocional não registram turma nem área de origem. Comparar respostas ou usar a turma atual não prova a origem de uma conclusão. O fluxo sem receptor não pode ser considerado validado para todos os casos de transferência; conclusões e presenças não devem ser descartadas silenciosamente. A opção de abrir mão de textos de respostas não autoriza perda ou atribuição indevida desses registros.
- O CAPTCHA no Android de homologação foi simulado, não o CAPTCHA real. A proteção de novas tentativas de presença/culto do aplicativo antigo foi alterada após a primeira validação física e requer novo ensaio no aparelho.

## Atualização parcial — conclusões antigas

A candidata conserva no aparelho conclusões sem turma verificável e permite que outras ações prossigam. Um identificador privado de matrícula muda a cada transferência, inclusive em uma sequência A → B → A. A liderança da turma atual recebe apenas aluno e atividade, sem textos, e pode autorizar explicitamente o destino atual sem afirmar a origem; a aprovação fica registrada e deixa de valer após nova transferência. A fila só é removida após conclusão confirmada no servidor ou escolha válida de respostas.

O ensaio com fila, API, autorização da liderança e banco passou localmente; o banco hospedado foi testado com identidades fictícias, com as alterações revertidas ao fim do teste. No Android, uma conclusão foi criada offline na versão antiga, a conta fictícia foi transferida e retornou à turma anterior, e a fila foi aberta na versão nova pelo mesmo endereço. A liderança fictícia autorizou o destino por chamadas autenticadas ao banco de homologação; o aluno comparou os dados e confirmou a escolha. A lição ficou concluída no banco e no Android após atualizar, sem aviso de fila. A tela da liderança teve testes automatizados, mas não foi operada em aparelho físico nesse ensaio. A origem histórica permanece desconhecida: o registro de aprovação demonstra apenas a destinação escolhida, e o modelo de progresso antigo ainda não registra uma turma histórica em cada conclusão. Os relatórios não devem apresentar esse destino como prova de origem.

A validação local cobre conclusão autorizada, transferência e retorno, liderança fora da turma e desativada, conflitos, fila e reversão. A inicialização foi testada com service worker: a navegação online recebe a página atual e a navegação offline usa a página e os arquivos iniciais armazenados. O teste físico ainda é necessário.

## Android: filas antigas de presença e culto

Em 24/11, na cópia de revisão da versão antiga e no mesmo navegador, foram guardadas offline uma presença em evento fictício e um culto fictício. Após instalar a versão nova no mesmo endereço, a tela de carregamento demorou a abrir e foi necessário fechar e reabrir a aba. A homologação recebeu a presença como pendente de aprovação e um único culto pendente; o Android deixou de mostrar itens a sincronizar e confirmou a situação da presença. O usuário também confirmou visualmente no Android o culto como pendente. Isto não comprova o tratamento de itens que perderam a igreja nem resolve a lentidão de inicialização.

## Conferência prévia de produção (25/11/2026)

Consulta somente de leitura: entre 41 perfis ativos aprovados com turma, um apresentou área de perfil diferente da turma. A nova verificação bloqueia a conclusão desse perfil até ajuste autorizado; não houve correção em produção. Confirmar novamente perto da janela e tratar o cadastro conforme a regra de turma/área antes da publicação.

## Abertura e troca de versão

No teste Android, o registro da conta fictícia mostrou falha ao carregar módulos JavaScript de versões anteriores depois da troca do destino do mesmo endereço de homologação. O service worker gerado respondia com a página armazenada antes da regra que tentava consultar a rede. A candidata usa navegação pela rede com fallback offline, armazena os módulos essenciais identificados automaticamente e oferece recuperação se o carregamento inicial ou um módulo falhar. O teste local em navegador verificou navegação online após mudança de versão e abertura do shell offline; isso não comprova disponibilidade de todas as telas sem rede.

Uma aba de outra prévia, cujo endereço termina em 1c8uzl0pv, manteve oito itens de teste em fila própria. Eles não são compartilhados automaticamente com o endereço caminho-fila-antiga. A fila foi preservada e não deve ser limpa para concluir o novo ensaio.

## Revisão da conclusão no Android (25/11)

Havia dois pedidos de conclusão fictícios para a mesma lição; cada um recebeu autorização da liderança fictícia. O primeiro rascunho foi comparado e mantida a versão do servidor; depois da aprovação, o aluno escolheu explicitamente a resposta fictícia do aparelho. O banco mostrou conclusão e resposta de teste; a segunda solicitação foi sincronizada sem aviso remanescente. O número de confirmações sucessivas pode dificultar o uso quando há várias entradas para a mesma atividade e merece atenção no suporte. O ensaio não recuperou nem apagou a fila de oito itens pertencente a outra origem de homologação.
