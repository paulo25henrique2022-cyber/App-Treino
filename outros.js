/* ===== MUSCULAÇÃO ===== */
const MUSC_ABAS = [['mapa', 'Mapa muscular'], ['sabado', 'Sábado'], ['semana', 'Semana'], ['along', 'Alongamento']];
V.musculacao = (sub = 'mapa') => `<div class="escuro">${topo('Musculação')}${abas('musculacao', MUSC_ABAS, sub)}${(MV[sub] || MV.mapa)()}</div>`;
const MV = {};
MV.mapa = () => {
  const grupos = [1, 2, 3].map(pr => `<h3>${['', '🔴 Essenciais para o karatê', '🟠 Importantes', '⚪ Gerais'][pr]}</h3>${DATA.musculos.filter(m => m.prioridade === pr).map(m => `<button class="tag p${pr}" data-act="musInfo" data-arg="${m.id}">${m.nome}${m.profundo ? ' ·prof.' : ''}</button>`).join('')}`).join('');
  return `<section class="card"><p class="peq">Foco em <b>entender</b>: o treino é do seu professor. Toque num músculo para ver a função no karatê e como treinar sem encurtar. Tracejado = músculo profundo.</p>
  ${mapa([], { todos: true, clic: true, vista: mapaVistaForcada || 'frente' })}${grupos}</section>
  <section class="card peq"><b>Regras que valem sempre:</b> amplitude completa · descida lenta (2–3 s) · subida rápida · nada que carregue a patela.<br><br>
  <b>Pesquisa:</b> musculação com amplitude completa melhora a flexibilidade tanto quanto o alongamento (meta-análises de 2021 e 2023); o treino excêntrico aumenta o comprimento das fibras do posterior da coxa; no karatê de elite, a velocidade pesa mais que a força máxima.</section>`;
};
MV.sabado = () => {
  const d = D(), sb = DATA.sabado;
  return `<section class="card"><h2>Sábado · ${sb.horario} · explosão, panturrilhas e core</h2><ul class="peq">${sb.regras.map(r => `<li>${r}</li>`).join('')}</ul>
   <button class="btn" data-act="alTimer" data-arg="90">⏱️ Descanso 90 s</button></section>
   ${sb.blocos.map((b, i) => `<div class="card">${chk((d.sab || {})[i], 'sabItem', i, b.exercicio, b.bloco + (b.series ? ' · ' + b.series : '') + (b.minutos ? ' · ' + b.minutos + ' min' : ''))}
     ${b.musculos.length ? `<details><summary class="lnk">ver músculos</summary>${mapa(b.musculos, { vista: mapaVistaForcada })}${nomesMus(b.musculos)}</details>` : '<p><a href="#/karate/along">abrir alongamentos</a></p>'}</div>`).join('')}
   <section class="card">${chk(d.musc, 'muscHoje', '', '✅ Treino de sábado concluído')}</section>`;
};
ACT.sabItem = i => { const d = D(); d.sab = d.sab || {}; d.sab[i] = !d.sab[i]; salvar(); rerender(); };
ACT.muscHoje = () => { const d = D(); d.musc = !d.musc; salvar(); rerender(); };
MV.semana = () => {
  const s = semana(hoje()); let n = 0, linhas = '';
  for (let i = 0; i < 7; i++) { const x = soma(s, i), v = (P().dias[x] || {}).musc; if (v) n++; linhas += `<div class="item">${fmtData(x)} ${v ? '✅' : ''}</div>`; }
  return `<section class="card"><h2>Meta da semana: ${n}/3</h2>${barra(n / 3 * 100)}<p class="peq">2 aulas com o professor (dias variáveis) + o sábado.</p>
   ${chk(D().musc, 'muscHoje', '', 'Treinei musculação hoje')}${linhas}</section>`;
};
MV.along = () => `<section class="card"><p>Antes: dinâmico dos músculos do dia. Depois: estático dos músculos treinados.</p><a class="btn" href="#/karate/along">Abrir alongamentos com mapa e cronômetro</a></section>`;

