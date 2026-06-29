# Integration Roadmap

## Phase 0: Demo PWA

- `DemoProvider`가 `data/demo-cockpit.json`을 읽는다.
- 대표 피드백은 localStorage에 저장한다.
- 화면 흐름과 판단 기준을 먼저 검증한다.

## Phase 1: Read-only Real Provider

- NotionProvider
  - Bryan 개인 업무 페이지 및 지정 업무 DB 조회
  - 월간/주간/일일 업무 필드 매핑
  - page URL, database 이름, last edited time 보존
- CalendarProvider
  - 오늘/이번주 일정 조회
  - timezone은 Asia/Seoul 고정
  - recurring instance와 cancelled event 처리

## Phase 2: AI Agent Queue

- HermesProvider
  - 위임 후보를 에이전트 작업 초안으로 생성
  - instruction preview 제공
  - 승인 후 실행 큐 등록
  - 실행 결과를 카드에 연결

## Phase 3: Controlled Write-back

- Notion status, due date, priority 제한 업데이트
- Calendar 일정 생성/변경은 대표 확인 후만 실행
- 모든 write-back은 audit log와 read-back 검증 필수

## 운영 리스크

- Notion schema 변경 시 매핑 깨짐
- Calendar OAuth token 만료
- AI 위임 중복 실행
- 오래된 PWA 캐시 표시
- 알림 피로

## 다음 개발 우선순위

1. 실제 Notion 업무 DB 필드 표준화
2. Google Calendar read-only OAuth 연결
3. 서버 사이드 token 저장
4. Sync log / stale badge 구현
5. Discord 또는 Google Chat 알림 연결
