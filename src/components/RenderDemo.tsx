import { useState, memo, useRef } from 'react'
import './RenderDemo.css'

// ─── 일반 컴포넌트 ─────────────────────────────────────────────
// 부모가 리렌더될 때마다 새 객체 참조를 받아 항상 함께 리렌더됨
function NormalChild({ config }: { config: { label: string } }) {
  const count = useRef(0)
  count.current++

  return (
    <div className="demo-child normal">
      <div className="demo-child-header">
        <code className="demo-child-name">NormalChild</code>
        <span className="render-count">🔄 {count.current}회</span>
      </div>
      <p className="demo-child-desc">{config.label}</p>
      <p className="demo-child-hint">인라인 객체 props → 매번 새 참조 → 리렌더</p>
    </div>
  )
}

// ─── React.memo 컴포넌트 ───────────────────────────────────────
// ✨ displayName: DevTools 트리에서 'Anonymous' 대신 이름 표시
const MemoChild = memo(function MemoChild({ label }: { label: string }) {
  const count = useRef(0)
  count.current++

  return (
    <div className="demo-child memoized">
      <div className="demo-child-header">
        <code className="demo-child-name">MemoChild</code>
        <span className="render-count memo-count">🔄 {count.current}회</span>
      </div>
      <p className="demo-child-desc">{label}</p>
      <p className="demo-child-hint">React.memo + 동일 props → 리렌더 건너뜀 ✓</p>
    </div>
  )
})
// ✨ displayName 명시: HOC/memo/forwardRef 사용 시 필수
MemoChild.displayName = 'MemoChild'

// ─── RenderDemo 부모 컴포넌트 ─────────────────────────────────
export default function RenderDemo() {
  const [count, setCount] = useState(0)

  return (
    <section className="render-demo-section">
      <div className="feature-labels">
        <span className="badge badge-yellow">Highlight Updates</span>
        <span className="badge badge-green">React.memo · displayName</span>
      </div>

      <div className="rd-header">
        <div>
          <p className="rd-title">불필요한 리렌더 시연</p>
          <p className="rd-sub">
            부모 상태 변경 시 자식 렌더 횟수 비교
          </p>
        </div>
        <button className="count-btn" onClick={() => setCount(c => c + 1)}>
          부모 상태 변경
          <span className="count-val">{count}</span>
        </button>
      </div>

      <div className="demo-children">
        {/* 매번 새 객체를 생성 → 참조가 달라져 리렌더 발생 */}
        <NormalChild config={{ label: 'props 객체 인라인 생성' }} />

        {/* string literal → 동일 값이면 memo가 방어 */}
        <MemoChild label="stable string props" />
      </div>

      <div className="rd-tip">
        💡 <strong>DevTools 확인:</strong>{' '}
        Settings → General →{' '}
        <em>"Highlight updates when components render"</em> 활성화 후 버튼 클릭
      </div>
    </section>
  )
}
