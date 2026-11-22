/* ===== ALIMENTAÇÃO ===== */
const ALI_ABAS = [['hoje', 'Hoje'], ['cardapio', 'Cardápio'], ['receitas', 'Receitas'], ['temperos', 'Temperos'], ['aprender', 'Aprender'], ['progresso', 'Metas'], ['compras', 'Supermercado']];
V.alimentacao = (sub = 'hoje', arg) => sub === 'compras' ? (location.hash = '#/compras', '') : `<div class="escuro verde">${topo('Alimentação')}${abas('alimentacao', ALI_ABAS, sub)}${(AV[sub] || AV.hoje)(arg)}</div>`;
const AV = {};
const REFS = ['Café da manhã', 'Almoço', 'Lanche / pré-treino', 'Jantar', 'Ceia'];
const REF_K = { 'Café da manhã': 'cafe', 'Almoço': 'almoco', 'Lanche / pré-treino': 'lanche', 'Jantar': 'jantar', 'Ceia': 'ceia' };
const DIST = { cafe: .25, almoco: .30, lanche: .15, jantar: .22, ceia: .08 };
const MET = { karate: 4, natacao: 5, musculacao: 4, sabado: 4, yoga: 1.5 };
const ALIM = () => ({ ...DATA.alimentos, ...S.alimentosEdit });
const todasReceitas = () => DATA.receitas.concat(S.receitasMinhas);
const receita = id => todasReceitas().find(r => String(r.id) === String(id));

/* -- metas -- */
function tmb(p) { return 10 * p.peso + 6.25 * p.altura - 5 * p.idade + (p.sexo === 'M' ? 5 : -161); }
const OBJ = { recomp: [-.05, 'Recomposição (força e definição)'], perder: [-.15, 'Perder gordura e definir'], manter: [0, 'Manter'], ganhar: [.08, 'Ganhar massa'] };
function metaDia(data, p = P()) {
  const base = tmb(p) * 1.35;
  const treino = treinosDoDia(data, p).reduce((a, t) => a + MET[t.tipo] * p.peso * Math.max(.5, (hm(t.fim) - hm(t.ini)) / 60), 0);
  const total = base + treino;
  const kcal = Math.round(total * (1 + OBJ[p.objetivo][0]) + (p.ajusteKcal || 0));
  const prot = Math.round(p.peso * (p.objetivo === 'perder' ? 2.0 : 2.0)), gord = Math.round(p.peso * .8);
  const carb = Math.max(0, Math.round((kcal - prot * 4 - gord * 9) / 4));
  return { kcal, prot, gord, carb, gasto: Math.round(total) };
}
function mediaSemana(p) { let s = 0; for (let i = 0; i < 7; i++) s += metaDia(soma(semana(hoje()), i), p).kcal; return Math.round(s / 7); }

/* -- horários -- */
function refeicoesDoDia(data, p = P()) {
  const ac = hm(acordarDoDia(data, p)), tr = treinosDoDia(data, p).slice().sort((a, b) => hm(a.ini) - hm(b.ini));
  const r = { cafe: ac + 30, almoco: Math.max(12 * 60, ac + 4 * 60), lanche: 16 * 60, jantar: 19 * 60 + 30, ceia: hm(p.dormir || '00:00') - 60 };
  const notas = {};
  tr.forEach(t => {
    const i = hm(t.ini), f = hm(t.fim);
    if (t.tipo === 'karate' || i >= 15 * 60) { r.lanche = i - 90; notas.lanche = 'pré-treino (1h30 antes)'; r.jantar = f + 40; notas.jantar = 'pós-treino'; }
    else if (i < 10 * 60) { if (r.cafe > i - 60) { r.cafe = Math.max(ac + 10, i - 75); } notas.cafe = 'pré-treino'; notas.almoco = 'pós-treino'; if (r.almoco < f + 60) r.almoco = f + 60; }
    else if (i < 14 * 60) { notas.cafe = notas.cafe || 'pré-treino (1h30 antes)'; r.almoco = Math.max(r.almoco, f + 40); notas.almoco = 'pós-treino'; }
  });
  return Object.keys(DIST).map(k => ({ k, hora: th(r[k]), nota: notas[k] || '' }));
}

