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

export function detectLocaleFromNavigator(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of languages) {
    const normalized = normalizeLocale(lang);
    if (normalized && supportedLocales.includes(normalized)) {
      return normalized;
    }
  }
  return defaultLocale;
}

export function detectCountryFromLanguage(locale: Locale): CountryCode {
  return languageDefaultCountry[locale] ?? "US";
}

export function detectLocaleAndCountry(): { locale: Locale; country: CountryCode } {
  const storedCountry = getStoredCountry();
  const cookieCountry = detectCountryFromCookie();
  const locale = detectLocaleFromNavigator();

  const country =
    cookieCountry ??
    storedCountry ??
    detectCountryFromLanguage(locale);

  return { locale, country };
}
