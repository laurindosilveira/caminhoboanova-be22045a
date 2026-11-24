# Revisão de acesso e histórico — 23/11/2026

Situação em 24/11: **candidata unificada em homologação; ainda não publicar em produção**. Os arquivos `attendance_scope_candidate.sql` e `historical_response_read_candidate.sql` integram `20261123_coordinated_learning_candidate.sql`, gerado a partir de cinco partes e testado atomicamente. Nenhum deles é uma migração histórica automática.

## Acesso a respostas

As políticas existentes permitem leitura e alteração de respostas por responsáveis com acesso à igreja, que pode conter mais de uma área. A turma atual não comprova a turma histórica de uma resposta. A política candidata mantém leitura e escrita para o aluno ativo na mesma igreja; ela impede acesso direto ao texto por outro usuário, inclusive liderança e administração. As telas de detalhes e o relatório pastoral não buscam respostas de outro aluno e explicam a restrição. O histórico de conclusão permanece separado. O relatório de turma informa que atividades individuais podem pertencer a turmas anteriores; isso não comprova o pertencimento histórico.

A política candidata também restringe exclusões diretas de progresso e revoga temporariamente a execução da função privilegiada `reset_turma_journey` por usuários autenticados. Esta função atualmente exclui progresso e presenças de todos os alunos da turma atual, incluindo históricos de turmas anteriores. Na interface de revisão, operações diretas de reinício por turma e pelo ranking ficam indisponíveis. A exclusão de estudos e devocionais pelas telas de liderança também fica suspensa até existir uma operação segura. As proteções dependem de atualização coordenada do banco; aparelhos antigos continuam usando a aplicação publicada até essa atualização.

O painel de exportação administrativa do app usava consultas sujeitas às mesmas políticas e podia gerar um arquivo incompleto identificado como backup. A candidata bloqueia as opções de exportar dados e migrar pelo navegador; o backup deve usar as ferramentas administrativas adequadas ao banco. A exportação pessoal permanece disponível.

## Presenças

A candidata rejeita a substituição da decisão final por uma fila antiga. Solicitações pendentes usam a versão observada para detectar conflito, e o aparelho conserva solicitações que exigem revisão. Pedidos de culto têm identificador idempotente. É necessário fornecer um fluxo operacional para tratar os itens retidos, revisar compatibilidade com aplicativos antigos e coordenar a instalação das funções e do aplicativo.

## Histórico

O resumo de estudos usa o registro de conclusão mesmo quando o texto não está disponível. Se a pontuação da lição não estiver registrada, o total é indicado como parcial e a exclusão fica bloqueada para revisão. O histórico acompanha a pessoa e pode incluir turmas anteriores. A próxima lição exibida pela liderança depende do evento programado, não da média do histórico dos alunos. Os demais cálculos de presença e pontuação histórica ainda precisam de revisão; eventos e cadastros atuais não comprovam matrícula passada.

## Evidências locais

Em banco isolado e na homologação hospedada, com identidades e dados fictícios em transação revertida: leitura das próprias respostas de lição e devocional, recusa de leitura e exclusão por outra conta com papéis de liderança/administração, recusa de exclusão de conclusões, suspensão da função antiga de reinício, transferência da área 1 para a 2, preservação do acesso do aluno e bloqueio para a liderança antiga e nova; resumo e painel de acompanhamento mostram o participante na turma atribuída antes da transferência, deixam de mostrá-lo na anterior depois e recusam acesso a outra turma. Também foram testados presença e sincronização. Testes de interface conferem que o relatório não consulta respostas de outro aluno e que descarta o relatório ao trocar a conta. Pela API hospedada, a conta fictícia rejeitou salvamento de versão antiga e de outra conta e preservou a resposta diante de conflito. O teste da fila IndexedDB com API foi executado no banco local; o teste no Android ainda está em andamento.

## Homologação e pendências

1. A homologação contém uma função antiga de sincronização. Sua instalação específica a preserva em `private`, com acesso suspenso, e salva as políticas para reversão. Como faltava a função de resumo e o painel de liderança diferia da produção, foram instaladas definições equivalentes às publicadas, preservando a função anterior. A instalação e a reversão foram ensaiadas no banco local. As migrações específicas foram aplicadas somente em `nuqwwlzklqdlnvqdbpjy`; a reversão ainda não foi executada no ambiente hospedado.
2. A prévia `caminho-recuperacao-ensaio-20261109-1c8uzl0pv.vercel.app` foi compilada em diretório limpo, e o arquivo servido foi conferido para apontar à homologação, não à produção. O login automatizado passou usando CAPTCHA simulado. O teste em Android e a fila real no aparelho ainda estão pendentes.
3. Planejar um procedimento autorizado e seguro para exclusões e reinício de ranking/turma sem apagar históricos alheios. Não inferir a área histórica a partir da turma atual. Rever os demais cálculos históricos de presença e pontos.
4. Antes de produção, revisar novamente as pré-condições e privilégios, preparar o plano de reversão específico de produção e concluir os testes em homologação e nos aparelhos. A atualização de produção continua pendente.
