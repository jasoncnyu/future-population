import { type AgeGroupGender } from "@/components/PopulationPyramid";

export interface FertilityChangeEvent {
  id: string;
  year: number;
  tfr: number;
}

export interface SimulationParams {
  initialPopulation: number;
  initialTfr: number;
  startYear: number;
  endYear: number;
  deathRate: number;
  fertilityChanges: FertilityChangeEvent[];
  ageGroups: AgeGroupGender[];
}

export interface YearData {
  year: number;
  population: number;
  tfr: number;
  births: number;
  deaths: number;
  growthRate: number;
}

// Fertile women ratio: percentage of women ages 10-49 within total population.
function calculateFertileWomenRatio(ageGroups: AgeGroupGender[]): number {
  const fertileGroups = ageGroups.filter((g) => g.minAge >= 10 && g.maxAge <= 49);
  // femalePercent represents share within female population. Assume females are ~50% of total.
  const fertilePercentage = fertileGroups.reduce((sum, g) => sum + g.femalePercent, 0);
  return (fertilePercentage / 100) * 0.5;
}

export function simulatePopulation(params: SimulationParams): YearData[] {
  const {
    initialPopulation,
    initialTfr,
    startYear,
    endYear,
    deathRate,
    fertilityChanges,
    ageGroups,
  } = params;

  const sortedChanges = [...fertilityChanges].sort((a, b) => a.year - b.year);
  const fertileWomenRatio = calculateFertileWomenRatio(ageGroups);

  const results: YearData[] = [];
  let population = initialPopulation;
  let currentTfr = initialTfr;

  for (let year = startYear; year <= endYear; year++) {
    const change = sortedChanges.find((c) => c.year === year);
    if (change) {
      currentTfr = change.tfr;
    }

    const births = Math.round(population * fertileWomenRatio * (currentTfr / 30));
    const deaths = Math.round(population * deathRate);
    const prevPopulation = population;

    population = Math.max(0, population + births - deaths);

    const growthRate =
      prevPopulation > 0 ? ((population - prevPopulation) / prevPopulation) * 100 : 0;

    results.push({ year, population, tfr: currentTfr, births, deaths, growthRate });
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
