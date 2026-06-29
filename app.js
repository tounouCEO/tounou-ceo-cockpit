import { DemoProvider } from './adapters/demo-provider.js';

const provider = new DemoProvider();
const state = {
  data: null,
  selectedFeedback: null,
  feedback: JSON.parse(localStorage.getItem('ceoCockpitFeedback') || '[]')
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function priorityLabel(priority) {
  return priority === 'p0' ? 'P0 대표 결정' : priority === 'p1' ? 'P1 중요' : 'P2 위임 가능';
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2300);
}

function saveFeedbackLog(entry) {
  state.feedback.unshift({ ...entry, createdAt: new Date().toISOString() });
  state.feedback = state.feedback.slice(0, 20);
  localStorage.setItem('ceoCockpitFeedback', JSON.stringify(state.feedback));
  renderFeedback();
}

function feedbackButton(item, label, type) {
  return `<button data-feedback-id="${item.id}" data-feedback-title="${item.title}" data-feedback-type="${type}">${label}</button>`;
}

function renderFocus(items) {
  $('#focusCount').textContent = items.length;
  $('#topFocusList').innerHTML = items.map((item, index) => `
    <article class="focus-card">
      <header>
        <h4>${index + 1}. ${item.title}</h4>
        <span class="pill ${item.priority === 'p0' ? 'danger' : 'warning'}">${priorityLabel(item.priority)}</span>
      </header>
      <p class="reason">${item.reason}</p>
      <div class="meta">
        <span class="tag">출처: ${item.source}</span>
        <span class="tag">담당: ${item.owner}</span>
        <span class="tag">마감: ${item.due}</span>
      </div>
      <div class="recommend">추천 액션: ${item.recommendation}</div>
      <div class="actions">
        ${feedbackButton(item, '내가 볼게', '대표 직접')}
        ${feedbackButton(item, '위임 가능', '위임')}
        ${feedbackButton(item, '중요도 낮음', '낮음')}
        ${feedbackButton(item, '왜 떴어?', '근거 요청')}
      </div>
    </article>
  `).join('');
}

function renderMeeting(meeting) {
  $('#meetingBrief').innerHTML = `
    <article class="meeting-card">
      <h4>${meeting.title}</h4>
      <div class="meta">
        <span class="tag">${meeting.time}</span>
        <span class="tag">${meeting.source}</span>
        <span class="tag">참석: ${meeting.attendees.join(', ')}</span>
      </div>
      <p class="reason">미팅 전 확인할 질문 3개</p>
      <ul>${meeting.questions.map((q) => `<li>${q}</li>`).join('')}</ul>
      <div class="recommend">${meeting.recommendation}</div>
      <div class="actions">
        <button data-copy-questions>질문 복사</button>
        <button data-add-checkout>체크아웃에 추가</button>
        <button data-feedback-id="${meeting.id}" data-feedback-title="${meeting.title}" data-feedback-type="브리핑 수정">이 브리핑 틀렸음</button>
      </div>
    </article>
  `;
}

function renderDelegations(items) {
  $('#delegateList').innerHTML = items.map((item) => `
    <article class="compact-item">
      <div>
        <strong>${item.title}</strong>
        <p>${item.why}</p>
        <p>추천 위임: ${item.assignee}</p>
      </div>
      <button class="secondary small" data-feedback-id="${item.id}" data-feedback-title="${item.title}" data-feedback-type="위임 확정">위임 확정</button>
    </article>
  `).join('');
}

function renderTimeline(items) {
  $('#timeline').innerHTML = items.map((item) => `
    <div class="time-row">
      <div class="time">${item.time}</div>
      <div class="time-card">
        <strong>${item.title}</strong>
        <span>${item.type} · ${item.summary}</span>
      </div>
    </div>
  `).join('');
}

function renderAgentJobs(items) {
  $('#agentQueue').innerHTML = items.map((job) => `
    <article class="agent-card">
      <header>
        <h4>${job.title}</h4>
        <span class="pill ${job.status === 'queued' ? 'success' : 'warning'}">${job.status}</span>
      </header>
      <div class="meta">
        <span class="tag">${job.agent}</span>
        <span class="tag risk">risk: ${job.risk}</span>
      </div>
      <p class="reason">${job.instruction}</p>
      <div class="actions">
        <button data-feedback-id="${job.id}" data-feedback-title="${job.title}" data-feedback-type="에이전트 승인">승인 후 실행</button>
        <button data-feedback-id="${job.id}" data-feedback-title="${job.title}" data-feedback-type="지시문 수정">지시문 수정</button>
      </div>
    </article>
  `).join('');
}

