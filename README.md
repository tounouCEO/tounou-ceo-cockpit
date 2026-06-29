# Tounou CEO Cockpit OS Mockup

Bryan 대표의 최종 완성본 사용성/디자인 검토를 위한 고충실도 목업 서비스입니다.

## 포함 화면

- Today Cockpit: 오늘 대표가 볼 3가지, 주요 업무, Calendar 자동 연결, Hermes 실행 큐
- OKR Center: 회사 OKR / 개인 OKR / KR 진행률
- Weekly Planner: 이번 주 Focus와 실행 보드
- Daily Planner: 데일리 업무, 업무 카드, Notion식 메모 에디터 미리보기
- Calendar Sync: Google Calendar → Daily Task 단방향 정책
- AI Briefing: 위키 기반 브리핑과 근거 문서
- Hermes Control: 맥미니 Hermes 실행 엔진 상태와 승인 게이트

## 로컬 실행

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

## 배포

GitHub Pages:

https://tounouceo.github.io/tounou-ceo-cockpit/

## 설계 원칙

- Notion/Google Calendar를 대체하지 않고 실행 레이어로 연결
- Calendar → Daily Task 단방향 자동 생성
- Daily Task → Calendar 자동 생성 금지
- 업무 카드 안에서 Notion식 메모 작성
- Wiki 기반 AI 브리핑
- Hermes AI는 백그라운드 실행 엔진
- 외부 write-back은 승인 후 실행

## 주의

현재 버전은 실데이터 연결 전 UX/디자인 목업입니다. 실제 OAuth, Notion write-back, Hermes Bridge, DB 저장은 다음 구현 단계에서 연결합니다.
