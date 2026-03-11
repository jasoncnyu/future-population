import type { AgeGroupGender } from "@/components/PopulationPyramid";
import type { CountryCode } from "@/lib/countries";

export interface CountryData {
  country: CountryCode;
  population: number;
  tfr: number;
  ageGroups: AgeGroupGender[];
  years: {
    population: number | null;
    tfr: number | null;
    age: number | null;
  };
}

const IDB_BASE = "https://api.census.gov/data/timeseries/idb/5year";
const IDB_CACHE_KEY = "fpp-idb-cache-v1";
const IDB_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;

const AGE_BANDS = [
  "0_4",
  "5_9",
  "10_14",
  "15_19",
  "20_24",
  "25_29",
  "30_34",
  "35_39",
  "40_44",
  "45_49",
  "50_54",
  "55_59",
  "60_64",
  "65_69",
  "70_74",
  "75_79",
  "80_84",
  "85_89",
  "90_94",
  "95_99",
  "100_",
];

const DEFAULT_AGE_GROUPS: AgeGroupGender[] = AGE_BANDS.map((band, i) => {
  const start = band.split("_")[0];
  const end = band === "100_" ? "100+" : band.split("_")[1];
  const label = band === "100_" ? "100+" : `${start}-${end}`;
  const minAge = Number(start);
  const maxAge = band === "100_" ? 100 : Number(end);
  const base = 100 / (AGE_BANDS.length * 2);
  return {
    label,
    minAge,
    maxAge,
    malePercent: Math.round(base * 100) / 100,
    femalePercent: Math.round(base * 100) / 100,
  };
});

const DEFAULT_DATA: Omit<CountryData, "country"> = {
  population: 50_000_000,
  tfr: 1.7,
  ageGroups: DEFAULT_AGE_GROUPS,
  years: { population: null, tfr: null, age: null },
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function sum(values: number[]) {
  return values.reduce((s, v) => s + v, 0);
}

function buildAgeGroupsFromCounts(male: number[], female: number[]): AgeGroupGender[] {
  const total = sum(male) + sum(female);
  if (!total) return DEFAULT_AGE_GROUPS;

  return AGE_BANDS.map((band, i) => {
    const start = band.split("_")[0];
    const end = band === "100_" ? "100+" : band.split("_")[1];
    const label = band === "100_" ? "100+" : `${start}-${end}`;
    const minAge = Number(start);
    const maxAge = band === "100_" ? 100 : Number(end);

    return {
      label,
      minAge,
      maxAge,
      malePercent: round2((male[i] / total) * 100),
      femalePercent: round2((female[i] / total) * 100),
    };
  });
}

function loadCachedData(): Record<CountryCode, CountryData> | null {
  try {
    const raw = localStorage.getItem(IDB_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: Record<CountryCode, CountryData> };
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > IDB_CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function storeCachedData(data: Record<CountryCode, CountryData>) {
  try {
    localStorage.setItem(IDB_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore
  }
}

async function fetchIdbCountry(code: CountryCode): Promise<CountryData> {
  const yearCandidates = [2024, 2023, 2022, 2021, 2020, 2019];
  const getFields = [
    "NAME",
    "YR",
    "POP",
    "TFR",
    ...AGE_BANDS.flatMap((b) => [`MPOP${b}`, `FPOP${b}`]),
  ].join(",");

  for (const year of yearCandidates) {
    const url = `${IDB_BASE}?get=${encodeURIComponent(getFields)}&time=${year}&for=${encodeURIComponent(
      "genc standard countries and areas"
    )}:${code}`;

    const res = await fetch(url);
    if (!res.ok) continue;
    const payload = (await res.json()) as string[][];
    if (!payload || payload.length < 2) continue;

    const headers = payload[0];
    const row = payload[1];
    const getValue = (key: string) => row[headers.indexOf(key)] ?? "";

    const population = Number(getValue("POP")) || DEFAULT_DATA.population;
    const tfr = Number(getValue("TFR")) || DEFAULT_DATA.tfr;

    const male = AGE_BANDS.map((b) => Number(getValue(`MPOP${b}`)) || 0);
    const female = AGE_BANDS.map((b) => Number(getValue(`FPOP${b}`)) || 0);

    const ageGroups = buildAgeGroupsFromCounts(male, female);

    return {
      country: code,
      population: population,
      tfr: round2(tfr),
      ageGroups,
      years: {
        population: Number(getValue("YR")) || year,
        tfr: Number(getValue("YR")) || year,
        age: Number(getValue("YR")) || year,
      },
    };
  }

  return { country: code, ...DEFAULT_DATA };
}

export async function getCountryData(code: CountryCode): Promise<CountryData> {
  const cached = loadCachedData();
  if (cached?.[code]) return cached[code];

  const data = await fetchIdbCountry(code);
  const nextCache = { ...(cached ?? {}), [code]: data };
  storeCachedData(nextCache);
  return data;
}

export function getDefaultCountryData(code: CountryCode): CountryData {
  return { country: code, ...DEFAULT_DATA };
}
