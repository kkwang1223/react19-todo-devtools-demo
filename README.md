# ⚛️ React 19 Todo — DevTools Demo

> React DevTools 크롬 확장프로그램 발표를 위한 React 19 기능 시연 앱

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

## ✨ 시연 기능 (React 19)

### 1. `useActionState` — 폼 상태 관리
```tsx
const [state, formAction, isPending] = useActionState(
  async (_prevState, formData) => {
    await saveToServer(formData) // 서버 요청 시뮬레이션
    return { error: null, lastAdded: text }
  },
  { error: null, lastAdded: null }
)

// form에 async 함수를 직접 action으로 연결
<form action={formAction}>
```
- `isPending`: 제출 중 로딩 상태 자동 관리
- `<form action={asyncFn}>`: 네이티브 form과 async 액션 통합

### 2. `useOptimistic` — 낙관적 UI 업데이트
```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (state, newTodo) => [{ ...newTodo, isOptimistic: true }, ...state]
)

// 폼 액션 내부에서 호출 → 서버 응답 전 즉시 UI 반영
addOptimisticTodo(newTodo)
await simulateServerDelay(700)
onAdd(newTodo) // 실제 상태 업데이트
```
- 서버 응답을 기다리지 않고 UI를 즉시 반영
- 요청 실패 시 자동 롤백

### 3. `useTransition` — 비긴급 상태 전환
```tsx
const [isPending, startTransition] = useTransition()

const handleFilterChange = (filter) => {
  startTransition(() => {
    setFilter(filter) // 낮은 우선순위로 처리
  })
}
```
- 필터 전환을 낮은 우선순위로 처리하여 UI 응답성 유지
- `isPending`으로 전환 중 시각적 피드백 제공

### 4. `useDeferredValue` — 값 처리 지연
```tsx
const deferredQuery = useDeferredValue(searchQuery)

// deferredQuery가 업데이트될 때만 필터링 재계산
const filteredTodos = todos.filter(todo =>
  todo.text.includes(deferredQuery)
)
```
- 타이핑 중 무거운 필터링 연산을 지연 처리
- 검색 입력의 응답성 향상

### 5. `ref` as prop — forwardRef 불필요
```tsx
// React 18: forwardRef 필요
const TodoItem = forwardRef<HTMLLIElement, Props>((props, ref) => { ... })

// React 19: ref를 일반 prop으로 직접 전달
function TodoItem({ todo, onToggle, ref }: Props) {
  return <li ref={ref}>...</li>
}
```

### 6. React Compiler — 자동 메모이제이션
```ts
// vite.config.ts
react({
  babel: {
    plugins: [['babel-plugin-react-compiler', {}]]
  }
})
```
- 수동 `useMemo`, `useCallback`, `memo()` 없이 자동 최적화
- **React DevTools Components 탭**에서 `memo ✓` 배지로 확인 가능

---

## 🔍 React DevTools 시연 포인트

| DevTools 탭 | 확인할 내용 |
|------------|-----------|
| **Components** | React Compiler 자동 메모이제이션 (`memo ✓` 배지) |
| **Components** | `useOptimistic`의 낙관적 상태 변화 |
| **Profiler** | `useTransition`으로 필터 전환 시 렌더링 우선순위 |
| **Profiler** | 불필요한 리렌더링 없음 (Compiler 효과) |

---

## 🗂 프로젝트 구조

```
src/
├── App.tsx                 # useTransition, useDeferredValue, useOptimistic
├── types.ts
└── components/
    ├── AddTodoForm.tsx      # useActionState + useOptimistic
    ├── AddTodoForm.css
    ├── FilterBar.tsx        # useTransition isPending 시각화
    ├── FilterBar.css
    ├── TodoList.tsx         # ref as prop (React 19)
    ├── TodoList.css
    ├── TodoItem.tsx         # ref as prop, React Compiler 메모이제이션
    └── TodoItem.css
```

---

## 🛠 기술 스택

- **React 19** — 최신 훅 및 기능
- **React Compiler 19.1.0-rc** — 자동 메모이제이션
- **TypeScript 5.7**
- **Vite 6**
