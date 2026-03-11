export const config = { runtime: "edge" };

const supportedLocales = [
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "nl",
  "sv",
  "da",
  "fi",
  "is",
  "nb",
  "nn",
  "pl",
  "cs",
  "sk",
  "sl",
  "hu",
  "et",
  "lv",
  "lt",
  "el",
  "tr",
  "he",
  "ga",
  "lb",
  "rm",
  "ja",
  "ko",
  "mi",
] as const;

type Locale = (typeof supportedLocales)[number];

type CountryCode =
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

const countryDefaultLocale: Record<CountryCode, Locale> = {
  AU: "en",
  AT: "de",
  BE: "nl",
  CA: "en",
  CL: "es",
  CO: "es",
  CR: "es",
  CZ: "cs",
  DK: "da",
  EE: "et",
  FI: "fi",
  FR: "fr",
  DE: "de",
  GR: "el",
  HU: "hu",
  IS: "is",
  IE: "en",
  IL: "he",
  IT: "it",
  JP: "ja",
  KR: "ko",
  LV: "lv",
  LT: "lt",
  LU: "lb",
  MX: "es",
  NL: "nl",
  NZ: "en",
  NO: "nb",
  PL: "pl",
  PT: "pt",
  SK: "sk",
  SI: "sl",
  ES: "es",
  SE: "sv",
  CH: "de",
  TR: "tr",
  GB: "en",
  US: "en",
};

const languageDefaultCountry: Record<Locale, CountryCode> = {
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

const oecdCountries = new Set(Object.keys(countryDefaultLocale));

function normalizeLocale(input?: string | null): Locale | null {
  if (!input) return null;
  const lowered = input.toLowerCase();
  if (supportedLocales.includes(lowered as Locale)) return lowered as Locale;
  const base = lowered.split("-")[0];
  return supportedLocales.includes(base as Locale) ? (base as Locale) : null;
}

function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const parts = header.split(",").map((part) => part.trim());
  for (const part of parts) {
    const lang = part.split(";")[0];
    const normalized = normalizeLocale(lang);
    if (normalized) return normalized;
  }
  return null;
}

function detectCountry(req: Request): CountryCode | null {
  const cf = req.headers.get("cf-ipcountry") ?? req.headers.get("CF-IPCountry");
  if (cf) {
    const code = cf.toUpperCase();
    if (oecdCountries.has(code)) return code as CountryCode;
  }
  return null;
}

export default function handler(req: Request) {
  const url = new URL(req.url);
  const country = detectCountry(req);
  const localeFromCountry = country ? countryDefaultLocale[country] : null;
  const localeFromLang = parseAcceptLanguage(req.headers.get("accept-language"));
  const locale = localeFromCountry ?? localeFromLang ?? "en";
  const resolvedCountry = country ?? languageDefaultCountry[locale];

  url.pathname = `/${locale}`;
  url.search = "";

  const res = Response.redirect(url.toString(), 302);
  res.headers.set(
    "Set-Cookie",
    `fpp-country=${resolvedCountry}; Path=/; Max-Age=2592000; SameSite=Lax`
  );
  res.headers.append(
    "Set-Cookie",
    `fpp-locale=${locale}; Path=/; Max-Age=2592000; SameSite=Lax`
  );
  res.headers.set("Vary", "Accept-Language, CF-IPCountry");
  return res;
}