/* -- porções -- */
function kcalReceita(r) { return r.porcao_referencia ? r.porcao_referencia.kcal : nutriIngr(r.ingredientes).kcal; }
function nutriIngr(ings) {
  const A = ALIM(), t = { kcal: 0, proteina_g: 0, carbo_g: 0, gordura_g: 0, fibra_g: 0 };
  ings.forEach(i => { const v = A[i.alimento]; if (v) for (const k in t) t[k] += v[k] * i.g / 100; });
  for (const k in t) t[k] = Math.round(t[k] * 10) / 10; return t;
}
function porcao(r, kcalAlvo) {
  const f = Math.max(.6, Math.min(1.5, kcalAlvo / (kcalReceita(r) || 1)));
  const ings = r.ingredientes.map(i => ({ alimento: i.alimento, g: Math.max(5, Math.round(i.g * f / 5) * 5) }));
  return { f, ings, n: nutriIngr(ings) };
}
const fmtG = (alim, g) => alim === 'ovo' ? `${nf(g / 50, 1)} ovo${g > 75 ? 's' : ''} (${g} g)` : /leite|iogurte/.test(alim) && !/grego/.test(alim) ? `${g} ml` : `${g} g`;

/* -- cardápio -- */
let semAtual = null;
const semPlan = () => new Date().getDay() === 0 ? soma(semana(hoje()), 7) : semana(hoje());
const semC = () => semAtual || semPlan();
function card(sem = semC()) { return S.cardapio[sem] || (S.cardapio[sem] = {}); }
AV.hoje = () => {
  const p = P(), x = hoje(), m = metaDia(x), c = card(semana(x))[diaSem(x)] || {};
  const tr = treinosDoDia(x).map(t => `${NOMES_TREINO[t.tipo]} ${t.ini}–${t.fim}`).join(' · ') || 'descanso';
  return `<section class="card"><h2>${fmtData(x)} · ${esc(p.nome)}</h2><p>Treinos: <b>${tr}</b> <a href="#/alimentacao/dia">ajustar o dia</a></p>
   <div class="metas"><div><b>${m.kcal}</b><small>kcal</small></div><div><b>${m.prot} g</b><small>proteína</small></div><div><b>${m.carb} g</b><small>carbo</small></div><div><b>${m.gord} g</b><small>gordura</small></div></div>
   ${refeicoesDoDia(x).map(rf => {
     const r = receita(c[rf.k]); const alvo = m.kcal * DIST[rf.k];
     const po = r ? porcao(r, alvo) : null;
     return `<div class="refeicao"><div class="hora">${rf.hora}</div><div><b>${REFS[Object.keys(DIST).indexOf(rf.k)]}</b> ${rf.nota ? `<span class="tag">${rf.nota}</span>` : ''}<br>
      ${r ? `<a href="#/alimentacao/receita/${r.id}">${esc(r.nome)}</a><br><small>${nf(po.n.kcal)} kcal · ${nf(po.n.proteina_g)} g prot.</small>` : `<small>sem receita · <a href="#/alimentacao/cardapio">montar cardápio</a></small>`}</div></div>`;
   }).join('')}
   <p class="peq">💊 Creatina 3–5 g em qualquer horário. Whey quando faltar proteína (já incluso em algumas receitas).</p></section>`;
};
AV.dia = () => {
  const x = hoje(), p = P(), o = p.override[x] || {}, tr = treinosDoDia(x);
  const tipos = ['karate', 'natacao', 'musculacao', 'sabado', 'yoga'];
  return `<section class="card"><h2>Ajustar ${fmtData(x)}</h2><p class="peq">Mudou o horário hoje? Ajuste aqui: as refeições e as quantidades se recalculam. Vale só para hoje.</p>
   <label>Acordei às <input type="time" class="campo" value="${acordarDoDia(x)}" data-chg="diaAcordar"></label>
   ${tipos.map(t => { const e = tr.find(z => z.tipo === t); return `<div class="item">${chk(!!e, 'diaTreino', t, NOMES_TREINO[t])}${e ? `<input type="time" value="${e.ini}" data-chg="diaHora" data-arg="${t}|ini"> às <input type="time" value="${e.fim}" data-chg="diaHora" data-arg="${t}|fim">` : ''}</div>`; }).join('')}
   <button class="btn sec" data-act="diaReset">Voltar ao padrão</button> <a class="btn" href="#/alimentacao/hoje">Pronto</a></section>`;
};
function ovr() { const p = P(), x = hoje(); const o = p.override[x] || (p.override[x] = {}); if (!o.treinos) o.treinos = treinosDoDia(x).map(t => ({ ...t })); return o; }
ACT.diaAcordar = (_, el) => { ovr().acordar = el.value; salvar(); };
ACT.diaTreino = t => { const o = ovr(); const i = o.treinos.findIndex(z => z.tipo === t); if (i >= 0) o.treinos.splice(i, 1); else { const pd = P().treinos.find(z => z.tipo === t) || { ini: '21:00', fim: '21:30' }; o.treinos.push({ tipo: t, ini: pd.ini, fim: pd.fim }); } if (t === 'musculacao') D().musc = i < 0; salvar(); rerender(); };
ACT.diaHora = (a, el) => { const [t, c] = a.split('|'); const e = ovr().treinos.find(z => z.tipo === t); if (e) e[c] = el.value; salvar(); };
ACT.diaReset = () => { delete P().override[hoje()]; salvar(); rerender(); };

