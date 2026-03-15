import { type AgeGroupGender } from "@/components/PopulationPyramid";

export interface FertilityChangeEvent {
  id: string;
  year: number;
  tfr: number;
}

export interface MigrationChangeEvent {
  id: string;
  year: number;
  netMigration: number;
}

export interface SimulationParams {
  initialPopulation: number;
  initialTfr: number;
  startYear: number;
  endYear: number;
  deathRate: number;
  fertilityChanges: FertilityChangeEvent[];
  netMigration: number;
  migrationChanges: MigrationChangeEvent[];
  ageGroups: AgeGroupGender[];
}

export interface YearData {
  year: number;
  population: number;
  tfr: number;
  births: number;
  deaths: number;
  growthRate: number;
  ageGroups: AgeGroupGender[];
}

const BASE_DEATH_RATE = 0.008;

export const MORTALITY_AGE_BANDS = [
  { label: "0-4", minAge: 0 },
  { label: "5-9", minAge: 5 },
  { label: "10-14", minAge: 10 },
  { label: "15-19", minAge: 15 },
  { label: "20-24", minAge: 20 },
  { label: "25-29", minAge: 25 },
  { label: "30-34", minAge: 30 },
  { label: "35-39", minAge: 35 },
  { label: "40-44", minAge: 40 },
  { label: "45-49", minAge: 45 },
  { label: "50-54", minAge: 50 },
  { label: "55-59", minAge: 55 },
  { label: "60-64", minAge: 60 },
  { label: "65-69", minAge: 65 },
  { label: "70-74", minAge: 70 },
  { label: "75-79", minAge: 75 },
  { label: "80-84", minAge: 80 },
  { label: "85-89", minAge: 85 },
  { label: "90-94", minAge: 90 },
  { label: "95-99", minAge: 95 },
  { label: "100+", minAge: 100 },
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const MALE_MORTALITY_MULTIPLIER = 1.1;
const FEMALE_MORTALITY_MULTIPLIER = 0.9;

function mortalityRateForAge(minAge: number): number {
  if (minAge < 5) return 0.004;
  if (minAge < 10) return 0.0006;
  if (minAge < 15) return 0.0006;
  if (minAge < 20) return 0.0008;
  if (minAge < 25) return 0.001;
  if (minAge < 30) return 0.0012;
  if (minAge < 35) return 0.0016;
  if (minAge < 40) return 0.0022;
  if (minAge < 45) return 0.0035;
  if (minAge < 50) return 0.005;
  if (minAge < 55) return 0.007;
  if (minAge < 60) return 0.01;
  if (minAge < 65) return 0.015;
  if (minAge < 70) return 0.025;
  if (minAge < 75) return 0.04;
  if (minAge < 80) return 0.06;
  if (minAge < 85) return 0.09;
  if (minAge < 90) return 0.14;
  if (minAge < 95) return 0.2;
  if (minAge < 100) return 0.28;
  return 0.36;
}

export function getScaledMortalityRate(minAge: number, deathRate: number) {
  const scale = clamp(deathRate / BASE_DEATH_RATE, 0.1, 5);
  return clamp(mortalityRateForAge(minAge) * scale, 0, 0.9);
}

export function getScaledSexMortalityRate(minAge: number, deathRate: number, sex: "male" | "female") {
  const base = getScaledMortalityRate(minAge, deathRate);
  const multiplier = sex === "male" ? MALE_MORTALITY_MULTIPLIER : FEMALE_MORTALITY_MULTIPLIER;
  return clamp(base * multiplier, 0, 0.9);
}

function toCounts(ageGroups: AgeGroupGender[], totalPopulation: number) {
  const male: number[] = [];
  const female: number[] = [];
  ageGroups.forEach((g) => {
    male.push((totalPopulation * g.malePercent) / 100);
    female.push((totalPopulation * g.femalePercent) / 100);
  });
  return { male, female };
}

function toPercents(
  ageGroups: AgeGroupGender[],
  male: number[],
  female: number[]
): AgeGroupGender[] {
  const total = male.reduce((s, v) => s + v, 0) + female.reduce((s, v) => s + v, 0);
  if (!total) return ageGroups;
  return ageGroups.map((g, i) => ({
    ...g,
    malePercent: Math.round(((male[i] / total) * 100) * 100) / 100,
    femalePercent: Math.round(((female[i] / total) * 100) * 100) / 100,
  }));
}

function sum(values: number[]) {
  return values.reduce((s, v) => s + v, 0);
}

function getReproductiveFemaleCount(ageGroups: AgeGroupGender[], female: number[]) {
  return ageGroups.reduce((s, g, i) => {
    if (g.minAge >= 15 && g.maxAge <= 49) return s + female[i];
    return s;
  }, 0);
}

export function simulatePopulation(params: SimulationParams): YearData[] {
  const {
    initialPopulation,
    initialTfr,
    startYear,
    endYear,
    deathRate,
    fertilityChanges,
    netMigration,
    migrationChanges,
    ageGroups,
  } = params;

  const sortedChanges = [...fertilityChanges].sort((a, b) => a.year - b.year);
  const sortedMigrationChanges = [...migrationChanges].sort((a, b) => a.year - b.year);
  let currentTfr = initialTfr;
  let currentMigration = netMigration;
  let { male, female } = toCounts(ageGroups, initialPopulation);

  const results: YearData[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const change = sortedChanges.find((c) => c.year === year);
    if (change) currentTfr = change.tfr;
    const migrationChange = sortedMigrationChanges.find((c) => c.year === year);
    if (migrationChange) currentMigration = migrationChange.netMigration;

    const reproductiveWomen = getReproductiveFemaleCount(ageGroups, female);
    const births = Math.round(reproductiveWomen * (currentTfr / 35));
    const maleBirths = Math.round(births * 0.512);
    const femaleBirths = births - maleBirths;

    let deaths = 0;
    const nextMale = new Array(male.length).fill(0);
    const nextFemale = new Array(female.length).fill(0);

    for (let i = 0; i < ageGroups.length; i++) {
      const maleRate = getScaledSexMortalityRate(ageGroups[i].minAge, deathRate, "male");
      const femaleRate = getScaledSexMortalityRate(ageGroups[i].minAge, deathRate, "female");

      const maleSurvivors = male[i] * (1 - maleRate);
      const femaleSurvivors = female[i] * (1 - femaleRate);
      deaths += (male[i] - maleSurvivors) + (female[i] - femaleSurvivors);

      const outflowMale = i === ageGroups.length - 1 ? 0 : maleSurvivors / 5;
      const outflowFemale = i === ageGroups.length - 1 ? 0 : femaleSurvivors / 5;
      const stayMale = maleSurvivors - outflowMale;
      const stayFemale = femaleSurvivors - outflowFemale;

      nextMale[i] += stayMale;
      nextFemale[i] += stayFemale;
      if (i < ageGroups.length - 1) {
        nextMale[i + 1] += outflowMale;
        nextFemale[i + 1] += outflowFemale;
      }
    }

    nextMale[0] += maleBirths;
    nextFemale[0] += femaleBirths;

    const beforeMigrationTotal = sum(nextMale) + sum(nextFemale);
    if (currentMigration !== 0) {
      if (beforeMigrationTotal > 0) {
        for (let i = 0; i < ageGroups.length; i++) {
          const maleShare = nextMale[i] / beforeMigrationTotal;
          const femaleShare = nextFemale[i] / beforeMigrationTotal;
          nextMale[i] = Math.max(0, nextMale[i] + currentMigration * maleShare);
          nextFemale[i] = Math.max(0, nextFemale[i] + currentMigration * femaleShare);
        }
      } else if (currentMigration > 0) {
        const maleAdd = currentMigration * 0.5;
        const femaleAdd = currentMigration - maleAdd;
        nextMale[0] += maleAdd;
        nextFemale[0] += femaleAdd;
      }
    }

    const population = Math.max(0, Math.round(sum(nextMale) + sum(nextFemale)));
    const prevPopulation = Math.max(0, Math.round(sum(male) + sum(female)));
    const growthRate = prevPopulation > 0 ? ((population - prevPopulation) / prevPopulation) * 100 : 0;

    const snapshotGroups = toPercents(ageGroups, nextMale, nextFemale);

    results.push({
      year,
      population,
      tfr: currentTfr,
      births,
      deaths: Math.round(deaths),
      growthRate,
      ageGroups: snapshotGroups,
    });

    male = nextMale;
    female = nextFemale;
  }

  return results;
}

export function formatPopulation(pop: number, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(pop);
}
