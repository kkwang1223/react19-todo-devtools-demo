import { useState, useTransition, useDeferredValue, useOptimistic, useRef } from 'react'
import type { Todo, Filter } from './types'
import AddTodoForm from './components/AddTodoForm'
import FilterBar from './components/FilterBar'
import TodoList from './components/TodoList'
import './App.css'

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
        <p className="app-subtitle">React Compiler · useActionState · useOptimistic · useTransition · useDeferredValue</p>
      </header>

      <main className="app-main">
        {/* ✨ useActionState + useOptimistic */}
        <AddTodoForm
          onAdd={handleAdd}
          addOptimistic={addOptimisticTodo}
          listRef={listRef}
        />

        {/* ✨ useDeferredValue */}
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

        {/* ✨ useTransition */}
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          isPending={isPending}
          counts={counts}
        />

        {/* Todo 목록 */}
        <TodoList
          ref={listRef}
          todos={filteredTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          isFiltering={isPending}
        />

        {filteredTodos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✨</span>
            <p>할 일이 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}
