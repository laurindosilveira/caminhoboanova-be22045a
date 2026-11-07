# Plano de atualização dos aparelhos

Estado: preparação. A proteção e o aplicativo revisados não estão em produção.

## Condições antes da publicação

1. A proteção por usuário e atividade foi implementada e testada no banco de testes. Ela recusa escritas de respostas feitas por clientes antigos que não informem a versão de referência; por isso, não pode ser ativada isoladamente antes da atualização dos aparelhos.
2. Foram repetidos ensaios com gravações simultâneas e com clientes antigos. A mediana de oito lições diferentes caiu de 1.314 ms, com o bloqueio de tabelas, para 611 ms com o bloqueio por atividade. Os testes pequenos não representam a capacidade de produção.
3. Os fluxos principais de lição e devocional da cópia revisada foram adaptados para a proteção. Antes de restringir funções antigas, conferir todas as chamadas administrativas, funções de servidor e versões antigas do app, além de validar os fluxos em aparelhos reais.
4. Conferir backup, restauração, permissões e indicadores de uso do banco. Executar o teste completo no ambiente de testes com filas antigas, respostas iguais, respostas diferentes, perda de conexão e mudança de usuário no aparelho.

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
