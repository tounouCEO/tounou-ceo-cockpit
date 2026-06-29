const STORAGE_KEY = 'tounou-ceo-os-v1';

const seed = {
  okrs: [
    {
      id: 'okr-revenue-100b',
      title: '3년 내 연매출 1000억 달성을 위한 실행 체계 구축',
      krs: [
        { id: 'kr-d2c-roas', title: '자사몰 ROAS 400% 기준의 반복 가능한 성장 루프 구축', progress: 38 },
        { id: 'kr-29cm', title: '29CM 월매출 기여 구조를 안정화하고 상품별 승자 식별', progress: 52 },
        { id: 'kr-ai-os', title: 'AI CEO/Hermes 기반 대표 실행 OS 정착', progress: 21 }
      ]
    },
    {
      id: 'okr-personal-focus',
      title: 'Bryan 대표의 주간·데일리 의사결정 피로도 50% 감소',
      krs: [
        { id: 'kr-top3', title: '매일 오전 Top 3 의사결정 항목 자동 정리', progress: 35 },
        { id: 'kr-meeting', title: '모든 주요 미팅 전 3분 브리핑 체계화', progress: 28 }
      ]
    }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: '29CM 주간 매출 리스크 점검',
      priority: 'P0',
      status: 'Today',
      krId: 'kr-29cm',
      body: '- 수기 Sheet 기준 전일/주간 매출 확인\n- 상품별 승자/하락 SKU 확인\n- MD/마케팅 액션 분리\n\nAI 요약: 29CM은 자사몰과 목표 ROAS 기준이 다르므로 별도 판단합니다.',
      source: 'Manual',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: 'CEO OS 업무 카드 에디터 MVP 검토',
      priority: 'P1',
      status: 'In Progress',
      krId: 'kr-ai-os',
      body: '- Markdown/Rich text 병행 저장\n- Notion write-back은 승인 기반\n- 오늘은 로컬 CRUD 사용성부터 확정',
      source: 'Manual',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: '오늘 미팅 후속 조치 체크아웃',
      priority: 'P1',
      status: 'This Week',
      krId: 'kr-top3',
      body: '- 미팅 결정사항 정리\n- 후속 담당자 지정\n- Discord CEO 채널 보고 초안 생성',
      source: 'Manual',
      createdAt: new Date().toISOString()
    }
  ],
  events: [
    { eventId: 'gcal-standup-001', time: '10:00', title: '마케팅 주간 액션 싱크', attendees: '마케팅팀', deleted: false },
    { eventId: 'gcal-md-002', time: '14:00', title: 'MD 상품 우선순위 리뷰', attendees: '상품기획팀', deleted: false },
    { eventId: 'gcal-coo-003', time: '17:00', title: 'COO 복귀 업무 브리핑', attendees: 'COO / AI CEO', deleted: false }
  ],
  hermesJobs: [
    { id: crypto.randomUUID(), title: '위키에서 금주 미완료 결정사항 재조회', status: 'queued' },
    { id: crypto.randomUUID(), title: 'Calendar 기반 미팅 브리핑 후보 생성', status: 'needs approval' }
  ],
  briefings: []
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(seed);
    const parsed = JSON.parse(saved);
    return { ...structuredClone(seed), ...parsed };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function krOptions() {
  return state.okrs.flatMap(o => o.krs.map(kr => ({ ...kr, objective: o.title })));
}

function findKr(id) {
  return krOptions().find(kr => kr.id === id);
}

