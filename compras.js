/* ===== SUPERMERCADO ===== */
const COM_ABAS = [['casa-mes', '🏠 Mensal'], ['mercado-mes', '🛒 Mensal'], ['casa-sem', '🏠 Semanal'], ['mercado-sem', '🛒 Semanal']];
V.compras = (sub = 'casa-mes') => `<div class="escuro verde compras">${topo('Supermercado')}${abas('compras', COM_ABAS, sub)}${(CV[sub] || CV['casa-mes'])()}</div>`;
const CV = {};
const mesC = () => { const m = mes(hoje()); return S.compras.mensal[m] || (S.compras.mensal[m] = { itens: [] }); };

CV['casa-mes'] = () => {
  const L = mesC().itens;
  return `<section class="card"><h2>Em casa · o que está faltando (mês)</h2><p class="peq">Digite o que falta. Vira a lista da compra mensal. Cada mês começa em branco: nada fica gravado para o mês seguinte.</p>
   <div class="linha"><input id="cmNome" class="campo" placeholder="Ex.: Arroz integral" onkeydown="if(event.key==='Enter')ACT.cmAdd()"><button class="btn" data-act="cmAdd">+</button></div>
   ${L.map((i, k) => `<div class="item">${esc(i.nome)} <button class="lnk" data-act="cmRm" data-arg="${k}">remover</button></div>`).join('') || '<p class="peq">Lista vazia.</p>'}
   ${L.length ? `<a class="btn" href="#/compras/mercado-mes">Ir para a compra (${L.length} itens) ›</a>` : ''}</section>`;
};
ACT.cmAdd = () => { const el = document.getElementById('cmNome'); const n = el.value.trim(); if (!n) return; mesC().itens.push({ nome: n, qtd: 1, preco: 0, ok: false }); salvar(); rerender(); setTimeout(() => document.getElementById('cmNome')?.focus(), 50); };
ACT.cmRm = k => { mesC().itens.splice(k, 1); salvar(); rerender(); };

function listaMercado(itens, pref, extra = () => '') {
  const ord = itens.map((i, k) => [i, k]).sort((a, b) => a[0].ok - b[0].ok);
  const total = itens.reduce((a, i) => a + (i.ok ? i.qtd * i.preco : 0), 0), prev = itens.reduce((a, i) => a + i.qtd * i.preco, 0);
  return `${ord.map(([i, k]) => `<div class="merc ${i.ok ? 'ok' : ''}">
     <button class="mchk" data-act="${pref}Ok" data-arg="${k}">${i.ok ? '✓' : ''}</button>
     <div class="mnome">${esc(i.nome)}${extra(i)}</div>
     <div class="mqtd"><button data-act="${pref}Q" data-arg="${k}|-1">−</button><b>${i.qtd}</b><button data-act="${pref}Q" data-arg="${k}|1">+</button></div>
     <label class="mpreco">R$<input type="number" inputmode="decimal" step="0.01" value="${i.preco || ''}" placeholder="0,00" data-chg="${pref}P" data-arg="${k}"></label>
     <div class="msub">${i.preco ? `${i.qtd} × ${br(i.preco)} = <b>R$ ${br(i.qtd * i.preco)}</b>` : ''}</div></div>`).join('') || '<p class="peq">Lista vazia.</p>'}
   <div class="total-fixo">🛒 No carrinho: <b>R$ ${br(total)}</b>${prev > total ? `<small>previsto R$ ${br(prev)}</small>` : ''}</div>`;
}
CV['mercado-mes'] = () => `<section class="card"><h2>No mercado · compra mensal</h2><p class="peq">Toque no quadrado ao pegar · ajuste a quantidade · digite o preço da unidade.</p></section>
  ${listaMercado(mesC().itens, 'mm')}<section class="card"><button class="btn sec" data-act="mmLimpar">Nova compra (limpar lista)</button></section>`;
ACT.mmOk = k => { const i = mesC().itens[k]; i.ok = !i.ok; salvar(); rerender(); };
ACT.mmQ = a => { const [k, d] = a.split('|').map(Number); const i = mesC().itens[k]; i.qtd = Math.max(1, i.qtd + d); salvar(); rerender(); };
ACT.mmP = (k, el) => { mesC().itens[k].preco = parseFloat(String(el.value).replace(',', '.')) || 0; salvar(); rerender(); };
ACT.mmLimpar = () => { if (confirm('Limpar a lista do mês?')) { S.compras.mensal[mes(hoje())] = { itens: [] }; salvar(); rerender(); } };

