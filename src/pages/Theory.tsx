import AppHeader from "@/components/AppHeader";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export default function Theory() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={t(locale, "theory.title")}
        subtitle={t(locale, "theory.subtitle")}
      />

      <main className="p-4 lg:p-8 space-y-8 max-w-3xl">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "theory.cohort.title")}
          </h2>
          <p className="text-base text-foreground">{t(locale, "theory.cohort.p1")}</p>
          <p className="text-base text-foreground">{t(locale, "theory.cohort.p2")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t(locale, "theory.tfr.title")}
          </h2>
          <p className="text-base text-foreground">{t(locale, "theory.tfr.p1")}</p>
          <p className="text-base text-foreground">{t(locale, "theory.tfr.p2")}</p>
        </section>
      </main>
    </div>
  );
}