AV.cardapio = () => {
  const sem = semC(), c = card(sem);
  const dias = Array.from({ length: 7 }, (_, i) => soma(sem, i));
  return `<section class="card"><div class="nav-sem"><button data-act="semNav" data-arg="-7">‹</button><b>Semana de ${fmtData(sem)}</b><button data-act="semNav" data-arg="7">›</button></div>
   <button class="btn" data-act="cardSugerir">✨ Sugerir semana completa</button> <a class="btn sec" href="#/pdf/${sem}">📄 PDF pirata</a>
   <p class="peq">Escolha as receitas. As porções são calculadas para cada um (Ele e Ela) pela meta do dia. Os ingredientes vão automáticos para a lista semanal do supermercado.</p></section>
   ${dias.map(x => { const w = diaSem(x), cd = c[w] || {}; return `<details class="card" ${x === hoje() ? 'open' : ''}><summary><b>${DIAS_L[w]} ${dt(x).getDate()}/${dt(x).getMonth() + 1}</b> <small>${Object.values(cd).filter(Boolean).length}/5</small></summary>
     ${REFS.map(ref => { const k = REF_K[ref]; const sel = cd[k]; const ops = todasReceitas().filter(r => r.refeicao === ref).sort((a, b) => S.favoritas.includes(b.id) - S.favoritas.includes(a.id));
       return `<label class="ref-sel">${ref}<select data-chg="cardSet" data-arg="${w}|${k}"><option value="">—</option>${ops.map(r => `<option value="${r.id}" ${String(sel) === String(r.id) ? 'selected' : ''}>${S.favoritas.includes(r.id) ? '★ ' : ''}${esc(r.nome)}</option>`).join('')}</select></label>
       ${sel ? porcoesDois(receita(sel), x, k) : ''}`; }).join('')}</details>`; }).join('')}`;
};
function porcoesDois(r, x, k) {
  if (!r) return '';
  return `<div class="porcoes">${['ele', 'ela'].map(q => { const p = S.perfis[q], po = porcao(r, metaDia(x, p).kcal * DIST[k]); return `<span><b>${esc(p.nome)}</b> ${nf(po.n.kcal)} kcal · ${nf(po.n.proteina_g)} g prot.</span>`; }).join('')} <a href="#/alimentacao/receita/${r.id}">ver</a></div>`;
}
ACT.semNav = d => { semAtual = soma(semC(), Number(d)); rerender(); };
ACT.cardSet = (a, el) => { const [w, k] = a.split('|'); const c = card(); c[w] = c[w] || {}; c[w][k] = el.value || null; salvar(); rerender(); };
ACT.cardSugerir = () => {
  if (Object.keys(card()).length && !confirm('Substituir o cardápio desta semana?')) return;
  const c = {}; const seed = Number(semC().replace(/-/g, '')) % 97;
  for (let w = 0; w < 7; w++) { c[w] = {}; REFS.forEach(ref => { let ops = todasReceitas().filter(r => r.refeicao === ref); const fav = ops.filter(r => S.favoritas.includes(r.id)); if (fav.length >= 3) ops = fav.concat(ops); c[w][REF_K[ref]] = ops[(seed + w * 3 + REFS.indexOf(ref)) % ops.length].id; }); }
  S.cardapio[semC()] = c; salvar(); toast('Semana sugerida. Troque o que quiser.'); rerender();
};

