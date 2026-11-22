/* ===== Mapa muscular ===== */
const MUS = Object.fromEntries(DATA.musculos.map(m => [m.id, m]));
const VISTAS = { frente: [85, 0, 445, 1024], costas: [555, 0, 445, 1024], lado: [1085, 0, 290, 1024] };
const COR = { 1: '#ff2a2a', 2: '#ff9a1f', 3: '#4da3ff' };
function vistaDe(ids) { const m = ids.map(i => MUS[i]).find(Boolean); return m ? (m.vista === 'lado' ? 'lado' : m.vista) : 'frente'; }
function mapa(ids, { vista, todos = false, clic = false } = {}) {
  vista = vista || vistaDe(ids);
  const vb = VISTAS[vista];
  const lista = todos ? DATA.musculos.map(m => m.id) : ids;
  const els = lista.map(id => {
    const m = MUS[id]; if (!m) return '';
    const cor = todos ? COR[m.prioridade] : '#ff2a2a';
    return m.area.map(([cx, cy, rx, ry]) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor}" fill-opacity="${todos ? .45 : .6}" stroke="${cor}" stroke-width="4" ${m.profundo ? 'stroke-dasharray="10 8"' : ''} ${clic ? `data-act="musInfo" data-arg="${id}" style="cursor:pointer"` : ''} class="${todos ? '' : 'pulsa'}"/>`).join('');
  }).join('');
  const tabs = Object.keys(VISTAS).map(v => `<button class="${v === vista ? 'on' : ''}" data-act="mapaVista" data-arg="${v}">${v}</button>`).join('');
  return `<div class="mapa"><div class="mapa-tabs">${tabs}</div><svg viewBox="${vb.join(' ')}"><image href="img/mapa.jpg" x="0" y="0" width="1536" height="1024"/>${els}</svg></div>`;
}
function nomesMus(ids) {
  return ids.map(i => MUS[i]).filter(Boolean).map(m => `<span class="tag p${m.prioridade}">${m.nome}${m.profundo ? ' · profundo' : ''}<small>${m.tecnico}</small></span>`).join('');
}
let mapaVistaForcada = null;
ACT.mapaVista = (v, el) => { const m = el.closest('.mapa'); m.querySelector('svg').setAttribute('viewBox', VISTAS[v].join(' ')); m.querySelectorAll('.mapa-tabs button').forEach(b => b.classList.toggle('on', b.dataset.arg === v)); };
ACT.musInfo = id => {
  const m = MUS[id];
  modal(`<h3>${m.nome}</h3><p class="tec">${m.tecnico}${m.profundo ? ' · <b>músculo profundo</b>: fica sob outros músculos; o mapa mostra a região' : ''}</p>
  <p><b>Prioridade no karatê:</b> ${['', '🔴 essencial', '🟠 importante', '⚪ geral'][m.prioridade]}</p>
  <p><b>Função no karatê:</b> ${m.funcao_karate}</p><p><b>Como treinar sem encurtar:</b> ${m.como_treinar}</p>`);
};
function modal(html) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-box">${html}<button class="btn" data-act="fecharModal">Fechar</button></div>`;
  m.classList.add('show');
}
ACT.fecharModal = () => document.getElementById('modal').classList.remove('show');

