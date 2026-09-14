#!/usr/bin/env node
/*
 * Gera os dados FICTÍCIOS do painel e grava no index.html, entre os marcadores
 * DADOS:INICIO e DADOS:FIM.
 *
 * Tudo aqui é inventado: nomes, equipes, times, cidades e números. Cada controlador
 * aparece só com primeiro nome e a inicial do sobrenome, sorteados de uma lista de nomes comuns e de letras —
 * de propósito, para que nenhuma combinação coincida com o nome completo de alguém.
 * A semente fixa faz o resultado ser sempre o mesmo.
 *
 * Os números não são sorteados um a um: são derivados uns dos outros para que o painel
 * feche as mesmas contas que mostra — as equipes somam o que os controladores
 * cadastraram, os times somam os totais do balão, a caixa de fontes soma o "já temos".
 *
 * Uso:  node scripts/gerar-dados.mjs [semente]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEMENTE = Number(process.argv[2] || 20250531);
const ARQUIVO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');

/* ------------------------------------------------------------ aleatório com semente */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEMENTE);
const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const embaralha = arr => {
  const c = arr.slice();
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
};
const soma = arr => arr.reduce((a, b) => a + b, 0);

/* Reparte um total inteiro por pesos, sem perder unidade no arredondamento. */
function reparte(total, pesos) {
  const s = soma(pesos);
  const brutos = pesos.map(p => s ? total * p / s : 0);
  const inteiros = brutos.map(Math.floor);
  let resto = total - soma(inteiros);
  brutos.map((b, i) => [b - Math.floor(b), i]).sort((x, y) => y[0] - x[0])
    .forEach(([, i]) => { if (resto > 0) { inteiros[i]++; resto--; } });
  return inteiros;
}

/* ------------------------------------------------------------ nomes e lugares inventados */
const NOMES = [
  'Ana', 'Bruno', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Heitor', 'Isabela', 'Karina',
  'Marina', 'Nicolas', 'Olívia', 'Paulo', 'Rafael', 'Sofia', 'Tiago', 'Vinícius', 'Yasmin',
  'Otávio', 'Márcio', 'Renata', 'Sérgio', 'Talita', 'Vanessa', 'Caio', 'Débora', 'Everton',
  'Flávia', 'Igor', 'Leandro', 'Mirela', 'Natália', 'Rodrigo', 'Tatiane', 'Valter', 'Beatriz',
  'Danilo', 'Priscila', 'Rogério', 'Lívia', 'Wagner'
];
const INICIAIS = 'ABCDFGHLMNPRSTV';

const EQUIPES_DEF = [
  ['(sem equipe)', 'sem'],
  ['Bairro Aurora', 'bairro'], ['Bairro Serra Azul', 'bairro'], ['Bairro Lagoa Clara', 'bairro'],
  ['Bairro Jardim do Sol', 'bairro'], ['Condomínios', 'bairro'],
  ['Universitários', 'prof'], ['Saúde', 'prof'], ['Educação', 'prof'], ['Comércio local', 'prof'],
  ['Tecnologia', 'prof'],
  ['Parceiros Norte', 'parceiro'], ['Parceiros Sul', 'parceiro'], ['Esportes', 'parceiro'],
  ['Cultura', 'parceiro'], ['Voluntários', 'parceiro']
];

/* [slug, rótulo, família, meta por piloto, fatia dos pilotos, produtividade, taxa de lançamento,
    expectativa média de quem lança, taxa de meta batida, taxa de piloto em zero] */
