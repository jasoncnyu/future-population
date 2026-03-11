import { defaultLocale, normalizeLocale, supportedLocales, type Locale } from "@/lib/i18n";
import { countryByCode, languageDefaultCountry, type CountryCode } from "@/lib/countries";

const COUNTRY_STORAGE_KEY = "fpp-country";
const COUNTRY_COOKIE_KEY = "fpp-country";

export function getStoredCountry(): CountryCode | null {
  try {
    const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (stored && countryByCode.has(stored as CountryCode)) {
      return stored as CountryCode;
    }
  } catch {
    // ignore
  }
  return null;
}

export function storeCountry(code: CountryCode) {
  try {
    localStorage.setItem(COUNTRY_STORAGE_KEY, code);
  } catch {
    // ignore
  }
}

export function detectCountryFromCookie(): CountryCode | null {
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COUNTRY_COOKIE_KEY}=`));
    if (!match) return null;
    const code = match.split("=")[1]?.toUpperCase();
    if (code && countryByCode.has(code as CountryCode)) return code as CountryCode;
  } catch {
    // ignore
  }
  return null;
}

function parseNavigatorLanguage(): { locale: Locale; region?: CountryCode } | null {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of languages) {
    const [language, region] = lang.toLowerCase().split("-");
    const normalized = normalizeLocale(language);
    if (!normalized || !supportedLocales.includes(normalized)) continue;
    const regionCode = region?.toUpperCase();
    if (regionCode && countryByCode.has(regionCode as CountryCode)) {
      return { locale: normalized, region: regionCode as CountryCode };
    }
    return { locale: normalized };
  }
  return null;
}

export function detectLocaleFromNavigator(): Locale {
  return parseNavigatorLanguage()?.locale ?? defaultLocale;
}

export function detectCountryFromLanguage(locale: Locale): CountryCode {
  return languageDefaultCountry[locale] ?? "US";
}

export function detectLocaleAndCountry(): { locale: Locale; country: CountryCode } {
  const storedCountry = getStoredCountry();
  const cookieCountry = detectCountryFromCookie();
  const parsed = parseNavigatorLanguage();
  const locale = parsed?.locale ?? defaultLocale;

  if (parsed?.region) {
    return { locale, country: parsed.region };
  }

  const country = cookieCountry ?? storedCountry ?? detectCountryFromLanguage(locale);
  return { locale, country };
}