/* ===== Tela inicial ===== */
const CARDS = [
  ['karate', 'Karatê', 7.3, 23.8, 41, 14], ['natacao', 'Natação', 51.6, 23.8, 41, 14],
  ['musculacao', 'Musculação', 7.3, 40, 41, 14], ['yoga', 'Yoga', 51.6, 40, 41, 14],
  ['alimentacao', 'Alimentação', 22.7, 56, 54.6, 14.4],
];
V.inicio = () => {
  if (S.novo) return V.boasvindas();
  const avisos = [];
  const h = new Date().getHours();
  if (!S.backup || hoje() > soma(S.backup, 7)) avisos.push(`<a href="#/config" class="aviso">💾 Faça o backup semanal dos seus dados</a>`);
  const pes = P().pesagens; if (!pes.length || hoje() >= soma(pes[pes.length - 1].data, 14)) avisos.push(`<a href="#/alimentacao/progresso" class="aviso">⚖️ Hora de registrar o peso (a cada 2 semanas)</a>`);
  const y = yogaSemana(); if (h >= 20 && y < 3 && !D().yoga) avisos.push(`<a href="#/yoga" class="aviso">🧘 Yoga da semana: ${y}/3 — que tal hoje antes de dormir?</a>`);
  if (h >= 20 && !D().chaNoite) avisos.push(`<a href="#/yoga" class="aviso">🍵 Chá antes de dormir</a>`);
  if (h < 12 && !D().chaManha) avisos.push(`<a href="#/yoga" class="aviso">🍵 Chá ao acordar</a>`);
  const tr = treinosDoDia(hoje()).map(t => NOMES_TREINO[t.tipo] + ' ' + t.ini).join(' · ') || 'Descanso';
  return `<div class="inicio">
   <div class="arte-wrap"><img src="img/inicial.jpg" class="arte" alt="">
   <button class="perfil-btn flut" data-act="trocarPerfil">👤 ${esc(P().nome)}</button>
   <a href="#/config" class="cfg-btn flut">⚙️</a>
   ${CARDS.map(([r, n, x, y, w, hh]) => `<a href="#/${r}" class="hot" style="left:${x}%;top:${y}%;width:${w}%;height:${hh}%"><span>${n}</span></a>`).join('')}</div>
   <div class="hoje-box"><b>Hoje · ${fmtData(hoje())}</b><br>${tr}
   ${avisos.join('')}<a href="#/compras" class="aviso verde">🛒 Supermercado</a></div>
  </div>`;
};
V.boasvindas = () => `<div class="pagina"><h1>Bem-vindo ao seu App de Treino</h1>
 <p>Os dados ficam guardados <b>só neste celular</b>. Quem é você neste aparelho?</p>
 <button class="btn grande" data-act="primeiro" data-arg="ele">Sou ele</button>
 <button class="btn grande" data-act="primeiro" data-arg="ela">Sou ela</button>
 <p class="peq">Depois confira seus dados em ⚙️ Configurações. Tem um backup? Importe por lá.</p></div>`;
ACT.primeiro = q => { S.ativo = q; delete S.novo; salvar(); location.hash = '#/config'; render(); };

/* ===== KARATÊ ===== */
const KAR_ABAS = [['treino', 'Treino'], ['kata', 'Kata semanal'], ['dominio', 'Domínio'], ['kumite', 'Kumite'], ['dicionario', 'Dicionário'], ['prova', 'Prova mensal'], ['along', 'Alongamentos']];
function katas() {
  const base = DATA.katas.map(k => ({ ...k, movimentos: S.katasEdit[k.nome] ?? k.movimentos }));
  return base.concat(S.katasExtra);
}
const kataPorNome = n => katas().find(k => k.nome === n);
function kpag(sub, corpo) { return `<div class="karate">${topo('Karatê')}<div class="kar-cab"></div><div class="madeira">${abas('karate', KAR_ABAS, sub)}${corpo}</div></div>`; }
V.karate = (sub = 'treino') => kpag(sub, (KV[sub] || KV.treino)());
const KV = {};

