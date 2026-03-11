import { useEffect, useMemo, useState } from "react";
import SimulatorSettings from "@/components/SimulatorSettings";
import SimulatorChart from "@/components/SimulatorChart";
import SimulatorSummary from "@/components/SimulatorSummary";
import { simulatePopulation, type FertilityChangeEvent } from "@/lib/population-simulator";
import { DEFAULT_AGE_GROUPS, type AgeGroupGender } from "@/components/PopulationPyramid";
import { useLocale } from "@/lib/locale-context";
import { localeLabel, t, type Locale } from "@/lib/i18n";
import { OECD_COUNTRIES, getCountryName, type CountryCode } from "@/lib/countries";
import { detectLocaleAndCountry, storeCountry } from "@/lib/geo";
import { getCountryData, getDefaultCountryData } from "@/lib/country-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const { locale, setLocale } = useLocale();
  const [dataCountry, setDataCountry] = useState<CountryCode>(() => {
    const { country } = detectLocaleAndCountry();
    return country;
  });
  const [dataYear, setDataYear] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [initialPopulation, setInitialPopulation] = useState(50_000_000);
  const [initialTfr, setInitialTfr] = useState(1.7);
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2124);
  const [deathRate, setDeathRate] = useState(0.008);
  const [fertilityChanges, setFertilityChanges] = useState<FertilityChangeEvent[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupGender[]>(DEFAULT_AGE_GROUPS);

  useEffect(() => {
    const fallback = getDefaultCountryData(dataCountry);
    setInitialPopulation(fallback.population);
    setInitialTfr(fallback.tfr);
    setAgeGroups(fallback.ageGroups);
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingData(true);
    getCountryData(dataCountry)
      .then((data) => {
        if (!active) return;
        setInitialPopulation(data.population);
        setInitialTfr(data.tfr);
        setFertilityChanges([]);
        setAgeGroups(data.ageGroups);
        setDataYear(data.years.population ?? data.years.tfr ?? data.years.age ?? null);
        storeCountry(dataCountry);
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });
    return () => {
      active = false;
    };
  }, [dataCountry]);

  const data = useMemo(
    () =>
      simulatePopulation({
        initialPopulation,
        initialTfr,
        startYear,
        endYear,
        deathRate,
        fertilityChanges,
        ageGroups,
      }),
    [initialPopulation, initialTfr, startYear, endYear, deathRate, fertilityChanges, ageGroups]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t(locale, "app.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t(locale, "app.subtitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(locale, "header.source")}
              {dataYear ? ` · ${t(locale, "header.dataYear", { year: dataYear })}` : ""}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[180px]">
              <Label className="text-xs">{t(locale, "header.language")}</Label>
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OECD_COUNTRIES.flatMap((c) => c.locales)
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {localeLabel(loc as any)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[220px]">
              <Label className="text-xs">{t(locale, "header.dataPreset")}</Label>
              <Select value={dataCountry} onValueChange={(v) => setDataCountry(v as CountryCode)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OECD_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {getCountryName(locale, c.code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingData && (
                <p className="text-[11px] text-muted-foreground mt-1">{t(locale, "misc.loading")}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 space-y-6">
        <SimulatorSummary data={data} initialPopulation={initialPopulation} locale={locale} />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <SimulatorSettings
            initialPopulation={initialPopulation}
            setInitialPopulation={setInitialPopulation}
            initialTfr={initialTfr}
            setInitialTfr={setInitialTfr}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            deathRate={deathRate}
            setDeathRate={setDeathRate}
            fertilityChanges={fertilityChanges}
            setFertilityChanges={setFertilityChanges}
            ageGroups={ageGroups}
            setAgeGroups={setAgeGroups}
            locale={locale}
          />

          <SimulatorChart data={data} fertilityChanges={fertilityChanges} locale={locale} />
        </div>
      </main>
    </div>
  );
};

export default Index;
