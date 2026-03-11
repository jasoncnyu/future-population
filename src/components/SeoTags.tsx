import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { supportedLocales } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

const SITE_URL = "https://population.simlab.me";

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let link = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (hreflang) {
      link.hreflang = hreflang;
    }
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function SeoTags() {
  const location = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const suffix = segments.slice(1).join("/");
    const suffixPath = suffix ? `/${suffix}` : "";
    const canonicalUrl = `${SITE_URL}/${locale}${suffixPath}`;

    upsertLink("canonical", canonicalUrl);

    supportedLocales.forEach((supportedLocale) => {
      upsertLink("alternate", `${SITE_URL}/${supportedLocale}${suffixPath}`, supportedLocale);
    });

    upsertLink("alternate", `${SITE_URL}/en${suffixPath}`, "x-default");
  }, [location.pathname, locale]);

  return null;
}
