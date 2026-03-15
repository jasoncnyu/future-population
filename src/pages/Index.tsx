import { useEffect, useMemo, useState } from "react";
import SimulatorSettings from "@/components/SimulatorSettings";
import SimulatorChart from "@/components/SimulatorChart";
import SimulatorSummary from "@/components/SimulatorSummary";
import { simulatePopulation, type FertilityChangeEvent } from "@/lib/population-simulator";
import PopulationPyramid, { DEFAULT_AGE_GROUPS, type AgeGroupGender } from "@/components/PopulationPyramid";
import AppHeader from "@/components/AppHeader";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { OECD_COUNTRIES, getCountryName, type CountryCode } from "@/lib/countries";
import { detectLocaleAndCountry, storeCountry } from "@/lib/geo";
import { getCountryData, getDefaultCountryData } from "@/lib/country-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const { locale } = useLocale();
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
  }, [dataCountry]);

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

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  useEffect(() => {
    if (data.length === 0) return;
    if (selectedYear == null || !data.find((d) => d.year === selectedYear)) {
      setSelectedYear(data[data.length - 1].year);
    }
  }, [data, selectedYear]);

  const selectedSnapshot =
    data.length === 0 ? null : data.find((d) => d.year === selectedYear) ?? data[data.length - 1];

  const upsertFertilityChange = (year: number, tfr: number) => {
    setFertilityChanges((prev) => {
      const existing = prev.find((event) => event.year === year);
      if (existing) {
        return prev.map((event) => (event.year === year ? { ...event, tfr } : event));
      }
      const next = [...prev, { id: crypto.randomUUID(), year, tfr }];
      return next.sort((a, b) => a.year - b.year);
    });
    setSelectedYear(year);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={t(locale, "app.title")}
        subtitle={t(locale, "app.subtitle")}
        meta={`${t(locale, "header.source")}${dataYear ? ` · ${t(locale, "header.dataYear", { year: dataYear })}` : ""}`}
        right={
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
        }
      />

      <main className="space-y-6 p-4 lg:p-8">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
            <SimulatorChart
              data={data}
              fertilityChanges={fertilityChanges}
              locale={locale}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              onUpdateTfrChange={upsertFertilityChange}
            />
            {selectedSnapshot && (
              <PopulationPyramid
                ageGroups={selectedSnapshot.ageGroups}
                setAgeGroups={() => {}}
                locale={locale}
                readOnly
                compact
                title={`${t(locale, "pyramid.populationPyramid")} · ${selectedSnapshot.year}`}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