/* -- treino do dia -- */
KV.treino = () => {
  const d = D(), p = P();
  const ehDia = treinosDoDia(hoje()).some(t => t.tipo === 'karate');
  const ks = p.kataSem, dm = p.dominio, meta = dm ? metaDominio(dm) : null;
  const k = semanaKumite();
  return `<section class="card"><h2>${fmtData(hoje())} ${ehDia ? '· dia de karatê 🥋' : '· (hoje não é dia de karatê)'}</h2>
  ${chk(d.alA, 'kTog', 'alA', '1. Alongamento antes (dinâmico)', '<a href="#/karate/along">ver os 9 movimentos</a>')}
  <div class="item"><b>2. Kata semanal${ks ? ': ' + esc(ks.kata) : ''}</b>${ks ? contador(d.kata || 0, 10, 'kKata', 'x') : ' — <a href="#/karate/kata">escolher o kata</a>'}</div>
  <div class="item"><b>3. Domínio do Kata</b> ${dm ? `${esc(dm.kata)} · meta de hoje: <b>${meta.feitosHoje}/${meta.metaHoje} blocos</b> <a href="#/karate/dominio">abrir</a>` : '<a href="#/karate/dominio">escolher o kata</a>'}</div>
  <div class="item"><b>4. Kumite da semana</b> <a href="#/karate/kumite">${['sanbon', 'kihon', 'jiyu'].map(x => k[x] || 0).join(' · ')} /10 · livre: ${k.lutei ? '✓' : '—'}</a></div>
  ${chk(d.alD, 'kTog', 'alD', '5. Alongamento depois (estático)', '<a href="#/karate/along">13 alongamentos com cronômetro</a>')}
  </section>`;
};
ACT.kTog = c => { const d = D(); d[c] = !d[c]; salvar(); rerender(); };
ACT.kKata = a => { const d = D(); d.kata = Math.max(0, Math.min(10, (d.kata || 0) + Number(a.split('|')[1]))); if (d.kata === 10) toast('10 execuções! Oss!'); salvar(); rerender(); };

/* -- kata semanal -- */
function kataSemStatus(p = P()) {
  const ks = p.kataSem; if (!ks) return null;
  const sem = semana(hoje());
  const dias = Object.entries(p.dias).filter(([dd, v]) => semana(dd) === sem && (v.kata || 0) >= 10).length;
  return { dias: Math.min(3, dias), sem };
}
KV.kata = () => {
  const p = P(), ks = p.kataSem, st = kataSemStatus();
  let h = `<section class="card"><h2>Kata semanal</h2><p>10 execuções por treino (seg, qua, sex). A semana conclui com os 3 dias. O kata fica <b>travado</b> até concluir uma semana completa.</p>`;
  if (ks) {
    h += `<p class="destaque">${esc(ks.kata)} ${kataPorNome(ks.kata)?.kanji || ''}</p><p>Esta semana: <b>${st.dias}/3 dias</b></p>${barra(st.dias / 3 * 100)}
     <p>Semanas concluídas com este kata: ${ks.concluidas.length}</p>`;
    if (st.dias >= 3 && !ks.concluidas.includes(st.sem)) { ks.concluidas.push(st.sem); salvar(); }
    h += ks.concluidas.length ? `<button class="btn" data-act="kataTrocar">Concluído ✓ · escolher outro kata</button>` : `<p class="peq">🔒 Trocar só depois de 1 semana completa.</p>`;
  } else h += selKata('kataEscolher');
  return h + `</section><section class="card"><h3>Lista de katas</h3><p class="peq">Número de movimentos editável (toque para corrigir). ⚠️ = fontes divergem.</p>${listaKatas()}
  <button class="btn sec" data-act="kataNovo">+ Adicionar kata</button></section>`;
};
function selKata(act) { return `<label>Escolha o kata<select data-chg="${act}"><option value="">—</option>${katas().map(k => `<option>${esc(k.nome)}</option>`).join('')}</select></label>`; }
function listaKatas() {
  return `<table class="tab">${katas().map(k => `<tr><td>${esc(k.nome)} <small>${k.kanji || ''}</small>${k.divergencia ? ` <span title="${k.divergencia}">⚠️</span>` : ''}</td><td><button class="lnk" data-act="kataMov" data-arg="${esc(k.nome)}">${k.movimentos ?? '<i>preencher</i>'}</button></td></tr>`).join('')}</table>`;
}
ACT.kataEscolher = (_, el) => { if (!el.value) return; P().kataSem = { kata: el.value, inicio: hoje(), concluidas: [] }; salvar(); rerender(); };
ACT.kataTrocar = () => { P().kataSem = null; salvar(); rerender(); };
ACT.kataMov = n => {
  const k = kataPorNome(n); const v = prompt(`Movimentos de ${n}${k.divergencia ? ' (' + k.divergencia + ')' : ''}:`, k.movimentos ?? '');
  if (v === null) return; const x = parseInt(v); if (!(x > 0)) return toast('Número inválido');
  const ex = S.katasExtra.find(e => e.nome === n); if (ex) ex.movimentos = x; else S.katasEdit[n] = x;
  const dm = P().dominio; if (dm && dm.kata === n) ajustarBlocos(dm, x);
  salvar(); rerender();
};
ACT.kataNovo = () => {
  const n = prompt('Nome do kata:'); if (!n) return;
  const kj = prompt('Kanji (opcional):') || ''; const m = parseInt(prompt('Número de movimentos (pode deixar vazio):'));
  S.katasExtra.push({ nome: n, kanji: kj, movimentos: m > 0 ? m : null, grupo: 'Extra' }); salvar(); rerender();
};

