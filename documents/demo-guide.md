# ⚛️ React 19 Todo — DevTools 시연 가이드

> 발표 중 이 앱으로 시연할 수 있는 기능과 DevTools 조작 포인트 정리

---

## 앱 구성 한눈에 보기

```
App
├── AddTodoForm       ← useActionState + useOptimistic
├── Search Input      ← useDeferredValue
├── FilterBar         ← useTransition
├── <Profiler>
│   └── TodoList      ← React Compiler (자동 메모이제이션)
│       └── TodoItem  ← ref as prop (forwardRef 불필요)
├── Profiler Stats    ← <Profiler> 컴포넌트 결과
├── <Suspense>
│   └── StatsPanel    ← React.lazy + useDebugValue
└── RenderDemo        ← Highlight Updates + React.memo + displayName
```

---

## 섹션별 시연 포인트

---

### 01 · useActionState — 폼 상태 관리

**위치:** 상단 입력 폼 (보라/청록 배지)

**시연 방법:**
1. 빈 입력으로 제출 → 에러 메시지 표시
2. 텍스트 입력 후 제출 → "추가 중..." 로딩 상태 (0.7초)
3. 완료 후 성공 메시지 표시

**DevTools 확인:**
- Components 탭 → `AddTodoForm` 선택
- Hooks 섹션에서 `ActionState` 항목 확인
- `isPending`, `state.error`, `state.lastAdded` 값 실시간 관찰

**핵심 코드:**
```tsx
const [state, formAction, isPending] = useActionState(
  async (_prev, formData) => {
    await simulateServer()          // 0.7초 딜레이
    return { error: null, lastAdded: text }
  },
  { error: null, lastAdded: null }
)

<form action={formAction}>   {/* ← React 19: async 함수를 action으로 */}
```

---

### 02 · useOptimistic — 낙관적 UI 업데이트

**개념:** 서버 응답을 기다리기 전에 UI를 먼저 바꿔서 사용자에게 즉각 반응하는 느낌을 줍니다. 응답이 오면 실제 상태로 맞추고, 실패 시 롤백할 수 있습니다.

**위치:** 할 일 추가 시 목록 상단 (청록색 테두리 아이템)

**시연 방법:**
1. 할 일 입력 후 추가 → 목록 상단에 **"⚡ 낙관적 업데이트"** 배지가 붙은 아이템이 즉시 나타남
2. 0.7초 후 서버 응답 완료 → 배지 사라지고 실제 아이템으로 교체
3. (비교) DevTools 없이도 서버 딜레이 동안 빈 화면이 아닌 낙관적 UI 표시됨을 확인

**DevTools 확인:**
- Components 탭 → `App` 선택
- Hooks → `OptimisticState` 항목에서 낙관적 아이템 포함 배열 확인
- 제출 중일 때와 완료 후 배열이 어떻게 달라지는지 관찰

**핵심 코드:**
```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (state, newTodo) => [{ ...newTodo, isOptimistic: true }, ...state]
)

// form action 내부에서 호출 → 서버 응답 전 즉시 반영
addOptimisticTodo(newTodo)
await simulateServer()
onAdd(newTodo)  // 실제 상태 업데이트
```

---

### 03 · useTransition — 비긴급 상태 전환

**개념:** 어떤 상태 업데이트를 "긴급하지 않다"고 표시해, 입력·클릭 같은 긴급 업데이트를 먼저 처리하게 합니다. 필터·탭 전환처럼 무거운 리렌더를 뒤로 미룰 때 쓰면 좋습니다.

**위치:** 필터 탭 (전체 / 진행 중 / 완료)

**시연 방법:**
1. 필터 탭 클릭 → "전환 중..." 텍스트와 탭 목록 흐려짐 확인
2. 할 일이 많을수록 효과가 더 잘 보임

**DevTools 확인:**
- Profiler 탭 → 녹화 시작
- 필터 탭 클릭 → 녹화 중지
- Flamegraph에서 `FilterBar` 업데이트가 별도 commit으로 처리됨 확인
- "Why did this render?" → `startTransition` 관련 내용 확인

**핵심 코드:**
```tsx
const [isPending, startTransition] = useTransition()

const handleFilterChange = (newFilter) => {
  startTransition(() => {
    setFilter(newFilter)  // 낮은 우선순위로 처리
  })
}
```

---

