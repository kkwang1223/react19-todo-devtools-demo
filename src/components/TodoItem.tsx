import type { Ref } from 'react'
import type { Todo } from '../types'
import './TodoItem.css'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  // ✨ React 19: ref를 일반 prop으로 전달 (forwardRef 불필요!)
  ref?: Ref<HTMLLIElement>
}

// ✨ React Compiler: 자동 메모이제이션 적용됨 (DevTools에서 확인 가능)
// ✨ React 19: forwardRef 없이 ref prop 직접 수신
export default function TodoItem({ todo, onToggle, onDelete, ref }: Props) {
  return (
    <li
      ref={ref}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.isOptimistic ? 'optimistic' : ''}`}
    >
      {todo.isOptimistic && (
        <span className="optimistic-badge">⚡ 낙관적 업데이트</span>
      )}
      <button
        className="todo-checkbox"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '완료 취소' : '완료 표시'}
        disabled={todo.isOptimistic}
      >
        <span className="checkbox-inner">
          {todo.completed && <span className="checkmark">✓</span>}
        </span>
      </button>

      <span className="todo-text">{todo.text}</span>

      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
        disabled={todo.isOptimistic}
      >
        ✕
      </button>
    </li>
  )
}
