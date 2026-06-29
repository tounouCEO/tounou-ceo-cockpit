const APP_VERSION = 'polish-1';
const STORAGE_KEY = 'tounou-ceo-os-v2';
const LEGACY_STORAGE_KEY = 'tounou-ceo-os-v1';

const ALL_STATUSES = ['Backlog', 'This Week', 'Today', 'In Progress', 'Waiting', 'Done', 'Dropped'];
const STATUS_LABELS = {
  Backlog: '백로그',
  'This Week': '이번 주',
  Today: '오늘',
  'In Progress': '진행 중',
  Waiting: '대기',
  Done: '완료',
  Dropped: '보류'
};
const PRIORITIES = ['P0', 'P1', 'P2'];

const makeId = () => {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
const clone = (value) => {
  if (window.structuredClone) return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const seed = {
  version: APP_VERSION,
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
      id: makeId(),
      title: '29CM 주간 매출 리스크 점검',
      priority: 'P0',
      status: 'Today',
      krId: 'kr-29cm',
      body: '- 수기 Sheet 기준 전일/주간 매출 확인\n- 상품별 승자/하락 SKU 확인\n- MD/마케팅 액션 분리\n\nAI 요약: 29CM은 자사몰과 목표 ROAS 기준이 다르므로 별도 판단합니다.',
      source: 'Manual',
      createdAt: new Date().toISOString()
    },
    {
      id: makeId(),
      title: 'CEO OS 업무 카드 에디터 MVP 검토',
      priority: 'P1',
      status: 'In Progress',
      krId: 'kr-ai-os',
      body: '- Markdown/Rich text 병행 저장\n- Notion 반영은 승인 기반\n- 오늘은 로컬 CRUD 사용성부터 확정',
      source: 'Manual',
      createdAt: new Date().toISOString()
    },
    {
      id: makeId(),
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
    { id: makeId(), title: '위키에서 금주 미완료 결정사항 재조회', status: 'queued' },
    { id: makeId(), title: 'Calendar 기반 미팅 브리핑 후보 생성', status: 'needs approval' }
  ],
  briefings: []
};

let state = loadState();
let activeView = 'today';
let toastTimer;

function cleanText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeKr(kr = {}) {
  return {
    id: cleanText(kr.id) || makeId(),
    title: cleanText(kr.title, '새 KR'),
    progress: clampProgress(kr.progress)
  };
}

function normalizeOkr(okr = {}) {
  const krs = Array.isArray(okr.krs) ? okr.krs.map(normalizeKr).filter(kr => kr.title) : [];
  return {
    id: cleanText(okr.id) || makeId(),
    title: cleanText(okr.title, '새 Objective'),
    krs
  };
}

function normalizeTask(task = {}) {
  const priority = PRIORITIES.includes(task.priority) ? task.priority : 'P1';
  const status = ALL_STATUSES.includes(task.status) ? task.status : 'Backlog';
  return {
    id: cleanText(task.id) || makeId(),
    eventId: cleanText(task.eventId),
    title: cleanText(task.title, '제목 없는 업무'),
    priority,
    status,
    krId: cleanText(task.krId),
    body: String(task.body ?? ''),
    source: cleanText(task.source, 'Manual'),
    createdAt: cleanText(task.createdAt) || new Date().toISOString()
  };
}

function normalizeEvent(event = {}) {
  return {
    eventId: cleanText(event.eventId) || makeId(),
    time: cleanText(event.time, '시간 미정'),
    title: cleanText(event.title, '제목 없는 일정'),
    attendees: cleanText(event.attendees, '참석자 미정'),
    deleted: Boolean(event.deleted)
  };
}

function normalizeJob(job = {}) {
  return {
    id: cleanText(job.id) || makeId(),
    title: cleanText(job.title, '제목 없는 Hermes 작업'),
    status: cleanText(job.status, 'queued')
  };
}

function normalizeBriefing(briefing = {}) {
  return {
    type: cleanText(briefing.type, '메모'),
    title: cleanText(briefing.title, '브리핑'),
    body: cleanText(briefing.body),
    refs: Array.isArray(briefing.refs) ? briefing.refs.map(r => cleanText(r)).filter(Boolean) : []
  };
}

function normalizeState(raw = {}) {
  const base = clone(seed);
  return {
    version: APP_VERSION,
    okrs: Array.isArray(raw.okrs) ? raw.okrs.map(normalizeOkr) : base.okrs,
    tasks: Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask) : base.tasks,
    events: Array.isArray(raw.events) ? raw.events.map(normalizeEvent) : base.events,
    hermesJobs: Array.isArray(raw.hermesJobs) ? raw.hermesJobs.map(normalizeJob) : base.hermesJobs,
    briefings: Array.isArray(raw.briefings) ? raw.briefings.map(normalizeBriefing) : base.briefings
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return normalizeState(seed);
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState(seed);
  }
}

