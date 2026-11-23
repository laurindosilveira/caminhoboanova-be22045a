# Testes da fila offline e do bloqueio

Testes realizados em 6 de novembro de 2026, exclusivamente no projeto Supabase de testes. A proteção permanece somente nesse ambiente e na cópia local; o banco e o aplicativo de produção não foram alterados.

## Fila e banco

O teste integrado usou a implementação de fila do aplicativo com IndexedDB simulado, uma conta temporária e a função instalada no PostgreSQL de testes. Uma ponte de teste executou as chamadas como o usuário autenticado no banco. A API HTTP de autenticação não foi testada nesse fluxo: o ambiente exige CAPTCHA. Os resultados foram:

- Uma resposta criada na fila permaneceu pendente depois que outra versão foi gravada no servidor.
- O usuário recebeu o conflito com a versão do servidor.
- Uma nova alteração no servidor, feita enquanto a primeira versão era revisada, produziu outro conflito e preservou a fila.
- Após uma escolha baseada na versão atual, a resposta escolhida foi salva e a ação retirada da fila.

Também passaram os testes de interface que verificam a apresentação das duas respostas e o encaminhamento da escolha. Os dados sintéticos, a conta e a credencial temporárias foram removidos após os testes.

## Conexões simultâneas

O ensaio abriu oito conexões PostgreSQL independentes, com a mesma conta sintética e oito lições diferentes. As conexões foram preparadas antes do início simultâneo e os tempos incluem rede e conclusão da transação:

| Operação | Mediana | Máximo |
| --- | ---: | ---: |
| Salvamento existente, sem a proteção | 594 ms | 604 ms |
| Salvamento com a proteção proposta | 1.314 ms | 2.081 ms |

Em outro teste, a transação que adquiriu o bloqueio foi mantida aberta artificialmente por 1,5 s. Uma gravação em outra lição ficou bloqueada e levou 1.867 ms para concluir. Isso confirma que o bloqueio das tabelas inteiras afeta operações independentes.

O ensaio é pequeno e foi feito em outra região, portanto não estima a capacidade de produção ou um percentil confiável. Ele é suficiente para rejeitar a publicação da proteção atual sem uma revisão do bloqueio. Um primeiro ensaio usando chamadas simultâneas do conector foi descartado para essa avaliação porque até consultas triviais foram serializadas pela ferramenta.

## Próximos passos

Os resultados do redesenho e dos novos testes estão abaixo. Antes da liberação, concluir a validação em aparelhos reais e executar o plano de atualização dos aparelhos.

## Novo desenho por pessoa e atividade

Uma segunda implementação usa bloqueios por pessoa e lição ou devocional. Ela recusa gravações autenticadas de respostas que não passem pela comparação protegida, incluindo pedidos das versões antigas; essas versões não fornecem uma versão de referência e precisam ser atualizadas para continuar salvando. A fila antiga permanece no aparelho quando uma tentativa é recusada.

Em oito conexões simultâneas, com a mesma conta e lições diferentes, a mediana foi de 593 ms e o máximo de 601 ms. Após uma alteração adicional na validação, uma repetição deu mediana de 611 ms e máximo de 622 ms. Na mesma lição, a mediana foi de 1.282 ms e o máximo de 2.027 ms, pois as gravações foram coordenadas entre si.

Com o bloqueio de uma atividade mantido aberto por 1,5 s, uma gravação em outra lição concluiu em 544 ms e uma gravação da mesma lição por outro usuário concluiu em 560 ms. Uma segunda gravação da mesma pessoa e lição aguardou a liberação e levou 1.876 ms. Uma chamada antiga para a mesma lição também aguardou e depois foi recusada; uma chamada antiga a outra lição foi recusada sem aguardar aquele bloqueio.

