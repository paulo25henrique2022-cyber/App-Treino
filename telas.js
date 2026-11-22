/* ===== Tela inicial, perfil, cronograma, configurações ===== */
const TIPOS = [['karate', 'Karatê', '#c62828', '空手'], ['natacao', 'Natação', '#1f6fb5', '水泳'], ['musculacao', 'Musculação', '#d9822b', '筋力'], ['yoga', 'Yoga', '#7b3fa0', 'ヨガ']];
const TNOME = Object.fromEntries(TIPOS.map(t => [t[0], t[1]])), TCOR = Object.fromEntries(TIPOS.map(t => [t[0], t[2]]));
function treinosDoDia(data) { const i = idxSeg(data); return TIPOS.map(t => t[0]).filter(k => S.crono[k][i] && S.crono[k][i][0]).map(k => ({ tipo: k, ini: S.crono[k][i][0], fim: S.crono[k][i][1] })); }

V.inicio = () => {
  const h = new Date().getHours(), av = [];
  if (!S.backup || hoje() > soma(S.backup, 7)) av.push(`<a href="#/config" class="aviso">💾 Faça o backup semanal</a>`);
  const y = yogaSemana(); if (h >= 19 && y < 3 && !D().yoga) av.push(`<a href="#/yoga" class="aviso">🧘 Yoga da semana: ${y}/3</a>`);
  if (!D().alongDia || !Object.values(D().alongDia).filter(Boolean).length) av.push(`<a href="#/karate/treino/along" class="aviso">🤸 Alongamento de hoje</a>`);
  const tr = treinosDoDia(hoje()).map(t => `${TNOME[t.tipo]} ${t.ini}`).join(' · ') || 'Sem treino no cronograma';
  const C = [['cronograma', 28.1, 22.9, 43.75, 15.6, 'Cronograma'], ['karate', 6.05, 39.2, 43.75, 15.5, 'Karatê'], ['natacao', 50.3, 39.2, 43.75, 15.5, 'Natação'], ['musculacao', 6.05, 55.5, 43.75, 15.5, 'Musculação'], ['yoga', 50.3, 55.5, 43.75, 15.5, 'Yoga']];
  return `<div class="inicio"><div class="arte-wrap" style="aspect-ratio:900/1350"><img src="img/inicial.jpg" alt="Menu">
   ${C.map(([r, x, yy, w, hh, n]) => `<a href="#/${r}" class="hot rot" style="left:${x}%;top:${yy}%;width:${w}%;height:${hh}%"><span>${n}</span></a>`).join('')}
   ${avatar('flut')}<a href="#/config" class="cfg-btn flut dir" aria-label="Configurações">⚙️</a></div>
   <div class="washi hoje-box"><b>Olá, ${esc(S.perfil.nome)}! · ${fmtData(hoje())}</b><br>${tr}${av.join('')}</div></div>`;
};

/* ---- perfil ---- */
V.boasvindas = () => `<div class="fundo-arte" style="background-image:url(img/karate_menu.jpg)"></div><div class="pg-janela"><div class="conteudo" style="padding-top:12vh">
  <div class="washi"><h1>Bem-vindo ao seu App de Treino</h1><p>Os seus dados ficam guardados <b>só neste celular</b>.</p>
  <a class="btn grande" href="#/perfil">Fazer meu cadastro</a>
  <label class="btn sec grande">Restaurar um backup<input type="file" accept=".json,application/json" hidden data-chg="importar"></label></div></div></div>`;