/* ===== NATAÇÃO ===== */
const NAT_ABAS = [['inicio', 'Hoje'], ['dicionario', 'Dicionário'], ['estilos', 'Estilos'], ['caderno', 'Caderno'], ['marcos', 'Marcos']];
V.natacao = (sub = 'inicio') => `<div class="escuro azul">${topo('Natação')}${abas('natacao', NAT_ABAS, sub)}${(NV[sub] || NV.inicio)()}</div>`;
const NV = {};
function natSemana() { const s = semana(hoje()); let n = 0; for (let i = 0; i < 7; i++) if ((P().dias[soma(s, i)] || {}).nat) n++; return n; }
NV.inicio = () => {
  const c = P().natacao.caderno; const ult = c[c.length - 1];
  const prox = treinosDoDia(hoje()).find(t => t.tipo === 'natacao');
  return `<section class="card"><h2>${prox ? 'Aula hoje às ' + prox.ini : 'Próxima aula: ' + proxNat()}</h2>
   ${ult ? `<div class="destaque-box">📝 Última correção do professor (${fmtData(ult.data)}):<br><b>${esc(ult.texto)}</b></div>` : '<p class="peq">Nenhuma correção anotada ainda.</p>'}
   <h3>Meta da semana: ${natSemana()}/2 aulas</h3>${barra(natSemana() / 2 * 100)}
   ${chk(D().nat, 'natHoje', '', 'Fui na aula hoje')}
   <p><a href="#/karate/along">Alongamento</a>: antes ombros, tronco, quadril e tornozelos; depois ombros, peito, tríceps, lombar e panturrilha.</p></section>`;
};
function proxNat() { for (let i = 1; i < 8; i++) { const x = soma(hoje(), i); const t = treinosDoDia(x).find(t => t.tipo === 'natacao'); if (t) return fmtData(x) + ' ' + t.ini; } return '—'; }
ACT.natHoje = () => { const d = D(); d.nat = !d.nat; salvar(); rerender(); };
NV.dicionario = () => `<section class="card"><h2>Dicionário da natação</h2>${DATA.natacao.dicionario.map(([t, s]) => `<div class="verbete"><b>${t}</b><p>${s}</p></div>`).join('')}</section>`;
NV.estilos = () => DATA.natacao.estilos.map(e => `<details class="card"><summary><b>${e.nome}</b>${e.joelho ? ' <span class="tag p1">⚠️ joelho</span>' : ''}</summary>
  <p>${e.texto}</p>${e.joelho ? '<p class="alerta">A pernada de peito gira o joelho: combine com o professor por causa da patela. Crawl e costas são os mais tranquilos.</p>' : ''}
  ${mapa(e.musculos, { vista: mapaVistaForcada })}${nomesMus(e.musculos)}</details>`).join('');
NV.caderno = () => {
  const c = P().natacao.caderno;
  return `<section class="card"><h2>Caderno do professor</h2><textarea id="natTxt" class="campo" placeholder="O que o professor corrigiu ou ensinou hoje?"></textarea><button class="btn" data-act="natAnotar">Salvar</button></section>
   <section class="card">${c.slice().reverse().map(x => `<div class="item"><small>${fmtData(x.data)}</small><br>${esc(x.texto)}</div>`).join('') || '<p class="peq">Vazio.</p>'}</section>`;
};
ACT.natAnotar = () => { const t = document.getElementById('natTxt').value.trim(); if (!t) return; P().natacao.caderno.push({ data: hoje(), texto: t }); salvar(); toast('Anotado'); rerender(); };
NV.marcos = () => `<section class="card"><h2>Marcos de evolução</h2>${DATA.natacao.marcos.map((m, i) => { const d = P().natacao.marcos[i]; return chk(!!d, 'natMarco', i, m, d ? 'conquistado em ' + fmtData(d) : ''); }).join('')}</section>`;
ACT.natMarco = i => { const mk = P().natacao.marcos; mk[i] = mk[i] ? null : hoje(); salvar(); rerender(); };