Duas versões concorrentes da mesma resposta, ambas baseadas no estado anterior, resultaram em um salvamento e um conflito. A fila integrada voltou a passar com IndexedDB simulado e o banco de testes. Foram testadas a recusa de rascunho e conclusão de lição antigos, a recusa de conclusão de devocional antiga e a impossibilidade de uma conta autenticada criar a autorização interna. A versão mais recente do devocional permaneceu preservada.

Os tempos incluem rede até o ambiente de testes e não são previsão de produção. A liberação exige teste de atualização em aparelhos reais, revisão dos caminhos administrativos e implantação coordenada: a regra que recusa clientes antigos não pode ser ativada isoladamente enquanto eles ainda precisarem salvar. A autenticação HTTP com CAPTCHA não foi coberta pelo teste integrado.

Após os ensaios, os usuários, respostas e credencial temporários foram removidos. Para não interromper testes com clientes antigos, os gatilhos do novo desenho foram retirados do banco de testes e a função anterior foi restaurada. O redesenho permanece na migração local para nova aplicação coordenada; não foi aplicado em produção. O build e 127 testes automatizados passaram; o teste que depende do banco de testes é executado separadamente com credenciais temporárias.

Em uma revisão posterior, o teste integrado também verificou uma resposta pendente sem referência de versão quando a resposta não existe mais no servidor. Ela permanece na fila e exige escolha explícita, pois a ausência pode resultar de uma exclusão em outro aparelho. A conta e os dados sintéticos foram removidos e o ambiente de testes foi restaurado após esse ensaio.


## Reteste apos separar as etapas

As duas etapas foram testadas separadamente no banco de homologacao, com IndexedDB simulado e uma conta temporaria. Na etapa compativel, a fila identificou a resposta mais recente, manteve o conflito e uma chamada antiga foi aceita. Na etapa de bloqueio, a mesma verificacao passou e uma chamada antiga foi recusada. Uma resposta ausente no servidor tambem permaneceu na fila ate confirmacao explicita.

O ambiente foi restaurado: a funcao anterior foi reinstalada e os gatilhos, a tabela interna, a conta, as respostas e o acesso temporarios foram removidos. O historico de migracoes da homologacao registra as aplicacoes e a restauracao usadas no teste. A autenticacao HTTP com CAPTCHA e a atualizacao em aparelhos reais nao foram cobertas. Nenhuma dessas etapas foi aplicada em producao.


## Atualizacao em navegador e Android

Em 07/11/2026 foi criada uma previa isolada ligada ao banco de homologacao e uma conta temporaria. O login pelo Android foi confirmado; a verificacao de seguranca usa chave de teste e nao valida a configuracao real de producao. Uma resposta foi digitada no Android em modo aviao. Ao trocar a previa para a versao nova, a pagina ficou na tela inicial de carregamento; a preservacao dessa resposta no Android ainda nao foi confirmada. A sincronizacao da conta de teste esta temporariamente bloqueada para nao consumir a fila durante a investigacao.

A falha de carregamento foi reproduzida em navegador automatizado: uma pagina antiga solicitou modulos JavaScript que a previa nova nao disponibilizava, e recebeu HTML com status 200; o navegador recusou os modulos por tipo incorreto. Na reproducao, uma acao sintetica permaneceu no IndexedDB. Uma previa de transicao com arquivos estaticos da versao antiga eliminou a tela parada no ensaio. A nova versao do service worker ficou aguardando; apos fechar e reabrir a aba no ensaio, o cliente novo carregou e exibiu a acao pendente para comparacao. Esse ensaio automatizado nao substitui a confirmacao no Android.

Apos a reproducao, a funcao de compatibilidade anterior do ambiente de homologacao foi restaurada para nao deixar o bloqueio de tabela de teste ativo para outros usuarios. O bloqueio especifico da conta Android continua ativo enquanto se aguarda a verificacao no aparelho; antes de liberar a sincronizacao, reinstalar e validar a funcao de compatibilidade revisada. Ao terminar, remover os gatilhos, a funcao e a conta temporarios.

