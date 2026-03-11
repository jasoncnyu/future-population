import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  right?: ReactNode;
}

export default function AppHeader({ title, subtitle, meta, right }: AppHeaderProps) {
  return (
    <header className="border-b border-border px-4 py-4 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {meta && <p className="text-xs text-muted-foreground mt-1">{meta}</p>}
          </div>
        </div>
        {right ? <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end")}>{right}</div> : null}
      </div>
    </header>
  );
}
