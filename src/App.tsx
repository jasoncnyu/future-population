import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LocaleProvider } from "@/lib/locale-context";
import { defaultLocale, normalizeLocale, type Locale } from "@/lib/i18n";
import { detectLocaleAndCountry, storeCountry } from "@/lib/geo";

const queryClient = new QueryClient();

const LocaleRedirect = () => {
  const navigate = useNavigate();
  const { locale, country } = detectLocaleAndCountry();
  storeCountry(country);
  return <Navigate to={`/${locale}`} replace />;
};

const LocaleGate = ({ element }: { element: React.ReactNode }) => {
  const navigate = useNavigate();
  const params = useParams();
  const paramLocale = params.locale ?? "";
  const normalized = normalizeLocale(paramLocale) ?? defaultLocale;
  const locale = normalized as Locale;

  if (paramLocale && normalizeLocale(paramLocale) !== locale) {
    return <Navigate to={`/${locale}`} replace />;
  }

  const setLocale = (next: Locale) => navigate(`/${next}`);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleProvider value={{ locale, setLocale }}>{element}</LocaleProvider>;
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
          <Route path="/:locale/*" element={<LocaleGate element={<NotFound />} />} />
          <Route path="*" element={<LocaleRedirect />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
