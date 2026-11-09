# Recuperação de respostas de versões antigas

Estado em 09/11/2026: investigação e protótipos em homologação. Nenhuma proteção de captura descrita aqui foi instalada em produção, e não se deve ativar ainda a etapa que recusa clientes antigos. A primeira etapa de compatibilidade também não impede sobrescrita tardia por clientes antigos.

## Problema observado

Na versão publicada de referência, edições feitas online podem existir apenas na tela enquanto o salvamento é tentado. Uma recusa do servidor mostra erro, mas não coloca automaticamente a resposta na fila local. Respostas já na fila offline permanecem nela quando o envio falha. A atualização do navegador ou do service worker pode fechar a tela com uma edição ainda não persistida.

Versões mais antigas também fizeram gravações diretas por `upsert` em `lesson_responses` e `devotional_responses`, além de operações em progresso. Interceptar apenas as funções de salvamento não cobre esses clientes. Não é possível preservar uma edição que esteja somente na memória de uma página se o aparelho desligar, a página for fechada ou uma atualização a recarregar antes de ela chegar a qualquer armazenamento.

## Experimentos em homologação

Com uma conta sintética e tabelas e funções temporárias isoladas, dois caminhos foram ensaiados por HTTP real do PostgREST:

- Uma função gravou um valor de teste e definiu `response.status` como 409. O cliente `supabase-js` recebeu erro HTTP 409 e a gravação foi confirmada no banco após o retorno.
- Um gatilho `BEFORE INSERT OR UPDATE` guardou um valor sintético, definiu 409 e retornou `NULL`. Os testes de inclusão direta, upsert sobre registro existente, upsert em lote e atualização direta retornaram erro ao cliente. As respostas de teste chegaram à tabela privada e o valor mais recente da tabela de destino permaneceu inalterado.

Esses experimentos verificam apenas o contrato básico em tabelas de teste, não são implementação de produção. Os objetos e dados sintéticos foram removidos da homologação. Uma exceção ou falha posterior na mesma transação pode reverter também a captura; erro HTTP por si só não garante recuperação.

## Implementação ainda necessária

1. Projetar uma caixa de recuperação durável e privada por pessoa, atividade e operação, com tratamento de tentativas repetidas, ordenação, limites, autorização e retenção. Os dados devem ser acessíveis somente à pessoa autorizada; nunca expor respostas em logs.
2. Tratar separadamente chamadas RPC antigas e escritas diretas antigas, incluindo lotes, mudanças de progresso, conclusão de lição e devocional, deleção, transações com falha e ações administrativas. Nenhuma conclusão ou pontuação pode ser informada como realizada se não tiver sido efetivada.
3. Integrar a caixa ao aplicativo novo. Antes de substituir uma resposta atual, mostrar a versão guardada e a atual, exigir escolha explícita e comparar novamente na gravação. Resolver duplicatas entre servidor e fila do aparelho sem apagar nenhuma resposta não resolvida.
4. Provar, em banco isolado e aparelhos reais, que a resposta sobrevive a interrupção, repetição, troca de versão, entrada em outro aparelho, erros de transação e sessão expirada. Testar cliente antigo online e offline, gravação direta, respostas múltiplas, telas administrativas e uso simultâneo por pessoas e atividades diferentes.
5. Coordenar a distribuição, preservar arquivos das versões antigas e verificar backup restaurável, monitoramento e retorno. Uma lista de versões conectadas não comprova que não restam aparelhos desconectados com respostas pendentes.

Documentação do PostgREST distingue a resposta HTTP definida por `response.status` de uma exceção SQL, que reverte a transação. Validar novamente o comportamento na versão de produção antes de qualquer uso: https://docs.postgrest.org/en/v13/references/transactions.html