/* semanal: sai do cardápio */
const semCompra = () => semPlan();
let semCmp = null;
function semReg(sem) { return S.compras.semanal[sem] || (S.compras.semanal[sem] = { tenho: {}, itens: {}, extras: [] }); }
function itensSemana(sem) {
  const tot = listaSemana(sem), reg = semReg(sem);
  return Object.entries(tot).sort((a, b) => categoria(a[0]).localeCompare(categoria(b[0])) || a[0].localeCompare(b[0])).map(([n, g]) => ({ nome: n, g, cat: categoria(n), tenho: !!reg.tenho[n] }));
}
function navSemC() { const s = semCmp || semCompra(); return `<div class="nav-sem"><button data-act="scNav" data-arg="-7">‹</button><b>Semana de ${fmtData(s)}</b><button data-act="scNav" data-arg="7">›</button></div>`; }
ACT.scNav = d => { semCmp = soma(semCmp || semCompra(), Number(d)); rerender(); };
CV['casa-sem'] = () => {
  const s = semCmp || semCompra(), its = itensSemana(s);
  let cat = '';
  return `<section class="card"><h2>Em casa · semana</h2>${navSemC()}<p class="peq">Lista automática do <a href="#/alimentacao/cardapio">cardápio</a> (porções dos dois somadas). Marque o que <b>já tem em casa</b>; o resto vai para a compra.</p>
   ${its.map(i => (i.cat !== cat ? `<h3>${cat = i.cat}</h3>` : '') + chk(i.tenho, 'csTenho', i.nome, i.nome, (i.tenho ? 'já tenho · ' : 'precisa: ') + qtdTxt(i.nome, i.g))).join('') || '<p>Monte o cardápio da semana para gerar a lista.</p>'}
   <h3>Outros itens da semana</h3><div class="linha"><input id="csExtra" class="campo" placeholder="Ex.: detergente"><button class="btn" data-act="csExtra">+</button></div>
   ${semReg(s).extras.map((e, k) => `<div class="item">${esc(e)} <button class="lnk" data-act="csExRm" data-arg="${k}">remover</button></div>`).join('')}
   <a class="btn" href="#/compras/mercado-sem">Ir para a compra ›</a></section>`;
};
ACT.csTenho = n => { const r = semReg(semCmp || semCompra()); r.tenho[n] = !r.tenho[n]; salvar(); rerender(); };
ACT.csExtra = () => { const v = document.getElementById('csExtra').value.trim(); if (!v) return; semReg(semCmp || semCompra()).extras.push(v); salvar(); rerender(); };
ACT.csExRm = k => { semReg(semCmp || semCompra()).extras.splice(k, 1); salvar(); rerender(); };
function itensMercadoSem() {
  const s = semCmp || semCompra(), reg = semReg(s);
  const nomes = itensSemana(s).filter(i => !i.tenho).map(i => [i.nome, i.g]).concat(reg.extras.map(e => [e, null]));
  return nomes.map(([n, g]) => { const r = reg.itens[n] || (reg.itens[n] = { qtd: 1, preco: S.compras.precos[n] || 0, ok: false }); r.nome = n; r.g = g; return r; });
}
CV['mercado-sem'] = () => { const its = itensMercadoSem(); salvar();
  return `<section class="card"><h2>No mercado · semana</h2>${navSemC()}<p class="peq">Quantidade = pacotes/unidades que você pega. O preço da semana anterior já vem preenchido.</p></section>
  ${listaMercado(its, 'ms', i => i.g ? `<small>precisa ${qtdTxt(i.nome, i.g)}</small>` : '')}`; };
const msItem = k => itensMercadoSem()[k];
ACT.msOk = k => { const i = msItem(k); i.ok = !i.ok; salvar(); rerender(); };
ACT.msQ = a => { const [k, d] = a.split('|').map(Number); const i = msItem(k); i.qtd = Math.max(1, i.qtd + d); salvar(); rerender(); };
ACT.msP = (k, el) => { const i = msItem(k); i.preco = parseFloat(String(el.value).replace(',', '.')) || 0; S.compras.precos[i.nome] = i.preco; salvar(); rerender(); };

