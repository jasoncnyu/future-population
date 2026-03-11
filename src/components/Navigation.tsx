import { BarChart3, BookOpen, Info } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/lib/locale-context";
import { localeLabel, supportedLocales, t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavigationProps {
  locale: Locale;
}

export default function Navigation({ locale }: NavigationProps) {
  const { setLocale } = useLocale();
  const links = [
    { to: `/${locale}`, label: t(locale, "nav.simulation"), icon: BarChart3, end: true },
    { to: `/${locale}/theory`, label: t(locale, "nav.theory"), icon: BookOpen, end: false },
    { to: `/${locale}/about`, label: t(locale, "nav.about"), icon: Info, end: false },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 lg:px-8">
        <div className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="w-[120px] shrink-0">
          <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLocales.map((supportedLocale) => (
                <SelectItem key={supportedLocale} value={supportedLocale}>
                  {localeLabel(supportedLocale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </nav>
  );
}
