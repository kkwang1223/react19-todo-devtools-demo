import type { Ref } from 'react'
import type { Todo } from '../types'
import TodoItem from './TodoItem'
import './TodoList.css'

type Props = {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isFiltering: boolean
  // ✨ React 19: ref를 일반 prop으로 전달
  ref?: Ref<HTMLDivElement>
}

// ✨ React Compiler: 자동 메모이제이션 (수동 memo() 불필요)
export default function TodoList({ todos, onToggle, onDelete, isFiltering, ref }: Props) {
  return (
    <div ref={ref} className={`todo-list-section ${isFiltering ? 'filtering' : ''}`}>
      <div className="feature-labels">
        <span className="badge badge-purple">React Compiler</span>
        <span className="compiler-hint">자동 메모이제이션 — DevTools에서 확인하세요</span>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  )
}
