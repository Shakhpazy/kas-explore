import type { ElementType } from "react"
import { User, ShieldCheck } from "lucide-react";

interface CardProps {
  title?: string;
  icon1?: ElementType;
  icon2?: ElementType;
  content?: string;
  description?: string;
}

export function Card({ title, icon1, icon2, content, description }: CardProps) {
    return (
        <div className="rounded-lg border text-card-foreground shadow-sm min-w-[250px] max-w-[340px] p-2 text-center">
            <div className="title flex justify-center items-center gap-2 mb-2">
                <User/>
                <h2 className="text-md font-semibold">{title}</h2>
                <ShieldCheck/>
            </div>
            <div className="content text-xl font-bold">{content}</div>
            <div className="description text-sm font-medium text-card-foreground/70 mt-1">
                {description}
            </div>
        </div>
    )
}