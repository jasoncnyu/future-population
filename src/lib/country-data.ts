import type { AgeGroupGender } from "@/components/PopulationPyramid";
import { OECD_COUNTRIES, type CountryCode } from "@/lib/countries";

export interface CountryData {
  country: CountryCode;
  population: number;
  tfr: number;
  ageShares: {
    age0_14: number;
    age15_64: number;
    age65Plus: number;
  };
  years: {
    population: number | null;
    tfr: number | null;
    age: number | null;
  };
}

const WB_BASE = "https://api.worldbank.org/v2";
const WB_CACHE_KEY = "fpp-wb-cache-v1";
const WB_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;

const OECD_CODES = OECD_COUNTRIES.map((c) => c.code).join(";");

const INDICATORS = {
  population: "SP.POP.TOTL",
  tfr: "SP.DYN.TFRT.IN",
  age0_14: "SP.POP.0014.TO.ZS",
  age15_64: "SP.POP.1564.TO.ZS",
  age65Plus: "SP.POP.65UP.TO.ZS",
};

type IndicatorKey = keyof typeof INDICATORS;

interface IndicatorValue {
  value: number | null;
  year: number | null;
}

const DEFAULT_DATA: Omit<CountryData, "country"> = {
  population: 50_000_000,
  tfr: 1.7,
  ageShares: { age0_14: 17, age15_64: 65, age65Plus: 18 },
  years: { population: null, tfr: null, age: null },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeShares(shares: number[]) {
  const total = shares.reduce((sum, s) => sum + s, 0) || 1;
  return shares.map((s) => (s / total) * 100);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function buildAgeGroupsFromShares(
  age0_14: number,
  age15_64: number,
  age65Plus: number
): AgeGroupGender[] {
  const [a0, a15, a65] = normalizeShares([age0_14, age15_64, age65Plus]);

  const share0_9 = (a0 * 10) / 15;
  const share10_19 = (a0 * 5) / 15 + (a15 * 5) / 50;
  const share20_29 = (a15 * 10) / 50;
  const share30_39 = (a15 * 10) / 50;
  const share40_49 = (a15 * 10) / 50;
  const share50_59 = (a15 * 10) / 50;
  const share60_69 = (a15 * 5) / 50 + a65 * 0.3;
  const share70_79 = a65 * 0.35;
  const share80Plus = a65 * 0.35;

  const totalShares = normalizeShares([
    share0_9,
    share10_19,
    share20_29,
    share30_39,
    share40_49,
    share50_59,
    share60_69,
    share70_79,
    share80Plus,
  ]);

  const maleRatios = [0.51, 0.51, 0.505, 0.5, 0.49, 0.48, 0.46, 0.44, 0.4];

  const maleShares = totalShares.map((s, i) => s * maleRatios[i]);
  const femaleShares = totalShares.map((s, i) => s * (1 - maleRatios[i]));

  const normMale = normalizeShares(maleShares);
  const normFemale = normalizeShares(femaleShares);

  const labels = [
    { label: "0-9", min: 0, max: 9 },
    { label: "10-19", min: 10, max: 19 },
    { label: "20-29", min: 20, max: 29 },
    { label: "30-39", min: 30, max: 39 },
    { label: "40-49", min: 40, max: 49 },
    { label: "50-59", min: 50, max: 59 },
    { label: "60-69", min: 60, max: 69 },
    { label: "70-79", min: 70, max: 79 },
    { label: "80+", min: 80, max: 100 },
  ];

  return labels.map((l, i) => ({
    label: l.label,
    minAge: l.min,
    maxAge: l.max,
    malePercent: round2(normMale[i]),
    femalePercent: round2(normFemale[i]),
  }));
}

async function fetchIndicator(indicator: IndicatorKey): Promise<Record<CountryCode, IndicatorValue>> {
  const url = `${WB_BASE}/country/${OECD_CODES}/indicator/${INDICATORS[indicator]}?format=json&per_page=20000&mrv=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
  const payload = (await res.json()) as [unknown, Array<any>];
  const data = payload[1] ?? [];
  const map: Record<CountryCode, IndicatorValue> = {} as Record<CountryCode, IndicatorValue>;
  for (const entry of data) {
    const code = entry?.country?.id as CountryCode | undefined;
    if (!code) continue;
    map[code] = {
      value: entry.value ?? null,
      year: entry.date ? Number(entry.date) : null,
    };
  }
  return map;
}

function loadCachedData(): Record<CountryCode, CountryData> | null {
  try {
    const raw = localStorage.getItem(WB_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: Record<CountryCode, CountryData> };
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > WB_CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function storeCachedData(data: Record<CountryCode, CountryData>) {
  try {
    localStorage.setItem(WB_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore
  }
}

async function fetchAllCountryData(): Promise<Record<CountryCode, CountryData>> {
  const [pop, tfr, a0, a15, a65] = await Promise.all([
    fetchIndicator("population"),
    fetchIndicator("tfr"),
    fetchIndicator("age0_14"),
    fetchIndicator("age15_64"),
    fetchIndicator("age65Plus"),
  ]);

  const dataset: Record<CountryCode, CountryData> = {} as Record<CountryCode, CountryData>;
  for (const { code } of OECD_COUNTRIES) {
    const population = pop[code]?.value ?? DEFAULT_DATA.population;
    const tfrValue = tfr[code]?.value ?? DEFAULT_DATA.tfr;
    const age0 = a0[code]?.value ?? DEFAULT_DATA.ageShares.age0_14;
    const age15 = a15[code]?.value ?? DEFAULT_DATA.ageShares.age15_64;
    const age65 = a65[code]?.value ?? DEFAULT_DATA.ageShares.age65Plus;

    dataset[code] = {
      country: code,
      population: clamp(Math.round(population), 0, 2_000_000_000),
      tfr: round2(clamp(tfrValue, 0.5, 6)),
      ageShares: {
        age0_14: round2(clamp(age0, 5, 40)),
        age15_64: round2(clamp(age15, 50, 75)),
        age65Plus: round2(clamp(age65, 5, 40)),
      },
      years: {
        population: pop[code]?.year ?? null,
        tfr: tfr[code]?.year ?? null,
        age: a0[code]?.year ?? a15[code]?.year ?? a65[code]?.year ?? null,
      },
    };
  }

  storeCachedData(dataset);
  return dataset;
}

export async function getCountryDataset(): Promise<Record<CountryCode, CountryData>> {
  const cached = loadCachedData();
  if (cached) return cached;
  return fetchAllCountryData();
}

export async function getCountryData(code: CountryCode): Promise<CountryData> {
  const dataset = await getCountryDataset();
  return dataset[code] ?? { country: code, ...DEFAULT_DATA };
}

export function getDefaultCountryData(code: CountryCode): CountryData {
  return { country: code, ...DEFAULT_DATA };
}
