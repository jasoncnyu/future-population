import AppHeader from "@/components/AppHeader";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export default function About() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={t(locale, "about.title")}
        subtitle={t(locale, "about.subtitle")}
      />

      <main className="p-4 lg:p-8 space-y-6 max-w-3xl">
        <p className="text-base text-foreground">{t(locale, "about.p1")}</p>
        <p className="text-base text-foreground">{t(locale, "about.p2")}</p>
        <p className="text-base text-foreground">{t(locale, "about.p3")}</p>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <p className="text-sm text-foreground">{t(locale, "about.q1")}</p>
          <p className="text-sm text-foreground">{t(locale, "about.q2")}</p>
        </div>

        <p className="text-sm text-muted-foreground">{t(locale, "about.opensource")}</p>
      </main>
    </div>
  );
}