const TIMES_DEF = [
  ['P20_CENTRO', 'Plano 20 Centro', 'p20', 20, 0.140, 0.004, 0.02, 1.5, 0.00, 0.99],
  ['P40_CENTRO', 'Plano 40 Centro', 'p40', 40, 0.440, 1.000, 0.61, 10.5, 0.05, 0.82],
  ['P20_LITORAL', 'Plano 20 Litoral', 'p20', 20, 0.010, 0.000, 0.00, 0.0, 0.00, 1.00],
  ['P40_LITORAL', 'Plano 40 Litoral', 'p40', 40, 0.050, 0.700, 0.55, 11.0, 0.06, 0.80],
  ['P20_SERRA', 'Plano 20 Serra', 'p20', 20, 0.035, 0.010, 0.03, 2.0, 0.00, 0.97],
  ['P40_SERRA', 'Plano 40 Serra', 'p40', 40, 0.070, 0.900, 0.08, 12.0, 0.07, 0.74],
  ['COMUNIDADE_A', 'Comunidade A', 'com', 40, 0.030, 2.300, 0.95, 36.0, 0.30, 0.34],
  ['COMUNIDADE_B', 'Comunidade B', 'com', 40, 0.015, 1.100, 0.92, 40.0, 0.08, 0.40],
  ['EMBAIXADOR_100', 'Embaixador 100', 'emb', 100, 0.015, 3.600, 0.80, 40.0, 0.16, 0.50],
  ['EMBAIXADOR_MAIS_100', 'Embaixador +100', 'emb', 100, 0.008, 2.400, 1.00, 46.0, 0.10, 0.62],
  ['EMBAIXADOR_MAIS_200', 'Embaixador +200', 'emb', 200, 0.007, 9.000, 1.00, 60.0, 0.30, 0.38],
  ['SEM_TIME', 'Sem time', 'sem', 40, 0.180, 0.420, 0.09, 17.0, 0.14, 0.93]
];

/* [cidade, fatia dos passageiros, fatia dos pilotos] */
const CIDADES = [
  ['Lagoa Serena', 0.886, 0.79], ['Porto Alvorada', 0.071, 0.12], ['Serra Clara', 0.024, 0.036],
  ['Lumiara', 0.009, 0.007], ['Lago Dourado', 0.006, 0.012], ['Monte Verdejante', 0.004, 0.011],
  ['Brisa do Norte', 0, 0.007], ['Recanto das Palmas', 0, 0.008], ['Campos do Ipê', 0, 0.006],
  ['Vila Esperança', 0, 0.003]
];
const REGIOES = [['Sul', 0.36, 0.045], ['Oeste', 0.22, 0.03], ['Norte', 0.19, 0.012], ['Leste', 0.14, 0.024],
  ['Centro', 0.09, 0.027], ['Sudeste', 0, 0.003]];

/* ------------------------------------------------------------ controladores */
const COM_PILOTO = 48, EM_ZERO_SEM_PILOTO = 25, SEM_CADASTRO = 6;
const nomes = new Set();
while (nomes.size < COM_PILOTO) nomes.add(NOMES[entre(0, NOMES.length - 1)] + ' ' + INICIAIS[entre(0, INICIAIS.length - 1)] + '.');

const comCadastro = COM_PILOTO - SEM_CADASTRO;
const pesos = Array.from({ length: comCadastro }, (_, i) => (0.7 + 0.6 * rnd()) / Math.pow(i + 1, 0.9));
pesos.sort((a, b) => b - a);
const cadastros = reparte(9180, pesos);

const equipesNomeadas = EQUIPES_DEF.slice(1);
const controladores = embaralha([...nomes]).map((nome, i) => {
  const cadastrou = i < comCadastro ? cadastros[i] : 0;
  const pilotos = cadastrou > 0 ? Math.max(1, Math.round(cadastrou / (3 + 5 * rnd()))) : entre(1, 9);
  return { nome, cadastrou, pilotos, equipe: null };
});
/* o maior e mais 11 ficam sem equipe (o maior bloco da base); cada equipe nomeada recebe ao menos um */
controladores[0].equipe = '(sem equipe)';
embaralha(controladores.slice(1).map((_, i) => i + 1)).forEach((idx, k) => {
  controladores[idx].equipe = k < 11 ? '(sem equipe)'
    : k < 11 + equipesNomeadas.length ? equipesNomeadas[k - 11][0]
    : equipesNomeadas[entre(0, equipesNomeadas.length - 1)][0];
});
controladores.sort((a, b) => b.cadastrou - a.cadastrou);

