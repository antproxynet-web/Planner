/* ============================================================
   AGENDA ESCOLAR INTELIGENTE — JavaScript
   Vanilla JS · Sem frameworks · Tempo real (UTC-3 Brasília)
   ============================================================ */

'use strict';

/* ============================================================
   1. DADOS ESCOLARES
   ============================================================ */

/**
 * Horários de cada aula (início e fim)
 * Formato: HH:MM
 */
const HORARIOS = [
  { slot: '1ª Aula', inicio: '13:00', fim: '13:40' },
  { slot: '2ª Aula', inicio: '13:40', fim: '14:20' },
  { slot: '3ª Aula', inicio: '14:20', fim: '15:00' },
  { slot: '4ª Aula', inicio: '15:15', fim: '15:55' },
  { slot: '5ª Aula', inicio: '15:55', fim: '16:35' },
  { slot: '6ª Aula', inicio: '16:35', fim: '17:00' },
];

/**
 * Grade horária semanal — carregada via JSON externo.
 * null = nenhum JSON importado; objeto = dados válidos.
 */
let GRADE = null;

/**
 * Chave usada para persistir a grade no localStorage
 */
// GRADE_STORAGE_KEY removido — dados agora no DB unificado (DB_KEY)

/**
 * Materiais necessários por matéria
 */
const MATERIAIS = {
  'Matemática':      { icone: '📐', livro: 'Livro de Matemática', extras: ['Calculadora', 'Caderno quadriculado'] },
  'Física':          { icone: '⚛️', livro: 'Livro de Física',     extras: ['Caderno de fórmulas', 'Calculadora'] },
  'Português':       { icone: '📖', livro: 'Livro de Português',  extras: ['Dicionário', 'Caderno de redação'] },
  'História':        { icone: '🏛️', livro: 'Livro de História',   extras: ['Caderno de anotações'] },
  'Biologia':        { icone: '🔬', livro: 'Livro de Biologia',   extras: ['Caderno de ciências'] },
  'Química':         { icone: '🧪', livro: 'Livro de Química',    extras: ['Tabela periódica', 'Calculadora'] },
  'Inglês':          { icone: '🌐', livro: 'Livro de Inglês',     extras: ['Dicionário inglês-português'] },
  'Filosofia':       { icone: '💭', livro: 'Livro de Filosofia',  extras: ['Caderno de anotações'] },
  'Sociologia':      { icone: '🌍', livro: 'Livro de Sociologia', extras: ['Caderno de ciências humanas'] },
  'Artes':           { icone: '🎨', livro: 'Livro de Artes',      extras: ['Material de desenho'] },
  'Educação Física': { icone: '🏃', livro: null,                  extras: ['Tênis', 'Roupa de esporte', 'Garrafa d\'água'] },
};

/**
 * Avisos e tarefas importantes
 */
const AVISOS = [
  {
    tipo: 'urgente',
    icone: '🔴',
    titulo: 'Prova de Matemática',
    desc: 'Revisão de funções do 2º grau e geometria analítica. Estudar capítulos 5 e 6.',
    data: 'Sexta-feira, 10/04',
  },
  {
    tipo: 'urgente',
    icone: '🔴',
    titulo: 'Trabalho de Biologia',
    desc: 'Entregar relatório sobre mitose e meiose. Mínimo de 3 páginas com referências.',
    data: 'Quinta-feira, 10/04',
  },
  {
    tipo: 'atencao',
    icone: '🟡',
    titulo: 'Simulado Geral',
    desc: 'Simulado de todas as disciplinas no estilo ENEM. Trazer documento com foto.',
    data: 'Sábado, 12/04',
  },
  {
    tipo: 'atencao',
    icone: '🟡',
    titulo: 'Revisão de Física',
    desc: 'Revisão de termodinâmica e ondas antes da prova bimestral.',
    data: 'Quarta-feira, 09/04',
  },
  {
    tipo: 'info',
    icone: '🔵',
    titulo: 'Reunião de Pais',
    desc: 'Reunião com responsáveis para entrega de boletins do 1º bimestre.',
    data: 'Segunda-feira, 14/04',
  },
  {
    tipo: 'ok',
    icone: '🟢',
    titulo: 'Redação Entregue',
    desc: 'Redação sobre "Desafios da educação no Brasil" entregue com sucesso.',
    data: 'Concluído',
  },
];

/**
 * Mapeamento de índice JS (0=Dom) para chave da grade
 */
const DIA_MAP = {
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
};

/**
 * Nomes dos dias da semana em português
 */
const DIAS_SEMANA = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

/**
 * Nomes curtos dos dias para o cabeçalho da tabela
 */
const DIAS_HEADER = {
  segunda: 'Segunda',
  terca:   'Terça',
  quarta:  'Quarta',
  quinta:  'Quinta',
  sexta:   'Sexta',
};

/**
 * Mapeamento de matéria para classe CSS do chip
 */
const CHIP_CLASS = {
  'Matemática':      'chip-matematica',
  'Física':          'chip-fisica',
  'Português':       'chip-portugues',
  'História':        'chip-historia',
  'Biologia':        'chip-biologia',
  'Química':         'chip-quimica',
  'Inglês':          'chip-ingles',
  'Filosofia':       'chip-filosofia',
  'Sociologia':      'chip-sociologia',
  'Artes':           'chip-artes',
  'Educação Física': 'chip-ed-fisica',
  'Geografia':       'chip-geografia',
};

/* ============================================================
   2. UTILITÁRIOS
   ============================================================ */

/**
 * Retorna a data/hora atual no fuso de Brasília (UTC-3)
 * @returns {Date}
 */
function getBrasiliaDate() {
  const now = new Date();
  // Converte para UTC-3
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 3 * 3600000);
}

/**
 * Formata número com zero à esquerda
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Converte "HH:MM" em minutos desde meia-noite
 * @param {string} hhmm
 * @returns {number}
 */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Retorna o índice do horário atual (-1 se fora do período escolar)
 * @param {number} minutosAgora
 * @returns {number}
 */