function renderCheckout(items) {
  $('#checkoutList').innerHTML = items.map((item) => `
    <article class="checkout-card">
      <h4>${item.title}</h4>
      <p class="reason">${item.summary}</p>
      <div class="recommend">권장 처리: ${item.action}</div>
      <div class="actions">
        <button data-feedback-id="${item.id}" data-feedback-title="${item.title}" data-feedback-type="완료">완료</button>
        <button data-feedback-id="${item.id}" data-feedback-title="${item.title}" data-feedback-type="내일 이월">내일로 넘김</button>
        <button data-feedback-id="${item.id}" data-feedback-title="${item.title}" data-feedback-type="리마인드">담당자 리마인드</button>
      </div>
    </article>
  `).join('');
}

function renderFeedback() {
  const log = $('#feedbackLog');
  if (!state.feedback.length) {
    log.innerHTML = '<p class="reason">아직 저장된 피드백이 없습니다. 카드 버튼을 눌러 대표 판단 기준을 학습시킬 수 있습니다.</p>';
    return;
  }
  log.innerHTML = state.feedback.map((entry) => `
    <article class="feedback-item">
      <strong>${entry.title}</strong>
      <p class="reason">${entry.type}${entry.note ? ` · ${entry.note}` : ''}</p>
      <time>${new Date(entry.createdAt).toLocaleString('ko-KR')}</time>
    </article>
  `).join('');
}

function renderSync(sync) {
  $('#notionSync').textContent = sync.notion;
  $('#calendarSync').textContent = sync.calendar;
  $('#hermesSync').textContent = sync.hermes;
  $('#todayLabel').textContent = new Date().toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' });
  $('#summaryLine').textContent = `Notion ${sync.notion} · Calendar ${sync.calendar} · Hermes ${sync.hermes} 기준`;
}

function bindActions() {
  document.body.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    if (target.matches('[data-feedback-id]')) {
      state.selectedFeedback = {
        id: target.dataset.feedbackId,
        title: target.dataset.feedbackTitle,
        type: target.dataset.feedbackType
      };
      $('#dialogTitle').textContent = state.selectedFeedback.title;
      $('#dialogContext').textContent = `${state.selectedFeedback.type} 기준을 저장합니다.`;
      $('#feedbackText').value = '';
      $('#feedbackDialog').showModal();
      return;
    }

    if (target.matches('[data-copy-questions]')) {
      const questions = state.data.meeting.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      await navigator.clipboard.writeText(questions);
      showToast('미팅 질문 3개를 복사했습니다.');
      return;
    }

    if (target.matches('[data-add-checkout]')) {
      saveFeedbackLog({ title: state.data.meeting.title, type: '체크아웃 후보 추가', note: '미팅 후 후속 액션 확인 필요' });
      showToast('체크아웃 후보에 추가했습니다.');
    }
  });

  $$('.nav-tab').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.nav-tab').forEach((b) => b.classList.remove('active'));
      $$('.view').forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      $(`#${button.dataset.view}View`).classList.add('active');
    });
  });

  $('#saveFeedback').addEventListener('click', () => {
    if (!state.selectedFeedback) return;
    saveFeedbackLog({ ...state.selectedFeedback, note: $('#feedbackText').value.trim() });
    showToast('반영했습니다. 다음 브리핑 기준에 저장됩니다.');
  });

  $('#clearFeedback').addEventListener('click', () => {
    state.feedback = [];
    localStorage.removeItem('ceoCockpitFeedback');
    renderFeedback();
    showToast('피드백 로그를 초기화했습니다.');
  });

  $('#refreshBtn').addEventListener('click', async () => {
    state.data = await provider.refresh();
    renderAll();
    showToast('데모 데이터를 새로고침했습니다.');
  });

  $('#briefBtn').addEventListener('click', () => {
    saveFeedbackLog({ title: '오늘 브리핑 생성', type: 'AI CEO 브리핑', note: 'Top3, 미팅, 위임 후보를 요약' });
    showToast('오늘 브리핑 초안을 생성했습니다.');
  });

  $('#feedbackBtn').addEventListener('click', () => {
    document.querySelector('[data-view="review"]').click();
  });
}

function renderAll() {
  const data = state.data;
  renderSync(data.sync);
  renderFocus(data.focusItems);
  renderMeeting(data.meeting);
  renderDelegations(data.delegations);
  renderTimeline(data.timeline);
  renderAgentJobs(data.agentJobs);
  renderCheckout(data.checkout);
  renderFeedback();
}

async function boot() {
  bindActions();
  state.data = await provider.load();
  renderAll();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot().catch((error) => {
  console.error(error);
  showToast('앱 초기화 실패: 콘솔을 확인하세요.');
});