/* -- receitas -- */
let recFiltro = 'Almoço', recBusca = '';
AV.receitas = () => {
  const lista = todasReceitas().filter(r => r.refeicao === recFiltro && (!recBusca || norm(r.nome).includes(norm(recBusca))));
  return `<section class="card"><div class="chips">${REFS.map(r => `<button class="${r === recFiltro ? 'on' : ''}" data-act="recFil" data-arg="${r}">${r.split(' /')[0]}</button>`).join('')}</div>
   <input class="campo" placeholder="Buscar receita" value="${esc(recBusca)}" data-chg="recBus"><a class="btn sec" href="#/alimentacao/nova">+ Adicionar minha receita</a></section>
   <section class="card">${lista.map(r => `<a class="lin" href="#/alimentacao/receita/${r.id}">${S.favoritas.includes(r.id) ? '★ ' : ''}${esc(r.nome)}<small>${r.tempo_min} min · ${nf(kcalReceita(r))} kcal ref.${r.minha ? ' · minha' : ''}</small></a>`).join('')}</section>`;
};
ACT.recFil = r => { recFiltro = r; rerender(); };
ACT.recBus = (_, el) => { recBusca = el.value; rerender(); };
let recModo = {}, recTemp = {};
AV.receita = id => {
  const r = receita(id); if (!r) return '<p>Receita não encontrada.</p>';
  const modo = recModo[id] ?? 0, tp = recTemp[id] ?? 0, m = r.modos[modo] || r.modos[0], T = DATA.temperos;
  const k = REF_K[r.refeicao], x = hoje();
  const po = ['ele', 'ela'].map(q => [S.perfis[q], porcao(r, metaDia(x, S.perfis[q]).kcal * DIST[k])]);
  return `<section class="card"><a href="#/alimentacao/receitas">‹ receitas</a><h2>${esc(r.nome)}</h2><p>${r.refeicao} · ${r.tempo_min} min ${r.sem_cebola ? '· sem cebola · sem açúcar' : ''}</p>
   <button class="btn sec" data-act="recFav" data-arg="${r.id}">${S.favoritas.includes(r.id) ? '★ Favorita' : '☆ Favoritar'}</button>
   ${r.temperos?.length ? `<h3>Tempero</h3><div class="chips">${r.temperos.map((t, i) => `<button class="${i === tp ? 'on' : ''}" data-act="recT" data-arg="${id}|${i}">${T[t].nome}</button>`).join('')}</div><p class="peq">${T[r.temperos[tp]].receita}</p>` : ''}
   <h3>Modo de preparo</h3><div class="chips">${r.modos.map((x, i) => `<button class="${i === modo ? 'on' : ''}" data-act="recM" data-arg="${id}|${i}">${x.modo}</button>`).join('')}</div><p>${m.como}</p>
   <h3>Passo a passo</h3><ol>${r.passos.map(s => `<li>${s}</li>`).join('')}</ol>
   ${r.dica ? `<p class="destaque-box">💡 ${r.dica}</p>` : ''}
   <h3>Quantidades de hoje</h3><div class="duas">${po.map(([p, x]) => `<div><b>${esc(p.nome)}</b><ul>${x.ings.map(i => `<li>${i.alimento}: ${fmtG(i.alimento, i.g)}</li>`).join('')}</ul><small>${nf(x.n.kcal)} kcal · P ${nf(x.n.proteina_g)} g · C ${nf(x.n.carbo_g)} g · G ${nf(x.n.gordura_g)} g · fibra ${nf(x.n.fibra_g)} g</small></div>`).join('')}</div>
   <p class="peq">Valores aproximados (tabela TACO). Industrializados: confira o rótulo.</p>
   ${r.minha ? `<button class="btn sec" data-act="recDel" data-arg="${r.id}">Excluir minha receita</button>` : ''}</section>`;
};
ACT.recM = a => { const [i, m] = a.split('|'); recModo[i] = Number(m); rerender(); };
ACT.recT = a => { const [i, m] = a.split('|'); recTemp[i] = Number(m); rerender(); };
ACT.recFav = id => { id = isNaN(id) ? id : Number(id); const f = S.favoritas, i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); salvar(); rerender(); };
ACT.recDel = id => { if (!confirm('Excluir esta receita?')) return; S.receitasMinhas = S.receitasMinhas.filter(r => String(r.id) !== String(id)); salvar(); location.hash = '#/alimentacao/receitas'; };