/* ===== CONFIGURAÇÕES, BACKUP, COMPARTILHAR, IA ===== */
V.config = () => {
  const p = P();
  const campo = (c, n, t = 'number') => `<label>${n}<input type="${t}" class="campo" value="${esc(p[c])}" data-chg="cfg" data-arg="${c}"></label>`;
  return `<div class="escuro">${topo('Configurações')}
  <section class="card"><h2>Perfil ativo: ${esc(p.nome)}</h2><p class="peq">Cada celular guarda os dois perfis (para o cardápio calcular as porções de vocês dois). Use o botão 👤 para trocar.</p>
   ${campo('nome', 'Nome', 'text')}<label>Sexo<select data-chg="cfg" data-arg="sexo"><option value="M" ${p.sexo === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${p.sexo === 'F' ? 'selected' : ''}>Feminino</option></select></label>
   ${campo('idade', 'Idade')}${campo('peso', 'Peso (kg)')}${campo('altura', 'Altura (cm)')}
   <label>Objetivo<select data-chg="cfg" data-arg="objetivo">${Object.entries(OBJ).map(([k, v]) => `<option value="${k}" ${p.objetivo === k ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></label>
   ${campo('acordar', 'Acordo normalmente às', 'time')}${campo('dormir', 'Durmo às', 'time')}
   <label>Restrições e observações<textarea class="campo" data-chg="cfg" data-arg="restricoes">${esc(p.restricoes)}</textarea></label></section>
  <section class="card"><h2>Treinos da semana (padrão)</h2><p class="peq">Musculação com professor: deixe sem dias fixos e marque no dia (Alimentação › Hoje › ajustar o dia).</p>
   ${p.treinos.map((t, i) => `<div class="treino-cfg"><b>${NOMES_TREINO[t.tipo]}</b><div class="dias">${[1, 2, 3, 4, 5, 6, 0].map(w => `<button class="dia ${t.dias.includes(w) ? 'on' : ''}" data-act="cfgDia" data-arg="${i}|${w}">${DIAS[w]}</button>`).join('')}</div>
     <input type="time" value="${t.ini}" data-chg="cfgHora" data-arg="${i}|ini"> às <input type="time" value="${t.fim}" data-chg="cfgHora" data-arg="${i}|fim"></div>`).join('')}</section>
  <section class="card"><h2>💾 Backup</h2><p class="peq">Os dados ficam só neste navegador. Limpar os dados do navegador, trocar de celular ou usar aba anônima apaga tudo. Faça backup toda semana e guarde no Google Drive ou no WhatsApp.</p>
   <p>Último backup: <b>${S.backup ? fmtData(S.backup) : 'nunca'}</b></p>
   <button class="btn" data-act="backup">Exportar backup</button> <label class="btn sec">Importar backup<input type="file" accept=".json,application/json" hidden data-chg="importar"></label></section>
  <section class="card"><h2>📲 Enviar para o outro celular</h2><p class="peq">Gera um arquivo com o cardápio, as listas de compras e as suas receitas. Mande pelo WhatsApp; no outro celular, use “Importar” abaixo.</p>
   <button class="btn" data-act="compartilhar">Enviar cardápio e listas</button> <label class="btn sec">Importar do outro celular<input type="file" accept=".json,application/json" hidden data-chg="importarComp"></label></section>
  <section class="card"><h2>🤖 Copiar para a IA</h2><p class="peq">Junta o resumo da semana num texto para colar no Claude ou no ChatGPT.</p><button class="btn" data-act="copiarIA">Copiar resumo da semana</button></section>
  <section class="card peq">App de Treino · versão 1.0 · dados locais · conteúdo: SKIF/Kanazawa (katas), Nippon Budōkan/JKF/JKA (termos), ISSN, ACSM, ADA, Cochrane, TACO.</section></div>`;
};
ACT.cfg = (c, el) => { const p = P(); p[c] = ['idade', 'peso', 'altura'].includes(c) ? Number(el.value) : el.value; salvar(); };
ACT.cfgDia = a => { const [i, w] = a.split('|').map(Number); const d = P().treinos[i].dias, k = d.indexOf(w); if (k >= 0) d.splice(k, 1); else d.push(w); salvar(); rerender(); };
ACT.cfgHora = (a, el) => { const [i, c] = a.split('|'); P().treinos[i][c] = el.value; salvar(); };
function baixar(nome, obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  const file = new File([blob], nome, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: nome }).catch(() => {});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
ACT.backup = () => { S.backup = hoje(); salvar(); baixar(`backup-app-treino-${S.ativo}-${hoje()}.json`, { tipo: 'backup', S }); rerender(); };
function lerArquivo(el, fn) { const f = el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { fn(JSON.parse(r.result)); } catch (e) { toast('Arquivo inválido'); } }; r.readAsText(f); }
ACT.importar = (_, el) => lerArquivo(el, j => { if (j.tipo !== 'backup') return toast('Não é um backup'); if (!confirm('Substituir todos os dados deste celular pelo backup?')) return; S = j.S; delete S.novo; salvar(); toast('Backup restaurado'); location.hash = '#/'; render(); });
ACT.compartilhar = () => baixar(`cardapio-e-listas-${hoje()}.json`, { tipo: 'compartilhado', cardapio: S.cardapio, compras: S.compras, receitasMinhas: S.receitasMinhas, favoritas: S.favoritas });
ACT.importarComp = (_, el) => lerArquivo(el, j => {
  if (j.tipo !== 'compartilhado') return toast('Arquivo não é de compartilhamento');
  Object.assign(S.cardapio, j.cardapio); Object.assign(S.compras.semanal, j.compras.semanal); Object.assign(S.compras.mensal, j.compras.mensal); Object.assign(S.compras.precos, j.compras.precos);
  j.receitasMinhas.forEach(r => { if (!S.receitasMinhas.find(x => x.id === r.id)) S.receitasMinhas.push(r); });
  j.favoritas.forEach(f => { if (!S.favoritas.includes(f)) S.favoritas.push(f); });
  salvar(); toast('Cardápio e listas importados');
});
ACT.copiarIA = () => {
  const p = P(), s = semana(hoje()); const L = [];
  L.push(`Resumo da semana de ${fmtData(s)} — ${p.nome}, ${p.idade} anos, ${p.peso} kg, ${p.altura} cm, objetivo: ${OBJ[p.objetivo][1]}. ${p.restricoes}`);
  for (let i = 0; i < 7; i++) { const x = soma(s, i); if (x > hoje()) break; const d = p.dias[x] || {};
    L.push(`${fmtData(x)}: treinos ${treinosDoDia(x).map(t => NOMES_TREINO[t.tipo]).join(', ') || 'descanso'}; along. antes ${d.alA ? 'sim' : 'não'}, depois ${d.alD ? 'sim' : 'não'}; kata ${d.kata || 0}/10; yoga ${d.yoga ? 'sim' : 'não'}; natação ${d.nat ? 'sim' : 'não'}; musculação ${d.musc ? 'sim' : 'não'}; chás ${(d.chaManha ? 1 : 0) + (d.chaNoite ? 1 : 0)}/2`); }
  const k = p.kumite[s] || {}; L.push(`Kumite: sanbon ${k.sanbon || 0}/10, kihon ${k.kihon || 0}/10, jiyu ${k.jiyu || 0}/10, livre ${k.lutei ? 'sim' : 'não'}.`);
  if (p.dominio) { const m = metaDominio(p.dominio); L.push(`Domínio do kata ${p.dominio.kata}: ${nf(m.pct)}%.`); }
  const c = S.cardapio[s] || {}; L.push('Cardápio: ' + Object.entries(c).map(([w, cd]) => DIAS[w] + ': ' + Object.values(cd).map(id => receita(id)?.nome).filter(Boolean).join(' / ')).join(' | '));
  L.push(`Meta média: ${mediaSemana(p)} kcal/dia, ${metaDia(hoje()).prot} g de proteína. Pesagens: ${p.pesagens.slice(-3).map(x => x.data + ' ' + x.peso + 'kg').join(', ') || 'nenhuma'}.`);
  if (S.pendentes.length) L.push('Palavras pendentes no dicionário de karatê: ' + S.pendentes.join(', '));
  L.push('Use só fontes de universidades de ponta e evidências fortes (meta-análises, revisões, consensos). Para karatê, priorize a SKIF.');
  const t = L.join('\n');
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copiado! Cole na IA.')).catch(() => modal(`<textarea class="campo alto">${esc(t)}</textarea>`));
};

/* ===== partida ===== */
carregar();
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
setTimeout(() => { try { agendarAvisos(); } catch (e) {} }, 1500);
