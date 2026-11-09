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
