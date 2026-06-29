# Data Contract

## SourceRef

```ts
type SourceRef = {
  source: 'notion' | 'google_calendar' | 'hermes' | 'manual_demo';
  sourceId: string;
  sourceUrl?: string;
  lastSyncedAt?: string;
  revision?: string;
};
```

## CockpitItem

```ts
type CockpitItem = {
  id: string;
  type: 'meeting' | 'task' | 'decision' | 'reminder' | 'agent_job' | 'document_signal';
  title: string;
  summary?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  owner?: string;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  timezone?: 'Asia/Seoul';
  sourceRefs: SourceRef[];
  linkedItems?: string[];
  aiRecommendation?: string;
};
```

## 실제 연동 시 필수 규칙

- 화면용 내부 ID와 원천 ID를 분리한다.
- Notion page/database ID, Google event ID, Hermes job ID는 `sourceRefs`에 둔다.
- Notion/Calendar 쓰기 작업은 read-back 검증 후 action log에 저장한다.
- 삭제, 외부 발송, 일정 변경은 대표 승인 없이 자동 실행하지 않는다.
