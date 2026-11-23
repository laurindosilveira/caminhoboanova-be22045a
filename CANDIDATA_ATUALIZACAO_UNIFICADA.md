# Candidata unificada de atualização

Estado em 23/11/2026: preparada para revisão e testes; **não publicada**. A base é a `main` do Git no commit `24ca637` e a cópia de integração anteriormente revisada. A alteração reúne o aplicativo integrado, otimizações, a fila offline e uma candidata de proteção do banco. A candidata ainda requer revisão funcional, segurança e validação hospedada antes de uma implantação.

## Caminho de banco, sem receptor de respostas antigas

O arquivo único `supabase/rollout/20261123_coordinated_learning_candidate.sql` é construído localmente por `node scripts/build-learning-rollout.mjs` a partir de três arquivos em `supabase/rollout`. Ele cria a comparação de respostas e bloqueios por pessoa e atividade, recusa escritas antigas sem proteção e só permite que a conta dona envie um item da fila. A chamada anterior sem verificação de titular é revogada para o papel autenticado. A aplicação ocorre em uma transação e recusa uma segunda aplicação ou a presença de objetos incompatíveis. O cliente novo chama `sync_owned_learning` e requer essa função no mesmo banco.

Não usar `supabase db push` ou executar o histórico de migrações em lote. A candidata fica fora da pasta de migrações automáticas. Migrações históricas adicionadas na antiga cópia de integração não fazem parte desta alteração, incluindo arquivos que modificam conteúdo de lições. Antes de qualquer execução, verificar novamente funções, gatilhos, permissões e histórico do banco de destino; conferir backup atualizado, ordem coordenada de publicação, comunicação aos aparelhos e reversão que preserve as APIs necessárias ao cliente novo.

O responsável aceita a possibilidade de perda dos textos antigos de lições e devocionais. A candidata não apaga respostas nem filas e não captura tentativas feitas por versões antigas. Uma tentativa antiga recusada pode permanecer apenas na memória do aparelho ou não ser recuperável; o comportamento visual das versões antigas precisa ser confirmado em aparelhos. A aceitação de eventual perda de textos não inclui autorização para apagar presenças, conclusões, usuários ou outros dados.

## Verificações e limites

O roteiro `src/tests/run-unified-rollout-isolated.ps1` restaura uma cópia do banco em contêineres locais descartáveis, sem exposição de portas e em rede interna. Ele testa o arquivo SQL exato, precondições, clientes antigos, alterações diretas, comparação de versões, identidade e fila IndexedDB com PostgREST. Os resultados locais não demonstram segurança, velocidade ou capacidade da hospedagem. As consultas reais de produção e a origem dos dados históricos continuam sujeitas a revisão antes da implantação.

A experiência anterior de revisão de escopo de área e turma permanece desativada nesta candidata; sua caixa de recuperação e o receptor não são requisitos deste caminho. Em produção, políticas de leitura de respostas permitem acesso mais amplo por igreja, e há questões abertas de presenças, conclusões pendentes e resumos históricos. Elas exigem revisão específica para não expor conteúdo nem atribuir automaticamente uma atividade à turma errada. Sem resolver esses pontos e testar Android, CAPTCHA e aparelhos antigos na homologação, não tratar esta candidata como pronta para publicação.
