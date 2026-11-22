/* ===== Núcleo: estado, utilidades, roteador, PDF ===== */
const CHAVE = 'appTreino.v2';
const V = {}, ACT = {};
let S;

function estadoPadrao() {
  return {
    v: 2, novo: true, perfil: { nome: '', foto: '' },
    crono: { karate: {}, natacao: {}, musculacao: {}, yoga: {} },
    dias: {}, kumite: {},
    km: null, kmConcl: [], kp: null, kpConcl: [],
    katasEdit: {}, katasExtra: [], links: {}, pendentes: [],
    natacao: { caderno: [], marcos: {} }, musculosExtra: [], backup: null,
  };
}
function carregar() {
  try { const t = localStorage.getItem(CHAVE); S = t ? JSON.parse(t) : null; } catch (e) { S = null; }
  if (!S) S = estadoPadrao();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { toast('⚠️ Não foi possível salvar. Faça um backup.'); } }

/* ---- datas ---- */
const z2 = n => String(n).padStart(2, '0');
function iso(d) { return `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`; }
function hoje() { return iso(new Date()); }
function dt(s) { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); }
function soma(s, n) { const d = dt(s); d.setDate(d.getDate() + n); return iso(d); }
function semana(s) { const d = dt(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
const mes = s => s.slice(0, 7);
function fimMes(m) { const d = dt(m + '-01'); d.setMonth(d.getMonth() + 1); d.setDate(0); return iso(d); }
function somaMes(m, n) { const d = dt(m + '-01'); d.setMonth(d.getMonth() + n); return iso(d).slice(0, 7); }
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_L = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const SEMANA_SEG = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const diaSem = s => dt(s).getDay();
const idxSeg = s => (diaSem(s) + 6) % 7;
function fmtData(s) { const d = dt(s); return `${DIAS[d.getDay()]} ${z2(d.getDate())}/${z2(d.getMonth() + 1)}`; }
function fmtLonga(s) { const d = dt(s); return `${z2(d.getDate())}/${z2(d.getMonth() + 1)}/${d.getFullYear()} · ${DIAS_L[d.getDay()]}`; }
function nomeMes(m) { return MESES[Number(m.slice(5)) - 1] + ' de ' + m.slice(0, 4); }
function D(data = hoje()) { return S.dias[data] || (S.dias[data] = {}); }

/* ---- html ---- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n, d = 0) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: d });
function chk(on, act, arg, label, sub = '') {
  return `<button class="chk ${on ? 'on' : ''}" data-act="${act}" data-arg="${esc(arg)}"><span class="box">${on ? '✓' : ''}</span><span class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
}
function contador(valor, max, act, arg) {
  return `<div class="cont"><button data-act="${act}" data-arg="${esc(arg)}|-1" aria-label="menos">−</button><b>${valor}/${max}</b><button data-act="${act}" data-arg="${esc(arg)}|1" aria-label="mais">+</button></div>`;
}
const corNivel = p => p < 25 ? '#c62828' : p < 50 ? '#e8711a' : p < 75 ? '#d9a400' : '#2e8b3e';
function barra(p) { p = Math.max(0, Math.min(100, p)); return `<div class="barra"><i style="width:${p}%;background:${corNivel(p)}"></i></div>`; }
function topo(titulo, kanji = '', voltar = '#/') {
  return `<header class="topo"><a class="voltar" href="${voltar}" aria-label="Voltar">‹</a><h1>${titulo}${kanji ? ` <span class="kj">${kanji}</span>` : ''}</h1>${avatar('mini')}</header>`;
}
function avatar(cls = '') {
  const p = S.perfil;
  return `<a href="#/perfil" class="avatar ${cls}" aria-label="Perfil">${p.foto ? `<img src="${p.foto}" alt="">` : `<span>${esc((p.nome || '?').trim()[0] || '?').toUpperCase()}</span>`}</a>`;
}
/* página com arte de fundo + janela de washi */
function janela(arte, titulo, kanji, voltar, corpo) {
  return `<div class="fundo-arte" style="background-image:url(img/${arte})"></div><div class="pg-janela">${topo(titulo, kanji, voltar)}<div class="conteudo">${corpo}</div></div>`;
}
/* menu: arte com placas clicáveis */
function menuArte(arte, w, h, placas, voltar, titulo) {
  return `<div class="menu-arte"><a class="voltar flut" href="${voltar}" aria-label="Voltar">‹</a>${avatar('flut dir')}
   <div class="arte-wrap" style="aspect-ratio:${w}/${h}"><img src="img/${arte}" alt="${esc(titulo)}">
   ${placas.map(([href, x, y, pw, ph, nome]) => `<a class="hot" href="${href}" aria-label="${esc(nome)}" style="left:${x}%;top:${y}%;width:${pw}%;height:${ph}%"></a>`).join('')}</div></div>`;
}
function linksBloco(chave, max, titulo = 'Vídeos') {
  const L = S.links[chave] || [];
  let h = `<div class="links"><b>▶ ${titulo}</b>`;
  for (let i = 0; i < max; i++) {
    const u = L[i];
    h += u ? `<div class="link-l"><a class="btn yt" href="${esc(u)}" target="_blank" rel="noopener">▶ Vídeo ${i + 1}</a><button class="lnk" data-act="linkEdit" data-arg="${esc(chave)}|${i}">editar</button><button class="lnk" data-act="linkDel" data-arg="${esc(chave)}|${i}">apagar</button></div>`
           : `<button class="lnk add" data-act="linkEdit" data-arg="${esc(chave)}|${i}">+ adicionar link ${i + 1}</button>`;
  }
  return h + '</div>';
}
ACT.linkEdit = a => {
  const i = a.lastIndexOf('|'), k = a.slice(0, i), n = +a.slice(i + 1);
  const L = S.links[k] || (S.links[k] = []);
  const v = prompt('Cole o link do YouTube:', L[n] || ''); if (v === null) return;
  const u = v.trim(); if (u && !/^https?:\/\//i.test(u)) return toast('O link precisa começar com https://');
  L[n] = u; salvar(); rerender();
};
ACT.linkDel = a => { const i = a.lastIndexOf('|'), k = a.slice(0, i), n = +a.slice(i + 1); if (!confirm('Apagar este link?')) return; S.links[k][n] = ''; salvar(); rerender(); };

function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600); }
function modal(html) { const m = document.getElementById('modal'); m.innerHTML = `<div class="modal-box">${html}<button class="btn sec" data-act="fecharModal">Fechar</button></div>`; m.classList.add('show'); }
ACT.fecharModal = () => document.getElementById('modal').classList.remove('show');
function beep(n = 3) {
  try { const c = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < n; i++) { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; o.connect(g); g.connect(c.destination); const t = c.currentTime + i * .35; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.start(t); o.stop(t + .3); }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
}

/* ---- roteador ---- */
function render() {
  const r = location.hash.replace(/^#\/?/, '') || 'inicio';
  const partes = r.split('/');
  let fn = null, args = [];
  for (let i = partes.length; i > 0; i--) { const k = partes.slice(0, i).join('/'); if (V[k]) { fn = V[k]; args = partes.slice(i); break; } }
  if (S.novo && partes[0] !== 'perfil') fn = V.boasvindas;
  document.getElementById('modal').classList.remove('show');
  const app = document.getElementById('app');
  app.className = 'pg-' + partes[0];
  app.innerHTML = (fn || V.inicio)(...args);
  if (!render.mesma) window.scrollTo(0, 0);
  render.mesma = false;
}
function rerender() { render.mesma = true; const y = window.scrollY; render(); window.scrollTo(0, y); }
document.addEventListener('click', ev => { const el = ev.target.closest('[data-act]'); if (!el) return; const f = ACT[el.dataset.act]; if (f) { ev.preventDefault(); f(el.dataset.arg, el, ev); } });
document.addEventListener('change', ev => { const el = ev.target.closest('[data-chg]'); if (!el) return; const f = ACT[el.dataset.chg]; if (f) f(el.dataset.arg, el, ev); });
window.addEventListener('hashchange', render);

/* ---- PDF simples (texto) com dados escondidos ---- */
function latin1(s) { return s.replace(/[^\x00-\xff]/g, c => ({ '·': '\xb7', '–': '-', '—': '-', '‹': '<', '›': '>', '✓': 'x' }[c] || '?')); }
function pdfTexto(linhas, dados) {
  const pe = t => latin1(t).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  let y = 800, st = 'BT\n';
  linhas.forEach(([txt, tam = 11, cor = '0 0 0']) => {
    if (y < 50) return; st += `/F1 ${tam} Tf ${cor} rg 1 0 0 1 50 ${y} Tm (${pe(txt)}) Tj\n`; y -= tam + 7;
  });
  st += 'ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${st.length} >>\nstream\n${st}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(dados))));
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n%DADOS-APP-TREINO:' + b64 + '\n'; const off = [];
  objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xr = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
  const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return new Blob([bytes], { type: 'application/pdf' });
}
function lerDadosPdf(file, fn) {
  const r = new FileReader();
  r.onload = () => { const m = /%DADOS-APP-TREINO:([A-Za-z0-9+/=]+)/.exec(r.result); if (!m) return toast('Este PDF não tem um cronograma do app');
    try { fn(JSON.parse(decodeURIComponent(escape(atob(m[1]))))); } catch (e) { toast('Não consegui ler o PDF'); } };
  r.readAsBinaryString(file);
}
async function entregar(blob, nome, compartilhar) {
  const f = new File([blob], nome, { type: blob.type });
  if (compartilhar && navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: nome }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  if (compartilhar) toast('PDF baixado. Envie pelo WhatsApp.');
}
