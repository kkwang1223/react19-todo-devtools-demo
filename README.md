# ⚛️ React 19 Todo — DevTools Demo

> React DevTools + React 19 기능 시연 앱

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![React Compiler](https://img.shields.io/badge/React_Compiler-19.1.0--rc-a78bfa)

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

---

## ✨ 기능

### 1. `useActionState` — 폼 상태 관리

```tsx
const [state, formAction, isPending] = useActionState(
  async (_prev, formData) => {
    await simulateServer()  // 0.7초 딜레이
    return { error: null, lastAdded: text }
  },
  { error: null, lastAdded: null }
)

// React 19: async 함수를 form action으로 직접 연결
<form action={formAction}>
```

- `isPending` 으로 제출 중 로딩 상태 자동 관리
- 빈 입력 제출 시 에러 메시지 표시

---

### 2. `useOptimistic` — 낙관적 UI 업데이트

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (state, newTodo) => [{ ...newTodo, isOptimistic: true }, ...state],
);

// form action 내부: 서버 응답 전 즉시 UI 반영
addOptimisticTodo(newTodo);
await simulateServer(700);
onAdd(newTodo); // 실제 상태 업데이트
```

- 서버 응답 전 목록 상단에 **"⚡ 낙관적 업데이트"** 배지와 함께 즉시 표시
- 트랜지션 완료 후 실제 아이템으로 자동 교체

---

### 3. `useTransition` — 비긴급 상태 전환

```tsx
const [isPending, startTransition] = useTransition();

const handleFilterChange = (filter) => {
  startTransition(() => setFilter(filter)); // 낮은 우선순위
};
```

- 필터 전환 중 `isPending`으로 시각적 피드백 제공
- DevTools Profiler에서 별도 commit으로 처리되는 것 확인 가능

---

### 4. `useDeferredValue` — 값 처리 지연

```tsx
const deferredQuery = useDeferredValue(searchQuery);

const filtered = todos.filter((t) => t.text.includes(deferredQuery));
```

- 타이핑 중 `searchQuery !== deferredQuery` 구간에 "처리 중..." 표시
- DevTools Components 탭에서 두 값의 차이를 실시간 확인 가능

---

### 5. `useDebugValue` — 커스텀 훅 레이블

```tsx
function useTodoStats(todos) {
  // ...계산...

  // 두 번째 인자(포맷 함수)는 DevTools가 열릴 때만 실행 → 성능 영향 없음
  useDebugValue(
    { total, completed, completionRate },
    (s) => `${s.total} total · ${s.completed} done (${s.completionRate}%)`,
  );
  return stats;
}
```

- DevTools Components 탭 → App 선택 → Hooks의 `useTodoStats` 항목에서 포맷된 레이블 확인

---

### 6. `ref` as prop — forwardRef 불필요

```tsx
// React 18: forwardRef 필수
const TodoList = forwardRef<HTMLDivElement, Props>((props, ref) => { ... })

// React 19: ref를 일반 prop으로 직접 전달
function TodoList({ todos, ref }: Props) {
  return <div ref={ref}>...</div>
}
```

---

### 7. `React.lazy` + `Suspense` — 지연 로딩

```tsx
const LazyStatsPanel = lazy(() =>
  new Promise(resolve => setTimeout(resolve, 1200))
    .then(() => import('./components/StatsPanel'))
)

<Suspense fallback={<StatsPanelSkeleton />}>
  <LazyStatsPanel stats={stats} />
</Suspense>
```

- 첫 로드 시 1.2초 스켈레톤 fallback 표시
- DevTools: 컴포넌트 우클릭 → **"Suspend the selected component"** 로 강제 테스트

---

### 8. `<Profiler>` 컴포넌트 — 코드 레벨 성능 측정

```tsx
<Profiler id="TodoList" onRender={(id, phase, actual, base) => {
  console.log(`[⚛ Profiler] ${id} ${phase}: ${actual.toFixed(2)}ms (base: ${base.toFixed(2)}ms)`)
}}>
  <TodoList ... />
</Profiler>
```

- 브라우저 콘솔에서 실시간 렌더 시간 확인
- UI의 "통계 갱신" 버튼으로 `actual` vs `base` 비교
- `actual < base` → React Compiler 메모이제이션이 효과를 내고 있다는 신호

---

### 9. React Compiler — 자동 메모이제이션

```ts
// vite.config.ts
react({
  babel: {
    plugins: [["babel-plugin-react-compiler", {}]],
  },
});
```

- 수동 `useMemo` / `useCallback` / `memo()` 없이 자동 최적화
- DevTools Components 탭에서 컴포넌트명 옆 **`memo ✓`** 배지로 확인

---

### 10. `React.memo` + `displayName` — 불필요 리렌더 방지

```tsx
const MemoChild = memo(function MemoChild({ label }) { ... })
MemoChild.displayName = 'MemoChild'  // DevTools 트리에서 이름 표시

// 나쁜 예: 매번 새 객체 생성 → 불필요 리렌더
<NormalChild config={{ label: 'inline 객체' }} />

// 좋은 예: stable props → memo가 방어
<MemoChild label="stable string" />
```

- 하단 "불필요한 리렌더 시연" 섹션에서 렌더 횟수 비교
- DevTools **"Highlight updates"** 켜고 버튼 클릭 시 차이 시각적으로 확인

---

## 🔍 DevTools 포인트

| DevTools 탭    | 확인할 내용                                       |
| -------------- | ------------------------------------------------- |
| **Components** | React Compiler `memo ✓` 배지                      |
| **Components** | `useTodoStats` 훅의 `useDebugValue` 레이블        |
| **Components** | `useOptimistic` 낙관적 상태 변화                  |
| **Components** | 우클릭 → "Suspend the selected component"         |
| **Profiler**   | `useTransition` 필터 전환 commit 분리 확인        |
| **Profiler**   | Ranked Chart — NormalChild vs MemoChild 비교      |
| **Profiler**   | "Why did this render?" 원인 분석                  |
| **Console**    | `<Profiler>` actual / base 렌더 시간 로그         |
| **Settings**   | "Highlight updates when components render" 활성화 |

---

## 🗂 프로젝트 구조

```
src/
├── App.tsx                   # Profiler, Suspense, useTodoStats, lazy import
├── types.ts
├── hooks/
│   └── useTodoStats.ts       # useDebugValue
└── components/
    ├── AddTodoForm.tsx        # useActionState + useOptimistic
    ├── FilterBar.tsx          # useTransition isPending 시각화
    ├── TodoList.tsx           # ref as prop (React 19)
    ├── TodoItem.tsx           # ref as prop, React Compiler 메모이제이션
    ├── StatsPanel.tsx         # React.lazy + Suspense
    └── RenderDemo.tsx         # Highlight Updates + React.memo + displayName

documents/
├── react-devtools.md          # 발표 원고
└── demo-guide.md              # 섹션별 시연 방법 및 권장 순서
```

---

## 🛠 기술 스택

- **React 19** — useActionState, useOptimistic, useTransition, useDeferredValue, useDebugValue, ref as prop
- **React Compiler 19.1.0-rc** — 자동 메모이제이션 (babel-plugin-react-compiler)
- **TypeScript 5.7**
- **Vite 6**