/* -- domínio do kata -- */
function ajustarBlocos(dm, mov) {
  dm.mov = mov; const n = Math.ceil(mov / 2);
  while (dm.blocos.length < n) dm.blocos.push({ reps: 0, ex: Array(10).fill(false), feito: null });
  dm.blocos.length = n;
}
function diasKarateAte(de, ate, p = P()) {
  const dk = (p.treinos.find(t => t.tipo === 'karate') || { dias: [1, 3, 5] }).dias; let n = 0;
  for (let x = de; x <= ate; x = soma(x, 1)) if (dk.includes(diaSem(x))) n++;
  return n;
}
function metaDominio(dm) {
  const prazo = soma(dm.inicio, 30), h = hoje();
  const feitos = dm.blocos.filter(b => b.feito).length, total = dm.blocos.length;
  const feitosHoje = dm.blocos.filter(b => b.feito === h).length;
  const restAntes = total - feitos + feitosHoje;
  const dias = Math.max(1, diasKarateAte(h, prazo));
  return { prazo, feitos, total, feitosHoje, metaHoje: Math.min(restAntes, Math.ceil(restAntes / dias)), vencido: h > prazo && feitos < total, pct: total ? feitos / total * 100 : 0 };
}
KV.dominio = () => {
  const p = P(), dm = p.dominio;
  let h = `<section class="card"><h2>Domínio do Kata</h2><p>Blocos de 2 movimentos. Cada bloco: <b>20 repetições</b> + check dos <b>10 exercícios com elástico</b>. Meta: 100% em até 1 mês. Treinar a mais é sempre permitido.</p>`;
  if (!dm) return h + selKata('domEscolher') + '</section>' + exsElastico();
  if (!dm.mov) return h + `<p>${esc(dm.kata)} está sem número de movimentos.</p><button class="btn" data-act="kataMov" data-arg="${esc(dm.kata)}">Preencher movimentos</button></section>`;
  const m = metaDominio(dm);
  h += `<p class="destaque">${esc(dm.kata)} · ${dm.mov} movimentos · ${m.total} blocos</p>${barra(m.pct)}
   <p><b>${nf(m.pct)}%</b> · ${m.feitos}/${m.total} blocos · prazo ${fmtData(m.prazo)}</p>
   <p>Meta de hoje: <b>${m.feitosHoje}/${m.metaHoje} blocos</b> (recalculada automaticamente)</p>
   ${m.vencido ? '<p class="alerta">⏰ Prazo vencido — continue até 100%. O kata fica travado até concluir.</p>' : ''}
   ${m.pct >= 100 ? '<p class="ok">🏆 Kata dominado!</p><button class="btn" data-act="domNovo">Escolher outro kata</button>' : '<p class="peq">🔒 Kata travado até 100%.</p>'}</section>`;
  const nomes = p.exsElastico;
  h += dm.blocos.map((b, i) => {
    const a = i * 2 + 1, z = Math.min(dm.mov, a + 1);
    return `<details class="card bloco ${b.feito ? 'feito' : ''}"><summary>Bloco ${i + 1} · mov. ${a}${z > a ? '–' + z : ''} ${b.feito ? '✓ ' + fmtData(b.feito) : `· ${b.reps}/20`}</summary>
     <div class="item">Repetições ${contador(b.reps, 20, 'domRep', i)}</div>
     ${b.ex.map((e, j) => chk(e, 'domEx', i + '|' + j, nomes[j] || `Exercício ${j + 1}`)).join('')}
    </details>`;
  }).join('');
  return h + exsElastico();
};
function exsElastico() {
  return `<section class="card"><h3>Meus 10 exercícios com elástico</h3><p class="peq">Você escolhe; o app não sugere.</p>
  ${P().exsElastico.map((e, i) => `<input class="campo" placeholder="Exercício ${i + 1}" value="${esc(e)}" data-chg="exNome" data-arg="${i}">`).join('')}</section>`;
}
ACT.exNome = (i, el) => { P().exsElastico[i] = el.value; salvar(); };
ACT.domEscolher = (_, el) => {
  if (!el.value) return; const k = kataPorNome(el.value);
  const dm = { kata: el.value, inicio: hoje(), mov: null, blocos: [] }; if (k.movimentos) ajustarBlocos(dm, k.movimentos);
  P().dominio = dm; salvar(); rerender();
};
ACT.domNovo = () => { P().dominio = null; salvar(); rerender(); };
function domCheckFeito(b) { const ok = b.reps >= 20 && b.ex.every(Boolean); if (ok && !b.feito) { b.feito = hoje(); toast('Bloco concluído!'); } if (!ok) b.feito = null; }
ACT.domRep = a => { const [i, d] = a.split('|').map(Number); const b = P().dominio.blocos[i]; b.reps = Math.max(0, Math.min(20, b.reps + d)); domCheckFeito(b); salvar(); rerender(); };
ACT.domEx = a => { const [i, j] = a.split('|').map(Number); const b = P().dominio.blocos[i]; b.ex[j] = !b.ex[j]; domCheckFeito(b); salvar(); rerender(); };

