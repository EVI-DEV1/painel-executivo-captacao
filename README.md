# Horizonte · Painel executivo de captação

Painel executivo em **um único arquivo HTML** — HTML, CSS e JavaScript puros, sem build e sem
dependências. Mostra, numa tela só, quanto um programa de indicação **deve ter**, quanto **já tem**,
de onde vêm os cadastros e o que merece atenção.

> **Demonstração com dados fictícios.** O "Clube Horizonte" não existe. Todos os nomes, equipes,
> times, cidades e números foram gerados por `scripts/gerar-dados.mjs`. Os controladores aparecem só
> com primeiro nome e inicial. Qualquer semelhança com pessoas, organizações ou lugares reais é
> coincidência.

## Como abrir

Baixe o repositório e abra `index.html` no navegador. É só isso.

## O que tem na tela

- **Balão dividido.** À direita, o que já temos sobe; à esquerda, a previsão que ainda falta entrar
  desce. Os dois níveis são complementares: cada cadastro que sobe de um lado desce do outro.
- **Linhas de fibra óptica.** As origens (equipes, times e fontes de cadastro) se ligam ao balão
  por linhas com pulsos de luz correndo na direção dele.
- **Pista da expectativa.** O avião, parado no fim da pista, é a meta. O bonequinho correndo é o
  que já temos. Mostra o ritmo dos últimos 7 dias fechados e uma estimativa de quando alcança.
- **Rota da captação.** Cadastros por dia em barras, com um avião voando sobre a rota. O dia em
  andamento aparece tracejado e fica fora da média, do pico e do vale — de manhã ele seria sempre
  o pior dia do mês, e isso é hora do dia, não informação.
- **Recortes na lateral** (equipe, cidade, plano, região e time), cada um anunciando a própria
  cobertura: uma fatia pequena não pode ser lida como o retrato do todo.
- **Pontos de atenção** que leem os mesmos dados da tela, em vez de números escritos à mão.
- **Sobreposições** explicando a origem de cada número.
- Tema claro e escuro, navegação por teclado e respeito a `prefers-reduced-motion`.

## Vocabulário do clube fictício

| Termo | O que é |
|---|---|
| Piloto | Embaixador que indica e cadastra novos membros |
| Passageiro | Pessoa cadastrada por um piloto |
| Controlador | Coordena um grupo de pilotos |
| Aspirante | Quem ainda não virou piloto |
| Equipe | Grupo do controlador |
| Time e plano | Time do piloto e a meta dele (20, 40, 100…) |
| Expectativa Projetada | Soma das metas dos pilotos ativos |
| Expectativa Real | Última expectativa lançada por cada piloto ativo |
| Contabilizados | Passageiros ativos dos pilotos ativos — o "já temos" |
| Previsão | Contabilizados + Expectativa Real |
| Cumprido da real | Contabilizados ÷ Expectativa Real |

## Os dados

Os dados ficam num bloco do próprio `index.html`, entre os marcadores `DADOS:INICIO` e `DADOS:FIM`.
Para regerar (Node 18 ou superior):

```bash
node scripts/gerar-dados.mjs            # semente padrão
node scripts/gerar-dados.mjs 12345      # outra semente, outro conjunto fictício
```

Os números não são sorteados um a um: são derivados uns dos outros para que o painel feche as
mesmas contas que mostra — as equipes somam o que os controladores cadastraram, os times somam os
totais do balão, a caixa de fontes soma o "já temos". O gerador confere essas somas e **se recusa a
gravar** se alguma não fechar.

## Estrutura

```
index.html               o painel inteiro
scripts/gerar-dados.mjs  gerador dos dados fictícios
```