/* ------------------------------------------------------------ equipes = soma dos controladores */
const famDe = Object.fromEntries(EQUIPES_DEF);
const porEquipe = {};
controladores.forEach(c => {
  const e = porEquipe[c.equipe] || (porEquipe[c.equipe] = { nome: c.equipe, n: 0, pilotos: 0, fam: famDe[c.equipe] });
  e.n += c.cadastrou; e.pilotos += c.pilotos;
});
const equipes = Object.values(porEquipe).sort((a, b) => b.n - a.n);

/* ------------------------------------------------------------ totais */
const PASSAGEIROS_SEM_CONTROLADOR = 142, PILOTOS_SEM_CONTROLADOR = 96;
const somaEquipes = soma(equipes.map(e => e.n));
const contab = somaEquipes + PASSAGEIROS_SEM_CONTROLADOR;
const pilotosNoAr = soma(controladores.map(c => c.pilotos)) + PILOTOS_SEM_CONTROLADOR;

const P_PILOTOS = Math.round(contab * 0.061), P_CONTROLADORES = Math.round(contab * 0.0049);
const P_ASPIRANTES = Math.round(contab * 0.0233);
const P_MEMBROS = contab - P_PILOTOS - P_CONTROLADORES - P_ASPIRANTES;

/* ------------------------------------------------------------ times: somam o balão */
const pilTimes = reparte(pilotosNoAr, TIMES_DEF.map(t => t[4]));
const nTimes = reparte(contab, TIMES_DEF.map((t, i) => pilTimes[i] * t[5]));
const times = TIMES_DEF.map((t, i) => {
  const pil = pilTimes[i];
  const lanc = Math.min(pil, Math.round(pil * t[6]));
  return {
    t: t[0], pil, proj: pil * t[3], ex: Math.round(lanc * t[7]), n: nTimes[i], lanc,
    bat: Math.min(lanc, Math.round(lanc * t[8])), zer: Math.min(pil, Math.round(pil * t[9]))
  };
});
const meta = soma(times.map(t => t.ex));
const projetada = soma(times.map(t => t.proj));
const pilotosComLinha = soma(times.map(t => t.lanc));
const planoBateramBruto = soma(times.map(t => t.bat));

/* planos pela META do piloto: 40, 20 e o resto */
const grupo = m => m === 40 ? 0 : m === 20 ? 2 : 1;
const pilPlano = [0, 0, 0], nPlanoBruto = [0, 0, 0];
TIMES_DEF.forEach((t, i) => { pilPlano[grupo(t[3])] += times[i].pil; nPlanoBruto[grupo(t[3])] += times[i].n; });
const nPlano = reparte(contab - P_PILOTOS - P_CONTROLADORES, nPlanoBruto);
const dimPlano = [
  { name: 'Plano 40 - meta 40', n: nPlano[0], pilotos: pilPlano[0], fam: 'bairro' },
  { name: 'Outros planos', n: nPlano[1], pilotos: pilPlano[1], fam: 'parceiro' },
  { name: 'Plano 20 - meta 20', n: nPlano[2], pilotos: pilPlano[2], fam: 'prof' }
];

const nCidades = reparte(contab - 34, CIDADES.map(c => c[1]));
const pCidades = reparte(pilotosNoAr, CIDADES.map(c => c[2]));
const dimCidade = CIDADES.map((c, i) => ({ name: c[0], n: nCidades[i], pilotos: pCidades[i] }))
  .sort((a, b) => b.n - a.n || b.pilotos - a.pilotos)
  .map((d, i) => ({ ...d, fam: i === 0 ? 'bairro' : d.n > 0 ? 'prof' : 'sem' }));

const nRegioes = reparte(Math.round(contab * 0.071), REGIOES.map(r => r[1]));
const dimRegiao = REGIOES.map((r, i) => ({
  name: r[0], n: nRegioes[i], pilotos: Math.round(pilotosNoAr * r[2]),
  fam: nRegioes[i] === 0 ? 'sem' : i === 0 ? 'bairro' : i === 1 ? 'parceiro' : 'prof'
}));