Depois da previa de transicao, a participante informou que a licao abriu, mas a resposta de teste nao estava visivel e nenhum indicador de fila aparecia. Isso nao confirma se o texto foi gravado no armazenamento local. Foi disponibilizada uma pagina temporaria de diagnostico, de leitura apenas, que verifica no mesmo aparelho a existencia da frase de teste e a quantidade de itens, sem enviar o conteudo; aguarda-se o resultado. A conta e o bloqueio especifico continuam temporarios no ambiente de homologacao.

O diagnostico no Android informou zero itens na fila e nao encontrou a frase de teste. O banco de homologacao tambem nao registrou respostas para a conta de teste, cuja gravacao estava bloqueada. Assim, a resposta usada nesse ensaio nao foi preservada; nao ha evidencia para afirmar a causa especifica daquele aparelho.

Uma reproducao independente encontrou uma causa possivel: na versao antiga, ao atrasar duas consultas de carregamento das respostas, o campo da licao ficou editavel; com a rede desligada e apos 10 segundos, o texto estava visivel mas nao havia acao na fila. Quando as consultas haviam terminado antes da digitacao, a mesma resposta entrou na fila. A versao revisada impede a edicao ate concluir o carregamento; um teste automatizado verifica essa protecao. Outro ajuste local mostra em modo de leitura as respostas que ja estejam aguardando sincronizacao. O teste no Android ainda precisa ser repetido com a versao revisada.

Em 08/11/2026, no Android, o indicador apresentou seis alteracoes pendentes. O diagnostico aberto no mesmo navegador encontrou seis itens, mas nao encontrou a frase exata de teste; a pessoa confirmou que ela ainda estava visivel no campo da licao. Portanto, nao se deve presumir que essa frase foi gravada na fila. A conta de homologacao permanece com o envio bloqueado para evitar sobrescritas enquanto a verificacao prossegue.

A revisao identificou que o indicador de rascunho salvo podia continuar visivel apos uma edicao nova, antes da conclusao do novo salvamento. A copia revisada foi alterada para mostrar aguardando salvamento durante esse intervalo, e um teste automatizado verifica a transicao. Isso nao prova que esse foi o mecanismo exato observado no Android.

Na repeticao de 08/11, a fila exibiu oito itens e o campo continuou visivel, mas o diagnostico literal nao encontrou a frase original. A pessoa informou que o corretor do Android escreveu a palavra equivalente com acento e uma letra adicional; portanto o resultado negativo do diagnostico literal nao comprova que a resposta esteja ausente. Uma verificacao temporaria revisada compara as duas variantes localmente, sem transmitir respostas; o resultado no aparelho ainda esta pendente.

## Resultado no Android em 08/11/2026

A verificacao revisada encontrou a frase de teste na fila do Android. Depois da troca para a previa revisada e do fechamento das abas, a mesma verificacao voltou a encontra-la. A atualizacao do cliente foi confirmada pela tela de conflito; para duas versoes de teste exibidas em sequencia, a pessoa escolheu a resposta deste aparelho. A resposta final foi confirmada diretamente no banco de homologacao e voltou a aparecer na licao depois de fechar e reabrir o aplicativo; nao havia aviso de alteracoes pendentes. A primeira tentativa no aparelho, descrita acima, continua sem causa conclusiva. A mensagem anterior de que a verificacao revisada estava pendente e o relato de bloqueio ativo referem-se a etapas anteriores.

Este resultado cobre um Android, uma conta e uma resposta sintetica; nao valida iPhone, todos os caminhos de salvamento ou a configuracao de CAPTCHA de producao. A previa usou chave de teste do Turnstile. Ao finalizar a etapa, os gatilhos temporarios de bloqueio da conta foram removidos e a funcao anterior do banco de homologacao foi restaurada. Nenhuma migracao foi aplicada ao banco de producao.