/* -- nova receita -- */
let nova = null;
AV.nova = () => {
  nova = nova || { nome: '', refeicao: 'Almoço', tempo_min: 30, ingredientes: [], passos: '', modos: [] };
  const A = ALIM(), n = nutriIngr(nova.ingredientes);
  const modos = ['Frigideira', 'Forno', 'Air fryer', 'Panela de pressão', 'Panela comum', 'Micro-ondas', 'Liquidificador', 'Grill elétrico', 'Sem fogo'];
  return `<section class="card"><h2>Minha receita</h2>
   <input class="campo" placeholder="Nome" value="${esc(nova.nome)}" data-chg="novaC" data-arg="nome">
   <label>Refeição<select data-chg="novaC" data-arg="refeicao">${REFS.map(r => `<option ${r === nova.refeicao ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
   <label>Tempo (min)<input type="number" class="campo" value="${nova.tempo_min}" data-chg="novaC" data-arg="tempo_min"></label>
   <h3>Ingredientes (porção para 1 pessoa)</h3>
   ${nova.ingredientes.map((i, k) => `<div class="item">${esc(i.alimento)} · ${i.g} g <button class="lnk" data-act="novaRm" data-arg="${k}">remover</button></div>`).join('')}
   <div class="linha"><input list="alims" id="nAl" class="campo" placeholder="Alimento"><input id="nG" type="number" class="campo curto" placeholder="g"><button class="btn" data-act="novaAdd">+</button></div>
   <datalist id="alims">${Object.keys(A).map(a => `<option value="${esc(a)}">`).join('')}</datalist>
   <p class="peq">Não achou o alimento? <a href="#/alimentacao/alimento">cadastre com os valores do rótulo</a>.</p>
   <p><b>${nf(n.kcal)} kcal</b> · P ${nf(n.proteina_g)} g · C ${nf(n.carbo_g)} g · G ${nf(n.gordura_g)} g</p>
   <h3>Modos de preparo</h3>${modos.map(m => { const e = nova.modos.find(z => z.modo === m); return `<div class="item">${chk(!!e, 'novaModo', m, m)}${e ? `<textarea class="campo" data-chg="novaModoTxt" data-arg="${m}" placeholder="Como fazer neste modo">${esc(e.como)}</textarea>` : ''}</div>`; }).join('')}
   <h3>Passo a passo</h3><textarea class="campo alto" data-chg="novaC" data-arg="passos" placeholder="Um passo por linha">${esc(nova.passos)}</textarea>
   <button class="btn" data-act="novaSalvar">Salvar receita</button></section>`;
};
ACT.novaC = (c, el) => { nova[c] = c === 'tempo_min' ? Number(el.value) : el.value; };
ACT.novaAdd = () => { const a = document.getElementById('nAl').value.trim(), g = Number(document.getElementById('nG').value); if (!ALIM()[a]) return toast('Alimento não cadastrado'); if (!(g > 0)) return toast('Informe os gramas'); nova.ingredientes.push({ alimento: a, g }); rerender(); };
ACT.novaRm = k => { nova.ingredientes.splice(k, 1); rerender(); };
ACT.novaModo = m => { const i = nova.modos.findIndex(z => z.modo === m); if (i >= 0) nova.modos.splice(i, 1); else nova.modos.push({ modo: m, como: '' }); rerender(); };
ACT.novaModoTxt = (m, el) => { nova.modos.find(z => z.modo === m).como = el.value; };
ACT.novaSalvar = () => {
  if (!nova.nome || !nova.ingredientes.length) return toast('Preencha nome e ingredientes');
  const r = { id: 'm' + Date.now(), nome: nova.nome, refeicao: nova.refeicao, tempo_min: nova.tempo_min, ingredientes: nova.ingredientes,
    passos: nova.passos.split('\n').filter(Boolean), modos: nova.modos.length ? nova.modos : [{ modo: 'Livre', como: '' }], temperos: [], dica: '', minha: true, porcao_referencia: nutriIngr(nova.ingredientes) };
  S.receitasMinhas.push(r); nova = null; salvar(); toast('Receita salva'); location.hash = '#/alimentacao/receita/' + r.id;
};
AV.alimento = () => `<section class="card"><h2>Novo alimento</h2><p class="peq">Use os valores por 100 g do rótulo.</p>
  ${['nome', 'kcal', 'proteina_g', 'carbo_g', 'gordura_g', 'fibra_g'].map(c => `<input id="al_${c}" class="campo" placeholder="${c}" ${c !== 'nome' ? 'type="number" step="0.1"' : ''}>`).join('')}
  <button class="btn" data-act="alSalvar">Salvar</button></section>`;
ACT.alSalvar = () => { const g = c => document.getElementById('al_' + c).value; const n = g('nome').trim(); if (!n) return; S.alimentosEdit[n] = { kcal: +g('kcal') || 0, proteina_g: +g('proteina_g') || 0, carbo_g: +g('carbo_g') || 0, gordura_g: +g('gordura_g') || 0, fibra_g: +g('fibra_g') || 0 }; salvar(); toast('Alimento salvo'); history.back(); };

AV.temperos = () => `<section class="card"><h2>Temperos caseiros</h2><p class="peq">Sem cebola, sem açúcar e com pouco sal.</p>${Object.values(DATA.temperos).map(t => `<div class="verbete"><b>${t.nome}</b><p>${t.receita}</p><small>Combina com: ${t.combina}</small></div>`).join('')}</section>`;
AV.aprender = () => `<section class="card"><h2>Aprender</h2>${Object.entries(DATA.aprender).map(([k, v]) => `<details><summary><b>${k}</b></summary><p>${v}</p></details>`).join('')}</section>
 <section class="card"><h3>Alimentos (por 100 g)</h3><input class="campo" placeholder="Buscar alimento" data-chg="alBus" value="${esc(alBusca)}">
 <table class="tab"><tr><th>Alimento</th><th>kcal</th><th>P</th><th>C</th><th>G</th><th>Fibra</th></tr>${Object.entries(ALIM()).filter(([n]) => !alBusca || norm(n).includes(norm(alBusca))).map(([n, v]) => `<tr><td>${n}${etiqueta(n, v)}</td><td>${nf(v.kcal)}</td><td>${nf(v.proteina_g, 1)}</td><td>${nf(v.carbo_g, 1)}</td><td>${nf(v.gordura_g, 1)}</td><td>${nf(v.fibra_g, 1)}</td></tr>`).join('')}</table>
 <p class="peq">Valores aproximados da TACO (Unicamp). 🟢 sempre · 🟡 moderação (calórico ou carboidrato com pouca fibra).</p></section>`;
let alBusca = ''; ACT.alBus = (_, el) => { alBusca = el.value; rerender(); };
function etiqueta(n, v) { if (v.kcal === 0) return ''; const mod = v.kcal > 350 || (v.carbo_g > 20 && v.fibra_g < 2.5); return mod ? ' 🟡' : ' 🟢'; }

/* -- metas e progresso -- */
AV.progresso = () => {
  const p = P(), m = metaDia(hoje()), pes = p.pesagens;
  return `<section class="card"><h2>Metas de ${esc(p.nome)}</h2><p>${OBJ[p.objetivo][1]} · média da semana <b>${mediaSemana(p)} kcal</b> · proteína <b>${m.prot} g/dia</b></p>
   <p class="peq">Gasto estimado: equação de Mifflin-St Jeor + gasto de cada treino do dia. Margem de erro de ~10%: por isso o ajuste pela balança.</p>
   <h3>Registrar peso</h3><div class="linha"><input id="pPeso" type="number" step="0.1" class="campo" placeholder="kg"><input id="pCint" type="number" step="0.5" class="campo" placeholder="cintura cm (opcional)"><button class="btn" data-act="pesar">Salvar</button></div>
   ${pes.length ? `<table class="tab"><tr><th>Data</th><th>Peso</th><th>Cintura</th></tr>${pes.slice().reverse().map(x => `<tr><td>${fmtData(x.data)}</td><td>${x.peso} kg</td><td>${x.cint || '—'}</td></tr>`).join('')}</table>` : ''}
   <p>Ajuste automático atual: <b>${p.ajusteKcal > 0 ? '+' : ''}${p.ajusteKcal} kcal/dia</b></p></section>`;
};
ACT.pesar = () => {
  const p = P(), kg = Number(document.getElementById('pPeso').value), c = Number(document.getElementById('pCint').value) || null;
  if (!(kg > 30)) return toast('Peso inválido');
  p.pesagens.push({ data: hoje(), peso: kg, cint: c }); p.peso = kg;
  const ant = p.pesagens.filter(x => x.data <= soma(hoje(), -21)).pop();
  if (ant) { const sem = (dt(hoje()) - dt(ant.data)) / 6048e5, taxa = (kg - ant.peso) / ant.peso / sem * 100;
    if (p.objetivo === 'perder' && taxa > -.2) p.ajusteKcal -= 100; if (p.objetivo === 'perder' && taxa < -1) p.ajusteKcal += 100;
    if (p.objetivo === 'recomp' && taxa < -.5) p.ajusteKcal += 100; if (p.objetivo === 'recomp' && taxa > .5) p.ajusteKcal -= 100; }
  salvar(); toast('Peso registrado'); rerender();
};

/* -- PDF pirata (impressão) -- */
const CAT = [['Proteínas', /frango|patinho|acém|lombo|peru|salmão|tilápia|atum|ovo/], ['Laticínios', /leite desn|iogurte|queijo|cottage|ricota|muçarela/], ['Grãos e cereais', /arroz|feijão|grão|lentilha|ervilha|quinoa|aveia|pão|tapioca|flocão|fubá|macarrão|tortilha|biscoito|granola/], ['Frutas', /banana|maçã|mamão|morango|frutas|kiwi|abacate|limão/], ['Despensa', /azeite|pasta|castanha|nozes|chia|tahine|coco|cacau|mostarda|molho|ervas|canela/], ['Suplementos', /whey/], ['Hortifrúti', /./]];
const categoria = n => CAT.find(([, re]) => re.test(n))[0];
function listaSemana(sem) {
  const c = S.cardapio[sem] || {}, tot = {};
  for (let w = 0; w < 7; w++) { const x = soma(sem, (w + 6) % 7), cd = c[diaSem(x)] || {};
    Object.entries(cd).forEach(([k, id]) => { const r = receita(id); if (!r) return;
      ['ele', 'ela'].forEach(q => porcao(r, metaDia(x, S.perfis[q]).kcal * DIST[k]).ings.forEach(i => { let n = i.alimento, g = i.g; if (n === 'molho de tomate caseiro') { n = 'tomate'; g = g * 1.3; } tot[n] = (tot[n] || 0) + g; })); }); }
  return tot;
}
function qtdTxt(n, g) {
  if (n === 'ovo') return Math.ceil(g / 50) + ' un. (' + nf(Math.ceil(g / 50) / 12, 1) + ' dz)';
  if (n === 'ervas e especiarias' || n === 'canela') return 'repor';
  if (/leite desn/.test(n)) return nf(Math.ceil(g / 100) / 10, 1) + ' L';
  return g >= 1000 ? nf(Math.ceil(g / 100) / 10, 1) + ' kg' : Math.ceil(g / 10) * 10 + ' g';
}
V.pdf = (sem) => {
  sem = sem || semC(); const c = S.cardapio[sem] || {}, tot = listaSemana(sem);
  const linhas = [1, 2, 3, 4, 5, 6, 0].map(w => { const x = soma(sem, (w + 6) % 7), cd = c[w] || {}; const tr = treinosDoDia(x).map(t => NOMES_TREINO[t.tipo] + ' ' + t.ini).join(', ') || 'Descanso';
    return `<tr><td><b>${DIAS[w]}</b><small>${tr}</small></td>${Object.keys(DIST).map(k => `<td>${receita(cd[k])?.nome || '—'}</td>`).join('')}</tr>`; }).join('');
  const grupos = {}; Object.entries(tot).forEach(([n, g]) => (grupos[categoria(n)] = grupos[categoria(n)] || []).push([n, g]));
  const me = metaDia(soma(sem, 0), S.perfis.ele), ma = metaDia(soma(sem, 0), S.perfis.ela);
  return `<div class="pdf-barra"><a href="#/alimentacao/cardapio" class="btn sec">‹ Voltar</a><button class="btn" data-act="imprimir">📄 Salvar em PDF</button><small>No celular: Compartilhar/Imprimir → “Salvar como PDF”.</small></div>
  <div class="folha"><div class="fcab"><img src="img/logo.png"><div><h1>Cardápio da Semana</h1><p>Semana de ${fmtData(sem)} · ${S.perfis.ele.nome}: ~${mediaSemana(S.perfis.ele)} kcal / ${me.prot} g prot. · ${S.perfis.ela.nome}: ~${mediaSemana(S.perfis.ela)} kcal / ${ma.prot} g prot.</p></div></div>
   <div class="fpainel"><table><tr><th>Dia</th><th>Café da manhã</th><th>Almoço</th><th>Lanche / pré-treino</th><th>Jantar</th><th>Ceia</th></tr>${linhas}</table>
   <p class="frod">Porções de cada um no app · sem cebola · sem açúcar adicionado · creatina 3–5 g/dia</p></div></div>
  <div class="folha"><div class="fcab"><img src="img/logo.png"><div><h1>Lista de Compras</h1><p>Tudo para a semana · quantidades somadas para os dois</p></div></div>
   <div class="fpainel col3">${Object.entries(grupos).map(([gname, its]) => `<div class="fgrupo"><h4>${gname}</h4>${its.sort().map(([n, g]) => `<div class="fit"><span>☐ ${n}</span><b>${qtdTxt(n, g)}</b></div>`).join('')}</div>`).join('') || '<p>Monte o cardápio para gerar a lista.</p>'}</div></div>`;
};
ACT.imprimir = () => window.print();
