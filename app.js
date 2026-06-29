const DATA = {
  nav: [
    { id: 'today', icon: '◒', label: 'Today', count: '12' },
    { id: 'okr', icon: '◎', label: 'OKR', count: '8' },
    { id: 'weekly', icon: '▦', label: 'Weekly', count: '17' },
    { id: 'daily', icon: '✓', label: 'Daily', count: '9' },
    { id: 'calendar', icon: '◷', label: 'Calendar', count: '6' },
    { id: 'briefing', icon: '✦', label: 'Briefing', count: '4' },
    { id: 'hermes', icon: '⌁', label: 'Hermes', count: '5' }
  ],
  briefings: [
    { title: '29CM 35% 매출축 방어', body: '오후 미팅 전 29CM 판매 캘린더·신상품 노출·할인 정책을 확정해야 합니다. Wiki 기준 29CM 목표 ROAS는 1000%입니다.' },
    { title: '파자마 제작 일정 압축', body: '7/1 컨셉 5개 → 7/3 제작파일 20개 → 7/6 완성 조건. 오늘 디자인/MD 실행 누락 확인이 필요합니다.' },
    { title: 'CRM 테스트는 대표 승인 없이 ON 가능', body: '하루 카카오 예산 10만원 이하 + 피드백 에이전트 승인 건은 AI CEO가 테스트 후 결과 보고합니다.' }
  ],
  tasks: [
    { id: '29cm', p: 'P0', title: '29CM 하반기 매출 방어 미팅 준비', status: 'In Progress', due: '14:00', okr: '회사 KR1 월매출 5억→8억', source: 'Calendar', team: 'MD·마케팅', body: '미팅 전 확인: 베스트 SKU, 노출 구좌, 7월 프로모션, 29CM 전용 번들/세트 제안. 질문: 침구/러그/파자마 중 29CM가 가장 키울 수 있는 카테고리 우선순위.', checks: ['29CM 최근 매출 원천 Sheet 확인', '상위 SKU 20개 추출', '노출/쿠폰 정책 질문지 작성'] },
    { id: 'pajama', p: 'P0', title: '파자마 7/6 완성 역산 실행안 확정', status: 'Needs Decision', due: '18:00', okr: '회사 KR2 신제품 매출 기여', source: 'Manual', team: '상품기획', body: '강혜현 합류 직후 바로 실행 가능한 디자인/파일/샘플링 프로세스로 쪼개야 함. 7/3 제작파일 20개가 병목.', checks: ['컨셉 5개 기준 확정', '작가 IP 후보 연결', '제작파일 템플릿 준비'] },
    { id: 'crm', p: 'P1', title: 'CRM 카카오 소재 3종 ON 테스트', status: 'Queued', due: '16:30', okr: '회사 KR3 재구매율 20%대→30%', source: 'AI', team: '마케팅', body: '단기 ROAS보다 성공공식 탐색이 우선. 오디언스/타겟/소재를 넓게 테스트하고 결과만 데일리 보고.', checks: ['피드백 에이전트 승인 확인', '카카오 예산 10만원 이하 확인', '성과 로그 저장'] },
    { id: 'okr', p: 'P1', title: '7월 회사/개인 OKR 정리', status: 'Draft', due: '11:30', okr: 'CEO 개인 O1 실행 집중도', source: 'Manual', team: 'CEO', body: '회사 OKR과 대표 개인 OKR을 한 화면에서 연결. 업무 생성 기준을 OKR에서 끌어오도록 설계.', checks: ['회사 O/KR 3개 이내', '개인 O/KR 3개 이내', '이번 주 업무 연결'] },
    { id: 'wiki', p: 'P2', title: '29CM·파자마 관련 위키 브리핑 보강', status: 'Waiting', due: '20:00', okr: 'AI CEO 운영 고도화', source: 'Wiki', team: 'AI CEO', body: '오늘 일정과 업무에 붙일 위키 근거를 더 촘촘하게 연결. 출처 링크와 stale 여부 표시.', checks: ['29CM 문서 링크', '파자마 일정 링크', '브리핑 stale 표시'] }
  ],
  calendar: [
    { time: '09:30', title: 'Daily CEO Briefing', sub: 'AI CEO · Wiki/Calendar/Task 종합', task: '자동 생성 완료' },
    { time: '11:30', title: '7월 OKR 정리', sub: '회사 OKR + Bryan 개인 OKR', task: '업무 후보 생성' },
    { time: '14:00', title: '29CM 하반기 전략 미팅', sub: 'MD·마케팅 · 매출/노출/프로모션', task: '준비/후속 업무 연결' },
    { time: '16:30', title: 'CRM 소재 테스트 체크', sub: '카카오 예산 10만원 이하', task: '자동 체크리스트 생성' }
  ],
  okrs: [
    { type: 'Company', title: '3년 내 연매출 1000억 구조 만들기', progress: 38, krs: [
      { title: '월매출 5억 → 8억 운영체계 구축', progress: 42, owner: 'CEO·COO' },
      { title: '29CM ROAS 1000% 기준 유지', progress: 61, owner: '마케팅·MD' },
      { title: '신제품 카테고리 월 1억 후보 발굴', progress: 24, owner: '상품기획' }
    ]},
    { type: 'Personal', title: 'Bryan 대표의 실행 집중도와 의사결정 속도 개선', progress: 47, krs: [
      { title: '매일 P0 3건 이하로 압축', progress: 52, owner: 'CEO' },
      { title: '주간 OKR 리뷰 1회 고정', progress: 33, owner: 'CEO' },
      { title: 'AI 위임 업무 70% 이상 비동기 처리', progress: 58, owner: 'AI CEO' }
    ]}
  ],
  weekly: [
    '29CM 매출 방어 구조 확정',
    '파자마 7/6 완성 로드맵 실행',
    'CRM 성공공식 탐색 테스트 5건',
    'CEO Cockpit OS 목업 사용성 검증'
  ],
  kanban: {
    'This Week': ['29CM 운영 전략 정리', '7월 OKR 초안', '파자마 작가 IP 후보'],
    'In Progress': ['CEO Cockpit 목업', 'CRM 카카오 소재'],
    'Waiting': ['Notion Write-back 승인', 'Vercel 재인증'],
    'Done': ['GitHub Pages 배포', '1차 PWA 검증']
  },
  docs: [
    { title: '29CM 매출 원천 Sheet', desc: '일 1회 수기 업데이트. 29CM 매출 우선 원천.' },
    { title: '뚜누 데이터/CRM 규칙', desc: '0원 주문 제외, Hackle paymentAmount>0 필터, 목표 ROAS 기준.' },
    { title: '파자마 제작 일정 메모리', desc: '7/1 컨셉5 → 7/3 제작파일20 → 7/6 완성.' },
    { title: '뚜누 브랜드 온톨로지', desc: 'Everyday Art, Better Mood. 타겟/채널/카테고리.' }
  ],
  approvals: [
    { title: 'Notion 업무 DB 생성', body: '실제 DB write-back 전 대표 승인 필요' },
    { title: 'Google OAuth production 연결', body: '토큰 저장/암호화/권한 범위 확인 필요' },
    { title: 'Discord 자동 보고 활성화', body: '초안 생성은 허용, 실제 발송은 승인 후 실행' }
  ]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const state = { screen: 'today', density: Number(localStorage.getItem('cockpitDensity') || '1') };

function init() {
  document.documentElement.style.setProperty('--density', String(state.density));
  renderNavigation();
  renderToday();
  renderOKR();
  renderWeekly();
  renderDaily();
  renderCalendar();
  renderBriefing();
  renderHermes();
  wireEvents();
  navigate('today');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

function renderNavigation() {
  const nav = DATA.nav.map(item => `
    <button class="nav-item" data-screen="${item.id}" type="button">
      <span class="left"><span>${item.icon}</span><span>${item.label}</span></span>
      <span class="count">${item.count}</span>
    </button>
  `).join('');
  $('#navList').innerHTML = nav;
  $('#mobileTabbar').innerHTML = DATA.nav.slice(0, 5).map(item => `<button data-screen="${item.id}" type="button"><span>${item.icon}</span><span>${item.label}</span></button>`).join('');
}

function renderToday() {
  $('#briefingList').innerHTML = DATA.briefings.map((item, idx) => `
    <div class="briefing-item">
      <div class="briefing-no">0${idx + 1}</div>
      <div><b>${item.title}</b><p>${item.body}</p></div>
    </div>
  `).join('');
  $('#todayTasks').innerHTML = DATA.tasks.slice(0, 4).map(taskCard).join('');
  $('#calendarTimeline').innerHTML = DATA.calendar.map(event => `
    <div class="timeline-item">
      <div class="timeline-time">${event.time}</div>
      <div><div class="timeline-title">${event.title}</div><div class="timeline-sub">${event.sub}<br>${event.task}</div></div>
    </div>
  `).join('');
  $('#okrSignal').innerHTML = DATA.okrs.map(okr => `
    <div class="okr-row">
      <div class="okr-row-top"><span>${okr.type} · ${okr.title}</span><strong>${okr.progress}%</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${okr.progress}%"></div></div>
    </div>
  `).join('');
  $('#jobStack').innerHTML = [
    ['Wiki briefing generator', '오늘 14:00 29CM 미팅용 근거 문서 4개 연결 완료', 'ok'],
    ['Calendar sync worker', '4개 일정 확인, 3개 업무 후보 생성', 'ok'],
    ['Notion write-back bridge', '대표 승인 전까지 dry-run only', 'warn']
  ].map(([title, body, status]) => `<div class="job-card"><div><b>${title}</b><p>${body}</p></div><span class="status-dot ${status}"></span></div>`).join('');
}

function taskCard(task) {
  const p = task.p.toLowerCase();
  return `
    <div class="task-card" data-open-task="${task.id}">
      <div class="priority ${p}">${task.p}</div>
      <div>
        <h4>${task.title}</h4>
        <div class="task-meta">
          <span class="meta-chip">${task.status}</span>
          <span class="meta-chip">${task.due}</span>
          <span class="meta-chip">${task.source}</span>
          <span class="meta-chip">${task.okr}</span>
        </div>
      </div>
      <button class="task-open" type="button" aria-label="업무 열기">›</button>
    </div>
  `;
}

function renderOKR() {
  $('#okrBoards').innerHTML = DATA.okrs.map(okr => `
    <article class="panel okr-board">
      <div class="panel-header">
        <div><p class="eyebrow">${okr.type} OKR</p><h3>${okr.title}</h3></div>
        <span class="pill">${okr.progress}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${okr.progress}%"></div></div>
      <div class="kr-list">
        ${okr.krs.map(kr => `
          <div class="kr-card">
            <h4>${kr.title}</h4>
            <div class="kr-meta"><span>${kr.owner}</span><strong>${kr.progress}%</strong></div>
            <div class="progress-track"><div class="progress-fill" style="width:${kr.progress}%"></div></div>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function renderWeekly() {
  $('#weeklyFocus').innerHTML = DATA.weekly.map((item, idx) => `<div class="focus-card"><b>${idx + 1}. ${item}</b><p>회사/개인 OKR에 연결된 이번 주 우선순위</p></div>`).join('');
  $('#kanban').innerHTML = Object.entries(DATA.kanban).map(([col, cards]) => `
    <div class="kanban-col">
      <h4><span>${col}</span><span>${cards.length}</span></h4>
      ${cards.map(card => `<div class="kanban-card"><b>${card}</b><span>OKR 연결 · 담당/기한 지정 가능</span></div>`).join('')}
    </div>
  `).join('');
}

function renderDaily() {
  const days = ['월 29', '화 30', '수 01', '목 02', '금 03'];
  $('#dayStrip').innerHTML = days.map((day, idx) => `<div class="day-pill ${idx === 0 ? 'active' : ''}"><b>${day.split(' ')[0]}</b><span>${day.split(' ')[1]}</span></div>`).join('');
  $('#dailyTasks').innerHTML = DATA.tasks.map(taskCard).join('');
  const task = DATA.tasks[0];
  $('#editorPreview').innerHTML = `
    <div class="editor-cover"></div>
    <div class="editor-body">
      <h4>${task.title}</h4>
      <div class="editor-block"><strong>AI 요약</strong><br>${task.body}</div>
      <div class="editor-block"><strong>체크리스트</strong>${task.checks.map((c, i) => `<div class="checkline"><span class="checkbox">${i === 0 ? '✓' : ''}</span>${c}</div>`).join('')}</div>
      <div class="editor-block"><strong>관련 근거</strong><br>[[29CM 매출 원천 Sheet]] · [[뚜누 데이터/CRM 규칙]]</div>
    </div>
  `;
}

function renderCalendar() {
  $('#calendarBoard').innerHTML = DATA.calendar.map(event => `
    <div class="calendar-event">
      <div class="timeline-time">${event.time}</div>
      <div><b>${event.title}</b><div class="timeline-sub">${event.sub}</div></div>
      <span class="pill">${event.task}</span>
    </div>
  `).join('');
}

function renderBriefing() {
  $('#briefingDoc').innerHTML = [
    ['오늘의 결론', ['29CM 미팅은 하반기 매출 방어축으로 P0입니다.', '파자마 일정은 오늘 역산하지 않으면 7/6 완성 가능성이 급락합니다.', 'CRM 테스트는 승인 조건 충족 시 AI CEO가 바로 ON합니다.']],
    ['미팅 준비 질문', ['29CM 내 뚜누 침구/러그/파자마 카테고리별 성장 여지는 어디인가?', '쿠폰/노출/기획전 중 ROAS 1000% 유지에 가장 유리한 조합은 무엇인가?', '29CM 단독 구성 또는 선출시 SKU를 만들 수 있는가?']],
    ['대표 결정 필요', ['파자마 컨셉 5개 우선순위', '29CM 하반기 목표 매출 기준', 'Notion write-back 실데이터 연결 승인 여부']]
  ].map(([title, bullets]) => `<div class="doc-section"><h4>${title}</h4><ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul></div>`).join('');
  $('#sourceList').innerHTML = DATA.docs.map(doc => `<div class="source-card"><b>${doc.title}</b><p>${doc.desc}</p></div>`).join('');
}

function renderHermes() {
  $('#hermesConsole').innerHTML = [
    ['08:30:01', 'ok', 'Daily briefing job completed · 4 sources · 12 tasks scanned'],
    ['09:10:18', 'accent', 'Calendar sync: Google event_id dedupe active'],
    ['09:42:55', 'ok', 'Wiki retrieval: 29CM, CRM, Pajama, Data Rules matched'],
    ['10:13:21', 'warn', 'Notion write-back disabled until approval gate is opened'],
    ['10:31:04', 'accent', 'Hermes Bridge mock endpoint ready: /api/hermes/jobs']
  ].map(([time, tone, text]) => `<span class="console-line"><span class="console-time">${time}</span> <span class="console-${tone}">${text}</span></span>`).join('');
  $('#approvalStack').innerHTML = DATA.approvals.map(item => `<div class="approval-card"><b>${item.title}</b><p>${item.body}</p></div>`).join('');
}

function wireEvents() {
  document.addEventListener('click', (event) => {
    const screenBtn = event.target.closest('[data-screen]');
    if (screenBtn) navigate(screenBtn.dataset.screen);

    const taskBtn = event.target.closest('[data-open-task]');
    if (taskBtn) openTask(taskBtn.dataset.openTask);
  });
  $('#mobileMenu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
  $('#briefingBtn').addEventListener('click', () => toast('AI 브리핑 재생성 목업 완료 · 실제 버전에서는 Hermes job이 실행됩니다.'));
  $('#newTaskBtn').addEventListener('click', () => toast('업무 생성 플로우 목업 · 다음 구현에서 DB CRUD로 연결합니다.'));
  $('#commandTrigger').addEventListener('click', () => toast('⌘K 검색 목업 · 업무/일정/위키 통합 검색 진입점입니다.'));
  $('#densityBtn').addEventListener('click', () => {
    state.density = state.density === 1 ? 0.82 : 1;
    localStorage.setItem('cockpitDensity', String(state.density));
    document.documentElement.style.setProperty('--density', String(state.density));
    toast(state.density === 1 ? '기본 밀도' : '고밀도 모드');
  });
  $('#runHermesBtn').addEventListener('click', () => {
    $('#hermesConsole').insertAdjacentHTML('afterbegin', `<span class="console-line"><span class="console-time">${new Date().toLocaleTimeString('ko-KR', { hour12: false })}</span> <span class="console-ok">Manual health check: bridge reachable · queue dry-run ok</span></span>`);
    toast('Hermes 상태 점검 목업 실행 완료');
  });
}

function navigate(id) {
  state.screen = id;
  $$('.screen').forEach(screen => screen.classList.toggle('active-screen', screen.id === id));
  $$('.nav-item, .mobile-tabbar button').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === id));
  const nav = DATA.nav.find(n => n.id === id);
  $('#sectionTitle').textContent = nav ? nav.label === 'Today' ? 'Today Cockpit' : nav.label : id;
  $('#sectionEyebrow').textContent = id === 'today' ? 'DAILY EXECUTION' : 'CEO COCKPIT OS';
  $('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTask(id) {
  const task = DATA.tasks.find(t => t.id === id) || DATA.tasks[0];
  $('#dialogTitle').textContent = task.title;
  $('#dialogBody').innerHTML = `
    <div class="dialog-card">
      <h4>업무 메모</h4>
      <textarea>${task.body}\n\n결정사항:\n- \n\n후속 액션:\n- </textarea>
    </div>
    <div class="dialog-card">
      <h4>속성</h4>
      <div class="rule-list">
        <div><strong>우선순위</strong><span>${task.p}</span></div>
        <div><strong>상태</strong><span>${task.status}</span></div>
        <div><strong>기한</strong><span>${task.due}</span></div>
        <div><strong>연결 OKR</strong><span>${task.okr}</span></div>
        <div><strong>출처</strong><span>${task.source}</span></div>
        <div><strong>팀</strong><span>${task.team}</span></div>
      </div>
      <div class="editor-block"><strong>체크리스트</strong>${task.checks.map((c, i) => `<div class="checkline"><span class="checkbox">${i === 0 ? '✓' : ''}</span>${c}</div>`).join('')}</div>
    </div>
  `;
  $('#taskDialog').showModal();
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
}

init();
