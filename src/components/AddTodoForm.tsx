import { useActionState } from 'react'
import type { RefObject } from 'react'
import type { Todo } from '../types'
import './AddTodoForm.css'

type FormState = {
  error: string | null
  lastAdded: string | null
}

type Props = {
  onAdd: (todo: Todo) => void
  addOptimistic: (todo: Todo) => void
  listRef: RefObject<HTMLDivElement | null>
}

export default function AddTodoForm({ onAdd, addOptimistic, listRef }: Props) {
  // ✨ useActionState: 폼 액션 상태 관리 (React 19)
  const [state, formAction, isPending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      const text = (formData.get('todo') as string)?.trim()

      if (!text) return { error: '할 일을 입력해주세요!', lastAdded: null }
      if (text.length > 100) return { error: '100자 이내로 입력해주세요.', lastAdded: null }

      // ✨ useOptimistic: 서버 응답 전에 UI를 즉시 업데이트
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: new Date(),
      }
      addOptimistic(newTodo)

      // 서버 요청 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 700))

      // 실제 상태 업데이트
      onAdd(newTodo)

      // 목록 상단으로 스크롤
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

      return { error: null, lastAdded: text }
    },
    { error: null, lastAdded: null }
  )

  return (
    <section className="add-form-section">
      <div className="feature-labels">
        <span className="badge badge-purple">useActionState</span>
        <span className="badge badge-cyan">useOptimistic</span>
      </div>

      {/* ✨ React 19: <form action={asyncFn}> 네이티브 지원 */}
      <form action={formAction} className="add-form">
        <div className="input-row">
          <input
            type="text"
            name="todo"
            placeholder="새 할 일을 입력하세요..."
            className="todo-input"
            disabled={isPending}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isPending}
            className={`add-btn ${isPending ? 'loading' : ''}`}
          >
            {isPending ? (
              <>
                <span className="spinner" />
                추가 중...
              </>
            ) : (
              <>
                <span>+</span> 추가
              </>
            )}
          </button>
        </div>

        {state.error && (
          <p className="form-message form-error">⚠ {state.error}</p>
        )}
        {!state.error && state.lastAdded && (
          <p className="form-message form-success">✓ &quot;{state.lastAdded}&quot; 추가됨</p>
        )}

        {isPending && (
          <p className="form-pending-hint">
            ⚡ useOptimistic: 서버 응답 전 UI 즉시 반영 중...
          </p>
        )}
      </form>
    </section>
  )
}