function taskSummary(body = '') {
  return body.replace(/[#*`>-]/g, '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 2).join(' · ');
}

function setView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${view}`));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  const titles = { today: '오늘', tasks: '업무', okr: 'OKR', calendar: '캘린더', briefing: '브리핑', hermes: 'Hermes' };
  document.getElementById('view-title').textContent = titles[view] || '오늘';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function badge(text, extra = '') {
  return `<span class="badge ${extra}">${text}</span>`;
}

function renderToday() {
  const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  document.getElementById('today-date').textContent = date;
  const todayTasks = state.tasks.filter(t => t.status === 'Today' || t.status === 'In Progress');
  const doneToday = state.tasks.filter(t => t.status === 'Done').length;
  const progress = state.tasks.length ? Math.round((doneToday / state.tasks.length) * 100) : 0;
  document.getElementById('today-progress').textContent = `${progress}%`;
  document.getElementById('today-focus').innerHTML = todayTasks.length ? todayTasks.map(renderListTask).join('') : '<p class="muted">오늘 지정된 업무가 없습니다.</p>';
  document.getElementById('today-meetings').innerHTML = state.events.map(e => `
    <div class="list-item">
      <strong>${e.time} · ${e.title}</strong>
      <div class="meta-row">${badge(e.attendees)} ${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('Google Calendar')}</div>
    </div>`).join('');
  document.getElementById('okr-pressure').textContent = new Set(state.tasks.map(t => t.krId).filter(Boolean)).size + ' KR';
  document.getElementById('approval-count').textContent = state.tasks.filter(t => t.status === 'Waiting').length + '건';
  document.getElementById('hermes-count').textContent = state.hermesJobs.length + '개';
}

function renderListTask(t) {
  const kr = findKr(t.krId);
  return `<div class="list-item">
    <strong>${t.title}</strong>
    <div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${badge(t.status)}${kr ? badge(kr.title) : ''}</div>
  </div>`;
}

function renderTasks() {
  const filter = document.getElementById('task-filter')?.value || 'all';
  const statuses = ['Today', 'In Progress', 'This Week', 'Waiting'];
  const filtered = state.tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'P0' || filter === 'P1') return t.priority === filter;
    return t.status === filter;
  });
  document.getElementById('task-board').innerHTML = statuses.map(status => {
    const tasks = filtered.filter(t => t.status === status);
    return `<section class="column"><h4>${status}<span>${tasks.length}</span></h4>${tasks.map(renderTaskCard).join('') || '<p class="muted" style="padding:0 6px">비어 있음</p>'}</section>`;
  }).join('');
}

function renderTaskCard(t) {
  const kr = findKr(t.krId);
  return `<article class="task-card">
    <button data-edit-task="${t.id}">
      <h5>${t.title}</h5>
      <p>${taskSummary(t.body) || '메모 없음'}</p>
      <div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${kr ? badge(kr.title) : ''}${t.source === 'Calendar' ? badge('Calendar') : ''}</div>
    </button>
  </article>`;
}

function renderOkrs() {
  document.getElementById('okr-list').innerHTML = state.okrs.map(o => `<article class="okr-card">
    <h4>${o.title}</h4>
    ${o.krs.map(kr => `<div class="kr-row"><div><strong>${kr.title}</strong><div class="progress"><span style="width:${kr.progress}%"></span></div></div><strong>${kr.progress}%</strong></div>`).join('')}
  </article>`).join('');
}

function renderCalendar() {
  document.getElementById('calendar-events').innerHTML = state.events.map(e => `<div class="list-item"><strong>${e.time} · ${e.title}</strong><div class="meta-row">${badge(e.eventId)}${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('active', 'done')}</div></div>`).join('');
}

function renderBriefing() {
  if (!state.briefings.length) generateBriefing(false);
  document.getElementById('briefing-list').innerHTML = state.briefings.map(b => `<article class="briefing-item"><p class="eyebrow">${b.type}</p><h4>${b.title}</h4><p class="muted">${b.body}</p><div class="meta-row">${b.refs.map(r => badge(r)).join('')}</div></article>`).join('');
}

function renderHermes() {
  document.getElementById('hermes-jobs').innerHTML = state.hermesJobs.map(j => `<div class="list-item"><strong>${j.title}</strong><div class="meta-row">${badge(j.status, j.status.includes('approval') ? 'wait' : '')}</div></div>`).join('');
}

function renderAll() {
  renderToday(); renderTasks(); renderOkrs(); renderCalendar(); renderBriefing(); renderHermes();
}

function openTaskDialog(taskId = '') {
  const task = state.tasks.find(t => t.id === taskId);
  document.getElementById('dialog-title').textContent = task ? '업무 수정' : '업무 생성';
  document.getElementById('task-id').value = task?.id || '';
  document.getElementById('task-title').value = task?.title || '';
  document.getElementById('task-priority').value = task?.priority || 'P1';
  document.getElementById('task-status').value = task?.status || 'Today';
  document.getElementById('task-body').value = task?.body || '';
  const krSelect = document.getElementById('task-kr');
  krSelect.innerHTML = '<option value="">연결 안 함</option>' + krOptions().map(kr => `<option value="${kr.id}">${kr.title}</option>`).join('');
  krSelect.value = task?.krId || '';
  document.getElementById('delete-task').style.visibility = task ? 'visible' : 'hidden';
  document.getElementById('task-dialog').showModal();
}

function saveTask(event) {
  event.preventDefault();
  const id = document.getElementById('task-id').value || crypto.randomUUID();
  const payload = {
    id,
    title: document.getElementById('task-title').value.trim(),
    priority: document.getElementById('task-priority').value,
    status: document.getElementById('task-status').value,
    krId: document.getElementById('task-kr').value,
    body: document.getElementById('task-body').value,
    source: state.tasks.find(t => t.id === id)?.source || 'Manual',
    createdAt: state.tasks.find(t => t.id === id)?.createdAt || new Date().toISOString()
  };
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx >= 0) state.tasks[idx] = payload; else state.tasks.unshift(payload);
  saveState(); renderAll(); document.getElementById('task-dialog').close();
}

function deleteTask() {
  const id = document.getElementById('task-id').value;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState(); renderAll(); document.getElementById('task-dialog').close();
}

function syncCalendarToTasks() {
  const existing = new Set(state.tasks.filter(t => t.eventId).map(t => t.eventId));
  const created = [];
  for (const e of state.events) {
    if (existing.has(e.eventId)) continue;
    const task = {
      id: crypto.randomUUID(),
      eventId: e.eventId,
      title: `[미팅 준비] ${e.title}`,
      priority: 'P1',
      status: 'Today',
      krId: 'kr-meeting',
      body: `- 참석자: ${e.attendees}\n- 일정: ${e.time}\n- 미팅 전 확인할 위키/Notion 자료 붙이기\n- 미팅 후 결정사항과 후속 조치 기록`,
      source: 'Calendar',
      createdAt: new Date().toISOString()
    };
    state.tasks.unshift(task);
    created.push(task);
  }
  saveState(); renderAll();
  alert(created.length ? `${created.length}개의 Calendar 업무 후보를 생성했습니다.` : '새로 생성할 Calendar 업무가 없습니다. event_id 기준 중복 방지됨.');
}

function openOkrDialog() { document.getElementById('okr-title').value = ''; document.getElementById('okr-krs').value = ''; document.getElementById('okr-dialog').showModal(); }
function saveOkr(event) {
  event.preventDefault();
  const title = document.getElementById('okr-title').value.trim();
  const lines = document.getElementById('okr-krs').value.split('\n').map(s => s.trim()).filter(Boolean);
  state.okrs.push({ id: crypto.randomUUID(), title, krs: lines.map(line => ({ id: crypto.randomUUID(), title: line, progress: 0 })) });
  saveState(); renderAll(); document.getElementById('okr-dialog').close();
}

function generateBriefing(persist = true) {
  const p0 = state.tasks.filter(t => t.priority === 'P0' && t.status !== 'Done');
  const meetings = state.events.filter(e => !e.deleted);
  state.briefings = [
    { type: '결론', title: `오늘은 P0 ${p0.length}건과 미팅 ${meetings.length}건에 집중`, body: '업무는 OKR과 Calendar 기준으로 압축했습니다. 완료보다 중요한 것은 대표가 오늘 직접 결정해야 할 병목을 제거하는 것입니다.', refs: ['OKR', 'Calendar', 'Tasks'] },
    { type: '리스크', title: 'Notion/Calendar 실연동 전 보안 경계 유지', body: '현재는 로컬 저장 MVP입니다. OAuth token, Notion secret, Hermes webhook secret은 frontend에 넣지 않습니다.', refs: ['Security', 'Audit log'] },
    { type: '다음 액션', title: 'Backend + DB + Auth로 실데이터 전환 준비', body: '업무/OKR CRUD 사용성이 고정되면 Supabase 또는 Vercel Postgres 기반 backend와 Google read-only sync를 붙이는 순서가 맞습니다.', refs: ['Backend', 'Google OAuth'] }
  ];
  if (persist) { saveState(); renderBriefing(); }
}

function addHermesJob() {
  state.hermesJobs.unshift({ id: crypto.randomUUID(), title: 'CEO OS 다음 개발 이슈 분해 및 실행 순서 제안', status: 'queued' });
  saveState(); renderAll();
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(seed);
  saveState(); renderAll();
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) setView(viewButton.dataset.view);
  const jump = event.target.closest('[data-jump]');
  if (jump) setView(jump.dataset.jump);
  const edit = event.target.closest('[data-edit-task]');
  if (edit) openTaskDialog(edit.dataset.editTask);
});

document.getElementById('new-task-top').addEventListener('click', () => openTaskDialog());
document.getElementById('new-task-board').addEventListener('click', () => openTaskDialog());
document.getElementById('task-form').addEventListener('submit', saveTask);
document.getElementById('delete-task').addEventListener('click', deleteTask);
document.getElementById('task-filter').addEventListener('change', renderTasks);
document.getElementById('sync-calendar').addEventListener('click', syncCalendarToTasks);
document.getElementById('sync-calendar-2').addEventListener('click', syncCalendarToTasks);
document.getElementById('new-okr').addEventListener('click', openOkrDialog);
document.getElementById('okr-form').addEventListener('submit', saveOkr);
document.getElementById('generate-briefing').addEventListener('click', () => generateBriefing(true));
document.getElementById('add-hermes-job').addEventListener('click', addHermesJob);
document.getElementById('reset-demo').addEventListener('click', resetDemo);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

saveState();
renderAll();
