import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Theory from "./pages/Theory";
import { LocaleProvider } from "@/lib/locale-context";
import { defaultLocale, normalizeLocale, type Locale } from "@/lib/i18n";
import { detectLocaleAndCountry, storeCountry } from "@/lib/geo";
import AppLayout from "@/layouts/AppLayout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

const LocaleRedirect = () => {
  const { locale, country } = detectLocaleAndCountry();
  storeCountry(country);
  return <Navigate to={`/${locale}`} replace />;
};

const LocaleGate = ({ element }: { element: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const paramLocale = params.locale ?? "";
  const normalized = normalizeLocale(paramLocale) ?? defaultLocale;
  const locale = normalized as Locale;
  const shouldRedirect = Boolean(paramLocale && normalizeLocale(paramLocale) !== locale);
  const setLocale = (next: Locale) => {
    const [, , ...rest] = location.pathname.split("/");
    const nextPath = `/${next}${rest.length > 0 ? `/${rest.join("/")}` : ""}`;
    navigate(`${nextPath}${location.search}${location.hash}`);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (shouldRedirect) {
    return <Navigate to={`/${locale}`} replace />;
  }

  return (
    <LocaleProvider value={{ locale, setLocale }}>
      <AppLayout>{element}</AppLayout>
    </LocaleProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LocaleRedirect />} />
          <Route path="/:locale" element={<LocaleGate element={<Index />} />} />
          <Route path="/:locale/theory" element={<LocaleGate element={<Theory />} />} />
          <Route path="/:locale/about" element={<LocaleGate element={<About />} />} />
          <Route path="/:locale/*" element={<LocaleGate element={<NotFound />} />} />
          <Route path="*" element={<LocaleRedirect />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