/* -- kumite -- */
function semanaKumite(p = P()) { const s = semana(hoje()); return p.kumite[s] || (p.kumite[s] = {}); }
KV.kumite = () => {
  const k = semanaKumite();
  const c = (id, n) => `<div class="item"><b>${n}</b>${contador(k[id] || 0, 10, 'kuCont', id)}</div>`;
  return `<section class="card"><h2>Kumite · semana de ${fmtData(semana(hoje()))}</h2><p class="peq">1× por semana cada. Zera toda segunda.</p>
   ${c('sanbon', 'Sanbon kumite')}${c('kihon', 'Kihon ippon kumite')}${c('jiyu', 'Jiyu ippon kumite')}
   <h3>Kumite livre</h3>${chk(k.lutei, 'kuLutei', '', 'Lutei com adversário aleatório')}
   ${c('explosao', 'Explosão')}${c('reflexo', 'Reflexo')}${c('velocidade', 'Velocidade')}</section>
   <section class="card peq"><b>Base de pesquisa:</b> pliometria melhora força e potência em artes marciais; testes simples de reação a luz/som não diferenciam lutadores; treino de antecipação em vídeo (oclusão temporal) tem efeito grande.</section>`;
};
ACT.kuCont = a => { const [id, d] = a.split('|'); const k = semanaKumite(); k[id] = Math.max(0, Math.min(10, (k[id] || 0) + Number(d))); salvar(); rerender(); };
ACT.kuLutei = () => { const k = semanaKumite(); k.lutei = !k.lutei; salvar(); rerender(); };

