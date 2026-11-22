/* ===== MUSCULAÇÃO ===== */
V.musculacao = () => menuArte('musc_menu.jpg', 900, 1599, [['#/musculacao/mapa', 8.5, 42.6, 83.1, 13, 'Mapa muscular'], ['#/musculacao/sabado', 8.5, 57.7, 83.1, 13.6, 'Treino de sábado'], ['#/musculacao/semana', 8.5, 73.3, 83.1, 13.6, 'Meta da semana']], '#/', 'Musculação');
const JM = (t, k, c) => janela('musc_menu.jpg', t, k, '#/musculacao', c);
V['musculacao/mapa'] = () => {
  const reg = window.musRegistrando;
  const grupos = [1, 2, 3].map(pr => `<h3>${['', '🔴 Essenciais para o karatê', '🟠 Importantes', '⚪ Gerais'][pr]}</h3>${musculos().filter(m => m.prioridade === pr).map(m => `<button class="tag p${pr}" data-act="musInfo" data-arg="${m.id}">${esc(m.nome)}${m.profundo ? ' ·prof.' : ''}${m.extra ? ' ✎' : ''}</button>`).join('')}`).join('');
  return JM('Mapa Muscular', '筋肉図', `<div class="washi"><p class="peq">Foco em <b>entender</b>: o treino é do seu professor. Toque num músculo para ver a função no karatê e como treinar sem encurtar. Tracejado = músculo profundo.</p>
   ${reg ? '<p class="destaque-box">📍 Toque no mapa, no ponto onde fica o músculo novo. Troque a vista (frente, costas, lado) se precisar.</p><button class="btn sec" data-act="musCancelar">Cancelar</button>' : '<button class="btn" data-act="musNovo">+ Registrar músculo novo</button>'}
   <div data-act="mapaToque">${mapa([], { todos: true, vista: 'frente' })}</div>${grupos}</div>
   <div class="washi peq"><b>Regras que valem sempre:</b> amplitude completa · descida lenta (2–3 s) · subida rápida · nada que carregue a patela.<br><br><b>Pesquisa:</b> musculação com amplitude completa melhora a flexibilidade tanto quanto o alongamento (meta-análises de 2021 e 2023); o treino excêntrico aumenta o comprimento das fibras do posterior da coxa; no karatê de elite, a velocidade pesa mais que a força máxima.</div>`);
};
ACT.musNovo = () => { window.musRegistrando = true; rerender(); };
ACT.musCancelar = () => { window.musRegistrando = false; rerender(); };
ACT.mapaToque = (_, el, ev) => {
  if (!window.musRegistrando) { const e = ev.target.closest('ellipse'); if (e && e.dataset.id) ACT.musInfo(e.dataset.id); return; }
  const svg = el.querySelector('svg'); const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse()); if (ev.target.closest('.mapa-tabs')) { const b = ev.target.closest('button'); if (b) ACT.mapaVista(b.dataset.arg, b); return; }
  const vista = Object.entries(VISTAS).find(([, v]) => p.x >= v[0] && p.x <= v[0] + v[2])?.[0] || 'frente';
  window.musPonto = { x: Math.round(p.x), y: Math.round(p.y), vista };
  modal(`<h3>Novo músculo</h3><p class="peq">Ponto marcado na vista <b>${vista}</b>.</p>
   <input id="mNome" class="campo" placeholder="Nome (ex.: Braquiorradial)"><input id="mTec" class="campo" placeholder="Nome técnico (opcional)">
   <label>Prioridade no karatê<select id="mPri"><option value="1">🔴 Essencial</option><option value="2" selected>🟠 Importante</option><option value="3">⚪ Geral</option></select></label>
   <label>Tamanho da marcação<select id="mTam"><option value="18">Pequeno</option><option value="30" selected>Médio</option><option value="45">Grande</option></select></label>
   <label class="linha"><input type="checkbox" id="mProf"> Músculo profundo</label>
   <textarea id="mFun" class="campo" placeholder="Função no karatê"></textarea><textarea id="mCom" class="campo" placeholder="Como treinar sem encurtar"></textarea>
   <button class="btn" data-act="musSalvar">Salvar músculo</button>`);
};
ACT.musSalvar = () => {
  const g = i => document.getElementById(i), n = g('mNome').value.trim(); if (!n) return toast('Digite o nome'); const t = +g('mTam').value, p = window.musPonto;
  S.musculosExtra.push({ id: 'x' + Date.now(), nome: n, tecnico: g('mTec').value.trim(), vista: p.vista, prioridade: +g('mPri').value, profundo: g('mProf').checked,
    funcao_karate: g('mFun').value.trim() || '—', como_treinar: g('mCom').value.trim() || '—', area: [[p.x, p.y, Math.round(t * .8), t]], extra: true });
  window.musRegistrando = false; salvar(); ACT.fecharModal(); toast('Músculo registrado'); rerender();
};
ACT.musDel = id => { if (!confirm('Apagar este músculo?')) return; S.musculosExtra = S.musculosExtra.filter(m => m.id !== id); salvar(); ACT.fecharModal(); rerender(); };
V['musculacao/sabado'] = () => {
  const d = D(), sb = DATA.sabado;
  return JM('Treino de Sábado', '土曜', `<div class="washi"><p><b>Explosão, panturrilhas e core</b></p><ul class="peq">${sb.regras.map(r => `<li>${r}</li>`).join('')}</ul><button class="btn sec" data-act="alTimer" data-arg="90">⏱️ Descanso 90 s</button></div>
   ${sb.blocos.filter(b => b.bloco !== 'Volta à calma' && b.bloco !== 'Aquecimento').map(b => { const i = sb.blocos.indexOf(b); return `<div class="washi">${chk((d.sab || {})[i], 'sabItem', i, esc(b.exercicio), b.bloco + (b.series ? ' · ' + b.series : ''))}
     <details><summary class="lnk">ver músculos</summary>${mapa(b.musculos)}${nomesMus(b.musculos)}</details></div>`; }).join('')}
   <div class="washi">${chk(d.musc, 'muscHoje', '', '✅ Treino de sábado concluído')}</div>`);
};
ACT.sabItem = i => { const d = D(); d.sab = d.sab || {}; d.sab[i] = !d.sab[i]; salvar(); rerender(); };
ACT.muscHoje = () => { const d = D(); d.musc = !d.musc; salvar(); rerender(); };
V['musculacao/semana'] = () => {
  const s = semana(hoje()); let n = 0, l = '';
  for (let i = 0; i < 7; i++) { const x = soma(s, i), v = (S.dias[x] || {}).musc; if (v) n++; l += `<div class="item">${fmtData(x)}<span>${v ? '✅' : ''}</span></div>`; }
  return JM('Meta da Semana', '目標', `<div class="washi"><h2>${n}/3 treinos</h2>${barra(n / 3 * 100)}<p class="peq">2 aulas com o professor + o treino de sábado.</p>${chk(D().musc, 'muscHoje', '', 'Treinei musculação hoje')}${l}</div>`);
};