const pilotosLancaram = Math.round(pilotosComLinha * 0.41);
const N_ASPIRANTES = entre(2000, 2200), aspiranteConvertido = entre(1650, 1780);
const N_MEMBROS = P_MEMBROS + 27, N_PILOTOS = pilotosNoAr + 41;
const CTRL_TOTAL = COM_PILOTO + EM_ZERO_SEM_PILOTO;
const p20Bateram = soma(TIMES_DEF.map((t, i) => t[2] === 'p20' ? times[i].bat : 0));

const painel = {
  meta,
  temos: contab,
  projetada,
  pilotosNoAr,
  pessoas: N_MEMBROS + N_PILOTOS + N_ASPIRANTES + CTRL_TOTAL,
  membroLinhas: contab + 27,
  confirmouSim: 3,
  confirmouOutro: 0,
  tagP40: Math.round(pilPlano[0] * 0.58),
  tagP20: Math.round(pilPlano[2] * 1.6),
  p20Bateram,
  contabilizados: contab,
  pilotosLancaram,
  pilotosComLinha,
  pilotosQueBateram: Math.round(pilotosLancaram * 0.13),
  duplicadas: P_PILOTOS + P_ASPIRANTES + P_CONTROLADORES + entre(150, 220),
  semTelefone: 88,
  planoBateramBruto,
  planoBateramLimpo: planoBateramBruto - entre(Math.round(planoBateramBruto * 0.25), Math.round(planoBateramBruto * 0.35)),
  pilotoProprioPlano: entre(15, 24),
  semConfirmacao: contab - 3,
  confirmaram: 3,
  aspiranteTotal: N_ASPIRANTES + aspiranteConvertido,
  aspiranteConvertido,
  aspiranteMesclado: entre(30, 45),
  transferencias: entre(280, 340),
  contasTeste: 3
};

/* ------------------------------------------------------------ cadastros por dia */
const DIAS = 31, INICIO = Date.UTC(2025, 4, 1);
const captacao = [];
for (let d = 0; d < DIAS; d++) {
  const data = new Date(INICIO + d * 86400000);
  const semana = data.getUTCDay();
  const tendencia = 95 + (d / (DIAS - 1)) * 230;
  const fimDeSemana = semana === 6 ? 0.7 : semana === 0 ? 0.55 : 1;
  const mutirao = (d === 9 || d === 23) ? 2.1 : 1;
  let v = Math.round(tendencia * fimDeSemana * mutirao * (0.78 + 0.44 * rnd()));
  if (d === DIAS - 1) v = Math.round(v * 0.4);
  captacao.push([data.toISOString().slice(0, 10), v]);
}