function saveState() {
  try {
    state.version = APP_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showToast('저장 공간 문제로 변경사항을 저장하지 못했습니다.', 'error');
    return false;
  }
}

function krOptions() {
  return state.okrs.flatMap(o => o.krs.map(kr => ({ ...kr, objective: o.title })));
}

function findKr(id) {
  return krOptions().find(kr => kr.id === id);
}

function taskSummary(body = '') {
  return String(body).replace(/[#*`>-]/g, '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 2).join(' · ');
}

function krAlias(kr) {
  if (!kr) return '';
  if (kr.id.includes('29cm')) return 'KR: 29CM';
  if (kr.id.includes('ai')) return 'KR: AI OS';
  if (kr.id.includes('meeting')) return 'KR: 미팅';
  if (kr.id.includes('top3')) return 'KR: Top 3';
  return `KR: ${kr.title.slice(0, 14)}${kr.title.length > 14 ? '…' : ''}`;
}

function setView(view) {
  activeView = document.getElementById(`view-${view}`) ? view : 'today';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${activeView}`));
  document.querySelectorAll('[data-view]').forEach(b => {
    const active = b.dataset.view === activeView;
    b.classList.toggle('is-active', active);
    if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const titles = { today: '오늘', tasks: '업무', okr: 'OKR', calendar: '캘린더', briefing: '브리핑', hermes: 'Hermes' };
  const title = document.getElementById('view-title');
  if (title) title.textContent = titles[activeView] || '오늘';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function badge(text, extra = '') {
  const className = String(extra || '').replace(/[^a-z0-9_-]/gi, '');
  return `<span class="badge ${className}">${escapeHtml(text)}</span>`;
}

function emptyState(message, actionText = '', action = '') {
  return `<div class="empty-state"><p>${escapeHtml(message)}</p>${actionText ? `<button class="text-btn pill" data-action="${escapeAttr(action)}">${escapeHtml(actionText)}</button>` : ''}</div>`;
}

function renderToday() {
  const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  document.getElementById('today-date').textContent = date;
  const todayScope = state.tasks.filter(t => ['Today', 'In Progress', 'Done'].includes(t.status));
  const focusTasks = state.tasks
    .filter(t => ['Today', 'In Progress'].includes(t.status))
    .sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority));
  const doneToday = todayScope.filter(t => t.status === 'Done').length;
  const progress = todayScope.length ? Math.round((doneToday / todayScope.length) * 100) : 0;
  document.getElementById('today-progress').textContent = `${progress}%`;
  document.getElementById('today-focus').innerHTML = focusTasks.length ? focusTasks.map(renderListTask).join('') : emptyState('오늘 집중 업무가 없습니다.', '오늘 P0 만들기', 'new-task');
  document.getElementById('today-meetings').innerHTML = state.events.length ? state.events.map(e => `
    <div class="list-item">
      <strong>${escapeHtml(e.time)} · ${escapeHtml(e.title)}</strong>
      <div class="meta-row">${badge(e.attendees)} ${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('Google Calendar')}</div>
    </div>`).join('') : emptyState('오늘 일정이 없습니다.', '캘린더 보기', 'calendar');
  document.getElementById('okr-pressure').textContent = new Set(state.tasks.map(t => t.krId).filter(Boolean)).size + ' KR';
  document.getElementById('approval-count').textContent = state.tasks.filter(t => t.status === 'Waiting').length + '건';
  document.getElementById('hermes-count').textContent = state.hermesJobs.length + '개';
}

function renderListTask(t) {
  const kr = findKr(t.krId);
  return `<div class="list-item">
    <strong>${escapeHtml(t.title)}</strong>
    <div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${badge(STATUS_LABELS[t.status] || t.status)}${kr ? badge(krAlias(kr)) : ''}</div>
  </div>`;
}

function renderTasks() {
  const filter = document.getElementById('task-filter')?.value || 'all';
  const filtered = state.tasks.filter(t => {
    if (filter === 'all') return true;
    if (PRIORITIES.includes(filter)) return t.priority === filter;
    return t.status === filter;
  });
  document.getElementById('task-board').innerHTML = ALL_STATUSES.map(status => {
    const tasks = filtered.filter(t => t.status === status).sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority));
    const emptyCopy = status === 'Done' ? '완료 업무 없음' : status === 'Waiting' ? '승인 대기 없음' : '비어 있음';
    return `<section class="column"><h4>${escapeHtml(STATUS_LABELS[status])}<span>${tasks.length}</span></h4>${tasks.map(renderTaskCard).join('') || emptyState(emptyCopy)}</section>`;
  }).join('');
}

function renderTaskCard(t) {
  const kr = findKr(t.krId);
  return `<article class="task-card">
    <button data-edit-task="${escapeAttr(t.id)}" aria-label="업무 열기: ${escapeAttr(t.title)}">
      <h5>${escapeHtml(t.title)}</h5>
      <p>${escapeHtml(taskSummary(t.body) || '메모 없음')}</p>
      <div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${badge(STATUS_LABELS[t.status] || t.status)}${kr ? badge(krAlias(kr)) : ''}${t.source === 'Calendar' ? badge('Calendar') : ''}</div>
    </button>
  </article>`;
}

function renderOkrs() {
  document.getElementById('okr-list').innerHTML = state.okrs.length ? state.okrs.map(o => `<article class="okr-card">
    <h4>${escapeHtml(o.title)}</h4>
    ${o.krs.length ? o.krs.map(kr => `<div class="kr-row"><div><strong>${escapeHtml(kr.title)}</strong><div class="progress"><span style="width:${clampProgress(kr.progress)}%"></span></div></div><strong>${clampProgress(kr.progress)}%</strong></div>`).join('') : '<p class="muted">연결된 KR이 없습니다.</p>'}
  </article>`).join('') : emptyState('등록된 Objective가 없습니다.', 'Objective 만들기', 'new-okr');
}

function renderCalendar() {
  document.getElementById('calendar-events').innerHTML = state.events.map(e => `<div class="list-item"><strong>${escapeHtml(e.time)} · ${escapeHtml(e.title)}</strong><div class="meta-row">${badge(e.eventId)}${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('연동됨', 'done')}</div></div>`).join('') || emptyState('연동된 일정이 없습니다.');
}

function renderBriefing() {
  if (!state.briefings.length) generateBriefing(false);
  document.getElementById('briefing-list').innerHTML = state.briefings.map(b => `<article class="briefing-item"><p class="eyebrow">${escapeHtml(b.type)}</p><h4>${escapeHtml(b.title)}</h4><p class="muted">${escapeHtml(b.body)}</p><div class="meta-row">${b.refs.map(r => badge(r)).join('')}</div></article>`).join('');
}

function renderHermes() {
  document.getElementById('hermes-jobs').innerHTML = state.hermesJobs.map(j => `<div class="list-item"><strong>${escapeHtml(j.title)}</strong><div class="meta-row">${badge(j.status.includes('approval') ? '승인 필요' : j.status, j.status.includes('approval') ? 'wait' : '')}</div></div>`).join('') || emptyState('Hermes 실행 큐가 비어 있습니다.', '조사 작업 추가', 'add-hermes');
}

function renderAll() {
  renderToday();
  renderTasks();
  renderOkrs();
  renderCalendar();
  renderBriefing();
  renderHermes();
}

function populateKrOptions(selected = '') {
  const krSelect = document.getElementById('task-kr');
  if (!krSelect) return;
  krSelect.replaceChildren();
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '연결 안 함';
  krSelect.append(empty);
  for (const kr of krOptions()) {
    const option = document.createElement('option');
    option.value = kr.id;
    option.textContent = krAlias(kr);
    krSelect.append(option);
  }
  krSelect.value = selected;
}

function openTaskDialog(taskId = '') {
  const task = state.tasks.find(t => t.id === taskId);
  document.getElementById('dialog-title').textContent = task ? '업무 수정' : '업무 생성';
  document.getElementById('task-id').value = task?.id || '';
  document.getElementById('task-title').value = task?.title || '';
  document.getElementById('task-priority').value = task?.priority || 'P1';
  document.getElementById('task-status').value = task?.status || 'Today';
  document.getElementById('task-body').value = task?.body || '';
  populateKrOptions(task?.krId || '');
  document.getElementById('delete-task').style.visibility = task ? 'visible' : 'hidden';
  const dialog = document.getElementById('task-dialog');
  dialog.showModal();
  requestAnimationFrame(() => document.getElementById('task-title').focus());
}

function saveTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  if (!title) {
    showToast('업무 제목을 입력해야 저장됩니다.', 'error');
    document.getElementById('task-title').focus();
    return;
  }
  const id = document.getElementById('task-id').value || makeId();
  const previous = state.tasks.find(t => t.id === id);
  const payload = {
    id,
    eventId: previous?.eventId || '',
    title,
    priority: document.getElementById('task-priority').value,
    status: document.getElementById('task-status').value,
    krId: document.getElementById('task-kr').value,
    body: document.getElementById('task-body').value,
    source: previous?.source || 'Manual',
    createdAt: previous?.createdAt || new Date().toISOString()
  };
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx >= 0) state.tasks[idx] = normalizeTask(payload); else state.tasks.unshift(normalizeTask(payload));
  if (saveState()) {
    renderAll();
    document.getElementById('task-dialog').close();
    showToast('업무가 저장됐습니다.');
  }
}

function deleteTask() {
  const id = document.getElementById('task-id').value;
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  if (!window.confirm(`업무를 삭제할까요?\n${task.title}`)) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  if (saveState()) {
    renderAll();
    document.getElementById('task-dialog').close();
    showToast('업무를 삭제했습니다.');
  }
}

function syncCalendarToTasks() {
  const existing = new Set(state.tasks.filter(t => t.eventId).map(t => t.eventId));
  const created = [];
  for (const e of state.events) {
    if (existing.has(e.eventId)) continue;
    const task = normalizeTask({
      id: makeId(),
      eventId: e.eventId,
      title: `[미팅 준비] ${e.title}`,
      priority: 'P1',
      status: 'Today',
      krId: 'kr-meeting',
      body: `- 참석자: ${e.attendees}\n- 일정: ${e.time}\n- 미팅 전 확인할 위키/Notion 자료 붙이기\n- 미팅 후 결정사항과 후속 조치 기록`,
      source: 'Calendar',
      createdAt: new Date().toISOString()
    });
    state.tasks.unshift(task);
    created.push(task);
  }
  if (saveState()) {
    renderAll();
    showToast(created.length ? `${created.length}개의 Calendar 업무 후보를 생성했습니다.` : '새로 생성할 Calendar 업무가 없습니다. event_id 기준 중복 방지됨.');
  }
}

function openOkrDialog() {
  document.getElementById('okr-title').value = '';
  document.getElementById('okr-krs').value = '';
  const dialog = document.getElementById('okr-dialog');
  dialog.showModal();
  requestAnimationFrame(() => document.getElementById('okr-title').focus());
}

function saveOkr(event) {
  event.preventDefault();
  const title = document.getElementById('okr-title').value.trim();
  const lines = document.getElementById('okr-krs').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!title) {
    showToast('Objective 제목을 입력해야 저장됩니다.', 'error');
    document.getElementById('okr-title').focus();
    return;
  }
  if (!lines.length) {
    showToast('Key Result를 최소 1개 입력해야 합니다.', 'error');
    document.getElementById('okr-krs').focus();
    return;
  }
  state.okrs.push(normalizeOkr({ id: makeId(), title, krs: lines.map(line => ({ id: makeId(), title: line, progress: 0 })) }));
  if (saveState()) {
    renderAll();
    document.getElementById('okr-dialog').close();
    showToast('Objective가 저장됐습니다.');
  }
}

function generateBriefing(persist = true) {
  const p0 = state.tasks.filter(t => t.priority === 'P0' && t.status !== 'Done');
  const meetings = state.events.filter(e => !e.deleted);
  state.briefings = [
    { type: '결론', title: `오늘은 P0 ${p0.length}건과 미팅 ${meetings.length}건에 집중`, body: '업무는 OKR과 Calendar 기준으로 압축했습니다. 완료보다 중요한 것은 대표가 오늘 직접 결정해야 할 병목을 제거하는 것입니다.', refs: ['OKR', 'Calendar', 'Tasks'] },
    { type: '리스크', title: 'Notion/Calendar 실연동 전 보안 경계 유지', body: '현재는 로컬 저장 MVP입니다. OAuth token, Notion secret, Hermes webhook secret은 frontend에 넣지 않습니다.', refs: ['Security', 'Audit log'] },
    { type: '다음 액션', title: 'Backend + DB + Auth로 실데이터 전환 준비', body: '업무/OKR CRUD 사용성이 고정되면 Supabase 또는 Vercel Postgres 기반 backend와 Google read-only sync를 붙이는 순서가 맞습니다.', refs: ['Backend', 'Google OAuth'] }
  ];
  if (persist && saveState()) {
    renderBriefing();
    showToast('브리핑을 새로 생성했습니다.');
  }
}

function addHermesJob() {
  state.hermesJobs.unshift(normalizeJob({ id: makeId(), title: 'CEO OS 다음 개발 이슈 분해 및 실행 순서 제안', status: 'queued' }));
  if (saveState()) {
    renderAll();
    showToast('Hermes 조사 작업을 추가했습니다.');
  }
}

function resetDemo() {
  if (!window.confirm('데모 데이터를 초기화할까요?\n현재 로컬 저장 업무가 seed 상태로 되돌아갑니다.')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  state = normalizeState(seed);
  if (saveState()) {
    renderAll();
    setView('today');
    showToast('데모 데이터를 초기화했습니다.');
  }
}

function showToast(message, tone = '') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog?.open) dialog.close();
}

function handleAction(action) {
  if (action === 'new-task') return openTaskDialog();
  if (action === 'new-okr') return openOkrDialog();
  if (action === 'calendar') return setView('calendar');
  if (action === 'add-hermes') return addHermesJob();
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) setView(viewButton.dataset.view);
  const jump = event.target.closest('[data-jump]');
  if (jump) setView(jump.dataset.jump);
  const edit = event.target.closest('[data-edit-task]');
  if (edit) openTaskDialog(edit.dataset.editTask);
  const action = event.target.closest('[data-action]');
  if (action) handleAction(action.dataset.action);
  const close = event.target.closest('[data-close-dialog]');
  if (close) closeDialog(close.dataset.closeDialog);
});

function on(id, event, handler) {
  document.getElementById(id)?.addEventListener(event, handler);
}

on('new-task-top', 'click', () => openTaskDialog());
on('new-task-board', 'click', () => openTaskDialog());
on('task-form', 'submit', saveTask);
on('delete-task', 'click', deleteTask);
on('task-filter', 'change', renderTasks);
on('sync-calendar', 'click', syncCalendarToTasks);
on('sync-calendar-2', 'click', syncCalendarToTasks);
on('new-okr', 'click', openOkrDialog);
on('okr-form', 'submit', saveOkr);
on('generate-briefing', 'click', () => generateBriefing(true));
on('add-hermes-job', 'click', addHermesJob);
on('reset-demo', 'click', resetDemo);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=polish-1').catch(() => {}));
}

saveState();
renderAll();
setView(activeView);