/* ===== NATAÇÃO ===== */
V.natacao = () => menuArte('nat_menu.jpg', 900, 1470, [['#/natacao/hoje', 10.7, 34.3, 78, 10.6, 'Hoje'], ['#/natacao/dicionario', 10.7, 45.9, 78, 10.6, 'Dicionário'], ['#/natacao/estilos', 10.7, 57.4, 78, 10.9, 'Estilos'], ['#/natacao/caderno', 10.7, 69.3, 78, 11.1, 'Caderno do professor'], ['#/natacao/marcos', 10.7, 81.5, 78, 11.2, 'Marcos']], '#/', 'Natação');
const JN = (t, k, c) => janela('nat_menu.jpg', t, k, '#/natacao', c);
function natSemana() { const s = semana(hoje()); let n = 0; for (let i = 0; i < 7; i++) if ((S.dias[soma(s, i)] || {}).nat) n++; return n; }
function proxNat() { for (let i = 0; i < 8; i++) { const x = soma(hoje(), i); const t = treinosDoDia(x).find(t => t.tipo === 'natacao'); if (t) return (i ? fmtData(x) : 'Hoje') + ' às ' + t.ini; } return 'sem aula no cronograma'; }
V['natacao/hoje'] = () => { const c = S.natacao.caderno, u = c[c.length - 1], n = natSemana();
  return JN('Hoje', '今日', `<div class="washi"><h3>Próxima aula: ${proxNat()}</h3>
   ${u ? `<div class="destaque-box">📝 Última correção do professor (${fmtData(u.data)}):<br><b>${esc(u.texto)}</b></div>` : '<p class="peq">Nenhuma correção anotada ainda.</p>'}
   <h3>Meta da semana: ${n}/2 aulas</h3>${barra(n / 2 * 100)}${chk(D().nat, 'natHoje', '', 'Fui na aula hoje')}</div>`); };
