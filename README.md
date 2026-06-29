# Tounou CEO OS

Bryan 대표 전용 CEO 실행 OS 개발본입니다. Notion과 Google Calendar를 대체하지 않고, 두 시스템을 원천으로 유지한 상태에서 오늘의 실행·OKR·미팅 준비·AI 브리핑·Hermes 실행 큐를 압축하는 PWA입니다.

## 현재 버전

- Notion-like 라이트/문서형 UI
- 로컬 저장 기반 업무 CRUD
- 업무 카드 Markdown 메모
- 회사/개인 OKR 표시 및 Objective 생성
- Calendar → Daily Task 후보 생성 시뮬레이션
- event_id 기반 중복 생성 방지
- AI Briefing/Hermes Queue 목업
- 모바일 하단 탭바

## 실행

```bash
python3 -m http.server 4173
# http://localhost:4173
```

## 개발 원칙

- Notion = 업무/목표/메모/회의록/위키 원천
- Google Calendar = 일정/미팅 원천
- CEO OS = 실행 레이어
- Calendar → Daily Task 단방향 자동 생성만 허용
- Daily Task → Calendar 자동 생성 금지
- 외부 write-back, 발송, 삭제, 대규모 변경은 대표 승인 후 실행
- OAuth token/Notion secret/Hermes secret은 frontend에 저장 금지

## 다음 단계

1. Backend + DB + Auth 구축
2. Google Calendar read-only OAuth
3. Task/OKR 영속 DB 전환
4. TipTap 기반 Rich Text editor
5. Wiki 기반 AI briefing API
6. Hermes signed webhook bridge
7. Audit log + 승인 게이트
8. 승인 기반 Notion export/write-back
