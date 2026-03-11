import type { Locale } from "@/lib/i18n";

export type CountryCode =
  | "AU"
  | "AT"
  | "BE"
  | "CA"
  | "CL"
  | "CO"
  | "CR"
  | "CZ"
  | "DK"
  | "EE"
  | "FI"
  | "FR"
  | "DE"
  | "GR"
  | "HU"
  | "IS"
  | "IE"
  | "IL"
  | "IT"
  | "JP"
  | "KR"
  | "LV"
  | "LT"
  | "LU"
  | "MX"
  | "NL"
  | "NZ"
  | "NO"
  | "PL"
  | "PT"
  | "SK"
  | "SI"
  | "ES"
  | "SE"
  | "CH"
  | "TR"
  | "GB"
  | "US";

export interface CountryInfo {
  code: CountryCode;
  name: string;
  defaultLocale: Locale;
  locales: Locale[];
}

export const OECD_COUNTRIES: CountryInfo[] = [
  { code: "AU", name: "Australia", defaultLocale: "en", locales: ["en"] },
  { code: "AT", name: "Austria", defaultLocale: "de", locales: ["de"] },
  { code: "BE", name: "Belgium", defaultLocale: "nl", locales: ["nl", "fr", "de"] },
  { code: "CA", name: "Canada", defaultLocale: "en", locales: ["en", "fr"] },
  { code: "CL", name: "Chile", defaultLocale: "es", locales: ["es"] },
  { code: "CO", name: "Colombia", defaultLocale: "es", locales: ["es"] },
  { code: "CR", name: "Costa Rica", defaultLocale: "es", locales: ["es"] },
  { code: "CZ", name: "Czechia", defaultLocale: "cs", locales: ["cs"] },
  { code: "DK", name: "Denmark", defaultLocale: "da", locales: ["da"] },
  { code: "EE", name: "Estonia", defaultLocale: "et", locales: ["et"] },
  { code: "FI", name: "Finland", defaultLocale: "fi", locales: ["fi", "sv"] },
  { code: "FR", name: "France", defaultLocale: "fr", locales: ["fr"] },
  { code: "DE", name: "Germany", defaultLocale: "de", locales: ["de"] },
  { code: "GR", name: "Greece", defaultLocale: "el", locales: ["el"] },
  { code: "HU", name: "Hungary", defaultLocale: "hu", locales: ["hu"] },
  { code: "IS", name: "Iceland", defaultLocale: "is", locales: ["is"] },
  { code: "IE", name: "Ireland", defaultLocale: "en", locales: ["en", "ga"] },
  { code: "IL", name: "Israel", defaultLocale: "he", locales: ["he"] },
  { code: "IT", name: "Italy", defaultLocale: "it", locales: ["it"] },
  { code: "JP", name: "Japan", defaultLocale: "ja", locales: ["ja"] },
  { code: "KR", name: "Korea", defaultLocale: "ko", locales: ["ko"] },
  { code: "LV", name: "Latvia", defaultLocale: "lv", locales: ["lv"] },
  { code: "LT", name: "Lithuania", defaultLocale: "lt", locales: ["lt"] },
  { code: "LU", name: "Luxembourg", defaultLocale: "lb", locales: ["lb", "fr", "de"] },
  { code: "MX", name: "Mexico", defaultLocale: "es", locales: ["es"] },
  { code: "NL", name: "Netherlands", defaultLocale: "nl", locales: ["nl"] },
  { code: "NZ", name: "New Zealand", defaultLocale: "en", locales: ["en", "mi"] },
  { code: "NO", name: "Norway", defaultLocale: "nb", locales: ["nb", "nn"] },
  { code: "PL", name: "Poland", defaultLocale: "pl", locales: ["pl"] },
  { code: "PT", name: "Portugal", defaultLocale: "pt", locales: ["pt"] },
  { code: "SK", name: "Slovakia", defaultLocale: "sk", locales: ["sk"] },
  { code: "SI", name: "Slovenia", defaultLocale: "sl", locales: ["sl"] },
  { code: "ES", name: "Spain", defaultLocale: "es", locales: ["es"] },
  { code: "SE", name: "Sweden", defaultLocale: "sv", locales: ["sv"] },
  { code: "CH", name: "Switzerland", defaultLocale: "de", locales: ["de", "fr", "it", "rm"] },
  { code: "TR", name: "Turkey", defaultLocale: "tr", locales: ["tr"] },
  { code: "GB", name: "United Kingdom", defaultLocale: "en", locales: ["en"] },
  { code: "US", name: "United States", defaultLocale: "en", locales: ["en"] },
];

export const countryByCode = new Map<CountryCode, CountryInfo>(
  OECD_COUNTRIES.map((c) => [c.code, c])
);

export const languageDefaultCountry: Record<Locale, CountryCode> = {
  en: "US",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  pt: "PT",
  nl: "NL",
  sv: "SE",
  da: "DK",
  fi: "FI",
  is: "IS",
  nb: "NO",
  nn: "NO",
  pl: "PL",
  cs: "CZ",
  sk: "SK",
  sl: "SI",
  hu: "HU",
  et: "EE",
  lv: "LV",
  lt: "LT",
  el: "GR",
  tr: "TR",
  he: "IL",
  ga: "IE",
  lb: "LU",
  rm: "CH",
  ja: "JP",
  ko: "KR",
  mi: "NZ",
};

export function getCountryName(locale: Locale, code: CountryCode): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code) ?? countryByCode.get(code)?.name ?? code;
  } catch {
    return countryByCode.get(code)?.name ?? code;
  }
}
