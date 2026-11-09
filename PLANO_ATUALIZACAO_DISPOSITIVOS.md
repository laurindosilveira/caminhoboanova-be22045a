# Plano de atualização dos aparelhos

Estado: preparação. A proteção e o aplicativo revisados não estão em produção.

## Condições antes da publicação

1. A proteção por usuário e atividade foi implementada e testada no banco de testes. Ela recusa escritas de respostas feitas por clientes antigos que não informem a versão de referência; por isso, não pode ser ativada isoladamente antes da atualização dos aparelhos.
2. Foram repetidos ensaios com gravações simultâneas e com clientes antigos. A mediana de oito lições diferentes caiu de 1.314 ms, com o bloqueio de tabelas, para 611 ms com o bloqueio por atividade. Os testes pequenos não representam a capacidade de produção.
3. Os fluxos principais de lição e devocional da cópia revisada foram adaptados para a proteção. Antes de restringir funções antigas, conferir todas as chamadas administrativas, funções de servidor e versões antigas do app, além de validar os fluxos em aparelhos reais.
4. Conferir backup, restauração, permissões e indicadores de uso do banco. Executar o teste completo no ambiente de testes com filas antigas, respostas iguais, respostas diferentes, perda de conexão e mudança de usuário no aparelho.


## Separacao operacional das migracoes

A migracao em `supabase/migrations/20261106221735_offline_response_conflict_guard.sql` foi revisada para coordenar gravacoes por usuario e atividade, inclusive chamadas de clientes antigos. Ela ainda permite que uma versao antiga envie uma resposta desatualizada: a protecao completa depende da etapa separada e ainda nao esta ativa. Medir o impacto antes de aplica-la.

O arquivo `supabase/rollout/20261106225947_per_item_learning_conflict_guard.sql` fica fora da pasta de migracoes automaticas porque passa a recusar gravacoes sem versao, inclusive de aparelhos antigos. Sua execucao e uma etapa separada, somente depois de validar atualizacao, filas antigas e recuperacao dos dados em aparelhos reais. Criar uma migracao formal para essa etapa na hora da liberacao, apos revisar historico, permissoes, backup e plano de reversao. Nao executar os arquivos automaticamente em sequencia.

## Publicação gradual

1. Disponibilizar primeiro a API compatível, sem bloquear o aplicativo atual. Depois publicar uma versão piloto do aplicativo que saiba preservar filas existentes, apresentar conflitos e usar a API protegida em todos os salvamentos.
2. Validar em Android, iPhone e navegador instalado e não instalado: abrir a versão antiga, preparar uma resposta offline, instalar a atualização, voltar à internet e confirmar que a fila continua no aparelho e é reconciliada corretamente. Verificar também aplicativo fechado durante a atualização e atualização interrompida.
3. Liberar inicialmente para um grupo pequeno e acompanhar erros de salvamento, tempo de resposta, filas pendentes e conflitos. Identificar a versão do app com métricas agregadas, sem recolher o conteúdo das respostas. Ampliar a distribuição somente após os testes e indicadores serem satisfatórios.
4. Avisar os usuários dentro do app de que existe uma atualização e orientar a permanecer no aparelho até a sincronização terminar. Nunca pedir que limpem os dados do aplicativo, desinstalem o PWA ou apaguem o armazenamento para resolver o problema: isso pode apagar filas ainda não enviadas.

## Aparelhos que permanecem na versão antiga

- Enquanto funções antigas de escrita aceitarem pedidos sem versão, uma fila de um cliente antigo ainda poderá substituir dados novos. A instalação da nova versão, por si só, não protege aparelhos que não a receberam.
- Preparar um aviso e uma atualização obrigatória compatíveis com os aparelhos antigos. O bloqueio de escrita deve ocorrer apenas depois que os caminhos online e offline do novo cliente tenham sido migrados e testados, e deve manter acessíveis as respostas pendentes no armazenamento local.
- Testar explicitamente o que a versão antiga exibe quando uma gravação é recusada. Se ela não preservar o rascunho com segurança, não ativar o bloqueio até existir um caminho de recuperação compatível. Não afirmar que uma escrita recusada foi salva.
- Não usar somente o número de versões conectadas como prova de que não restam filas offline: um aparelho desconectado pode retornar dias depois. Manter suporte e instruções para recuperação desses casos.

## Monitoramento e reversão

Antes de ampliar, verificar salvamentos bem-sucedidos, conflitos, erros, duração das requisições e crescimento das filas por período. Investigar aumentos e interromper a distribuição se houver perda de dados, falhas de sincronização ou degradação relevante.

Uma reversão deve preservar a API e a proteção necessárias para as versões já atualizadas. Não reimplantar automaticamente um cliente antigo que possa reenviar respostas sem proteção. Qualquer restauração de backup deve ser avaliada separadamente para evitar sobrescrever respostas mais recentes.


## Historico de migracoes de producao

A comparacao do historico mostrou que varias migracoes antigas presentes na integracao nao constam como aplicadas em producao, incluindo alteracoes de conteudo de licoes e uma correcao especifica de presenca. Nao executar uma sincronizacao automatica de todas as migracoes pendentes. Primeiro conferir cada arquivo e o estado atual do banco; definir uma unica migracao revisada para o que ainda for necessario. O teste de compatibilidade da fila nao valida essas migracoes historicas.


## Arquivos de versoes anteriores

Antes de publicar, preservar no mesmo dominio os arquivos de codigo e demais assets referenciados pela versao efetivamente publicada e pelas versoes antigas ainda em uso. Uma previa que nao os preservou retornou HTML para modulos JavaScript antigos e deixou o app na tela de carregamento. Validar com requisicoes diretas que cada modulo antigo retorna JavaScript, e repetir a atualizacao com cache e fila reais. A previa de transicao usada no ensaio guardou os arquivos apenas no pacote temporario; esse pacote nao representa automaticamente todas as versoes de producao.

O service worker novo pode aguardar ate que as abas da versao antiga sejam fechadas. So orientar fechar e reabrir depois de confirmar que toda resposta esteja salva ou na fila; nao limpar armazenamento, nao desinstalar o aplicativo e nao forcar recarga de paginas com dados ainda nao salvos. Manter os arquivos de versoes antigas durante a janela necessaria para aparelhos que retornem offline.


Para preparar uma copia isolada de liberacao, `node scripts/retain-deployed-assets.mjs --source https://www.caminhoboanova.com.br --output <copia-de-liberacao>/public/assets` recolhe os assets versionados publicos referenciados pela pagina e pelos modulos. O comando encerra com erro se receber HTML em lugar de um modulo ou encontrar arquivos diferentes com o mesmo nome. O ensaio de 07/11/2026 recolheu 130 arquivos da versao publicada, sem alterar o servidor. Repetir imediatamente antes de uma liberacao e conferir se outras versoes ainda usadas tambem precisam ser preservadas; a coleta da versao atual nao inclui automaticamente todas as anteriores. Nao apontar o destino para a pasta de trabalho original do usuario.