V.perfil = () => {
  const p = S.perfil;
  return janela('karate_menu.jpg', 'Meu perfil', '', S.novo ? '#/' : '#/config', `<div class="washi">
   <div class="foto-box">${p.foto ? `<img src="${p.foto}" alt="Foto">` : '<span>📷</span>'}</div>
   <label class="btn sec">${p.foto ? 'Trocar foto' : 'Adicionar foto'}<input type="file" accept="image/*" hidden data-chg="foto"></label>
   ${p.foto ? '<button class="btn sec" data-act="fotoDel">Remover</button>' : ''}
   <label>Nome<input id="pNome" class="campo" value="${esc(p.nome)}" placeholder="Seu nome"></label>
   <button class="btn" data-act="perfilSalvar">Salvar</button></div>`);
};
ACT.foto = (_, el) => {
  const f = el.files[0]; if (!f) return; const img = new Image();
  img.onload = () => { const s = 320, c = document.createElement('canvas'); c.width = c.height = s; const k = Math.min(img.width, img.height);
    c.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, s, s); S.perfil.foto = c.toDataURL('image/jpeg', .82); salvar(); rerender(); URL.revokeObjectURL(img.src); };
  img.src = URL.createObjectURL(f);
};
ACT.fotoDel = () => { S.perfil.foto = ''; salvar(); rerender(); };
ACT.perfilSalvar = () => { const n = document.getElementById('pNome').value.trim(); if (!n) return toast('Digite o seu nome'); S.perfil.nome = n; const era = S.novo; delete S.novo; salvar(); toast('Perfil salvo'); location.hash = era ? '#/cronograma' : '#/config'; };

