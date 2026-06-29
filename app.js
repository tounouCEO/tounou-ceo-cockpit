const APP_VERSION = 'exec-2';
const STORAGE_KEY = 'tounou-ceo-os-v3';
const LEGACY_STORAGE_KEYS = ['tounou-ceo-os-v2', 'tounou-ceo-os-v1'];
const THEME_KEY = 'tounou-ceo-os-theme';

const STATUS_GROUPS = ['Backlog', 'In Progress', 'Waiting', 'Done', 'Dropped'];
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
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const TEAMS = ['CEO', '마케팅', 'MD', '디자인', 'CX', '개발', 'LC'];
const PRIORITIES = ['P0', 'P1', 'P2'];

const makeId = () => window.crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const clone = (value) => window.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const seed = {
  version: APP_VERSION,
  okrs: [
    {
      id: 'okr-revenue-100b',
      title: '3년 내 연매출 1000억 달성을 위한 실행 체계 구축',
      krs: [
        { id: 'kr-d2c-roas', title: '자사몰 ROAS 400% 기준의 반복 가능한 성장 루프 구축', progress: 38 },
        { id: 'kr-29cm', title: '29CM 월매출 기여 구조를 안정화하고 상품별 승자 식별', progress: 52 },
        { id: 'kr-ai-os', title: 'AI CEO/Hermes 기반 대표 실행 OS 정착', progress: 27 }
      ]
    },
    {
      id: 'okr-personal-focus',
      title: 'Bryan 대표의 주간·데일리 의사결정 피로도 50% 감소',
      krs: [
        { id: 'kr-top3', title: '매일 오전 Top 3 의사결정 항목 자동 정리', progress: 42 },
        { id: 'kr-meeting', title: '모든 주요 미팅 전 3분 브리핑 체계화', progress: 31 }
      ]
    }
  ],
  tasks: [
    { id: makeId(), title: '29CM 주간 매출 리스크 점검', priority: 'P0', status: 'Today', day: '월', team: '마케팅', krId: 'kr-29cm', body: '<ul><li>수기 Sheet 기준 전일/주간 매출 확인</li><li>상품별 승자/하락 SKU 확인</li><li>MD/마케팅 액션 분리</li></ul><p><strong>AI 요약:</strong> 29CM은 자사몰과 목표 ROAS 기준이 다르므로 별도 판단합니다.</p>', source: 'Manual', createdAt: new Date().toISOString() },
    { id: makeId(), title: 'CEO OS 업무 카드 에디터 MVP 검토', priority: 'P1', status: 'In Progress', day: '화', team: '개발', krId: 'kr-ai-os', body: '<ul><li>Rich text 편집기 적용</li><li>드래그앤드롭 보드 검증</li><li>Notion 반영은 승인 기반</li></ul>', source: 'Manual', createdAt: new Date().toISOString() },
    { id: makeId(), title: '오늘 미팅 후속 조치 체크아웃', priority: 'P1', status: 'This Week', day: '수', team: 'CEO', krId: 'kr-top3', body: '<ul><li>미팅 결정사항 정리</li><li>후속 담당자 지정</li><li>Discord CEO 채널 보고 초안 생성</li></ul>', source: 'Manual', createdAt: new Date().toISOString() }
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
  briefings: [],
  calendarUrl: 'https://calendar.google.com/calendar/embed?mode=WEEK&showTitle=0&showPrint=0&showTabs=1&showCalendars=1&showTz=1'
};

let state = loadState();
let activeView = 'today';
let toastTimer;
let draggedTaskId = '';

function cleanText(value, fallback = '') { return String(value ?? fallback).trim(); }
function escapeHtml(value = '') { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function escapeAttr(value = '') { return escapeHtml(value).replaceAll('`', '&#96;'); }
function clampProgress(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0; }
function sanitizeHtml(value = '') {
  const template = document.createElement('template');
  template.innerHTML = String(value || '');
  template.content.querySelectorAll('script, style, iframe, object, embed, link, meta, svg, math, img, video, audio, source').forEach(n => n.remove());
  template.content.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase();
      if (name.startsWith('on') || val.includes('javascript:') || val.includes('data:text/html')) el.removeAttribute(attr.name);
    });
  });
  return template.innerHTML;
}
function markdownToHtml(value = '') {
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(value);
  const lines = String(value).split('\n');
  const html = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if (inList) { html.push('</ul>'); inList = false; } continue; }
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${escapeHtml(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('') || '<p></p>';
}
function plainTextFromHtml(value = '') {
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitizeHtml(value);
  return tmp.textContent.replace(/\s+/g, ' ').trim();
}
function normalizeKr(kr = {}) { return { id: cleanText(kr.id) || makeId(), title: cleanText(kr.title, '새 KR'), progress: clampProgress(kr.progress) }; }
function normalizeOkr(okr = {}) { return { id: cleanText(okr.id) || makeId(), title: cleanText(okr.title, '새 Objective'), krs: Array.isArray(okr.krs) ? okr.krs.map(normalizeKr).filter(kr => kr.title) : [] }; }
function normalizeTask(task = {}) {
  const priority = PRIORITIES.includes(task.priority) ? task.priority : 'P1';
  const rawStatus = ALL_STATUSES.includes(task.status) ? task.status : 'Backlog';
  const status = rawStatus === 'Today' || rawStatus === 'This Week' ? 'Backlog' : rawStatus;
  const day = WEEK_DAYS.includes(task.day) ? task.day : '월';
  const team = TEAMS.includes(task.team) ? task.team : 'CEO';
  return { id: cleanText(task.id) || makeId(), eventId: cleanText(task.eventId), title: cleanText(task.title, '제목 없는 업무'), priority, status, day, team, krId: cleanText(task.krId), body: sanitizeHtml(markdownToHtml(task.body ?? '')), source: cleanText(task.source, 'Manual'), createdAt: cleanText(task.createdAt) || new Date().toISOString() };
}
function normalizeEvent(event = {}) { return { eventId: cleanText(event.eventId) || makeId(), time: cleanText(event.time, '시간 미정'), title: cleanText(event.title, '제목 없는 일정'), attendees: cleanText(event.attendees, '참석자 미정'), deleted: Boolean(event.deleted) }; }
function normalizeJob(job = {}) { return { id: cleanText(job.id) || makeId(), title: cleanText(job.title, '제목 없는 Hermes 작업'), status: cleanText(job.status, 'queued') }; }
function normalizeBriefing(briefing = {}) { return { type: cleanText(briefing.type, '메모'), title: cleanText(briefing.title, '브리핑'), body: cleanText(briefing.body), refs: Array.isArray(briefing.refs) ? briefing.refs.map(r => cleanText(r)).filter(Boolean) : [] }; }
function normalizeCalendarUrl(url = '') {
  const value = cleanText(url, seed.calendarUrl);
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('google.com')) return parsed.toString();
  } catch {}
  return seed.calendarUrl;
}
function normalizeState(raw = {}) {
  const base = clone(seed);
  return { version: APP_VERSION, okrs: Array.isArray(raw.okrs) ? raw.okrs.map(normalizeOkr) : base.okrs, tasks: Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask) : base.tasks, events: Array.isArray(raw.events) ? raw.events.map(normalizeEvent) : base.events, hermesJobs: Array.isArray(raw.hermesJobs) ? raw.hermesJobs.map(normalizeJob) : base.hermesJobs, briefings: Array.isArray(raw.briefings) ? raw.briefings.map(normalizeBriefing) : base.briefings, calendarUrl: normalizeCalendarUrl(raw.calendarUrl) };
}
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    return saved ? normalizeState(JSON.parse(saved)) : normalizeState(seed);
  } catch { return normalizeState(seed); }
}
function saveState() {
  try { state.version = APP_VERSION; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { showToast('저장 공간 문제로 변경사항을 저장하지 못했습니다.', 'error'); return false; }
}
function applyTheme(theme = localStorage.getItem(THEME_KEY) || 'light') {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.textContent = next === 'dark' ? '☀️ 라이트' : '🌙 다크';
    btn.setAttribute('aria-pressed', String(next === 'dark'));
  });
}
function toggleTheme() { applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }
function krOptions() { return state.okrs.flatMap(o => o.krs.map(kr => ({ ...kr, objective: o.title }))); }
function findKr(id) { return krOptions().find(kr => kr.id === id); }
function taskSummary(body = '') { return plainTextFromHtml(body).slice(0, 96); }
function krAlias(kr) { if (!kr) return ''; if (kr.id.includes('29cm')) return 'KR: 29CM'; if (kr.id.includes('ai')) return 'KR: AI OS'; if (kr.id.includes('meeting')) return 'KR: 미팅'; if (kr.id.includes('top3')) return 'KR: Top 3'; return `KR: ${kr.title.slice(0, 14)}${kr.title.length > 14 ? '…' : ''}`; }
function badge(text, extra = '') { return `<span class="badge ${String(extra || '').replace(/[^a-z0-9_-]/gi, '')}">${escapeHtml(text)}</span>`; }
function emptyState(message, actionText = '', action = '') { return `<div class="empty-state"><p>${escapeHtml(message)}</p>${actionText ? `<button class="text-btn pill" data-action="${escapeAttr(action)}">${escapeHtml(actionText)}</button>` : ''}</div>`; }
function setView(view) {
  activeView = document.getElementById(`view-${view}`) ? view : 'today';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${activeView}`));
  document.querySelectorAll('[data-view]').forEach(b => { const active = b.dataset.view === activeView; b.classList.toggle('is-active', active); active ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  const titles = { today: '오늘', tasks: '업무', okr: 'OKR', calendar: '캘린더', briefing: '브리핑', hermes: 'Hermes' };
  const title = document.getElementById('view-title'); if (title) title.textContent = titles[activeView] || '오늘';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderToday() {
  document.getElementById('today-date').textContent = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  const todayScope = state.tasks.filter(t => ['In Progress', 'Done'].includes(t.status) || t.day === '월');
  const focusTasks = state.tasks.filter(t => t.status !== 'Done' && t.status !== 'Dropped').sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority)).slice(0, 5);
  const doneToday = todayScope.filter(t => t.status === 'Done').length;
  document.getElementById('today-progress').textContent = `${todayScope.length ? Math.round((doneToday / todayScope.length) * 100) : 0}%`;
  document.getElementById('today-focus').innerHTML = focusTasks.length ? focusTasks.map(renderListTask).join('') : emptyState('오늘 집중 업무가 없습니다.', '오늘 P0 만들기', 'new-task');
  document.getElementById('today-meetings').innerHTML = state.events.length ? state.events.map(e => `<div class="list-item"><strong>${escapeHtml(e.time)} · ${escapeHtml(e.title)}</strong><div class="meta-row">${badge(e.attendees)} ${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('Google Calendar')}</div></div>`).join('') : emptyState('오늘 일정이 없습니다.', '캘린더 보기', 'calendar');
  document.getElementById('okr-pressure').textContent = new Set(state.tasks.map(t => t.krId).filter(Boolean)).size + ' KR';
  document.getElementById('approval-count').textContent = state.tasks.filter(t => t.status === 'Waiting').length + '건';
  document.getElementById('hermes-count').textContent = state.hermesJobs.length + '개';
}
function renderListTask(t) { const kr = findKr(t.krId); return `<div class="list-item"><strong>${escapeHtml(t.title)}</strong><div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${badge(STATUS_LABELS[t.status] || t.status)}${badge(t.day)}${badge(t.team)}${kr ? badge(krAlias(kr)) : ''}</div></div>`; }
function sortedTasks(tasks) { return [...tasks].sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.title.localeCompare(b.title, 'ko')); }
function renderTasks() {
  const filter = document.getElementById('task-filter')?.value || 'all';
  const visible = state.tasks.filter(t => filter === 'all' ? true : PRIORITIES.includes(filter) ? t.priority === filter : t.status === filter);
  document.getElementById('task-overview').innerHTML = STATUS_GROUPS.map(status => renderTaskLane({ type: 'status', key: status, title: STATUS_LABELS[status], tasks: visible.filter(t => t.status === status), addLabel: '+ 업무' })).join('');
  document.getElementById('task-week').innerHTML = WEEK_DAYS.map(day => renderTaskLane({ type: 'day', key: day, title: `${day}요일`, tasks: visible.filter(t => t.day === day), addLabel: '+ 데일리' })).join('');
  document.getElementById('task-teams').innerHTML = TEAMS.map(team => renderTaskLane({ type: 'team', key: team, title: team, tasks: visible.filter(t => t.team === team), addLabel: '+ 팀 업무' })).join('');
}
function renderTaskLane({ type, key, title, tasks, addLabel }) {
  return `<section class="column drop-lane" data-drop-type="${escapeAttr(type)}" data-drop-key="${escapeAttr(key)}"><h4><span>${escapeHtml(title)}</span><span>${tasks.length}</span></h4><button class="mini-add" data-new-task-scope="${escapeAttr(type)}:${escapeAttr(key)}">${escapeHtml(addLabel)}</button><div class="lane-body">${sortedTasks(tasks).map(renderTaskCard).join('') || emptyState('비어 있음')}</div></section>`;
}
function renderTaskCard(t) {
  const kr = findKr(t.krId);
  return `<article class="task-card" draggable="true" data-task-id="${escapeAttr(t.id)}"><button data-edit-task="${escapeAttr(t.id)}" aria-label="업무 열기: ${escapeAttr(t.title)}"><h5>${escapeHtml(t.title)}</h5><p>${escapeHtml(taskSummary(t.body) || '메모 없음')}</p><div class="meta-row">${badge(t.priority, t.priority.toLowerCase())}${badge(STATUS_LABELS[t.status] || t.status)}${badge(t.day)}${badge(t.team)}${kr ? badge(krAlias(kr)) : ''}${t.source === 'Calendar' ? badge('Calendar') : ''}</div></button></article>`;
}
function renderOkrs() {
  document.getElementById('okr-list').innerHTML = state.okrs.length ? state.okrs.map(o => `<article class="okr-card" data-okr-id="${escapeAttr(o.id)}"><div class="okr-title-row"><input class="okr-title-input" data-okr-title="${escapeAttr(o.id)}" value="${escapeAttr(o.title)}" aria-label="Objective 제목 수정" /><button class="text-btn danger-text" data-delete-okr="${escapeAttr(o.id)}">삭제</button></div>${o.krs.length ? o.krs.map(kr => `<div class="kr-row" data-kr-id="${escapeAttr(kr.id)}"><div><input class="kr-title-input" data-kr-title="${escapeAttr(o.id)}:${escapeAttr(kr.id)}" value="${escapeAttr(kr.title)}" aria-label="Key Result 수정" /><div class="progress"><span style="width:${clampProgress(kr.progress)}%"></span></div></div><label class="kr-progress"><input type="number" min="0" max="100" data-kr-progress="${escapeAttr(o.id)}:${escapeAttr(kr.id)}" value="${clampProgress(kr.progress)}" /><strong>%</strong></label><button class="icon-mini" data-delete-kr="${escapeAttr(o.id)}:${escapeAttr(kr.id)}" aria-label="KR 삭제">×</button></div>`).join('') : '<p class="muted">연결된 KR이 없습니다.</p>'}<button class="mini-add wide" data-add-kr="${escapeAttr(o.id)}">+ KR 추가</button></article>`).join('') : emptyState('등록된 Objective가 없습니다.', 'Objective 만들기', 'new-okr');
}
function renderCalendar() {
  const frame = document.getElementById('google-calendar-frame');
  if (frame && frame.src !== state.calendarUrl) frame.src = state.calendarUrl;
  const input = document.getElementById('calendar-url'); if (input) input.value = state.calendarUrl;
  document.getElementById('calendar-events').innerHTML = state.events.map(e => `<div class="list-item"><strong>${escapeHtml(e.time)} · ${escapeHtml(e.title)}</strong><div class="meta-row">${badge(e.eventId)}${e.deleted ? badge('원본 일정 삭제됨', 'wait') : badge('연동됨', 'done')}</div></div>`).join('') || emptyState('연동된 일정이 없습니다.');
}
function renderBriefing() { if (!state.briefings.length) generateBriefing(false); document.getElementById('briefing-list').innerHTML = state.briefings.map(b => `<article class="briefing-item"><p class="eyebrow">${escapeHtml(b.type)}</p><h4>${escapeHtml(b.title)}</h4><p class="muted">${escapeHtml(b.body)}</p><div class="meta-row">${b.refs.map(r => badge(r)).join('')}</div></article>`).join(''); }
function renderHermes() { document.getElementById('hermes-jobs').innerHTML = state.hermesJobs.map(j => `<div class="list-item"><strong>${escapeHtml(j.title)}</strong><div class="meta-row">${badge(j.status.includes('approval') ? '승인 필요' : j.status, j.status.includes('approval') ? 'wait' : '')}</div></div>`).join('') || emptyState('Hermes 실행 큐가 비어 있습니다.', '조사 작업 추가', 'add-hermes'); }
function renderAll() { renderToday(); renderTasks(); renderOkrs(); renderCalendar(); renderBriefing(); renderHermes(); }
function populateKrOptions(selected = '') { const krSelect = document.getElementById('task-kr'); if (!krSelect) return; krSelect.replaceChildren(); const empty = document.createElement('option'); empty.value = ''; empty.textContent = '연결 안 함'; krSelect.append(empty); for (const kr of krOptions()) { const option = document.createElement('option'); option.value = kr.id; option.textContent = krAlias(kr); krSelect.append(option); } krSelect.value = selected; }
function fillSelect(id, values, selected) { const el = document.getElementById(id); if (!el) return; el.innerHTML = values.map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join(''); el.value = selected; }
function openTaskDialog(taskId = '', defaults = {}) {
  const task = state.tasks.find(t => t.id === taskId);
  document.getElementById('dialog-title').textContent = task ? '업무 수정' : '업무 생성';
  document.getElementById('task-id').value = task?.id || '';
  document.getElementById('task-title').value = task?.title || '';
  document.getElementById('task-priority').value = task?.priority || 'P1';
  fillSelect('task-status', STATUS_GROUPS, task?.status || defaults.status || 'Backlog');
  fillSelect('task-day', WEEK_DAYS, task?.day || defaults.day || '월');
  fillSelect('task-team', TEAMS, task?.team || defaults.team || 'CEO');
  populateKrOptions(task?.krId || '');
  document.getElementById('task-editor').innerHTML = sanitizeHtml(task?.body || '<p></p>');
  document.getElementById('delete-task').style.visibility = task ? 'visible' : 'hidden';
  const dialog = document.getElementById('task-dialog'); dialog.showModal(); requestAnimationFrame(() => document.getElementById('task-title').focus());
}
function saveTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  if (!title) { showToast('업무 제목을 입력해야 저장됩니다.', 'error'); document.getElementById('task-title').focus(); return; }
  const id = document.getElementById('task-id').value || makeId();
  const previous = state.tasks.find(t => t.id === id);
  const payload = { id, eventId: previous?.eventId || '', title, priority: document.getElementById('task-priority').value, status: document.getElementById('task-status').value, day: document.getElementById('task-day').value, team: document.getElementById('task-team').value, krId: document.getElementById('task-kr').value, body: document.getElementById('task-editor').innerHTML, source: previous?.source || 'Manual', createdAt: previous?.createdAt || new Date().toISOString() };
  const idx = state.tasks.findIndex(t => t.id === id); if (idx >= 0) state.tasks[idx] = normalizeTask(payload); else state.tasks.unshift(normalizeTask(payload));
  if (saveState()) { renderAll(); document.getElementById('task-dialog').close(); showToast('업무가 저장됐습니다.'); }
}
function deleteTask() { const id = document.getElementById('task-id').value; const task = state.tasks.find(t => t.id === id); if (!task) return; if (!window.confirm(`업무를 삭제할까요?\n${task.title}`)) return; state.tasks = state.tasks.filter(t => t.id !== id); if (saveState()) { renderAll(); document.getElementById('task-dialog').close(); showToast('업무를 삭제했습니다.'); } }
function openScopedTask(scope = '') { const [type, key] = scope.split(':'); const defaults = {}; if (type === 'status') defaults.status = key; if (type === 'day') defaults.day = key; if (type === 'team') defaults.team = key; openTaskDialog('', defaults); }
function moveTask(taskId, type, key) { const task = state.tasks.find(t => t.id === taskId); if (!task) return; if (type === 'status') task.status = key; if (type === 'day') task.day = key; if (type === 'team') task.team = key; if (saveState()) { renderAll(); showToast(`업무를 ${type === 'status' ? STATUS_LABELS[key] : key} 섹션으로 이동했습니다.`); } }
function syncCalendarToTasks() { const existing = new Set(state.tasks.filter(t => t.eventId).map(t => t.eventId)); const created = []; for (const e of state.events) { if (existing.has(e.eventId)) continue; const task = normalizeTask({ id: makeId(), eventId: e.eventId, title: `[미팅 준비] ${e.title}`, priority: 'P1', status: 'Backlog', day: '월', team: 'CEO', krId: 'kr-meeting', body: `<ul><li>참석자: ${escapeHtml(e.attendees)}</li><li>일정: ${escapeHtml(e.time)}</li><li>미팅 전 확인할 위키/Notion 자료 붙이기</li><li>미팅 후 결정사항과 후속 조치 기록</li></ul>`, source: 'Calendar', createdAt: new Date().toISOString() }); state.tasks.unshift(task); created.push(task); } if (saveState()) { renderAll(); showToast(created.length ? `${created.length}개의 Calendar 업무 후보를 생성했습니다.` : '새로 생성할 Calendar 업무가 없습니다. event_id 기준 중복 방지됨.'); } }
function openOkrDialog() { document.getElementById('okr-title').value = ''; document.getElementById('okr-krs').value = ''; const dialog = document.getElementById('okr-dialog'); dialog.showModal(); requestAnimationFrame(() => document.getElementById('okr-title').focus()); }
function saveOkr(event) { event.preventDefault(); const title = document.getElementById('okr-title').value.trim(); const lines = document.getElementById('okr-krs').value.split('\n').map(s => s.trim()).filter(Boolean); if (!title) { showToast('Objective 제목을 입력해야 저장됩니다.', 'error'); return; } state.okrs.push(normalizeOkr({ id: makeId(), title, krs: lines.length ? lines.map(line => ({ id: makeId(), title: line, progress: 0 })) : [{ id: makeId(), title: '새 Key Result', progress: 0 }] })); if (saveState()) { renderAll(); document.getElementById('okr-dialog').close(); showToast('Objective가 저장됐습니다.'); } }
function updateOkrField(target) { const title = target.dataset.okrTitle; const krTitle = target.dataset.krTitle; const krProgress = target.dataset.krProgress; if (title) { const okr = state.okrs.find(o => o.id === title); if (okr) okr.title = cleanText(target.value, '새 Objective'); } if (krTitle) { const [okrId, krId] = krTitle.split(':'); const kr = state.okrs.find(o => o.id === okrId)?.krs.find(k => k.id === krId); if (kr) kr.title = cleanText(target.value, '새 KR'); } if (krProgress) { const [okrId, krId] = krProgress.split(':'); const kr = state.okrs.find(o => o.id === okrId)?.krs.find(k => k.id === krId); if (kr) kr.progress = clampProgress(target.value); } if (saveState()) renderOkrs(); }
function deleteOkr(id) { if (!window.confirm('Objective를 삭제할까요?')) return; state.okrs = state.okrs.filter(o => o.id !== id); if (saveState()) { renderAll(); showToast('Objective를 삭제했습니다.'); } }
function addKr(okrId) { const okr = state.okrs.find(o => o.id === okrId); if (!okr) return; okr.krs.push({ id: makeId(), title: '새 Key Result', progress: 0 }); if (saveState()) { renderAll(); showToast('KR을 추가했습니다.'); } }
function deleteKr(pair) { const [okrId, krId] = pair.split(':'); const okr = state.okrs.find(o => o.id === okrId); if (!okr) return; okr.krs = okr.krs.filter(k => k.id !== krId); if (saveState()) { renderAll(); showToast('KR을 삭제했습니다.'); } }
function saveCalendarUrl() { state.calendarUrl = normalizeCalendarUrl(document.getElementById('calendar-url').value); if (saveState()) { renderCalendar(); showToast('Google Calendar 화면 URL을 저장했습니다.'); } }
function openGoogleCalendar() { window.open('https://calendar.google.com/calendar/u/0/r', '_blank', 'noopener,noreferrer'); }
function generateBriefing(persist = true) { const p0 = state.tasks.filter(t => t.priority === 'P0' && t.status !== 'Done'); const meetings = state.events.filter(e => !e.deleted); state.briefings = [{ type: '결론', title: `오늘은 P0 ${p0.length}건과 미팅 ${meetings.length}건에 집중`, body: '업무는 OKR과 Calendar 기준으로 압축했습니다. 완료보다 중요한 것은 대표가 오늘 직접 결정해야 할 병목을 제거하는 것입니다.', refs: ['OKR', 'Calendar', 'Tasks'] }, { type: '리스크', title: 'Google Calendar 직접 편집은 Google 화면에서 처리', body: 'MVP는 Google Calendar 화면을 iframe/새 탭으로 띄워 원본 기능을 사용합니다. 완전한 앱 내 실시간 양방향 편집은 OAuth backend가 붙는 다음 단계에서 구현합니다.', refs: ['Security', 'Google OAuth'] }, { type: '다음 액션', title: 'Backend + DB + Auth로 실데이터 전환 준비', body: '업무/OKR CRUD 사용성이 고정되면 Supabase 또는 Vercel Postgres 기반 backend와 Google sync를 붙이는 순서가 맞습니다.', refs: ['Backend', 'Google OAuth'] }]; if (persist && saveState()) { renderBriefing(); showToast('브리핑을 새로 생성했습니다.'); } }
function addHermesJob() { state.hermesJobs.unshift(normalizeJob({ id: makeId(), title: 'CEO OS 다음 개발 이슈 분해 및 실행 순서 제안', status: 'queued' })); if (saveState()) { renderAll(); showToast('Hermes 조사 작업을 추가했습니다.'); } }
function resetDemo() { if (!window.confirm('데모 데이터를 초기화할까요?\n현재 로컬 저장 업무가 seed 상태로 되돌아갑니다.')) return; localStorage.removeItem(STORAGE_KEY); LEGACY_STORAGE_KEYS.forEach(k => localStorage.removeItem(k)); state = normalizeState(seed); if (saveState()) { renderAll(); setView('today'); showToast('데모 데이터를 초기화했습니다.'); } }
function showToast(message, tone = '') { let toast = document.getElementById('app-toast'); if (!toast) { toast = document.createElement('div'); toast.id = 'app-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); document.body.append(toast); } toast.className = `toast ${tone}`; toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600); }
function closeDialog(id) { const dialog = document.getElementById(id); if (dialog?.open) dialog.close(); }
function handleAction(action) { if (action === 'new-task') return openTaskDialog(); if (action === 'new-okr') return openOkrDialog(); if (action === 'calendar') return setView('calendar'); if (action === 'add-hermes') return addHermesJob(); }
function applyEditorCommand(command) { document.getElementById('task-editor').focus(); document.execCommand(command, false, null); }
function sanitizeEditorNow() {
  const editor = document.getElementById('task-editor');
  if (!editor) return;
  const cleaned = sanitizeHtml(editor.innerHTML);
  if (cleaned !== editor.innerHTML) editor.innerHTML = cleaned;
}
function bindEditorSanitizer() {
  const editor = document.getElementById('task-editor');
  if (!editor) return;
  editor.addEventListener('paste', (event) => {
    event.preventDefault();
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain');
    document.execCommand('insertHTML', false, sanitizeHtml(html || escapeHtml(text || '')));
  });
  editor.addEventListener('input', () => requestAnimationFrame(sanitizeEditorNow));
  const observer = new MutationObserver(() => requestAnimationFrame(sanitizeEditorNow));
  observer.observe(editor, { childList: true, subtree: true, attributes: true, characterData: true });
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const viewButton = event.target.closest('[data-view]'); if (viewButton) setView(viewButton.dataset.view);
  const jump = event.target.closest('[data-jump]'); if (jump) setView(jump.dataset.jump);
  const edit = event.target.closest('[data-edit-task]'); if (edit) openTaskDialog(edit.dataset.editTask);
  const action = event.target.closest('[data-action]'); if (action) handleAction(action.dataset.action);
  const close = event.target.closest('[data-close-dialog]'); if (close) closeDialog(close.dataset.closeDialog);
  const scoped = event.target.closest('[data-new-task-scope]'); if (scoped) openScopedTask(scoped.dataset.newTaskScope);
  const editor = event.target.closest('[data-editor-command]'); if (editor) applyEditorCommand(editor.dataset.editorCommand);
  const delOkr = event.target.closest('[data-delete-okr]'); if (delOkr) deleteOkr(delOkr.dataset.deleteOkr);
  const addKrBtn = event.target.closest('[data-add-kr]'); if (addKrBtn) addKr(addKrBtn.dataset.addKr);
  const delKrBtn = event.target.closest('[data-delete-kr]'); if (delKrBtn) deleteKr(delKrBtn.dataset.deleteKr);
});
document.addEventListener('dragstart', (event) => { const card = event.target.closest?.('[data-task-id]'); if (!card) return; draggedTaskId = card.dataset.taskId; card.classList.add('is-dragging'); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', draggedTaskId); });
document.addEventListener('dragend', () => { document.querySelectorAll('.is-dragging, .is-drag-over').forEach(el => el.classList.remove('is-dragging', 'is-drag-over')); draggedTaskId = ''; });
document.addEventListener('dragover', (event) => { const lane = event.target.closest?.('.drop-lane'); if (!lane) return; event.preventDefault(); lane.classList.add('is-drag-over'); });
document.addEventListener('dragleave', (event) => { const lane = event.target.closest?.('.drop-lane'); if (lane && !lane.contains(event.relatedTarget)) lane.classList.remove('is-drag-over'); });
document.addEventListener('drop', (event) => { const lane = event.target.closest?.('.drop-lane'); if (!lane) return; event.preventDefault(); lane.classList.remove('is-drag-over'); moveTask(draggedTaskId || event.dataTransfer.getData('text/plain'), lane.dataset.dropType, lane.dataset.dropKey); });
document.addEventListener('change', (event) => { if (!(event.target instanceof Element)) return; if (event.target.matches('[data-okr-title], [data-kr-title], [data-kr-progress]')) updateOkrField(event.target); });
document.addEventListener('keydown', (event) => { if (event.target?.matches?.('[data-okr-title], [data-kr-title]') && event.key === 'Enter') { event.preventDefault(); event.target.blur(); } });
function on(id, event, handler) { document.getElementById(id)?.addEventListener(event, handler); }
on('new-task-top', 'click', () => openTaskDialog()); on('new-task-board', 'click', () => openTaskDialog()); on('task-form', 'submit', saveTask); on('delete-task', 'click', deleteTask); on('task-filter', 'change', renderTasks); on('sync-calendar', 'click', syncCalendarToTasks); on('sync-calendar-2', 'click', syncCalendarToTasks); on('new-okr', 'click', openOkrDialog); on('okr-form', 'submit', saveOkr); on('generate-briefing', 'click', () => generateBriefing(true)); on('add-hermes-job', 'click', addHermesJob); on('reset-demo', 'click', resetDemo); on('save-calendar-url', 'click', saveCalendarUrl); on('open-google-calendar', 'click', openGoogleCalendar); document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', toggleTheme));
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=exec-2').catch(() => {}));
applyTheme(); saveState(); renderAll(); setView(activeView); bindEditorSanitizer();