### 04 · useDeferredValue — 값 처리 지연

**개념:** 어떤 값을 "지연된" 버전으로 쓸 수 있게 해서, 입력 등 긴급한 업데이트가 먼저 반영된 뒤에 무거운 연산(필터링·검색 등)이 따라가게 합니다. `useTransition`과 비슷한 목적이지만 "값" 기준으로 지연합니다.

**위치:** 검색 입력창 (노랑 배지)

**시연 방법:**
1. 검색창에 빠르게 입력 → "처리 중..." 표시 확인
2. 타이핑을 멈추면 즉시 검색 결과 반영

**DevTools 확인:**
- Components 탭 → `App` 선택
- Hooks → `DeferredValue` 항목에서 `searchQuery`와 `deferredQuery` 값 차이 확인
- 타이핑 중에는 두 값이 다름, 멈추면 동일해짐

**핵심 코드:**
```tsx
const deferredQuery = useDeferredValue(searchQuery)

// deferredQuery가 업데이트될 때만 필터링 재계산
const filtered = todos.filter(t => t.text.includes(deferredQuery))
```

---

### 05 · React Compiler — 자동 메모이제이션

**위치:** TodoList, TodoItem 컴포넌트 전체

**시연 방법:**
1. DevTools → Settings → ⚙️ → "Highlight updates" 켜기
2. 특정 할 일의 체크박스만 클릭 → 해당 `TodoItem`만 하이라이트되는지 확인
3. 관련 없는 아이템은 리렌더되지 않음을 시각적으로 확인

**DevTools 확인:**
- Components 탭 → `TodoItem` 선택
- 컴포넌트명 옆 **`memo ✓`** 배지 확인 (Compiler가 자동 적용)
- `useMemo`, `useCallback`, `React.memo` 수동 작성 없이 최적화됨

**핵심 설정 (vite.config.ts):**
```ts
react({
  babel: {
    plugins: [['babel-plugin-react-compiler', {}]]
  }
})
```

---

### 06 · ref as prop — forwardRef 불필요 (React 19)

**위치:** `TodoList`, `TodoItem` 컴포넌트

**시연 방법:**
1. 할 일 추가 시 목록 상단으로 자동 스크롤 → `ref`가 `listRef`로 전달됨을 확인

**코드 비교:**
```tsx
// React 18 — forwardRef 필수
const TodoList = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>...</div>
})

// React 19 — ref를 일반 prop으로 직접 전달
function TodoList({ todos, ref }: Props) {
  return <div ref={ref}>...</div>
}
```

---

### 07 · `<Profiler>` 컴포넌트 — 코드 레벨 성능 측정

**위치:** Profiler Stats 섹션 (TodoList 하단)

**시연 방법:**
1. 할 일 추가/삭제/체크 후 → "통계 갱신" 버튼 클릭
2. `actual` (실제 렌더 시간) vs `base` (메모이제이션 없을 때 예상 시간) 비교
3. `actual < base` 이면 React Compiler 메모이제이션이 효과를 내고 있다는 뜻

**콘솔 확인:**
- 브라우저 콘솔에 실시간 렌더 로그 출력
```
[⚛ Profiler] TodoList  update  actual: 2.3ms  base: 8.1ms
```

**핵심 코드:**
```tsx
<Profiler id="TodoList" onRender={(id, phase, actual, base) => {
  console.log(`${id} ${phase}: ${actual.toFixed(2)}ms (base: ${base.toFixed(2)}ms)`)
}}>
  <TodoList ... />
</Profiler>
```

---

### 08 · useDebugValue — 커스텀 훅 레이블

**개념:** 커스텀 훅 안에서 사용하는 값에 DevTools용 레이블을 붙입니다. Components 탭의 Hooks 섹션에서 해당 훅이 어떤 값으로 계산되었는지 사람이 읽기 쉬운 형태(포맷 함수)로 표시할 수 있습니다.

**위치:** `useTodoStats` 커스텀 훅 (App → StatsPanel)

**시연 방법:**
1. DevTools → Components 탭 → `App` 컴포넌트 선택
2. Hooks 섹션에서 `useTodoStats` 항목 확인
3. 값이 `"5 total · 3 done (60%)"` 형태로 포맷된 레이블로 표시됨

