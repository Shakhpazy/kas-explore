import type { ElementType } from 'react'

interface CardProps {
  title?: string
  icon1?: ElementType
  icon2?: ElementType
  content?: string
  description?: string
  summary?: string
  status?: 'ready' | 'loading' | 'error'
}
export function Card({
  title,
  icon1: Icon1,
  icon2: Icon2,
  content,
  description,
  status = 'ready',
}: CardProps) {
  return (
    <article className="network-metric" aria-busy={status === 'loading'}>
      <div className="flex items-center justify-between">
        <p className="m-0 text-sm font-semibold text-[var(--ink-muted)]">
          {title}
        </p>
        {Icon1 && (
          <Icon1
            className="size-4 text-[var(--ink-muted)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
        {Icon2 && (
          <Icon2
            className="size-4 text-[var(--ink-muted)]"
            aria-hidden="true"
          />
        )}
      </div>
      {status === 'loading' ? (
        <>
          <div className="metric-skeleton mt-6 h-8 w-28" />
          <div className="metric-skeleton mt-4 h-3 w-32" />
        </>
      ) : (
        <>
          <p
            className={`metric-value ${status === 'error' ? 'metric-error' : ''}`}
          >
            {content}
          </p>
          <p className="metric-description">{description}</p>
        </>
      )}
    </article>
  )
}
