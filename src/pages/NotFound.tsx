import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t(locale, "notFound.title")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t(locale, "notFound.message")}</p>
        <a href={`/${locale}`} className="text-primary underline hover:text-primary/90">
          {t(locale, "notFound.home")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