/* ---- cronograma ---- */
let cronoAberto = null, calMes = null;
V.cronograma = () => {
  const bal = TIPOS.map(([k, n, c]) => `<button class="balao ${cronoAberto === k ? 'on' : ''}" style="--c:${c}" data-act="cronoBal" data-arg="${k}">${n}<small>${Object.keys(S.crono[k]).filter(i => S.crono[k][i][0]).length} dias</small></button>`).join('');
  let painel = '';
  if (cronoAberto) {
    const c = S.crono[cronoAberto];
    painel = `<div class="washi"><h3>${TNOME[cronoAberto]} · horários da semana</h3>
     ${SEMANA_SEG.map((d, i) => `<div class="dia-h"><b>${d}</b><input type="time" value="${(c[i] || [])[0] || ''}" data-chg="cronoH" data-arg="${i}|0"><span>às</span><input type="time" value="${(c[i] || [])[1] || ''}" data-chg="cronoH" data-arg="${i}|1"><button class="lnk" data-act="cronoLimpa" data-arg="${i}" aria-label="Limpar">✕</button></div>`).join('')}
     <p class="peq">Dia em branco = sem treino.</p></div>`;
  }
  return janela('calendario.jpg', 'Cronograma', '予定', '#/', `<div class="baloes">${bal}</div>${painel}
   <div class="washi"><button class="btn" data-act="calAbrir">📅 Ver calendário do mês</button>
    <h3>Ao concluir a marcação</h3>
    <button class="btn" data-act="cronoPdf" data-arg="1">📤 Enviar cronograma em PDF</button>
    <button class="btn sec" data-act="cronoPdf" data-arg="0">⬇️ Baixar cronograma semanal</button>
    <label class="btn sec">📥 Importar cronograma (PDF)<input type="file" accept="application/pdf,.pdf" hidden data-chg="cronoImp"></label>
    <p class="peq">Quem importa fica com o calendário igual ao seu e pode editar depois.</p></div>`);
};
ACT.cronoBal = k => { cronoAberto = cronoAberto === k ? null : k; rerender(); };
ACT.cronoH = (a, el) => { const [i, c] = a.split('|'); const o = S.crono[cronoAberto]; o[i] = o[i] || ['', '']; o[i][c] = el.value; if (!o[i][0] && !o[i][1]) delete o[i]; salvar(); };
ACT.cronoLimpa = i => { delete S.crono[cronoAberto][i]; salvar(); rerender(); };
ACT.calAbrir = () => { calMes = mes(hoje()); mostrarCal(); };
ACT.calNav = d => { calMes = somaMes(calMes, +d); mostrarCal(); };
function mostrarCal() {
  const ini = calMes + '-01', fim = fimMes(calMes), off = idxSeg(ini); let cel = '';
  for (let i = 0; i < off; i++) cel += '<div></div>';
  for (let x = ini; x <= fim; x = soma(x, 1)) {
    const t = treinosDoDia(x);
    cel += `<button class="cdia ${t.length ? 'tem' : ''} ${x === hoje() ? 'hj' : ''}" ${t.length ? `data-act="calDia" data-arg="${x}"` : ''}>${dt(x).getDate()}<span class="pts">${t.map(z => `<i style="background:${TCOR[z.tipo]}"></i>`).join('')}</span></button>`;
  }
  const KJ = ['月', '火', '水', '木', '金', '土', '日'];
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-box cal-box"><div class="cal-arte"><div class="cal-tit">Calendário</div>
   <div class="nav-mes"><button data-act="calNav" data-arg="-1">‹</button><b>${nomeMes(calMes)}</b><button data-act="calNav" data-arg="1">›</button></div>
   <div class="cal-grade">${SEMANA_SEG.map((d, i) => `<div class="cab">${d}<span>${KJ[i]}</span></div>`).join('')}${cel}</div>
   <div class="leg">${TIPOS.map(([k, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div><div id="calPop"></div></div>
   <button class="btn sec" data-act="fecharModal">Fechar</button></div>`;
  m.classList.add('show');
}
ACT.calDia = x => {
  document.getElementById('calPop').innerHTML = `<div class="pop"><b>${fmtLonga(x)}</b>${treinosDoDia(x).map(t => `<div><i style="background:${TCOR[t.tipo]}"></i>${TNOME[t.tipo]}: ${t.ini} às ${t.fim || '—'}</div>`).join('')}</div>`;
};
ACT.cronoPdf = comp => {
  const L = [['Cronograma semanal de treinos', 20, '0.6 0.1 0.1'], [`${S.perfil.nome} · gerado em ${fmtData(hoje())}`, 11, '0.35 0.25 0.15'], ['', 8]];
  SEMANA_SEG.forEach((d, i) => {
    const it = TIPOS.filter(([k]) => S.crono[k][i] && S.crono[k][i][0]).map(([k, n]) => `${n} ${S.crono[k][i][0]}-${S.crono[k][i][1] || ''}`);
    L.push([`${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][i]}:  ${it.join('   |   ') || 'descanso'}`, 13]);
  });
  L.push(['', 8], ['Para importar: abra o App de Treino > Cronograma > Importar cronograma (PDF).', 10, '0.35 0.25 0.15']);
  entregar(pdfTexto(L, { tipo: 'cronograma', crono: S.crono }), `cronograma-${hoje()}.pdf`, comp === '1');
};
ACT.cronoImp = (_, el) => { const f = el.files[0]; if (!f) return; lerDadosPdf(f, d => { if (d.tipo !== 'cronograma') return toast('PDF inválido'); if (!confirm('Substituir o seu cronograma pelo do PDF?')) return; S.crono = d.crono; salvar(); toast('Cronograma importado'); rerender(); }); el.value = ''; };

/* ---- configurações e backup ---- */
V.config = () => janela('karate_menu.jpg', 'Configurações', '設定', '#/', `
  <div class="washi"><div class="linha">${avatar()}<div><b>${esc(S.perfil.nome)}</b><br><a href="#/perfil">editar perfil e foto</a></div></div></div>
  <div class="washi"><h3>💾 Backup</h3><p class="peq">Os dados ficam só neste navegador. Limpar os dados do navegador, trocar de celular ou usar aba anônima apaga tudo. Faça backup toda semana e guarde no Google Drive ou no WhatsApp.</p>
   <p>Último backup: <b>${S.backup ? fmtData(S.backup) : 'nunca'}</b></p>
   <button class="btn" data-act="backup">Exportar backup</button><label class="btn sec">Importar backup<input type="file" accept=".json,application/json" hidden data-chg="importar"></label></div>
  <div class="washi peq">App de Treino · versão 2.0 · dados locais · katas: SKIF/Kanazawa · termos: Nippon Budōkan/JKF/JKA · ciência: ACSM, Cochrane, meta-análises citadas nas telas.</div>`);
ACT.backup = () => { S.backup = hoje(); salvar(); entregar(new Blob([JSON.stringify({ tipo: 'backup-treino', S })], { type: 'application/json' }), `backup-treino-${hoje()}.json`, true); rerender(); };
ACT.importar = (_, el) => {
  const f = el.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const j = JSON.parse(r.result); if (j.tipo !== 'backup-treino') return toast('Não é um backup deste app');
    if (!confirm('Substituir todos os dados deste celular pelo backup?')) return; S = j.S; delete S.novo; salvar(); toast('Backup restaurado'); location.hash = '#/'; render(); } catch (e) { toast('Arquivo inválido'); } };
  r.readAsText(f);
};
