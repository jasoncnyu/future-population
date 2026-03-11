import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  right?: ReactNode;
}

export default function AppHeader({ title, subtitle, meta, right }: AppHeaderProps) {
  const { locale } = useLocale();
  const base = `/${locale}`;

  return (
    <header className="border-b border-border px-4 py-4 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {meta && <p className="text-xs text-muted-foreground mt-1">{meta}</p>}
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to={base}
              className="text-muted-foreground hover:text-foreground"
              activeClassName="text-foreground font-medium"
            >
              {t(locale, "nav.simulation")}
            </NavLink>
            <NavLink
              to={`${base}/theory`}
              className="text-muted-foreground hover:text-foreground"
              activeClassName="text-foreground font-medium"
            >
              {t(locale, "nav.theory")}
            </NavLink>
            <NavLink
              to={`${base}/about`}
              className="text-muted-foreground hover:text-foreground"
              activeClassName="text-foreground font-medium"
            >
              {t(locale, "nav.about")}
            </NavLink>
          </nav>
        </div>
        {right ? <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end")}>{right}</div> : null}
      </div>
    </header>
  );
}
