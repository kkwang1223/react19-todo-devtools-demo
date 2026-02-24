import { useDebugValue } from 'react'
import type { Todo } from '../types'

export interface TodoStats {
  total: number
  completed: number
  active: number
  completionRate: number
}

// ✨ useDebugValue: DevTools Components 패널에서 커스텀 훅 값을 레이블로 표시
// 선택한 컴포넌트의 훅 목록에서 "useTodoStats: '5 total · 3 done (60%)'" 형태로 보임
export function useTodoStats(todos: Todo[]): TodoStats {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const active = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // 두 번째 인자(포맷 함수)는 DevTools가 열려 있을 때만 실행 → 성능 영향 없음
  useDebugValue(
    { total, completed, active, completionRate },
    (s) => `${s.total} total · ${s.completed} done (${s.completionRate}%)`
  )

  return { total, completed, active, completionRate }
}