**코드:**
```tsx
function useTodoStats(todos) {
  // ...계산...

  // 두 번째 인자(포맷 함수)는 DevTools가 열릴 때만 실행
  useDebugValue(
    { total, completed, completionRate },
    (s) => `${s.total} total · ${s.completed} done (${s.completionRate}%)`
  )

  return stats
}
```

---

### 09 · React.lazy + Suspense — 지연 로딩

**위치:** StatsPanel (할 일 통계 섹션)

**시연 방법:**
1. 페이지 첫 로드 시 1.2초 동안 로딩 스켈레톤 표시
2. 완료 후 통계 패널로 전환

**DevTools에서 강제 테스트:**
1. Components 탭 → `LazyStatsPanel` 또는 `StatsPanel` 우클릭
2. **"Suspend the selected component"** 클릭 → 강제로 Suspense fallback 상태 진입
3. 로딩 UI를 언제든 미리 확인 가능 (QA/디자인 리뷰에 유용)

**핵심 코드:**
```tsx
const LazyStatsPanel = lazy(() =>
  new Promise(resolve => setTimeout(resolve, 1200))
    .then(() => import('./components/StatsPanel'))
)

<Suspense fallback={<StatsPanelSkeleton />}>
  <LazyStatsPanel stats={stats} />
</Suspense>
```

---

### 10 · Highlight Updates + React.memo + displayName

**위치:** 하단 "불필요한 리렌더 시연" 섹션

**시연 방법:**
1. DevTools → Settings → General → **"Highlight updates when components render"** 켜기
2. "부모 상태 변경" 버튼 클릭
3. 왼쪽 `NormalChild`는 매번 하이라이트 (빨간/주황), 오른쪽 `MemoChild`는 변화 없음
4. 렌더 횟수 카운터로 차이를 숫자로도 확인

**DevTools 추가 확인:**
- Profiler → 녹화 → 버튼 여러 번 클릭 → 중지
- Ranked Chart에서 `NormalChild`가 상위에, `MemoChild`는 나타나지 않음
- `MemoChild` 클릭 → "Why did this render?" 없음 (렌더 안 됨)
- Components 탭 → `MemoChild` 이름이 `Anonymous` 아닌 `MemoChild`로 표시 → **displayName 효과**

**핵심 코드:**
```tsx
// 나쁜 예: 매번 새 객체 → 불필요 리렌더
<NormalChild config={{ label: 'inline 객체' }} />

// 좋은 예: React.memo + stable props
const MemoChild = memo(function MemoChild({ label }) { ... })
MemoChild.displayName = 'MemoChild'  // ← DevTools에서 이름 표시
<MemoChild label="stable string" />
```

---

## 권장 시연 순서

```
1. 앱 소개 (헤더)
   ↓
2. 할 일 추가 → useActionState + useOptimistic 시연
   DevTools: Components → AddTodoForm → Hooks 관찰
   ↓
3. 검색 입력 → useDeferredValue 시연
   DevTools: App → DeferredValue 값 차이 확인
   ↓
4. 필터 탭 클릭 → useTransition 시연
   DevTools: Profiler 녹화 → 필터 전환 → Flamegraph 확인
   ↓
5. TodoList 조작 → React Compiler 확인
   DevTools: Components → TodoItem의 memo ✓ 배지
   ↓
6. Profiler 섹션 → <Profiler> 컴포넌트
   브라우저 콘솔에서 로그 확인 + "통계 갱신" 버튼
   ↓
7. StatsPanel → useDebugValue
   DevTools: App → Hooks → useTodoStats 레이블 확인
   ↓
8. StatsPanel 우클릭 → "Suspend" → Suspense fallback 강제 시연
   ↓
9. RenderDemo → Highlight Updates 켜고 버튼 반복 클릭
   DevTools: NormalChild vs MemoChild 시각적 비교
   Profiler Ranked Chart로 수치 비교
```

---

## 빠른 DevTools 세팅 체크리스트

발표 전 미리 설정해 두세요.

- [ ] Settings → General → **"Highlight updates when components render"** ✅
- [ ] Settings → Profiler → **"Record why each component rendered while profiling"** ✅
- [ ] Profiler 탭 열어두기 (녹화 버튼 바로 누를 수 있게)
- [ ] 브라우저 콘솔 열어두기 (Profiler 로그 확인용)
- [ ] `http://localhost:5173` 에서 개발 빌드로 실행 (프로덕션 빌드는 DevTools 비활성화)
