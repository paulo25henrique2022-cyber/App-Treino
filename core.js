/* ===== Núcleo: estado, utilidades, roteador ===== */
const CHAVE = 'appTreino.v1';
const V = {};            // views: V['karate/treino'] = () => html
const ACT = {};          // ações: ACT.nome = (el, ev) => {}
let S;                   // estado

function estadoPadrao() {
  const treinos = () => [
    { tipo: 'karate', dias: [1, 3, 5], ini: '17:00', fim: '19:00' },
    { tipo: 'natacao', dias: [2, 4], ini: '11:00', fim: '12:00' },
    { tipo: 'musculacao', dias: [], ini: '09:00', fim: '10:00' },
    { tipo: 'sabado', dias: [6], ini: '10:00', fim: '11:00' },
  ];
  const perfil = (nome, sexo, idade, peso, altura, objetivo, restr) => ({
    nome, sexo, idade, peso, altura, objetivo, restricoes: restr, acordar: '08:00', dormir: '00:00',
    treinos: treinos(), ajusteKcal: 0, pesagens: [], override: {}, dias: {}, kumite: {}, prova: {},
    kataSem: null, dominio: null, exsElastico: Array(10).fill(''), natacao: { caderno: [], marcos: {} },
  });
  return {
    v: 1, ativo: 'ele', criado: hoje(),
    perfis: {
      ele: perfil('Ele', 'M', 30, 73, 175, 'recomp', 'Sem cebola. Histórico de diabetes na família.'),
      ela: perfil('Ela', 'F', 28, 76, 175, 'perder', ''),
    },
    katasEdit: {}, katasExtra: [], pendentes: [],
    cardapio: {}, favoritas: [], receitasMinhas: [], alimentosEdit: {},
    compras: { mensal: {}, semanal: {}, precos: {} },
    backup: null,
  };
}
function carregar() {
  try { const t = localStorage.getItem(CHAVE); S = t ? JSON.parse(t) : null; } catch (e) { S = null; }
  if (!S) { S = estadoPadrao(); S.novo = true; }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(S)); }
  catch (e) { toast('⚠️ Não foi possível salvar neste navegador. Faça um backup.'); }
}
const P = () => S.perfis[S.ativo];
const outro = () => S.ativo === 'ele' ? 'ela' : 'ele';

/* ---- datas ---- */
function iso(d) { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
function hoje() { return iso(new Date()); }
function dt(s) { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); }
function soma(s, n) { const d = dt(s); d.setDate(d.getDate() + n); return iso(d); }
function semana(s) { const d = dt(s); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return iso(d); } // segunda
function mes(s) { return s.slice(0, 7); }
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_L = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
function fmtData(s) { const d = dt(s); return `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`; }
function diaSem(s) { return dt(s).getDay(); }
function hm(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function th(n) { n = ((n % 1440) + 1440) % 1440; return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); }

/* ---- registros do dia ---- */
function D(data = hoje(), p = P()) { return p.dias[data] || (p.dias[data] = {}); }
const NOMES_TREINO = { karate: 'Karatê', natacao: 'Natação', musculacao: 'Musculação', sabado: 'Musculação (sábado)', yoga: 'Yoga' };
function treinosDoDia(data, p = P()) {
  const o = p.override[data];
  if (o && o.treinos) return o.treinos;
  const w = diaSem(data);
  return p.treinos.filter(t => t.dias.includes(w)).map(t => ({ tipo: t.tipo, ini: t.ini, fim: t.fim }));
}
function acordarDoDia(data, p = P()) { return (p.override[data] && p.override[data].acordar) || p.acordar; }

/* ---- html ---- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = n => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf = (n, d = 0) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: d });
function chk(on, act, arg, label, sub = '') {
  return `<button class="chk ${on ? 'on' : ''}" data-act="${act}" data-arg="${esc(arg)}"><span class="box">${on ? '✓' : ''}</span><span class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
}
function abas(base, itens, atual) {
  return `<nav class="abas">${itens.map(([k, n]) => `<a href="#/${base}/${k}" class="${k === atual ? 'on' : ''}">${n}</a>`).join('')}</nav>`;
}
function topo(titulo, voltar = '#/') {
  return `<header class="topo"><a class="voltar" href="${voltar}">‹</a><h1>${titulo}</h1><button class="perfil-btn" data-act="trocarPerfil">👤 ${esc(P().nome)}</button></header>`;
}
function contador(valor, max, act, arg) {
  return `<div class="cont"><button data-act="${act}" data-arg="${arg}|-1">−</button><b>${valor}/${max}</b><button data-act="${act}" data-arg="${arg}|1">+</button></div>`;
}
function barra(p) { return `<div class="barra"><i style="width:${Math.max(0, Math.min(100, p))}%"></i></div>`; }
function toast(t) {
  const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}
function beep(n = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.35; g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t); o.stop(t + 0.3);
    }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch (e) {}
}

/* ---- roteador ---- */
let rotaAtual = '';
function render() {
  const r = (location.hash.replace(/^#\/?/, '') || 'inicio');
  rotaAtual = r;
  const [base, sub, arg] = r.split('/');
  let fn = V[base + '/' + (sub || '')] || V[base];
  if (!fn) fn = V.inicio;
  const app = document.getElementById('app');
  app.className = 'pg-' + base;
  app.innerHTML = fn(sub, arg);
  if (!render.mesma) window.scrollTo(0, 0);
  render.mesma = false;
}
function rerender() { render.mesma = true; const y = window.scrollY; render(); window.scrollTo(0, y); }
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const f = ACT[el.dataset.act];
  if (f) { ev.preventDefault(); f(el.dataset.arg, el, ev); }
});
document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-chg]');
  if (!el) return;
  const f = ACT[el.dataset.chg];
  if (f) f(el.dataset.arg, el, ev);
});
window.addEventListener('hashchange', render);

ACT.trocarPerfil = () => { S.ativo = outro(); salvar(); toast('Perfil: ' + P().nome); rerender(); };
