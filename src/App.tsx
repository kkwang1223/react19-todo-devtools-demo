import {
  useState,
  useTransition,
  useDeferredValue,
  useOptimistic,
  useRef,
  Suspense,
  lazy,
  Profiler,
} from 'react'
import type { ProfilerOnRenderCallback } from 'react'
import type { Todo, Filter } from './types'
import { useTodoStats } from './hooks/useTodoStats'
import AddTodoForm from './components/AddTodoForm'
import FilterBar from './components/FilterBar'
import TodoList from './components/TodoList'
import RenderDemo from './components/RenderDemo'
import './App.css'

// ✨ React.lazy: StatsPanel을 지연 로딩 (Suspense fallback 시연용)
// 1.2초 딜레이로 Suspense fallback을 눈으로 확인할 수 있음
// DevTools: 컴포넌트 우클릭 → "Suspend the selected component" 강제 테스트도 가능
const LazyStatsPanel = lazy(() =>
  new Promise<typeof import('./components/StatsPanel')>(resolve =>
    setTimeout(() => import('./components/StatsPanel').then(resolve), 1200)
  )
)

const INITIAL_TODOS: Todo[] = [
  { id: '1', text: 'React 19 새 기능 살펴보기', completed: true, createdAt: new Date() },
  { id: '2', text: 'React Compiler 적용하기', completed: true, createdAt: new Date() },
  { id: '3', text: 'React DevTools로 컴포넌트 분석하기', completed: false, createdAt: new Date() },
  { id: '4', text: 'useOptimistic으로 낙관적 업데이트 구현', completed: false, createdAt: new Date() },
  { id: '5', text: 'useActionState로 폼 상태 관리하기', completed: false, createdAt: new Date() },
]

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(searchQuery)
  const listRef = useRef<HTMLDivElement>(null)

  // ✨ useOptimistic: 낙관적 업데이트 (React 19)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state: Todo[], newTodo: Todo) => [{ ...newTodo, isOptimistic: true }, ...state]
  )

  // ✨ useDebugValue: DevTools Components 탭에서 커스텀 훅 값 확인
  // App 컴포넌트 선택 → Hooks 섹션 → useTodoStats 항목에 레이블 표시됨
  const stats = useTodoStats(todos)

  // ✨ <Profiler> 컴포넌트: 코드 레벨 렌더 성능 측정
  // renderStatsRef에 저장 → setState 없이 콘솔 출력만 (무한 루프 방지)
  const renderStatsRef = useRef({ phase: '-', actual: 0, base: 0, count: 0 })
  const [profilerDisplay, setProfilerDisplay] = useState(renderStatsRef.current)

  const handleProfilerRender: ProfilerOnRenderCallback = (
    _id, phase, actualDuration, baseDuration
  ) => {
    renderStatsRef.current = {
      phase,
      actual: +actualDuration.toFixed(2),
      base: +baseDuration.toFixed(2),
      count: renderStatsRef.current.count + 1,
    }
    // 콘솔에서도 확인 가능 (DevTools Console 탭)
    console.log(
      `%c[⚛ Profiler] TodoList %c${phase}%c  actual: ${actualDuration.toFixed(2)}ms  base: ${baseDuration.toFixed(2)}ms`,
      'color: #61dafb; font-weight: bold',
      'color: #a78bfa',
      'color: #94a3b8'
    )
  }

  const handleAdd = (todo: Todo) => {
    setTodos(prev => [todo, ...prev])
  }

  const handleToggle = (id: string) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )
  }

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  // ✨ useTransition: 필터 변경을 낮은 우선순위로 처리 (React 19)
  const handleFilterChange = (newFilter: Filter) => {
    startTransition(() => {
      setFilter(newFilter)
    })
  }

  // ✨ useDeferredValue: 검색어 처리를 지연 (React 19)
  const filteredTodos = optimisticTodos
    .filter(todo => {
      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true
    })
    .filter(todo =>
      todo.text.toLowerCase().includes(deferredQuery.toLowerCase())
    )

  const counts = {
    all: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">React DevTools Demo</div>
        <h1 className="app-title">
          <span className="react-logo">⚛</span> React 19 Todo
        </h1>
        <p className="app-subtitle">
          React Compiler · useActionState · useOptimistic · useTransition · useDeferredValue · useDebugValue
        </p>
      </header>

      <main className="app-main">

        {/* ── 섹션 1: useActionState + useOptimistic ── */}
        <AddTodoForm
          onAdd={handleAdd}
          addOptimistic={addOptimisticTodo}
          listRef={listRef}
        />

        {/* ── 섹션 2: useDeferredValue ── */}
        <div className="search-section">
          <div className="feature-label">
            <span className="badge badge-yellow">useDeferredValue</span>
          </div>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="할 일 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery !== deferredQuery && (
              <span className="search-pending">처리 중...</span>
            )}
          </div>
        </div>

        {/* ── 섹션 3: useTransition ── */}
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          isPending={isPending}
          counts={counts}
        />

        {/* ── 섹션 4: <Profiler> 컴포넌트 + React Compiler ── */}
        <Profiler id="TodoList" onRender={handleProfilerRender}>
          <TodoList
            ref={listRef}
            todos={filteredTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            isFiltering={isPending}
          />
        </Profiler>

        {filteredTodos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✨</span>
            <p>할 일이 없습니다</p>
          </div>
        )}

        {/* ── Profiler 통계 표시 ── */}
        <div className="profiler-section">
          <div className="feature-labels">
            <span className="badge badge-cyan">&lt;Profiler&gt; 컴포넌트</span>
          </div>
          <div className="profiler-bar">
            <div className="profiler-stat">
              <span className="profiler-key">phase</span>
              <span className="profiler-val">{profilerDisplay.phase}</span>
            </div>
            <div className="profiler-stat">
              <span className="profiler-key">actual</span>
              <span className="profiler-val">{profilerDisplay.actual}ms</span>
            </div>
            <div className="profiler-stat">
              <span className="profiler-key">base</span>
              <span className="profiler-val">{profilerDisplay.base}ms</span>
            </div>
            <div className="profiler-stat">
              <span className="profiler-key">renders</span>
              <span className="profiler-val">{profilerDisplay.count}회</span>
            </div>
            <button
              className="profiler-refresh-btn"
              onClick={() => setProfilerDisplay({ ...renderStatsRef.current })}
            >
              통계 갱신
            </button>
          </div>
          <p className="profiler-hint">
            콘솔에서 실시간 확인 가능 · "통계 갱신" 클릭으로 마지막 렌더 결과 표시
          </p>
        </div>

        {/* ── 섹션 5: useDebugValue + React.lazy + Suspense ── */}
        <Suspense fallback={<StatsPanelSkeleton />}>
          <LazyStatsPanel stats={stats} />
        </Suspense>

        {/* ── 섹션 6: Highlight Updates + React.memo + displayName ── */}
        <RenderDemo />

      </main>
    </div>
  )
}

// Suspense fallback 컴포넌트
function StatsPanelSkeleton() {
  return (
    <div className="stats-skeleton">
      <div className="feature-labels">
        <span className="badge badge-cyan">React.lazy · Suspense</span>
      </div>
      <p className="skeleton-label">
        <span className="skeleton-spinner" /> StatsPanel 로딩 중...
      </p>
      <p className="skeleton-hint">
        💡 DevTools: 컴포넌트 우클릭 → <em>"Suspend the selected component"</em>
      </p>
    </div>
  )
}