/* ===== YOGA + CHÁS ===== */
function yogaSemana(p = P()) { const s = semana(hoje()); let n = 0; for (let i = 0; i < 7; i++) if ((p.dias[soma(s, i)] || {}).yoga) n++; return n; }
function chaDoDia(lista, off = 0) { const n = Math.floor(dt(hoje()).getTime() / 864e5) + off; return lista[n % lista.length]; }
V.yoga = () => {
  const d = D(), y = yogaSemana(), C = DATA.chas, s = semana(hoje());
  const dias = Array.from({ length: 7 }, (_, i) => { const x = soma(s, i); return `<span class="dia ${(P().dias[x] || {}).yoga ? 'on' : ''}">${DIAS[diaSem(x)]}</span>`; }).join('');
  const noite = d.yoga ? chaDoDia(C.antes_yoga) : chaDoDia(C.dormir);
  return `<div class="escuro dourado">${topo('Yoga')}
  <section class="card"><h2>Meta da semana: ${y}/3</h2>${barra(y / 3 * 100)}<div class="dias">${dias}</div>
   <p class="peq">À noite, antes de dormir. Dias livres. O app lembra você à noite se a meta não estiver completa.</p>
   ${chk(d.yoga, 'yogaHoje', '', '✅ Concluí o yoga hoje')}</section>
  <section class="card"><h2>🍵 Chás de hoje</h2>
   ${chk(d.chaManha, 'cha', 'chaManha', '☀️ Ao acordar: ' + chaDoDia(C.acordar), 'pode ter cafeína')}
   ${chk(d.chaNoite, 'cha', 'chaNoite', (d.yoga ? '🧘 Antes do yoga: ' : '🌙 Antes de dormir: ') + noite, 'sem cafeína')}
   <details><summary>Ver todas as opções</summary><p><b>Ao acordar:</b> ${C.acordar.join(', ')}</p><p><b>Antes de dormir:</b> ${C.dormir.join(', ')}</p><p><b>Antes do yoga:</b> ${C.antes_yoga.join(', ')}</p></details>
   <ul class="peq">${C.regras.map(r => `<li>${r}</li>`).join('')}</ul>
   <p class="peq"><b>Ciência:</b> camomila tem efeito modesto na qualidade do sono (meta-análise 2024, estudos pequenos e variados); chá-verde reduziu um pouco a glicose em jejum em estudos curtos, sem consenso. O chá é um hábito saudável, não remédio.</p></section>
  <section class="card"><button class="btn sec" data-act="notifPedir">🔔 Ativar avisos</button><p class="peq">Os avisos aparecem quando o app estiver aberto ou em segundo plano recente; no celular o sistema pode atrasá-los. A tela inicial também mostra os lembretes.</p></section></div>`;
};
ACT.yogaHoje = () => { const d = D(); d.yoga = !d.yoga; salvar(); if (d.yoga) toast(`Yoga ${yogaSemana()}/3 nesta semana`); rerender(); };
ACT.cha = c => { const d = D(); d[c] = !d[c]; salvar(); rerender(); };
ACT.notifPedir = async () => {
  if (!('Notification' in window)) return toast('Este navegador não suporta avisos');
  const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Avisos ativados' : 'Avisos não permitidos');
  if (r === 'granted') agendarAvisos();
};
function agendarAvisos() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  clearTimeout(agendarAvisos.t);
  const agora = new Date(), alvo = new Date(); alvo.setHours(22, 0, 0, 0);
  if (alvo > agora) agendarAvisos.t = setTimeout(() => {
    const p = P(); if (yogaSemana() < 3 && !D().yoga) navigator.serviceWorker?.ready.then(r => r.showNotification('Yoga', { body: `Semana: ${yogaSemana()}/3. Que tal hoje antes de dormir? E o chá da noite 🍵`, icon: 'img/icon-192.png' }));
  }, alvo - agora);
}
