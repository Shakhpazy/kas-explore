import type { ElementType } from "react"

interface CardProps {
  title?: string;
  icon1?: ElementType;
  icon2?: ElementType;
  content?: string;
  description?: string;
}

export function Card({ title, icon1: Icon1, icon2: Icon2, content, description }: CardProps) {
    return (
        <div className="min-w-[240px] rounded-lg border border-border bg-card p-4 text-center text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-center gap-2">
                {Icon1 && <Icon1 aria-hidden="true" className="size-5 text-muted-foreground" />}
                <h2 className="text-md font-semibold text-[var(--lagoon-deep)]">{title}</h2>
                {Icon2 && <Icon2 aria-hidden="true" className="size-4 text-muted-foreground" />}
            </div>
            <div className="text-xl font-bold">{content}</div>
            <div className="mt-1 text-sm font-medium text-muted-foreground">
                {description}
            </div>
        </div>
    )
}