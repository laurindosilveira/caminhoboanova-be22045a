# Atualizacao especifica para sincronizacao de respostas

Estado em 08/11/2026: preparada e testada em homologacao; nao aplicada em producao. Nao executar `db push` ou lote de migracoes historicas. A migracao candidata e `supabase/migrations/20261106221735_offline_response_conflict_guard.sql`; a etapa de bloqueio de clientes antigos permanece em `supabase/rollout/20261106225947_per_item_learning_conflict_guard.sql`.

## O que a primeira etapa faz

Cria `sync_offline_learning` e coordenacao por usuario e licao ou devocional, envolvendo as quatro tabelas de respostas e progresso. Uma operacao revisada compara as respostas atuais com a referencia antes de salvar; no conflito, devolve os dados da propria conta e nao grava. A chamada antiga participa do mesmo bloqueio, mas nao oferece uma referencia de versao: uma escrita antiga posterior ainda pode sobrescrever uma resposta mais recente. A protecao completa exige a segunda etapa e nao deve ser anunciada antes dela.

A funcao delega as gravacoes as funcoes de producao existentes, preservando suas regras de pontuacao e validacao. A regra escolhida para licao fora do prazo permanece zero pontos no cliente revisado. Esta migracao nao atualiza conteudo, nem substitui as tres funcoes existentes. A chamada autenticada precisa de `SECURITY DEFINER`; o consultor de seguranca sinaliza essa exposicao para revisao, e o corpo limita a leitura ao `auth.uid()`. O acesso anonimo e negado. A etapa de bloqueio impede que uma conta autenticada fabrique a autorizacao interna.

## Conferencias e testes

Em 08/11, as definicoes de `save_lesson_draft`, `complete_lesson` e `complete_devotional` em homologacao tinham os mesmos hashes das definicoes consultadas em producao. As restricoes de unicidade usadas por elas existem em producao. A API nova e os objetos privados e gatilhos com os nomes escolhidos nao existiam no momento da consulta. O arquivo contem verificacao que interrompe a instalacao se faltar assinatura exigida ou se algum desses objetos ja existir; revalidar antes de uma eventual publicacao. O consultor reporta a funcao de seguranca elevada executavel por usuarios autenticados; revisar seu escopo e autorizacao com as demais funcoes e politicas existentes, sem conceder acesso anonimo.

O teste integrado com IndexedDB e banco de homologacao passou nas duas etapas, inclusive uma versao antiga, uma alteracao concorrente e outra alteracao depois da tela de conflito. A migracao exata revisada tambem passou com o teste de precondicao e a segunda aplicacao foi recusada. O tipo do aplicativo e 12 testes de conflitos e carregamento passaram. No ensaio de bloqueio confirmado por consulta separada, uma gravacao nova esperou 4.590 ms na mesma licao e 840 ms em outra; uma chamada antiga esperou 3.447 ms na mesma licao e 559 ms em outra. O bloqueio artificial era de cinco segundos; tempos incluem rede e nao sao capacidade de producao. O ensaio avalia uma conta e duas licoes; transacoes que alterem varios itens e caminhos administrativos exigem revisao adicional, inclusive deteccao de deadlock e politica de repeticao segura.

A resposta de teste no Android sobreviveu a troca de versao, foi conciliada e confirmada no banco de homologacao apos reabertura. Isso cobre um aparelho, com chave de teste do CAPTCHA; nao valida CAPTCHA de producao nem iPhone. A funcao anterior de homologacao foi restaurada e os gatilhos e funcoes temporarios removidos apos os testes.

## Preparacao para liberacao futura

1. Revisar novamente esquema, funcoes, privilegios e gatilhos atuais e validar o artefato exato em copia isolada. A consulta anterior e um retrato, nao garantia de que producao permaneceu igual.
2. Confirmar plano de distribuicao e preservacao de assets antigos e filas. Executar a revisao funcional dos caminhos administrativos e testar cargas e erros de concorrencia. Determinar monitoramento de bloqueios, erros, conflitos e filas, com limite para pausar a liberacao.
3. A primeira etapa pode ser analisada isoladamente, mas deixa o risco de sobrescrita por versoes antigas. A segunda recusa salvamentos antigos e so deve ser considerada apos existir um caminho seguro para atualizar aparelhos e recuperar filas; confirmar que clientes antigos nao fazem usuario acreditar que salvaram quando a escrita foi recusada. Um aparelho desconectado por dias nao pode ser descartado da avaliacao.
4. Preparar backup verificado e um plano de retorno que mantenha a API exigida pelos clientes atualizados e preserve respostas e filas. Nao restaurar dados antigos nem remover a API indiscriminadamente. Rever a seguranca de todo procedimento de retorno antes da execucao.

O historico de producao contem migracoes antigas ausentes localmente e vice-versa. Nao alterar registros de historico em massa para alinhar numeros; revisar e executar apenas uma mudanca identificada e aprovada no processo de liberacao. A migracao especifica, o aplicativo e a etapa de bloqueio nao foram publicados por este trabalho.