/* -- dicionário -- */
let dicBusca = '';
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ōō]/g, 'o').replace(/ū/g, 'u');
KV.dicionario = () => {
  const q = norm(dicBusca.trim());
  const res = q ? DATA.dicionario.filter(e => [e.pt, e.romaji, e.jp, e.kana].some(x => norm(x).includes(q))) : [];
  const cats = [...new Set(DATA.dicionario.map(e => e.categoria))];
  let h = `<section class="card"><h2>Dicionário</h2><input id="busca" class="campo" placeholder="Digite em português ou japonês…" value="${esc(dicBusca)}" data-chg="dicBuscar">
   <button class="btn" data-act="dicIr">Buscar</button>`;
  if (q && !res.length) {
    h += `<p>Não encontrei “${esc(dicBusca)}”.</p><button class="btn sec" data-act="dicPend">Enviar para a lista de pendentes</button>`;
  }
  h += res.map(verbete).join('') + '</section>';
  if (!q) h += cats.map(c => `<details class="card"><summary>${c} (${DATA.dicionario.filter(e => e.categoria === c).length})</summary>${DATA.dicionario.filter(e => e.categoria === c).map(verbete).join('')}</details>`).join('');
  if (S.pendentes.length) h += `<section class="card"><h3>Palavras pendentes</h3><p class="peq">Peça ao Claude para acrescentar: use “Copiar para a IA” em ⚙️.</p>${S.pendentes.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</section>`;
  return h;
};
function verbete(e) {
  return `<div class="verbete"><div class="vt"><span class="jp">${e.jp}</span> <span class="kana">${e.kana}</span></div>
  <b>${esc(e.pt)}</b> · <i>${e.romaji}</i> · 🔊 ${e.leitura}
  <div class="kanjis">${e.kanji.map(([k, s]) => `<span><b>${k}</b> ${s}</span>`).join('')}</div>
  <p>${e.texto}</p>${e.aviso ? `<p class="aviso-f">⚠️ ${e.aviso}</p>` : ''}</div>`;
}
ACT.dicBuscar = (_, el) => { dicBusca = el.value; rerender(); };
ACT.dicIr = () => { dicBusca = document.getElementById('busca').value; rerender(); };
ACT.dicPend = () => { if (!S.pendentes.includes(dicBusca)) S.pendentes.push(dicBusca); salvar(); toast('Adicionada aos pendentes'); rerender(); };

/* -- prova mensal -- */
function avaliarMes(m, p = P()) {
  const ini = m + '-01', fimMes = soma(soma(ini, 32).slice(0, 7) + '-01', -1), ate = hoje() < fimMes ? hoje() : fimMes;
  const dias = []; let prev = 0, feito = 0; const falhas = [];
  for (let x = ini; x <= ate; x = soma(x, 1)) {
    if (!treinosDoDia(x, p).some(t => t.tipo === 'karate')) continue;
    const d = p.dias[x] || {}; const dm = p.dominio;
    const itens = [['Alongamento antes', !!d.alA], ['Kata 10×', (d.kata || 0) >= 10], ['Domínio (bloco)', dm ? dm.blocos.some(b => b.feito === x) : false], ['Alongamento depois', !!d.alD]];
    const ok = itens.filter(i => i[1]).length; prev += 4; feito += ok; dias.push([x, ok / 4 * 100]);
    itens.filter(i => !i[1]).forEach(i => falhas.push(`${fmtData(x)}: ${i[0]}`));
  }
  const sems = new Set(); for (let x = ini; x <= ate; x = soma(x, 1)) sems.add(semana(x));
  sems.forEach(s => {
    const k = p.kumite[s] || {};
    [['Sanbon', k.sanbon >= 10], ['Kihon ippon', k.kihon >= 10], ['Jiyu ippon', k.jiyu >= 10], ['Kumite livre', !!k.lutei]].forEach(([n, ok]) => { prev++; if (ok) feito++; else falhas.push(`Semana ${fmtData(s)}: ${n}`); });
  });
  return { nota: prev ? feito / prev * 10 : 0, prev, feito, dias, falhas };
}
KV.prova = () => {
  const m = mes(hoje()), p = P(), pv = p.prova[m] || (p.prova[m] = {}), a = avaliarMes(m);
  const graf = a.dias.length ? `<div class="graf">${a.dias.map(([d, v]) => `<div><i style="height:${v}%"></i><small>${dt(d).getDate()}</small></div>`).join('')}</div>` : '<p class="peq">Sem treinos de karatê no mês ainda.</p>';
  return `<section class="card"><h2>Prova interpessoal · ${m.slice(5)}/${m.slice(0, 4)}</h2>
   ${chk(pv.videoIni, 'provaVid', 'videoIni', 'Gravei o vídeo do início do mês')}${chk(pv.videoFim, 'provaVid', 'videoFim', 'Gravei o vídeo do fim do mês')}
   <p class="nota">${nf(a.nota, 1)}<small>/10</small></p><p class="peq">${a.feito} de ${a.prev} tarefas cumpridas (todas com o mesmo peso)</p>
   <h3>Treinos do mês</h3>${graf}
   <h3>Não cumprido</h3>${a.falhas.length ? '<ul>' + a.falhas.map(f => `<li>${f}</li>`).join('') + '</ul>' : '<p class="ok">Nada pendente 👏</p>'}</section>`;
};
ACT.provaVid = c => { const pv = P().prova[mes(hoje())]; pv[c] = !pv[c]; salvar(); rerender(); };

