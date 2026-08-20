export function SkeletonCard() {
	return (
		<div
			aria-busy="true"
			aria-label="Loading"
			className="animate-pulse rounded-lg border border-border bg-card p-4 text-center text-card-foreground shadow-sm"
		>
			<div className="mb-2 flex items-center justify-center gap-2">
				<div className="h-5 w-5 rounded bg-muted" />
				<div className="h-4 w-20 rounded bg-muted" />
				<div className="h-4 w-4 rounded bg-muted" />
			</div>
			<div className="mx-auto h-7 w-24 rounded bg-muted" />
			<div className="mx-auto mt-2 h-4 w-32 rounded bg-muted" />
		</div>
	)
}