ACT.natHoje = () => { const d = D(); d.nat = !d.nat; salvar(); rerender(); };
V['natacao/dicionario'] = () => JN('Dicionário', '辞書', `<div class="washi">${DATA.natacao.dicionario.map(([t, s]) => `<div class="verbete"><b>${t}</b><p>${s}</p></div>`).join('')}</div>`);
V['natacao/estilos'] = () => JN('Estilos', '泳法', DATA.natacao.estilos.map(e => `<details class="washi"><summary><b>${e.nome}</b>${e.joelho ? ' <span class="tag p1">⚠️ joelho</span>' : ''}</summary><p>${e.texto}</p>
   ${e.joelho ? '<p class="alerta">A pernada de peito gira o joelho: combine com o professor por causa da patela. Crawl e costas são os mais tranquilos.</p>' : ''}${mapa(e.musculos)}${nomesMus(e.musculos)}</details>`).join(''));
V['natacao/caderno'] = () => { const c = S.natacao.caderno;
  return JN('Caderno do Professor', '記録', `<div class="washi"><textarea id="natTxt" class="campo" placeholder="O que o professor corrigiu ou ensinou hoje?"></textarea><button class="btn" data-act="natAnotar">Salvar</button></div>
   <div class="washi">${c.slice().reverse().map(x => `<div class="item"><span><small>${fmtData(x.data)}</small>${esc(x.texto)}</span></div>`).join('') || '<p class="peq">Vazio.</p>'}</div>`); };
ACT.natAnotar = () => { const t = document.getElementById('natTxt').value.trim(); if (!t) return; S.natacao.caderno.push({ data: hoje(), texto: t }); salvar(); toast('Anotado'); rerender(); };
V['natacao/marcos'] = () => JN('Marcos', '進歩', `<div class="washi">${DATA.natacao.marcos.map((m, i) => { const d = S.natacao.marcos[i]; return chk(!!d, 'natMarco', i, m, d ? 'conquistado em ' + fmtData(d) : ''); }).join('')}</div>`);
ACT.natMarco = i => { const k = S.natacao.marcos; k[i] = k[i] ? null : hoje(); salvar(); rerender(); };

/* ===== YOGA ===== */
function yogaSemana() { const s = semana(hoje()); let n = 0; for (let i = 0; i < 7; i++) if ((S.dias[soma(s, i)] || {}).yoga) n++; return n; }
V.yoga = () => {
  const y = yogaSemana(), s = semana(hoje());
  const dias = Array.from({ length: 7 }, (_, i) => { const x = soma(s, i); return `<span class="dia ${(S.dias[x] || {}).yoga ? 'on' : ''}">${DIAS[diaSem(x)]}</span>`; }).join('');
  return `<div class="fundo-arte claro" style="background-image:url(img/yoga.jpg)"></div><div class="pg-janela yoga">${topo('Yoga', 'ヨガ')}<div class="conteudo" style="padding-top:52vh">
   <div class="washi trans"><h2>Meta da semana: ${y}/3</h2>${barra(y / 3 * 100)}<div class="dias">${dias}</div><p class="peq">3 sessões de 1 hora por semana, em qualquer dia.</p>
    ${chk(D().yoga, 'yogaHoje', '', '✅ Concluí 1h de yoga hoje')}</div>
   <div class="washi trans">${linksBloco('yoga', 3, 'Vídeos de yoga')}</div></div></div>`;
};
ACT.yogaHoje = () => { const d = D(); d.yoga = !d.yoga; salvar(); if (d.yoga) toast(`Yoga ${yogaSemana()}/3 nesta semana`); rerender(); };

/* ===== partida ===== */
carregar(); render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
