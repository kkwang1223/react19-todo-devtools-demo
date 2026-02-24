import type { TodoStats } from '../hooks/useTodoStats'
import './StatsPanel.css'

interface Props {
  stats: TodoStats
}

// ✨ React.lazy로 지연 로딩됨 (App.tsx 참고)
// → Suspense fallback 시연 + "Suspend the selected component" DevTools 우클릭 테스트
export default function StatsPanel({ stats }: Props) {
  const { total, completed, active, completionRate } = stats

  return (
    <section className="stats-panel">
      <div className="feature-labels">
        <span className="badge badge-cyan">React.lazy · Suspense</span>
        <span className="badge badge-purple">useDebugValue</span>
      </div>

      <p className="stats-title">할 일 통계</p>

      <div className="stats-grid">
        <StatCard value={total} label="전체" color="purple" />
        <StatCard value={active} label="진행 중" color="yellow" />
        <StatCard value={completed} label="완료" color="green" />
        <StatCard value={`${completionRate}%`} label="완료율" color="cyan" />
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <span className="progress-label">{completionRate}% 완료</span>
      </div>

      <p className="stats-devtools-hint">
        💡 Components 탭에서 App 선택 →{' '}
        훅 목록의 <em>useTodoStats</em> 값 확인 (useDebugValue)
      </p>
    </section>
  )
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number | string
  label: string
  color: 'purple' | 'yellow' | 'green' | 'cyan'
}) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
