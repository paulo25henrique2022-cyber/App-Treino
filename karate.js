/* ===== Mapa muscular ===== */
const musculos = () => DATA.musculos.concat(S.musculosExtra || []);
const MUS = id => musculos().find(m => m.id === id);
const VISTAS = { frente: [88, 0, 420, 1024], costas: [555, 0, 445, 1024], lado: [1085, 0, 290, 1024] };
const CORP = { 1: '#ff2a2a', 2: '#ff9a1f', 3: '#4da3ff' };
function mapa(ids, { vista, todos = false, clic = false, id = '' } = {}) {
  if (!vista) { const m = ids.map(MUS).find(Boolean); vista = m ? m.vista : 'frente'; }
  const lista = todos ? musculos().map(m => m.id) : ids;
  const els = lista.map(i => { const m = MUS(i); if (!m) return ''; const cor = todos ? CORP[m.prioridade] : '#ff2a2a';
    return m.area.map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor}" fill-opacity="${todos ? .45 : .6}" stroke="${cor}" stroke-width="4" data-id="${m.id}" ${m.profundo ? 'stroke-dasharray="10 8"' : ''} ${clic ? `data-act="musInfo" data-arg="${m.id}"` : ''} class="${todos ? '' : 'pulsa'}"/>`).join(''); }).join('');
  return `<div class="mapa" ${id ? `id="${id}"` : ''}><div class="mapa-tabs">${Object.keys(VISTAS).map(v => `<button class="${v === vista ? 'on' : ''}" data-act="mapaVista" data-arg="${v}">${v}</button>`).join('')}</div>
   <svg viewBox="${VISTAS[vista].join(' ')}"><image href="img/mapa.jpg" x="0" y="0" width="1536" height="1024"/>${els}</svg></div>`;
}
function nomesMus(ids) { return ids.map(MUS).filter(Boolean).map(m => `<span class="tag p${m.prioridade}">${esc(m.nome)}${m.profundo ? ' · profundo' : ''}<small>${esc(m.tecnico)}</small></span>`).join(''); }
ACT.mapaVista = (v, el) => { const m = el.closest('.mapa'); m.querySelector('svg').setAttribute('viewBox', VISTAS[v].join(' ')); m.querySelectorAll('.mapa-tabs button').forEach(b => b.classList.toggle('on', b.dataset.arg === v)); };
ACT.musInfo = id => {
  if (window.musRegistrando) return;
  const m = MUS(id);
  modal(`<h3>${esc(m.nome)}</h3><p class="tec">${esc(m.tecnico)}${m.profundo ? ' · <b>músculo profundo</b>: o mapa mostra a região' : ''}</p>
  <p><b>Prioridade no karatê:</b> ${['', '🔴 essencial', '🟠 importante', '⚪ geral'][m.prioridade]}</p><p><b>Função no karatê:</b> ${esc(m.funcao_karate)}</p><p><b>Como treinar sem encurtar:</b> ${esc(m.como_treinar)}</p>
  ${m.extra ? `<button class="btn sec" data-act="musDel" data-arg="${m.id}">Apagar este músculo</button>` : ''}`);
};

/* ===== Katas (Registro) ===== */
function katas() { return DATA.katas.map(k => ({ ...k, movimentos: S.katasEdit[k.nome] ?? k.movimentos })).concat(S.katasExtra); }
const kataPorNome = n => katas().find(k => k.nome === n);
function selKata(act, atual) { return `<select data-chg="${act}"><option value="">— escolha o kata —</option>${katas().map(k => `<option ${k.nome === atual ? 'selected' : ''}>${esc(k.nome)}</option>`).join('')}</select>`; }
function pedirMov(n) {
  const k = kataPorNome(n); const v = prompt(`Movimentos de ${n}${k.divergencia ? ' (' + k.divergencia + ')' : ''}:`, k.movimentos ?? ''); if (v === null) return false;
  const x = parseInt(v); if (!(x > 0)) { toast('Número inválido'); return false; }
  const ex = S.katasExtra.find(e => e.nome === n); if (ex) ex.movimentos = x; else S.katasEdit[n] = x;
  if (S.kp && S.kp.kata === n) ajustarBlocos(x);
  salvar(); return true;
}

/* ===== Menus em arte ===== */
V.karate = () => menuArte('karate_menu.jpg', 900, 1599, [['#/karate/treino', 13.6, 49.2, 72.7, 10.9, 'Treino'], ['#/karate/dicionario', 13.6, 63.1, 72.7, 11.1, 'Dicionário'], ['#/karate/resultado', 13.6, 77.6, 72.7, 11.5, 'Resultado mensal']], '#/', 'Karatê');
const TREINO_SUB = { memoria: () => KMemoria(), polimento: () => KPolimento(), along: () => KAlong(), registro: () => KRegistro() };
V['karate/treino'] = (sub) => TREINO_SUB[sub] ? TREINO_SUB[sub]() : menuArte('karate_treino.jpg', 900, 1599,
  [['#/karate/treino/memoria', 18.5, 46.7, 63, 8.9, 'Kata Memória'], ['#/karate/treino/polimento', 18.5, 56.4, 63, 9, 'Kata Polimento'], ['#/karate/treino/kumite', 18.5, 66.2, 63, 9.2, 'Kumite'], ['#/karate/treino/along', 18.5, 76.2, 63, 9.5, 'Alongamentos'], ['#/karate/treino/registro', 18.5, 86.5, 63, 9.2, 'Registro de Kata']], '#/karate', 'Treino');
const JT = (t, k, c) => janela('karate_treino.jpg', t, k, '#/karate/treino', c);

/* ===== Registro de Kata ===== */
function KRegistro() {
  return JT('Registro de Kata', '記録', `<div class="washi"><p class="peq">Banco de dados dos katas. O número de movimentos é usado automaticamente no Kata Memória e no Kata Polimento. ⚠️ = fontes divergem.</p>
   <button class="btn" data-act="kataNovo">+ Adicionar kata</button></div>
   ${katas().map(k => `<details class="washi kata-reg"><summary><span><b>${esc(k.nome)}</b> <span class="kjp">${esc(k.kanji || '')}</span>${k.divergencia ? ' <span title="' + esc(k.divergencia) + '">⚠️</span>' : ''}</span><span class="movs">${k.movimentos ?? '—'} mov.</span></summary>
     <button class="btn sec" data-act="kataMov" data-arg="${esc(k.nome)}">✏️ Editar movimentos</button>${k.divergencia ? `<small>Outra fonte: ${esc(k.divergencia.replace('outra fonte: ', ''))}</small>` : ''}
     ${linksBloco('kata:' + k.nome, 3)}
     ${k.grupo === 'Extra' ? `<button class="lnk" data-act="kataDel" data-arg="${esc(k.nome)}">apagar kata</button>` : ''}</details>`).join('')}`);
}
ACT.kataMov = n => { if (pedirMov(n)) rerender(); };
ACT.kataNovo = () => { const n = (prompt('Nome do kata:') || '').trim(); if (!n) return; if (kataPorNome(n)) return toast('Já existe');
  const kj = prompt('Kanji (opcional):') || ''; const m = parseInt(prompt('Número de movimentos (pode deixar vazio):'));
  S.katasExtra.push({ nome: n, kanji: kj, movimentos: m > 0 ? m : null, grupo: 'Extra' }); salvar(); rerender(); };
ACT.kataDel = n => { if (!confirm('Apagar ' + n + '?')) return; S.katasExtra = S.katasExtra.filter(k => k.nome !== n); salvar(); rerender(); };

/* ===== Kata Memória ===== */
const kmTotal = km => Object.values(km.log).reduce((a, b) => a + b, 0);
function KMemoria() {
  const km = S.km, t = km ? kmTotal(km) : 0, p = t / 45 * 100, hj = km ? km.log[hoje()] || 0 : 0;
  return JT('Kata Memória', '型記憶', `<div class="washi"><p class="peq">1 kata por vez · de 1 a 15 execuções por dia · meta de 45 execuções, sem prazo. Trocar de kata antes de 100% apaga o progresso.</p>
   ${selKata('kmEscolher', km && km.kata)}
   ${km ? `<div class="kata-nome">${esc(km.kata)} <span class="kjp">${esc(kataPorNome(km.kata)?.kanji || '')}</span></div>${barra(p)}
     <p><b>${t}/45</b> execuções · ${nf(p)}%</p>
     ${km.concluido ? `<p class="ok">🏆 Concluído em ${fmtData(km.concluido)}! Escolha o próximo kata.</p>` : `<div class="item"><b>Hoje</b>${contador(hj, 15, 'kmCont', 'x')}</div>`}` : ''}
   </div>${km ? linksBloco('kata:' + km.kata, 3, 'Vídeos deste kata') : ''}
   <div class="washi"><h3>Katas concluídos</h3>${S.kmConcl.length ? S.kmConcl.slice().reverse().map(c => `<div class="item">${esc(c.kata)}<small>${fmtData(c.data)}</small></div>`).join('') : '<p class="peq">Nenhum ainda.</p>'}</div>
   <div class="rodape"><button class="btn perigo" data-act="kmReset">Resetar todos os progressos</button></div>`);
}
ACT.kmEscolher = (_, el) => {
  const n = el.value; if (!n) return; const km = S.km;
  if (km && !km.concluido && kmTotal(km) > 0 && km.kata !== n && !confirm(`Trocar de kata apaga o progresso de ${km.kata} (${kmTotal(km)}/45). Continuar?`)) return rerender();
  S.km = { kata: n, log: {} }; salvar(); rerender();
};
ACT.kmCont = a => {
  const km = S.km, d = +a.split('|')[1], h = hoje(), v = (km.log[h] || 0) + d;
  if (v < 0) return; if (v > 15) return toast('Máximo de 15 por dia'); if (d > 0 && kmTotal(km) >= 45) return;
  km.log[h] = v; if (!v) delete km.log[h];
  if (kmTotal(km) >= 45 && !km.concluido) { km.concluido = h; S.kmConcl.push({ kata: km.kata, data: h, log: { ...km.log } }); beep(2); toast('Kata memorizado! 100%'); }
  salvar(); rerender();
};
ACT.kmReset = () => { if (!confirm('Apagar todo o progresso do Kata Memória, incluindo os concluídos?')) return; S.km = null; S.kmConcl = []; salvar(); rerender(); };

/* ===== Kata Polimento ===== */
function ajustarBlocos(mov) { const kp = S.kp; kp.mov = mov; const n = Math.ceil(mov / 2); while (kp.blocos.length < n) kp.blocos.push({ r: 0, dias: {} }); kp.blocos.length = n; }
const kpReps = kp => kp.blocos.reduce((a, b) => a + b.r, 0);
function kpAtual(kp) { return kp.blocos.findIndex(b => b.r < 20); }
function KPolimento() {
  const kp = S.kp;
  let h = `<div class="washi"><p class="peq">Blocos de 2 movimentos · 1 bloco por dia · 20 repetições por bloco. O bloco incompleto continua em outro dia. Sem prazo. Trocar de kata antes de 100% apaga o progresso.</p>${selKata('kpEscolher', kp && kp.kata)}`;
  if (kp && !kp.mov) h += `<p>${esc(kp.kata)} está sem número de movimentos.</p><button class="btn" data-act="kataMov" data-arg="${esc(kp.kata)}">Preencher movimentos</button>`;
  if (kp && kp.mov) {
    const tot = kp.blocos.length * 20, r = kpReps(kp), p = r / tot * 100, i = kpAtual(kp), b = kp.blocos[i];
    const outroHoje = kp.blocos.some((x, j) => j !== i && x.dias[hoje()]);
    h += `<div class="kata-nome">${esc(kp.kata)} <span class="kjp">${esc(kataPorNome(kp.kata)?.kanji || '')}</span></div>${barra(p)}
     <p><b>${nf(p)}%</b> · ${kp.blocos.filter(x => x.r >= 20).length}/${kp.blocos.length} blocos · ${kp.mov} movimentos</p>`;
    if (kp.concluido) h += `<p class="ok">🏆 Kata polido em ${fmtData(kp.concluido)}! Escolha o próximo.</p>`;
    else if (b) { const a = i * 2 + 1, z = Math.min(kp.mov, a + 1);
      h += `<div class="bloco-atual"><b>Bloco ${i + 1}</b> · movimentos ${a}${z > a ? '–' + z : ''}${b.r && !b.dias[hoje()] ? ' <small>(continuando)</small>' : ''}
       ${outroHoje && !b.r ? '<p class="peq">✅ Bloco de hoje concluído. O próximo começa no próximo treino.</p>' : `<div class="item"><b>Repetições</b>${contador(b.r, 20, 'kpCont', i)}</div>`}</div>`; }
  }
  h += '</div>';
  if (kp && kp.mov) h += `<details class="washi"><summary><b>Todos os blocos</b></summary>${kp.blocos.map((b, j) => `<div class="item">Bloco ${j + 1} · mov. ${j * 2 + 1}${j * 2 + 2 <= kp.mov ? '–' + (j * 2 + 2) : ''}<span>${b.r >= 20 ? '✅' : b.r + '/20'}</span></div>`).join('')}</details>`;
  if (kp) h += linksBloco('kata:' + kp.kata, 3, 'Vídeos deste kata');
  h += `<div class="washi"><h3>Katas polidos</h3>${S.kpConcl.length ? S.kpConcl.slice().reverse().map(c => `<div class="item">${esc(c.kata)}<small>${fmtData(c.data)}</small></div>`).join('') : '<p class="peq">Nenhum ainda.</p>'}</div>
   <div class="rodape"><button class="btn perigo" data-act="kpReset">Resetar todos os progressos</button></div>`;
  return JT('Kata Polimento', '型研磨', h);
}
ACT.kpEscolher = (_, el) => {
  const n = el.value; if (!n) return; const kp = S.kp;
  if (kp && !kp.concluido && kp.blocos && kpReps(kp) > 0 && kp.kata !== n && !confirm(`Trocar de kata apaga o progresso de ${kp.kata}. Continuar?`)) return rerender();
  S.kp = { kata: n, mov: null, blocos: [] }; const k = kataPorNome(n); if (k.movimentos) ajustarBlocos(k.movimentos); salvar(); rerender();
};
ACT.kpCont = a => {
  const [i, d] = a.split('|').map(Number), kp = S.kp, b = kp.blocos[i], h = hoje();
  const v = b.r + d; if (v < 0 || v > 20) return; if (d < 0 && !(b.dias[h] > 0)) return toast('Só dá para desfazer repetições de hoje');
  b.r = v; b.dias[h] = (b.dias[h] || 0) + d; if (!b.dias[h]) delete b.dias[h];
  if (b.r === 20) toast(`Bloco ${i + 1} concluído!`);
  if (kp.blocos.every(x => x.r >= 20) && !kp.concluido) { kp.concluido = h; S.kpConcl.push({ kata: kp.kata, data: h, reps: kp.blocos.map(x => x.dias) }); beep(2); toast('Kata polido! 100%'); }
  salvar(); rerender();
};
ACT.kpReset = () => { if (!confirm('Apagar todo o progresso do Kata Polimento, incluindo os concluídos?')) return; S.kp = null; S.kpConcl = []; salvar(); rerender(); };

/* ===== Kumite ===== */
const KUM = { sanbon: ['Sanbon Kumite', '三本組手'], kihon: ['Kihon Ippon', '基本一本'], jiyuippon: ['Jiyu Ippon', '自由一本'], jiyukumite: ['Jiyu Kumite', '自由組手'] };
const JIYU = [['explosao', 'Treino de explosão'], ['velocidade', 'Treino de velocidade'], ['reflexo', 'Treino de reflexo'], ['movimentacao', 'Treino de movimentação']];
function kumSem(s = semana(hoje())) { return S.kumite[s] || (S.kumite[s] = {}); }
V['karate/treino/kumite'] = sub => {
  if (!KUM[sub]) return menuArte('kumite_menu.jpg', 900, 1599, [['#/karate/treino/kumite/sanbon', 12.8, 46.5, 74.6, 10.3, 'Sanbon'], ['#/karate/treino/kumite/kihon', 12.8, 57.9, 74.6, 10.3, 'Kihon Ippon'], ['#/karate/treino/kumite/jiyuippon', 12.8, 69.3, 74.6, 10.6, 'Jiyu Ippon'], ['#/karate/treino/kumite/jiyukumite', 12.8, 81, 74.6, 10.8, 'Jiyu Kumite']], '#/karate/treino', 'Kumite');
  const k = kumSem(), [n, kj] = KUM[sub];
  let c = `<div class="washi"><p class="peq">Semana de ${fmtData(semana(hoje()))} · meta de 10 por semana · zera toda segunda.</p>`;
  if (sub === 'jiyukumite') c += '</div>' + JIYU.map(([id, nm]) => `<div class="washi"><div class="item"><b>${nm}</b>${contador(k[id] || 0, 10, 'kuCont', id)}</div>${barra((k[id] || 0) * 10)}${linksBloco('kum:' + id, 3)}</div>`).join('');
  else c += `<div class="item"><b>${n}</b>${contador(k[sub] || 0, 10, 'kuCont', sub)}</div>${barra((k[sub] || 0) * 10)}</div>${linksBloco('kum:' + sub, 3)}`;
  return janela('kumite_menu.jpg', n, kj, '#/karate/treino/kumite', c);
};
ACT.kuCont = a => { const [id, d] = a.split('|'); const k = kumSem(); const v = (k[id] || 0) + Number(d); if (v < 0 || v > 10) return; k[id] = v; salvar(); rerender(); };

/* ===== Alongamentos (sessão diária: meta de 20 à escolha) ===== */
const META_AL = 20;
let timer = null, alReg = null;
function KAlong() {
  const A = DATA.alongamentos.estaticos, d = D(), al = d.alongDia || {}, n = A.filter((_, i) => al[i]).length;
  const R = DATA.alongamentos.regioes, feitas = new Set(A.filter((_, i) => al[i]).map(a => a.regiao));
  const faltam = R.filter(r => !feitas.has(r) && A.some(a => a.regiao === r));
  const bal = R.filter(r => A.some(a => a.regiao === r)).map(r => { const q = A.filter((a, i) => a.regiao === r && al[i]).length;
    return `<button class="balao ${alReg === r ? 'on' : ''}" style="--c:${q ? '#3b6d11' : '#b3241c'}" data-act="alReg" data-arg="${esc(r)}">${esc(r)}<small>${q ? '✓ ' + q : 'falta'}</small></button>`; }).join('');
  const lista = alReg ? A.map((a, i) => [a, i]).filter(([a]) => a.regiao === alReg) : [];
  return JT('Alongamentos', '柔軟', `<div class="washi"><p>Sessão de hoje: <b>${Math.min(n, META_AL)}/${META_AL}</b>${n > META_AL ? ` (+${n - META_AL})` : ''}</p>${barra(Math.min(n / META_AL, 1) * 100)}
   <p class="peq">Escolha ${META_AL} alongamentos por dia · 2 a 4 × 30 s por músculo · estático depois do treino, dinâmico antes · os checks zeram à meia-noite.</p>
   ${faltam.length ? `<p class="peq"><b>Regiões ainda não alongadas hoje:</b> ${faltam.map(esc).join(', ')}</p>` : '<p class="peq"><b>Todas as regiões alongadas hoje ✓</b></p>'}</div>
   <div class="washi"><h3>Escolha a região</h3><div class="baloes">${bal}</div></div>
   ${lista.map(([a, i]) => `<div class="washi along">${chk(al[i], 'alItem', i, esc(a.nome), a.tempo_s + ' s' + (a.nunca_pular ? ' · <b class="alerta">nunca pular</b>' : ''))}
     <p>${esc(a.como)}</p>${a.video ? `<a class="btn yt" href="${esc(a.video)}" target="_blank" rel="noopener">▶ Ver vídeo</a> ` : ''}<button class="btn sec" data-act="alTimer" data-arg="30">⏱️ 30 s</button>
     <details><summary class="lnk">ver músculo alongado</summary>${mapa(a.musculos)}<div>${nomesMus(a.musculos)}</div></details>${linksBloco('al:' + i, 2)}</div>`).join('')}`);
}
ACT.alReg = r => { alReg = alReg === r ? null : r; rerender(); };
ACT.alItem = i => { const d = D(); d.alongDia = d.alongDia || {}; d.alongDia[i] = !d.alongDia[i]; salvar(); rerender(); };
ACT.alTimer = s => {
  clearInterval(timer); let pre = 5, t = +s; const el = document.getElementById('cron');
  const show = () => { el.innerHTML = pre > 0 ? `Prepare-se… <b>${pre}</b> <button class="lnk" data-act="alPara">parar</button>` : `<b>${t}s</b> <button class="lnk" data-act="alPara">parar</button>`; };
  tique(); show();
  timer = setInterval(() => {
    if (pre > 0) { pre--; tique(pre === 0); show(); return; }
    t--; show(); if (t > 0 && t <= 3) tique();
    if (t <= 0) { clearInterval(timer); timer = null; sino(); el.innerHTML = '🔔 Tempo!'; setTimeout(() => { if (!timer) el.innerHTML = ''; }, 4000); }
  }, 1000);
};
ACT.alPara = () => { clearInterval(timer); timer = null; document.getElementById('cron').innerHTML = ''; };

/* ===== Dicionário ===== */
let dicBusca = '';
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
V['karate/dicionario'] = () => {
  const q = norm(dicBusca.trim());
  const res = q ? DATA.dicionario.filter(e => [e.pt, e.romaji, e.jp, e.kana].some(x => norm(x).includes(q))) : [];
  const cats = [...new Set(DATA.dicionario.map(e => e.categoria))];
  let h = `<div class="washi"><input id="busca" class="campo" placeholder="Digite em português ou japonês…" value="${esc(dicBusca)}" data-chg="dicBuscar"><button class="btn" data-act="dicIr">Buscar</button>`;
  if (q && !res.length) h += `<p>Não encontrei “${esc(dicBusca)}”.</p><button class="btn sec" data-act="dicPend">Enviar para a lista de pendentes</button>`;
  h += res.map(verbete).join('') + '</div>';
  if (!q) h += cats.map(c => `<details class="washi"><summary><b>${c}</b> (${DATA.dicionario.filter(e => e.categoria === c).length})</summary>${DATA.dicionario.filter(e => e.categoria === c).map(verbete).join('')}</details>`).join('');
  if (S.pendentes.length) h += `<div class="washi"><h3>Palavras pendentes</h3><p class="peq">Peça ao Claude para acrescentar.</p>${S.pendentes.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>`;
  return janela('karate_menu.jpg', 'Dicionário', '辞書', '#/karate', h);
};
function verbete(e) {
  return `<div class="verbete"><div><span class="jp">${e.jp}</span> <span class="kana">${e.kana}</span></div><b>${esc(e.pt)}</b> · <i>${e.romaji}</i> · 🔊 ${e.leitura}
   <div class="kanjis">${e.kanji.map(([k, s]) => `<span><b>${k}</b> ${s}</span>`).join('')}</div><p>${e.texto}</p>${e.aviso ? `<p class="aviso-f">⚠️ ${e.aviso}</p>` : ''}</div>`;
}
ACT.dicBuscar = (_, el) => { dicBusca = el.value; rerender(); };
ACT.dicIr = () => { dicBusca = document.getElementById('busca').value; rerender(); };
ACT.dicPend = () => { if (!S.pendentes.includes(dicBusca)) S.pendentes.push(dicBusca); salvar(); toast('Adicionada aos pendentes'); rerender(); };

/* ===== Resultado mensal ===== */
const PIL = [['memoria', 'Kata Memória', '型記憶', '#b3241c'], ['polimento', 'Kata Polimento', '型研磨', '#1f5f8b'], ['kumite', 'Kumite', '組手', '#6b3f22'], ['along', 'Alongamentos', '柔軟', '#3b6d11']];
function pilares(m, ate) {
  const ini = m + '-01', fim = fimMes(m); ate = ate < fim ? ate : fim; const r = {}, pend = { memoria: [], polimento: [], kumite: [], along: [] };
  // Kata Memória
  const conclM = S.kmConcl.find(c => mes(c.data) === m && c.data <= ate);
  if (conclM) r.memoria = 100; else {
    let n = 0; const logs = [S.km ? S.km.log : {}].concat(S.kmConcl.map(c => c.log));
    logs.forEach(l => Object.entries(l).forEach(([d, v]) => { if (d >= ini && d <= ate) n += v; }));
    r.memoria = Math.min(100, n / 45 * 100); pend.memoria.push(S.km ? `${S.km.kata}: faltam ${45 - kmTotal(S.km)} execuções para concluir` : 'Nenhum kata em memorização');
  }
  // Kata Polimento
  const conclP = S.kpConcl.find(c => mes(c.data) === m && c.data <= ate);
  if (conclP) r.polimento = 100; else {
    let n = 0, tot = 1; if (S.kp && S.kp.blocos.length) { tot = S.kp.blocos.length * 20; S.kp.blocos.forEach(b => Object.entries(b.dias).forEach(([d, v]) => { if (d >= ini && d <= ate) n += v; })); }
    r.polimento = Math.min(100, n / tot * 100); pend.polimento.push(S.kp && S.kp.blocos.length ? `${S.kp.kata}: faltam ${tot - kpReps(S.kp)} repetições (${S.kp.blocos.filter(b => b.r < 20).length} blocos)` : 'Nenhum kata em polimento');
  }
  // Kumite
  const sems = []; for (let s = semana(ini); s <= ate; s = soma(s, 7)) if (s >= ini) sems.push(s);
  if (!sems.length) sems.push(semana(ini));
  let sk = 0; sems.forEach(s => { const k = S.kumite[s] || {}; const f = x => Math.min(1, (k[x] || 0) / 10);
    const jy = JIYU.reduce((a, [id]) => a + f(id), 0) / 4; sk += (f('sanbon') + f('kihon') + f('jiyuippon') + jy) / 4;
    [['sanbon', 'Sanbon'], ['kihon', 'Kihon ippon'], ['jiyuippon', 'Jiyu ippon']].forEach(([id, n]) => { if ((k[id] || 0) < 10) pend.kumite.push(`Semana ${fmtData(s)}: ${n} ${k[id] || 0}/10`); });
    JIYU.forEach(([id, n]) => { if ((k[id] || 0) < 10) pend.kumite.push(`Semana ${fmtData(s)}: ${n.replace('Treino de ', 'Jiyu kumite · ')} ${k[id] || 0}/10`); }); });
  r.kumite = sk / sems.length * 100;
  // Alongamentos
  let sa = 0, nd = 0; for (let x = ini; x <= ate; x = soma(x, 1)) { const a = (S.dias[x] || {}).alongDia || {}; const c = Object.values(a).filter(Boolean).length; sa += Math.min(c / META_AL, 1); nd++; if (c < META_AL) pend.along.push(`${fmtData(x)}: ${c}/${META_AL}`); }
  r.along = nd ? sa / nd * 100 : 0;
  r.total = (r.memoria + r.polimento + r.kumite + r.along) / 4;
  return { r, pend };
}
function curvas(m) {
  const ini = m + '-01', fim = fimMes(m), ate = hoje() < fim ? hoje() : fim, serie = PIL.map(() => []), dias = [];
  if (ate < ini) return { serie, dias };
  for (let x = ini; x <= ate; x = soma(x, 1)) { const { r } = pilares(m, x); PIL.forEach(([k], j) => serie[j].push(r[k])); dias.push(x); }
  return { serie, dias };
}
function graficoSvg(m) {
  const { serie, dias } = curvas(m), N = Number(fimMes(m).slice(8));
  const X = i => 40 + i * (550 / Math.max(1, N - 1)), Y = v => 200 - v * 1.8;
  let g = [0, 25, 50, 75, 100].map(v => `<line x1="40" x2="590" y1="${Y(v)}" y2="${Y(v)}" stroke="#c9a86a" stroke-width=".6"/><text x="2" y="${Y(v) + 4}" font-size="11" fill="#5a3d26">${v}%</text>`).join('');
  [1, 8, 15, 22, N].forEach(d => { g += `<text x="${X(d - 1) - 5}" y="216" font-size="10" fill="#5a3d26">${d}</text>`; });
  PIL.forEach(([, , , c], j) => { if (!serie[j].length) return; g += `<polyline points="${serie[j].map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${X(serie[j].length - 1)}" cy="${Y(serie[j][serie[j].length - 1])}" r="4" fill="${c}"/>`; });
  return `<svg viewBox="0 0 600 222" class="graf-svg">${g}</svg><div class="leg">${PIL.map(([, n, , c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>`;
}
function pilaresHtml(r) {
  return `<div class="pilares">${PIL.map(([k, n, kj]) => { const v = r[k]; return `<div><b style="color:${corNivel(v)}">${nf(v)}%</b><div class="pil" style="height:${Math.max(3, v * 1.3)}px;background:${corNivel(v)}"></div><div class="kjp">${kj}</div><small>${n}<br>${nf(v / 4, 1)} de 25%</small></div>`; }).join('')}</div>`;
}
let resMes = null;
V['karate/resultado'] = (m) => {
  m = m || resMes || mes(hoje()); resMes = m; const { r } = pilares(m, hoje());
  return janela('karate_menu.jpg', 'Resultado Mensal', '結果', '#/karate', `<div class="washi">
   <div class="nav-mes"><a class="btn sec" href="#/karate/resultado/${somaMes(m, -1)}">‹</a><b>${nomeMes(m)}</b>${m < mes(hoje()) ? `<a class="btn sec" href="#/karate/resultado/${somaMes(m, 1)}">›</a>` : '<span></span>'}</div>
   <div class="nota" style="color:${corNivel(r.total)}">${nf(r.total)}%</div>
   <h3>Oscilação no mês</h3>${graficoSvg(m)}<h3>Os 4 pilares</h3>${pilaresHtml(r)}</div>
   <div class="washi rodape"><p class="lembrete">🎥 Para a sua autoavaliação: grave um vídeo no começo e no fim do mês.</p><a class="btn" href="#/karate/pdf/${m}">📄 Gerar PDF do resultado</a></div>`);
};
V['karate/pdf'] = (m) => {
  m = m || mes(hoje()); const { r, pend } = pilares(m, hoje());
  return `<div class="pdf-barra"><a href="#/karate/resultado/${m}" class="btn sec">‹ Voltar</a><button class="btn" data-act="imprimir">📄 Salvar em PDF</button><small>No celular: Compartilhar/Imprimir → “Salvar como PDF”.</small></div>
  <div class="folha-r"><div class="fcab"><span class="kj">結果</span><div><h1>Resultado Mensal · Karatê</h1><p>${esc(S.perfil.nome)} · ${nomeMes(m)} · gerado em ${fmtData(hoje())}</p></div><div class="nota-p" style="color:${corNivel(r.total)}">${nf(r.total)}%</div></div>
   ${graficoSvg(m)}${pilaresHtml(r)}
   <h2>Pendências</h2>${PIL.map(([k, n]) => `<h3>${n} · ${nf(r[k])}%</h3>${pend[k].length && r[k] < 100 ? '<ul>' + pend[k].slice(0, 40).map(x => `<li>${esc(x)}</li>`).join('') + (pend[k].length > 40 ? `<li>… e mais ${pend[k].length - 40}</li>` : '') + '</ul>' : '<p class="ok">Nada pendente 👏</p>'}`).join('')}
   <p class="lembrete">🎥 Lembrete: grave um vídeo no começo e no fim do mês para a sua autoavaliação.</p></div>`;
};
ACT.imprimir = () => window.print();
