import type { Filter } from '../types'
import './FilterBar.css'

type Props = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  isPending: boolean
  counts: { all: number; active: number; completed: number }
}

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'all', label: '전체', emoji: '📋' },
  { key: 'active', label: '진행 중', emoji: '🔥' },
  { key: 'completed', label: '완료', emoji: '✅' },
]

// ✨ React Compiler가 자동으로 이 컴포넌트를 메모이제이션합니다
export default function FilterBar({ filter, onFilterChange, isPending, counts }: Props) {
  return (
    <div className="filter-section">
      <div className="feature-labels">
        <span className="badge badge-green">useTransition</span>
        {isPending && <span className="pending-indicator">전환 중...</span>}
      </div>
      <div className={`filter-bar ${isPending ? 'is-pending' : ''}`}>
        {FILTERS.map(({ key, label, emoji }) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
          >
            <span className="filter-emoji">{emoji}</span>
            <span>{label}</span>
            <span className="filter-count">{counts[key]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