function getAulaAtualIndex(minutosAgora) {
  for (let i = 0; i < HORARIOS.length; i++) {
    const ini = toMinutes(HORARIOS[i].inicio);
    const fim = toMinutes(HORARIOS[i].fim);
    if (minutosAgora >= ini && minutosAgora < fim) return i;
  }
  return -1;
}

/**
 * Retorna o índice da próxima aula (-1 se não houver)
 * @param {number} minutosAgora
 * @returns {number}
 */
function getProximaAulaIndex(minutosAgora) {
  for (let i = 0; i < HORARIOS.length; i++) {
    const ini = toMinutes(HORARIOS[i].inicio);
    if (minutosAgora < ini) return i;
  }
  return -1;
}

/**
 * Obtém o chip CSS class para uma matéria
 * @param {string} materia
 * @returns {string}
 */
function getChipClass(materia) {
  return CHIP_CLASS[materia] || 'chip-default';
}

/**
 * Remove duplicatas de um array
 * @param {Array} arr
 * @returns {Array}
 */
function unique(arr) {
  return [...new Set(arr)];
}

/* ============================================================
   3. RENDERIZAÇÃO DA TABELA
   ============================================================ */

/**
 * Constrói a tabela de horários semanais
 */
function renderizarTabela() {
  const thead = document.getElementById('tableHeader');
  const tbody = document.getElementById('tableBody');

  if (!thead || !tbody) return;

  // ---- Estado vazio: sem JSON importado ----
  if (!GRADE) {
    while (thead.children.length > 1) thead.removeChild(thead.lastChild);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="
          text-align:center;
          padding: 2.5rem 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.8;
        ">
          <div style="font-size:2rem;margin-bottom:.5rem">📋</div>
          <strong style="color:var(--text-secondary);display:block;margin-bottom:.25rem">Grade horária vazia</strong>
          Toque no <strong>✏️ lápis</strong> para preencher as matérias, ou no <strong>📥</strong> para importar um JSON.
        </td>
      </tr>`;
    return;
  }

  const dias = Object.keys(GRADE); // ['segunda','terca','quarta','quinta','sexta']

  // ---- Cabeçalho ----
  const hoje = getBrasiliaDate();
  const diaSemanaIndex = hoje.getDay();
  const diaChaveHoje = DIA_MAP[diaSemanaIndex] || null;

  // Limpa cabeçalho (mantém a primeira th)
  while (thead.children.length > 1) {
    thead.removeChild(thead.lastChild);
  }

  dias.forEach(dia => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = DIAS_HEADER[dia];
    th.dataset.dia = dia;
    if (dia === diaChaveHoje) {
      th.classList.add('today-col');
      th.setAttribute('aria-current', 'true');
      th.setAttribute('title', 'Hoje');
    }
    thead.appendChild(th);
  });

  // ---- Corpo ----
  tbody.innerHTML = '';

  const agora = getBrasiliaDate();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const aulaAtualIdx = getAulaAtualIndex(minutosAgora);

  HORARIOS.forEach((horario, rowIdx) => {
    const tr = document.createElement('tr');

    // Célula de horário
    const tdHorario = document.createElement('td');
    tdHorario.className = 'col-horario';
    tdHorario.innerHTML = `
      <span class="slot-name">${horario.slot}</span><br>
      <span style="font-size:0.65rem;color:var(--text-muted)">${horario.inicio}–${horario.fim}</span>
    `;
    tr.appendChild(tdHorario);

    // Células de matérias
    dias.forEach(dia => {
      const materia = GRADE[dia][rowIdx] || '—';
      const td = document.createElement('td');
      td.dataset.dia = dia;
      td.dataset.slot = rowIdx;

      // Destaque do dia atual
      if (dia === diaChaveHoje) {
        td.classList.add('today-col');

        // Aula atual
        if (rowIdx === aulaAtualIdx) {
          td.classList.add('current-aula');
        }
        // Aulas passadas (apenas em dias úteis)
        else if (aulaAtualIdx >= 0 && rowIdx < aulaAtualIdx) {
          td.classList.add('past-aula');
        }
        // Antes do horário escolar: todas passadas se já passou do horário
        else if (aulaAtualIdx === -1) {
          const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);
          if (minutosAgora >= fimUltimaAula) {
            td.classList.add('past-aula');
          }
        }
      }

      // Chip de matéria
      if (materia !== '—') {
        const chip = document.createElement('span');
        chip.className = `materia-chip ${getChipClass(materia)}`;
        chip.textContent = materia;
        td.appendChild(chip);
      } else {
        td.textContent = '—';
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* ============================================================
   4. STATUS BANNER
   ============================================================ */

/**
 * Atualiza o banner de status superior
 */
function atualizarStatusBanner() {
  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  // Nome do dia
  const elDayName = document.getElementById('currentDayName');
  if (elDayName) elDayName.textContent = DIAS_SEMANA[diaSemanaIndex] || '—';

  // Aula atual
  const elAulaName = document.getElementById('currentAulaName');
  const aulaAtualIdx = getAulaAtualIndex(minutosAgora);

  if (elAulaName) {
    if (diaChave && aulaAtualIdx >= 0 && GRADE && GRADE[diaChave]) {
      elAulaName.textContent = GRADE[diaChave][aulaAtualIdx] || '—';
    } else if (!diaChave) {
      elAulaName.textContent = 'Sem aula';
    } else if (!GRADE) {
      elAulaName.textContent = '—';
    } else {
      const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);
      const inicioAulas = toMinutes(HORARIOS[0].inicio);
      if (minutosAgora < inicioAulas) {
        elAulaName.textContent = 'Nenhuma';
      } else if (minutosAgora >= fimUltimaAula) {
        elAulaName.textContent = 'Aulas encerradas';
      } else {
        elAulaName.textContent = 'Intervalo';
      }
    }
  }

  // Próxima aula
  const elProxima = document.getElementById('nextAulaName');
  const proximaIdx = getProximaAulaIndex(minutosAgora);

  if (elProxima) {
    if (diaChave && proximaIdx >= 0 && GRADE && GRADE[diaChave]) {
      elProxima.textContent = GRADE[diaChave][proximaIdx] || '—';
    } else {
      elProxima.textContent = 'Nenhuma';
    }
  }

  // Status badge
  const elStatusText = document.getElementById('statusText');
  const elStatusDot = document.getElementById('statusDot');
  const elStatusBadge = document.getElementById('statusBadge');

  if (elStatusText && elStatusDot) {
    if (!diaChave) {
      elStatusText.textContent = 'Fim de semana';
      elStatusDot.className = 'status-dot off';
      elStatusBadge.style.color = 'var(--text-muted)';
    } else if (aulaAtualIdx >= 0) {
      elStatusText.textContent = 'Em aula';
      elStatusDot.className = 'status-dot';
      elStatusBadge.style.color = 'var(--accent-green)';
    } else {
      const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);
      const inicioAulas = toMinutes(HORARIOS[0].inicio);
      if (minutosAgora >= fimUltimaAula) {
        elStatusText.textContent = 'Encerrado';
        elStatusDot.className = 'status-dot off';
        elStatusBadge.style.color = 'var(--text-muted)';
      } else if (minutosAgora < inicioAulas) {
        elStatusText.textContent = 'Aguardando';
        elStatusDot.className = 'status-dot warning';
        elStatusBadge.style.color = 'var(--accent-amber)';
      } else {
        elStatusText.textContent = 'Intervalo';
        elStatusDot.className = 'status-dot warning';
        elStatusBadge.style.color = 'var(--accent-amber)';
      }
    }
  }
}

/* ============================================================
   5. CARDS MODULARES
   ============================================================ */

/**
 * Preenche o card "Aulas do Dia"
 */
function renderizarAulasHoje() {
  const el = document.getElementById('aulasHoje');
  if (!el) return;

  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const aulaAtualIdx = getAulaAtualIndex(minutosAgora);

  el.innerHTML = '';

  if (!diaChave) {
    el.innerHTML = '<li class="card__list-item skeleton">Sem aulas hoje (fim de semana)</li>';
    return;
  }

  if (!GRADE || !GRADE[diaChave]) {
    el.innerHTML = '<li class="card__list-item skeleton">Grade horária vazia — toque no ✏️ para preencher</li>';
    return;
  }

  const aulas = GRADE[diaChave];
  aulas.forEach((materia, idx) => {
    const li = document.createElement('li');
    li.className = 'card__list-item';

    if (idx === aulaAtualIdx) {
      li.classList.add('active');
    }

    const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);
    if (aulaAtualIdx === -1 && minutosAgora >= fimUltimaAula) {
      li.style.opacity = '0.5';
    } else if (aulaAtualIdx >= 0 && idx < aulaAtualIdx) {
      li.style.opacity = '0.5';
      li.style.textDecoration = 'line-through';
    }

    li.innerHTML = `
      <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);min-width:28px">${idx + 1}º</span>
      <span>${materia}</span>
      <span style="margin-left:auto;font-family:var(--font-mono);font-size:0.68rem;color:var(--text-muted)">${HORARIOS[idx].inicio}</span>
    `;
    el.appendChild(li);
  });
}

/**
 * Preenche o card "Próxima Aula"
 */
function renderizarProximaAula() {
  const elSlot = document.getElementById('proximaSlot');
  const elMateria = document.getElementById('proximaMateria');
  const elHorario = document.getElementById('proximaHorario');

  if (!elSlot || !elMateria || !elHorario) return;

  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const proximaIdx = getProximaAulaIndex(minutosAgora);

  if (!diaChave || proximaIdx < 0) {
    elSlot.textContent = '—';
    elMateria.textContent = diaChave ? 'Aulas encerradas' : 'Fim de semana';
    elHorario.textContent = '—';
    return;
  }

  if (!GRADE || !GRADE[diaChave]) {
    elSlot.textContent = '—';
    elMateria.textContent = 'Grade vazia';
    elHorario.textContent = '—';
    return;
  }

  const materia = GRADE[diaChave][proximaIdx];
  const horario = HORARIOS[proximaIdx];

  elSlot.textContent = `${proximaIdx + 1}ª Aula`;
  elMateria.textContent = materia;
  elHorario.textContent = `${horario.inicio} – ${horario.fim}`;
}

/**
 * Preenche o card "Materiais Necessários"
 */
function renderizarMateriaisCard() {
  const el = document.getElementById('materiaisCard');
  if (!el) return;

  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;

  el.innerHTML = '';

  if (!diaChave) {
    el.innerHTML = '<li class="card__list-item skeleton">Sem aulas hoje</li>';
    return;
  }

  if (!GRADE || !GRADE[diaChave]) {
    el.innerHTML = '<li class="card__list-item skeleton">Grade horária vazia — toque no ✏️ para preencher</li>';
    return;
  }

  const materiasUnicas = unique(GRADE[diaChave]);
  materiasUnicas.forEach(materia => {
    const mat = MATERIAIS[materia];
    const li = document.createElement('li');
    li.className = 'card__list-item';
    li.innerHTML = `
      <span>${mat ? mat.icone : '📚'}</span>
      <span>${mat && mat.livro ? mat.livro : materia}</span>
    `;
    el.appendChild(li);
  });
}

/**
 * Preenche o card "Status Geral"
 */
function renderizarStatusGeral() {
  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const aulaAtualIdx = getAulaAtualIndex(minutosAgora);
  const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);

  const total = diaChave ? HORARIOS.length : 0;
  let concluidas = 0;

  if (diaChave) {
    if (aulaAtualIdx >= 0) {
      concluidas = aulaAtualIdx;
    } else if (minutosAgora >= fimUltimaAula) {
      concluidas = total;
    }
  }

  const restantes = total - concluidas - (aulaAtualIdx >= 0 ? 1 : 0);
  const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const elTotal = document.getElementById('totalAulas');
  const elConcluidas = document.getElementById('aulasConcluidas');
  const elRestantes = document.getElementById('aulasRestantes');
  const elProgressBar = document.getElementById('progressBar');
  const elProgressLabel = document.getElementById('progressLabel');
  const elProgressWrapper = document.getElementById('progressWrapper');

  if (elTotal) elTotal.textContent = total || '—';
  if (elConcluidas) elConcluidas.textContent = concluidas;
  if (elRestantes) elRestantes.textContent = Math.max(0, restantes);

  if (elProgressBar) {
    elProgressBar.style.width = `${progresso}%`;
  }
  if (elProgressLabel) {
    elProgressLabel.textContent = `${progresso}%`;
  }
  if (elProgressWrapper) {
    elProgressWrapper.setAttribute('aria-valuenow', progresso);
  }
}

/* ============================================================
   6. SEÇÃO DE MATERIAIS DO DIA
   ============================================================ */

/**
 * Renderiza a grade de materiais para o dia atual
 */
function renderizarMateriaisSecao() {
  const el = document.getElementById('materiaisGrid');
  const elLabel = document.getElementById('materiaisDayLabel');

  if (!el) return;

  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;

  if (elLabel) {
    elLabel.textContent = DIAS_SEMANA[diaSemanaIndex] || '—';
  }

  el.innerHTML = '';

  if (!diaChave) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-xl);color:var(--text-muted)">
        <div style="font-size:2rem;margin-bottom:var(--space-sm)">🎉</div>
        <div>Hoje é fim de semana — aproveite para descansar e revisar!</div>
      </div>
    `;
    return;
  }

  if (!GRADE || !GRADE[diaChave]) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-xl);color:var(--text-muted)">
        <div style="font-size:2rem;margin-bottom:var(--space-sm)">📂</div>
        <div>Preencha a grade horária pelo ✏️ para ver os materiais do dia.</div>
      </div>
    `;
    return;
  }

  // Coletar todos os materiais únicos do dia (livros + extras)
  const materiasUnicas = unique(GRADE[diaChave]);
  const todosItens = new Set();

  materiasUnicas.forEach(materia => {
    const mat = MATERIAIS[materia];
    if (mat) {
      if (mat.livro) todosItens.add(JSON.stringify({ icone: mat.icone, nome: mat.livro, sub: materia }));
      mat.extras.forEach(extra => {
        todosItens.add(JSON.stringify({ icone: '📌', nome: extra, sub: 'Material' }));
      });
    }
  });

  // Itens sempre necessários
  const sempreNecessarios = [
    { icone: '📓', nome: 'Agenda Escolar', sub: 'Organização' },
    { icone: '🖊️', nome: 'Caneta e Lápis', sub: 'Escrita' },
    { icone: '💧', nome: 'Garrafa d\'água', sub: 'Saúde' },
  ];

  sempreNecessarios.forEach(item => {
    todosItens.add(JSON.stringify(item));
  });

  todosItens.forEach(itemStr => {
    const item = JSON.parse(itemStr);
    const div = document.createElement('div');
    div.className = 'material-card';
    div.innerHTML = `
      <span class="material-card__icon">${item.icone}</span>
      <span class="material-card__name">${item.nome}</span>
      <span class="material-card__sub">${item.sub}</span>
    `;
    el.appendChild(div);
  });
}

/* ============================================================
   7. SEÇÃO DE AVISOS
   ============================================================ */

/**
 * Renderiza os avisos e tarefas
 */
function renderizarAvisos() {
  const el = document.getElementById('avisosGrid');
  if (!el) return;

  el.innerHTML = '';

  AVISOS.forEach(aviso => {
    const div = document.createElement('div');
    div.className = `aviso-card ${aviso.tipo}`;
    div.innerHTML = `
      <span class="aviso-card__icon">${aviso.icone}</span>
      <div class="aviso-card__content">
        <div class="aviso-card__title">${aviso.titulo}</div>
        <div class="aviso-card__desc">${aviso.desc}</div>
        <div class="aviso-card__date">${aviso.data}</div>
      </div>
    `;
    el.appendChild(div);
  });
}

/* ============================================================
   8. RELÓGIO EM TEMPO REAL
   ============================================================ */

/**
 * Atualiza o relógio e a data na top bar
 */
function atualizarRelogio() {
  const agora = getBrasiliaDate();

  const hh = pad(agora.getHours());
  const mm = pad(agora.getMinutes());
  const ss = pad(agora.getSeconds());

  const dia = pad(agora.getDate());
  const mes = pad(agora.getMonth() + 1);
  const ano = agora.getFullYear();

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const nomeDia = diasSemana[agora.getDay()];

  const elTime = document.getElementById('realtimeTime');
  const elDate = document.getElementById('realtimeDate');

  if (elTime) elTime.textContent = `${hh}:${mm}:${ss}`;
  if (elDate) elDate.textContent = `${nomeDia}, ${dia}/${mes}/${ano}`;
}

/* ============================================================
   9. FOOTER
   ============================================================ */

function atualizarFooter() {
  const elYear = document.getElementById('footerYear');
  if (elYear) {
    elYear.textContent = getBrasiliaDate().getFullYear();
  }
}

/* ============================================================
   10. ATUALIZAÇÃO PERIÓDICA
   ============================================================ */

/**
 * Atualiza apenas os elementos dinâmicos (a cada segundo)
 */
function atualizarDinamico() {
  atualizarRelogio();
  atualizarStatusBanner();
  atualizarAulasAtivas();
}

/**
 * Atualiza o highlight da aula ativa na tabela
 */
function atualizarAulasAtivas() {
  const agora = getBrasiliaDate();
  const diaSemanaIndex = agora.getDay();
  const diaChave = DIA_MAP[diaSemanaIndex] || null;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const aulaAtualIdx = getAulaAtualIndex(minutosAgora);
  const fimUltimaAula = toMinutes(HORARIOS[HORARIOS.length - 1].fim);

  // Atualiza células da tabela
  const cells = document.querySelectorAll('.schedule-table td.today-col');
  cells.forEach(td => {
    const slotIdx = parseInt(td.dataset.slot, 10);
    td.classList.remove('current-aula', 'past-aula');

    if (aulaAtualIdx >= 0 && slotIdx === aulaAtualIdx) {
      td.classList.add('current-aula');
    } else if (aulaAtualIdx >= 0 && slotIdx < aulaAtualIdx) {
      td.classList.add('past-aula');
    } else if (aulaAtualIdx === -1 && minutosAgora >= fimUltimaAula) {
      td.classList.add('past-aula');
    }
  });

  // Atualiza card de aulas
  const liAulas = document.querySelectorAll('#aulasHoje .card__list-item');
  liAulas.forEach((li, idx) => {
    li.classList.remove('active');
    li.style.opacity = '';
    li.style.textDecoration = '';

    if (diaChave) {
      if (idx === aulaAtualIdx) {
        li.classList.add('active');
      } else if (aulaAtualIdx >= 0 && idx < aulaAtualIdx) {
        li.style.opacity = '0.5';
        li.style.textDecoration = 'line-through';
      } else if (aulaAtualIdx === -1 && minutosAgora >= fimUltimaAula) {
        li.style.opacity = '0.5';
        li.style.textDecoration = 'line-through';
      }
    }
  });

  // Atualiza próxima aula
  renderizarProximaAula();

  // Atualiza status geral
  renderizarStatusGeral();
}

/* ============================================================
   12. TEMA CLARO / ESCURO
   ============================================================ */

/* ============================================================
   12b. BANCO DE DADOS UNIFICADO (JSON)
   ============================================================
   Estrutura do banco:
   {
     "tema": "dark" | "light",
     "grade": { "segunda": [...], "terca": [...], ... },
     "anotacoes": [ { id, titulo, conteudo, criadoEm, atualizadoEm } ]
   }
   O localStorage é cache; o JSON exportável é a fonte de verdade.
   ============================================================ */

const DB_KEY = 'agendaEscolar:db_v1';

/**
 * Lê o banco do localStorage
 * @returns {{ tema: string, grade: object|null, anotacoes: Array }}
 */
function lerDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) { /* ignora */ }
  return { tema: null, grade: null, anotacoes: [] };
}

/**
 * Persiste o banco no localStorage
 * @param {object} db
 */
function salvarDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) { /* ignora */ }
}

/**
 * Atualiza um ou mais campos do banco e persiste
 * @param {Partial<{tema,grade,anotacoes}>} patch
 */
function atualizarDB(patch) {
  const db = lerDB();
  Object.assign(db, patch);
  salvarDB(db);
  return db;
}

/* ---- Tema ---- */

/**
 * Aplica o tema (light/dark) ao documento e persiste no DB
 * @param {string} tema
 */
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.setAttribute('aria-pressed', tema === 'light' ? 'true' : 'false');
  atualizarDB({ tema });
}

/**
 * Retorna o tema salvo no DB ou detecta preferência do sistema
 */
function obterTemaInicial() {
  const db = lerDB();
  if (db.tema === 'light' || db.tema === 'dark') return db.tema;
  // fallback: chave antiga (migração silenciosa)
  try {
    const legado = localStorage.getItem('agendaEscolar:tema');
    if (legado === 'light' || legado === 'dark') return legado;
  } catch (e) { /* ignora */ }
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
    ? 'light' : 'dark';
}

/**
 * Inicializa o botão de alternância de tema
 */
function initTema() {
  aplicarTema(obterTemaInicial());
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const atual = document.documentElement.getAttribute('data-theme') || 'dark';
    aplicarTema(atual === 'dark' ? 'light' : 'dark');
  });
}

/* ============================================================
   13. ANOTAÇÕES
   ============================================================ */

/** ID da anotação atualmente em edição (null = nova anotação) */
let notaEmEdicaoId = null;

/**
 * Lê todas as anotações do banco
 * @returns {Array}
 */
function obterAnotacoes() {
  const db = lerDB();
  return Array.isArray(db.anotacoes) ? db.anotacoes : [];
}

/**
 * Salva a lista completa de anotações no banco
 * @param {Array} notas
 */
function salvarAnotacoes(notas) {
  atualizarDB({ anotacoes: notas });
}

/**
 * Gera um ID único simples
 * @returns {string}
 */
function gerarIdNota() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Formata um timestamp para exibição (data + hora, Brasília)
 * @param {number} ts
 * @returns {string}
 */
function formatarDataNota(ts) {
  const d = new Date(ts);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const local = new Date(utc - 3 * 3600000);
  const dia = pad(local.getDate());
  const mes = pad(local.getMonth() + 1);
  const ano = local.getFullYear();
  const hh = pad(local.getHours());
  const mm = pad(local.getMinutes());
  return `${dia}/${mes}/${ano} às ${hh}:${mm}`;
}

/**
 * Renderiza os cards de anotações na grade
 */
function renderizarAnotacoes() {
  const grid = document.getElementById('notesGrid');
  const empty = document.getElementById('notesEmpty');
  if (!grid || !empty) return;

  const notas = obterAnotacoes().sort((a, b) => b.atualizadoEm - a.atualizadoEm);

  grid.innerHTML = '';

  if (notas.length === 0) {
    empty.classList.add('is-visible');
    grid.style.display = 'none';
    return;
  }

  empty.classList.remove('is-visible');
  grid.style.display = '';

  notas.forEach(nota => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'note-card';
    btn.dataset.id = nota.id;
    btn.setAttribute('aria-label', `Abrir anotação: ${nota.titulo || 'Sem título'}`);

    const titulo = document.createElement('div');
    titulo.className = 'note-card__title';
    titulo.textContent = nota.titulo || 'Sem título';

    const preview = document.createElement('div');
    preview.className = 'note-card__preview';
    preview.textContent = nota.conteudo || '';

    const data = document.createElement('div');
    data.className = 'note-card__date';
    data.textContent = formatarDataNota(nota.atualizadoEm);

    btn.appendChild(titulo);
    btn.appendChild(preview);
    btn.appendChild(data);

    btn.addEventListener('click', () => abrirVisualizacaoNota(nota.id));

    grid.appendChild(btn);
  });
}

/* ---- Tela de anotações (abrir/fechar) ---- */

function abrirTelaAnotacoes() {
  const tela = document.getElementById('notesScreen');
  if (!tela) return;
  renderizarAnotacoes();
  tela.classList.add('is-open');
  tela.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function fecharTelaAnotacoes() {
  const tela = document.getElementById('notesScreen');
  if (!tela) return;
  tela.classList.remove('is-open');
  tela.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ---- Modal de edição/criação ---- */

function abrirModalEdicao(notaId) {
  const modal = document.getElementById('notesEditModal');
  const titleInput = document.getElementById('noteTitleInput');
  const contentInput = document.getElementById('noteContentInput');
  const modalTitle = document.getElementById('notesEditTitle');
  const deleteBtn = document.getElementById('noteDeleteBtn');
  if (!modal || !titleInput || !contentInput) return;

  notaEmEdicaoId = notaId || null;

  if (notaId) {
    const nota = obterAnotacoes().find(n => n.id === notaId);
    titleInput.value = nota ? (nota.titulo || '') : '';
    contentInput.value = nota ? (nota.conteudo || '') : '';
    if (modalTitle) modalTitle.textContent = 'Editar anotação';
    if (deleteBtn) deleteBtn.hidden = false;
  } else {
    titleInput.value = '';
    contentInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Nova anotação';
    if (deleteBtn) deleteBtn.hidden = true;
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  setTimeout(() => contentInput.focus(), 150);
}

function fecharModalEdicao() {
  const modal = document.getElementById('notesEditModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  notaEmEdicaoId = null;
}

function salvarNota() {
  const titleInput = document.getElementById('noteTitleInput');
  const contentInput = document.getElementById('noteContentInput');
  if (!titleInput || !contentInput) return;

  const titulo = titleInput.value.trim();
  const conteudo = contentInput.value.trim();

  // Não salva nota completamente vazia
  if (!titulo && !conteudo) {
    fecharModalEdicao();
    return;
  }

  const notas = obterAnotacoes();
  const agora = Date.now();

  if (notaEmEdicaoId) {
    const idx = notas.findIndex(n => n.id === notaEmEdicaoId);
    if (idx >= 0) {
      notas[idx].titulo = titulo;
      notas[idx].conteudo = conteudo;
      notas[idx].atualizadoEm = agora;
    }
  } else {
    notas.push({
      id: gerarIdNota(),
      titulo,
      conteudo,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  salvarAnotacoes(notas);
  fecharModalEdicao();
  renderizarAnotacoes();
  renderizarAnotacoesHome();
}

function excluirNota() {
  if (!notaEmEdicaoId) return;
  const notas = obterAnotacoes().filter(n => n.id !== notaEmEdicaoId);
  salvarAnotacoes(notas);
  fecharModalEdicao();
  renderizarAnotacoes();
  renderizarAnotacoesHome();
}

/* ---- Modal de visualização ---- */

let notaVisualizandoId = null;

function abrirVisualizacaoNota(notaId) {
  const nota = obterAnotacoes().find(n => n.id === notaId);
  if (!nota) return;

  notaVisualizandoId = notaId;

  const modal = document.getElementById('notesViewModal');
  const titleEl = document.getElementById('notesViewTitle');
  const dateEl = document.getElementById('noteViewDate');
  const contentEl = document.getElementById('noteViewContent');
  if (!modal || !titleEl || !dateEl || !contentEl) return;

  titleEl.textContent = nota.titulo || 'Sem título';
  dateEl.textContent = `Atualizado em ${formatarDataNota(nota.atualizadoEm)}`;
  contentEl.textContent = nota.conteudo || '';

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function fecharVisualizacaoNota() {
  const modal = document.getElementById('notesViewModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  notaVisualizandoId = null;
}

/**
 * Inicializa todos os listeners da funcionalidade de anotações
 */
function initAnotacoes() {
  const notesButton = document.getElementById('notesButton');
  const notesBack = document.getElementById('notesBack');
  const notesFab = document.getElementById('notesFab');

  const editModal = document.getElementById('notesEditModal');
  const editBackdrop = document.getElementById('notesEditBackdrop');
  const editClose = document.getElementById('notesEditClose');
  const cancelBtn = document.getElementById('noteCancelBtn');
  const saveBtn = document.getElementById('noteSaveBtn');
  const deleteBtn = document.getElementById('noteDeleteBtn');

  const viewModal = document.getElementById('notesViewModal');
  const viewBackdrop = document.getElementById('notesViewBackdrop');
  const viewClose = document.getElementById('notesViewClose');
  const viewEditBtn = document.getElementById('noteViewEditBtn');

  if (notesButton) notesButton.addEventListener('click', abrirTelaAnotacoes);
  if (notesBack) notesBack.addEventListener('click', fecharTelaAnotacoes);
  if (notesFab) notesFab.addEventListener('click', () => abrirModalEdicao(null));

  if (editBackdrop) editBackdrop.addEventListener('click', fecharModalEdicao);
  if (editClose) editClose.addEventListener('click', fecharModalEdicao);
  if (cancelBtn) cancelBtn.addEventListener('click', fecharModalEdicao);
  if (saveBtn) saveBtn.addEventListener('click', salvarNota);
  if (deleteBtn) deleteBtn.addEventListener('click', excluirNota);

  if (viewBackdrop) viewBackdrop.addEventListener('click', fecharVisualizacaoNota);
  if (viewClose) viewClose.addEventListener('click', fecharVisualizacaoNota);
  if (viewEditBtn) {
    viewEditBtn.addEventListener('click', () => {
      const id = notaVisualizandoId;
      fecharVisualizacaoNota();
      abrirModalEdicao(id);
    });
  }

  // Tecla ESC fecha modais/tela abertos
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (editModal && editModal.classList.contains('is-open')) {
      fecharModalEdicao();
    } else if (viewModal && viewModal.classList.contains('is-open')) {
      fecharVisualizacaoNota();
    } else {
      const tela = document.getElementById('notesScreen');
      if (tela && tela.classList.contains('is-open')) fecharTelaAnotacoes();
    }
  });
}

/* ============================================================
   13b. GRADE HORÁRIA — EDIÇÃO, IMPORTAÇÃO E EXPORTAÇÃO (via DB unificado)
   ============================================================ */

/**
 * Carrega a grade do banco unificado para a variável GRADE
 */
function carregarGradeDoStorage() {
  const db = lerDB();
  if (db.grade && typeof db.grade === 'object' && !Array.isArray(db.grade)) {
    GRADE = db.grade;
    return true;
  }
  // Migração silenciosa da chave legada
  try {
    const legado = localStorage.getItem('agendaEscolar_grade_v1');
    if (legado) {
      const parsed = JSON.parse(legado);
      if (parsed && typeof parsed === 'object') {
        GRADE = parsed;
        atualizarDB({ grade: GRADE });
        localStorage.removeItem('agendaEscolar_grade_v1');
        return true;
      }
    }
  } catch (e) { /* ignora */ }
  return false;
}

/**
 * Valida um objeto de grade
 */
function validarGrade(obj) {
  const diasValidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
  if (typeof obj !== 'object' || Array.isArray(obj) || !obj) {
    return { ok: false, erro: 'O campo "grade" deve ser um objeto.' };
  }
  for (const chave of Object.keys(obj)) {
    if (!diasValidos.includes(chave)) {
      return { ok: false, erro: `Chave inválida em grade: "${chave}".` };
    }
    if (!Array.isArray(obj[chave])) {
      return { ok: false, erro: `"grade.${chave}" deve ser um array.` };
    }
  }
  return { ok: true };
}

/**
 * Importa um banco completo (JSON) — aplica tema, grade e anotações.
 * Aceita também JSONs parciais (só grade, só anotações, etc.)
 */
function importarBanco(obj) {
  if (typeof obj !== 'object' || Array.isArray(obj) || !obj) {
    return { ok: false, erro: 'O JSON deve ser um objeto.' };
  }

  const db = lerDB();
  let alterou = false;

  if (obj.tema === 'dark' || obj.tema === 'light') {
    db.tema = obj.tema;
    aplicarTema(obj.tema);
    alterou = true;
  }

  if (obj.grade !== undefined) {
    const r = validarGrade(obj.grade);
    if (!r.ok) return r;
    db.grade = obj.grade;
    GRADE = obj.grade;
    alterou = true;
  }

  if (Array.isArray(obj.anotacoes)) {
    db.anotacoes = obj.anotacoes;
    alterou = true;
  }

  if (!alterou) return { ok: false, erro: 'Nenhum campo reconhecido (esperado: tema, grade, anotacoes).' };

  salvarDB(db);
  return { ok: true };
}

/**
 * Exporta o banco completo como arquivo JSON
 */
function exportarBanco() {
  const db = lerDB();
  if (GRADE) db.grade = GRADE;
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agenda_escolar_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Abre o seletor de arquivo e importa o banco completo
 */
function abrirImportacaoBanco(onSuccess) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      const resultado = importarBanco(obj);
      if (resultado.ok) {
        atualizarTodaGrade();
        renderizarAnotacoes();
        renderizarAnotacoesHome();
        mostrarToast('Dados importados com sucesso! ✅');
        if (onSuccess) onSuccess(obj);
      } else {
        mostrarToast('Erro: ' + resultado.erro, true);
      }
    } catch (err) {
      mostrarToast('Arquivo JSON inválido. Verifique o formato.', true);
    }
  });
  input.click();
}

/**
 * Re-renderiza todos os componentes que dependem de GRADE
 */
function atualizarTodaGrade() {
  renderizarTabela();
  renderizarAulasHoje();
  renderizarProximaAula();
  renderizarMateriaisCard();
  renderizarStatusGeral();
  renderizarMateriaisSecao();
  atualizarStatusBanner();
}

/**
 * Toast de feedback genérico
 */
function mostrarToast(msg, erro = false) {
  let toast = document.getElementById('gradeToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gradeToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: .75rem 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      font-size: .875rem;
      font-family: var(--font-sans);
      z-index: 9999;
      opacity: 0;
      transition: opacity .3s ease, transform .3s ease;
      pointer-events: none;
      max-width: 90vw;
      text-align: center;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.borderColor = erro ? 'var(--accent-danger)' : 'var(--accent-success)';
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

/* ---- Editor visual da grade ---- */

const DIAS_EDITOR = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

function abrirEditorGrade() {
  const tela = document.getElementById('gradeEditorScreen');
  if (!tela) return;
  preencherEditorGrade();
  tela.classList.add('is-open');
  tela.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function fecharEditorGrade() {
  const tela = document.getElementById('gradeEditorScreen');
  if (!tela) return;
  tela.classList.remove('is-open');
  tela.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function preencherEditorGrade() {
  const tbody = document.getElementById('gradeEditorBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  HORARIOS.forEach((horario, rowIdx) => {
    const tr = document.createElement('tr');
    const tdH = document.createElement('td');
    tdH.innerHTML = `<div class="ge-horario-cell"><strong>${horario.slot}</strong>${horario.inicio}–${horario.fim}</div>`;
    tr.appendChild(tdH);

    DIAS_EDITOR.forEach(dia => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ge-input';
      input.placeholder = '—';
      input.dataset.dia = dia;
      input.dataset.slot = rowIdx;
      input.maxLength = 40;
      if (GRADE && GRADE[dia] && GRADE[dia][rowIdx]) {
        input.value = GRADE[dia][rowIdx];
      }
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const next = tbody.querySelector(`input[data-dia="${dia}"][data-slot="${rowIdx + 1}"]`);
          if (next) next.focus();
        }
      });
      td.appendChild(input);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function lerEditorGrade() {
  const tbody = document.getElementById('gradeEditorBody');
  if (!tbody) return null;
  const grade = {};
  DIAS_EDITOR.forEach(dia => { grade[dia] = []; });
  HORARIOS.forEach((_, rowIdx) => {
    DIAS_EDITOR.forEach(dia => {
      const input = tbody.querySelector(`input[data-dia="${dia}"][data-slot="${rowIdx}"]`);
      grade[dia].push(input ? input.value.trim() : '');
    });
  });
  return grade;
}

function salvarEditorGrade() {
  const grade = lerEditorGrade();
  if (!grade) return;
  GRADE = grade;
  atualizarDB({ grade });
  atualizarTodaGrade();
  fecharEditorGrade();
  mostrarToast('Grade salva com sucesso! ✅');
}

function limparEditorGrade() {
  if (!confirm('Apagar todas as matérias da grade?')) return;
  document.querySelectorAll('#gradeEditorBody .ge-input').forEach(i => { i.value = ''; });
}

/**
 * Inicializa toda a lógica da grade e dos botões de import/export do banco
 */
function initImportacaoGrade() {
  carregarGradeDoStorage();

  const btnEditar   = document.getElementById('btnEditarGrade');
  const btnImportar = document.getElementById('btnImportarGrade');
  if (btnEditar)   btnEditar.addEventListener('click', abrirEditorGrade);
  if (btnImportar) btnImportar.addEventListener('click', () => abrirImportacaoBanco());

  const btnVoltar         = document.getElementById('gradeEditorBack');
  const btnSalvar         = document.getElementById('gradeEditorSalvar');
  const btnExportar       = document.getElementById('gradeEditorExportar');
  const btnImportarEditor = document.getElementById('gradeEditorImportar');
  const btnLimpar         = document.getElementById('gradeEditorLimpar');

  if (btnVoltar)   btnVoltar.addEventListener('click', fecharEditorGrade);
  if (btnSalvar)   btnSalvar.addEventListener('click', salvarEditorGrade);
  if (btnExportar) btnExportar.addEventListener('click', exportarBanco);
  if (btnImportarEditor) btnImportarEditor.addEventListener('click', () => {
    abrirImportacaoBanco(() => {
      const tela = document.getElementById('gradeEditorScreen');
      if (tela && tela.classList.contains('is-open')) preencherEditorGrade();
    });
  });
  if (btnLimpar) btnLimpar.addEventListener('click', limparEditorGrade);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const tela = document.getElementById('gradeEditorScreen');
      if (tela && tela.classList.contains('is-open')) fecharEditorGrade();
    }
  });
}

/* ============================================================
   13c. ANOTAÇÕES NA PÁGINA INICIAL
   ============================================================ */

/**
 * Renderiza um preview das anotações na seção da página inicial
 */
function renderizarAnotacoesHome() {
  const grid = document.getElementById('homeNotesGrid');
  const emptyEl = document.getElementById('homeNotesEmpty');
  if (!grid) return;

  const notas = obterAnotacoes().sort((a, b) => b.atualizadoEm - a.atualizadoEm);

  grid.innerHTML = '';

  if (notas.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    grid.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  grid.style.display = '';

  notas.forEach(nota => {
    const card = document.createElement('div');
    card.className = 'home-note-card';
    card.dataset.id = nota.id;

    const header = document.createElement('div');
    header.className = 'home-note-card__header';

    const titulo = document.createElement('div');
    titulo.className = 'home-note-card__title';
    titulo.textContent = nota.titulo || 'Sem título';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'home-note-card__edit';
    editBtn.setAttribute('aria-label', `Editar anotação: ${nota.titulo || 'Sem título'}`);
    editBtn.title = 'Editar';
    editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModalEdicao(nota.id);
    });

    header.appendChild(titulo);
    header.appendChild(editBtn);

    const preview = document.createElement('div');
    preview.className = 'home-note-card__preview';
    preview.textContent = nota.conteudo || '';

    const data = document.createElement('div');
    data.className = 'home-note-card__date';
    data.textContent = formatarDataNota(nota.atualizadoEm);

    card.appendChild(header);
    card.appendChild(preview);
    card.appendChild(data);

    // Clicar no card (fora do botão de editar) abre visualização
    card.addEventListener('click', () => abrirVisualizacaoNota(nota.id));

    grid.appendChild(card);
  });
}



/**
 * Inicializa toda a aplicação
 */
function init() {
  // Tema (deve ser o mais cedo possível para evitar flash)
  initTema();

  // Importação de grade horária via JSON
  initImportacaoGrade();

  // Anotações
  initAnotacoes();

  // Renderizações estáticas (uma vez)
  renderizarTabela();
  renderizarAulasHoje();
  renderizarProximaAula();
  renderizarMateriaisCard();
  renderizarStatusGeral();
  renderizarMateriaisSecao();
  renderizarAvisos();
  renderizarAnotacoesHome();
  atualizarFooter();

  // Primeira atualização do relógio
  atualizarRelogio();
  atualizarStatusBanner();

  // Atualização a cada segundo (relógio + status)
  setInterval(atualizarDinamico, 999);

  // Atualização a cada minuto (cards e tabela completa)
  setInterval(() => {
    renderizarAulasHoje();
    renderizarMateriaisCard();
    renderizarStatusGeral();
    atualizarAulasAtivas();
  }, 60000);

  // Atualização a cada hora (rerender completo da tabela)
  setInterval(() => {
    renderizarTabela();
    renderizarMateriaisSecao();
  }, 3600000);

  console.log('[AgendaEscolar] Inicializado com sucesso — Horário de Brasília (UTC-3)');
}

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