/* ------------------------------------------------------------ bloco JS */
const J = v => JSON.stringify(v);
const linhas = (arr, fmt) => arr.map(fmt).join(',\n');
const bloco = `/* DADOS:INICIO — gerado por scripts/gerar-dados.mjs (semente ${SEMENTE}). Dados fictícios; não editar à mão. */
const N_MEMBROS = ${N_MEMBROS};
const N_PILOTOS = ${N_PILOTOS};
const N_ASPIRANTES = ${N_ASPIRANTES};
const N_CONTROLADORES = ${CTRL_TOTAL};
const P_MEMBROS = ${P_MEMBROS};
const P_PILOTOS = ${P_PILOTOS};
const P_ASPIRANTES = ${P_ASPIRANTES};
const P_CONTROLADORES = ${P_CONTROLADORES};

const PAINEL = {
${Object.entries(painel).map(([k, v]) => '  ' + k + ': ' + J(v) + ',').join('\n')}
  fontes: [
    {nome:"Membros",       n:N_MEMBROS,       sub:"sem outro papel na base",  icone:"users"},
    {nome:"Pilotos",       n:N_PILOTOS,       sub:"embaixadores do clube",    icone:"pin"},
    {nome:"Aspirantes",    n:N_ASPIRANTES,    sub:"ainda não viraram piloto", icone:"form"},
    {nome:"Controladores", n:N_CONTROLADORES, sub:"coordenam os pilotos",     icone:"trend"}
  ],
  passageiros: [
    {nome:"Membros",       n:P_MEMBROS,       sub:"só passageiro",         icone:"users"},
    {nome:"Pilotos",       n:P_PILOTOS,       sub:"também é piloto",       icone:"pin"},
    {nome:"Aspirantes",    n:P_ASPIRANTES,    sub:"ainda aspirante",       icone:"form"},
    {nome:"Controladores", n:P_CONTROLADORES, sub:"também é controlador",  icone:"trend"}
  ]
};
PAINEL.faltam = Math.max(PAINEL.meta - PAINEL.temos, 0);

const EQUIPES = [
${linhas(equipes, e => '  ' + J(e))}
];

const TIMES = [
${linhas(times, t => '  ' + J(t))}
];
const TIME_INFO = [
${linhas(TIMES_DEF, t => '  ' + J([t[0], t[1], t[2]]))}
];

const CONTROLADORES = [
${linhas(controladores, c => '  ' + J([c.nome, c.equipe, c.pilotos, c.cadastrou]))}
];
const CTRL_ZERO_SEM_PILOTO = ${EM_ZERO_SEM_PILOTO};
const CTRL_TOTAL = CONTROLADORES.length + CTRL_ZERO_SEM_PILOTO;

const CAPTACAO = [
${linhas(captacao, d => '  ' + J(d))}
];
const LIDO_AS = "31/05/2025 17:40";

const DIM_CIDADE = [
${linhas(dimCidade, d => '  ' + J(d))}
];
const DIM_PLANO = [
${linhas(dimPlano, d => '  ' + J(d))}
];
const DIM_REGIAO = [
${linhas(dimRegiao, d => '  ' + J(d))}
];
/* DADOS:FIM */`;

/* ------------------------------------------------------------ provas antes de gravar */
const falhas = [];
const confere = (ok, msg) => { if (!ok) falhas.push(msg); };
confere(P_MEMBROS + P_PILOTOS + P_ASPIRANTES + P_CONTROLADORES === contab, 'caixa de fontes não soma o balão');
confere(painel.semConfirmacao + painel.confirmaram === contab, 'confirmação não soma o balão');
confere(soma(times.map(t => t.n)) === contab, 'times não somam os contabilizados');
confere(soma(times.map(t => t.pil)) === pilotosNoAr, 'times não somam os pilotos');
confere(soma(dimPlano.map(d => d.pilotos)) === pilotosNoAr, 'planos não somam os pilotos');
confere(soma(dimPlano.map(d => d.n)) === contab - P_PILOTOS - P_CONTROLADORES, 'planos não somam os passageiros sem a equipe');
confere(soma(controladores.map(c => c.cadastrou)) === somaEquipes, 'equipes não somam os controladores');
confere(times.every(t => t.lanc <= t.pil && t.zer <= t.pil && t.bat <= t.lanc), 'time com parte maior que o todo');
confere(meta > contab, 'a expectativa real precisa ficar acima dos contabilizados para a pista ter o que correr');
if (falhas.length) { console.error('Não gravado:\n  - ' + falhas.join('\n  - ')); process.exit(1); }

const html = fs.readFileSync(ARQUIVO, 'utf8');
const ini = html.indexOf('/* DADOS:INICIO'), fim = html.indexOf('/* DADOS:FIM */');
if (ini < 0 || fim < 0) { console.error('Marcadores DADOS:INICIO / DADOS:FIM não encontrados em index.html'); process.exit(1); }
fs.writeFileSync(ARQUIVO, html.slice(0, ini) + bloco + html.slice(fim + '/* DADOS:FIM */'.length));
console.log('Dados fictícios gravados (semente ' + SEMENTE + '): ' + contab + ' contabilizados, meta ' + meta +
  ', ' + pilotosNoAr + ' pilotos, ' + controladores.length + ' controladores com piloto, ' + equipes.length +
  ' equipes, ' + times.length + ' times, ' + DIAS + ' dias.');