/* -- alongamentos -- */
let timer = null;
KV.along = () => {
  const A = DATA.alongamentos, d = D();
  const it = (a, i, tipo) => `<div class="card along">${chk((d.al || {})[tipo + i], 'alItem', tipo + i, a.nome, (tipo === 'e' ? a.tempo_s + ' s' : a.reps + ' repetições') + (a.nunca_pular ? ' · <b class="alerta">nunca pular</b>' : ''))}
    <details><summary class="lnk">ver músculo e como fazer</summary>${mapa(a.musculos, { vista: mapaVistaForcada })}<div>${nomesMus(a.musculos)}</div><p>${a.como}</p></details>
    ${tipo === 'e' ? `<button class="btn" data-act="alTimer" data-arg="30">⏱️ 30 s</button>` : ''}</div>`;
  return `<section class="card"><h2>Antes do treino · dinâmico</h2><p class="peq">10 repetições cada.</p></section>
   ${A.dinamicos.map((a, i) => it(a, i, 'd')).join('')}<section class="card">${chk(d.alA, 'kTog', 'alA', '✅ Concluí o alongamento antes')}</section>
   <section class="card"><h2>Depois do treino · estático</h2><p class="peq">20–30 s por lado, com apito no final.</p></section>
   ${A.estaticos.map((a, i) => it(a, i, 'e')).join('')}<section class="card">${chk(d.alD, 'kTog', 'alD', '✅ Concluí o alongamento depois')}</section>
   <section class="card"><h3>Regras</h3><ul>${A.regras.map(r => `<li>${r}</li>`).join('')}</ul>
   <table class="tab"><tr><th>Dia</th><th>Antes</th><th>Depois</th></tr><tr><td>Karatê</td><td>Dinâmico completo</td><td>Estático completo</td></tr><tr><td>Natação</td><td>Ombros, tronco, quadril, tornozelos</td><td>Ombros, peito, tríceps, lombar, panturrilha</td></tr><tr><td>Musculação</td><td>Músculos do dia</td><td>Músculos treinados</td></tr><tr><td>Yoga</td><td>—</td><td>Já é sessão de flexibilidade</td></tr></table></section>`;
};
ACT.alItem = id => { const d = D(); d.al = d.al || {}; d.al[id] = !d.al[id]; salvar(); rerender(); };
ACT.alTimer = (s) => {
  clearInterval(timer); let t = Number(s);
  const show = () => { const el = document.getElementById('cron'); if (el) el.innerHTML = `<b>${t}s</b> <button class="lnk" data-act="alPara">parar</button>`; };
  show(); timer = setInterval(() => { t--; show(); if (t <= 0) { clearInterval(timer); timer = null; beep(); const el = document.getElementById('cron'); if (el) { el.innerHTML = '🔔 Tempo! Troque de lado.'; setTimeout(() => { if (!timer) el.innerHTML = ''; }, 4000); } } }, 1000);
};
ACT.alPara = () => { clearInterval(timer); timer = null; const el = document.getElementById('cron'); if (el) el.innerHTML = ''; };
