import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import SeoTags from "@/components/SeoTags";
import { useLocale } from "@/lib/locale-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { locale } = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoTags />
      <Navigation locale={locale} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
