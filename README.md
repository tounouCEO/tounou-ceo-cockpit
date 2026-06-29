# Tounou CEO Cockpit MVP

Bryan 대표의 Notion 월간/주간/일일 업무와 Google Calendar 일정을 통합해 오늘의 대표 판단, 위임 후보, 미팅 브리핑, 체크아웃을 보여주는 PWA 데모입니다.

## 실행

```bash
cd /Users/kimhyeontae/Desktop/working/tounou-ceo-cockpit
python3 -m http.server 4173
```

브라우저에서 접속:

```txt
http://localhost:4173
```

## 현재 구현된 것

- Today Top 3 대표 판단 카드
- 다음 미팅 30초 브리핑
- 대표가 안 봐도 되는 위임 후보
- 오늘 일정/업무 타임라인
- AI CEO / 하위 에이전트 실행 큐
- 저녁 체크아웃 카드
- 카드별 피드백 저장 localStorage
- PWA manifest / service worker
- DemoProvider 기반 샘플 데이터 로딩

## 제품 원칙

- Notion과 Google Calendar를 대체하지 않는다.
- 원천 데이터는 Notion/Google Calendar에 둔다.
- 자체 앱은 대표 판단/위임/체크아웃 실행 레이어다.
- AI 실행은 초안 생성 후 대표 승인 구조로 제한한다.
- 모든 카드에는 출처와 추천 액션이 있어야 한다.
