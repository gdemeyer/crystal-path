export default function TaskCardSkeleton() {
  return (
    <div className="task-summary-card task-card-skeleton" aria-hidden="true">
      <div className="task-summary-card-content">
        <div className="skeleton-shimmer skeleton-line skeleton-title" />
        <div className="skeleton-shimmer skeleton-line skeleton-title-short" />
      </div>
      <div className="skeleton-shimmer skeleton-button" />
    </div>
  )
}
