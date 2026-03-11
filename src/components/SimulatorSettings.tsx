import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import type { FertilityChangeEvent } from "@/lib/population-simulator";
import PopulationPyramid, { type AgeGroupGender } from "./PopulationPyramid";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface SimulatorSettingsProps {
  initialPopulation: number;
  setInitialPopulation: (v: number) => void;
  initialTfr: number;
  setInitialTfr: (v: number) => void;
  startYear: number;
  setStartYear: (v: number) => void;
  endYear: number;
  setEndYear: (v: number) => void;
  deathRate: number;
  setDeathRate: (v: number) => void;
  fertilityChanges: FertilityChangeEvent[];
  setFertilityChanges: (v: FertilityChangeEvent[]) => void;
  ageGroups: AgeGroupGender[];
  setAgeGroups: (v: AgeGroupGender[]) => void;
  locale: Locale;
}

export default function SimulatorSettings({
  initialPopulation,
  setInitialPopulation,
  initialTfr,
  setInitialTfr,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  deathRate,
  setDeathRate,
  fertilityChanges,
  setFertilityChanges,
  ageGroups,
  setAgeGroups,
  locale,
}: SimulatorSettingsProps) {
  const addEvent = () => {
    const newYear =
      fertilityChanges.length > 0
        ? Math.min(fertilityChanges[fertilityChanges.length - 1].year + 10, endYear)
        : startYear + 10;
    setFertilityChanges([
      ...fertilityChanges,
      { id: crypto.randomUUID(), year: newYear, tfr: initialTfr },
    ]);
  };

  const removeEvent = (id: string) => {
    setFertilityChanges(fertilityChanges.filter((e) => e.id !== id));
  };

  const updateEvent = (id: string, field: "year" | "tfr", value: number) => {
    setFertilityChanges(
      fertilityChanges.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t(locale, "settings.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t(locale, "settings.initialPopulation")}</Label>
            <Input
              type="number"
              value={initialPopulation}
              onChange={(e) => setInitialPopulation(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t(locale, "settings.initialTfr")}: {initialTfr.toFixed(2)}
            </Label>
            <Slider value={[initialTfr]} onValueChange={([v]) => setInitialTfr(v)} min={0} max={6} step={0.01} />
          </div>

          <div className="space-y-2">
            <Label>
              {t(locale, "settings.deathRate")}: {(deathRate * 100).toFixed(1)}%
            </Label>
            <Slider
              value={[deathRate]}
              onValueChange={([v]) => setDeathRate(v)}
              min={0}
              max={0.05}
              step={0.001}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t(locale, "settings.startYear")}</Label>
              <Input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{t(locale, "settings.endYear")}</Label>
              <Input type="number" value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t(locale, "settings.fertilityScenario")}</CardTitle>
            <Button size="sm" variant="outline" onClick={addEvent}>
              <Plus className="h-4 w-4 mr-1" />
              {t(locale, "settings.addChange")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {fertilityChanges.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">{t(locale, "settings.noChanges")}</p>
          )}
          {fertilityChanges.map((event) => (
            <div
              key={event.id}
              className="flex items-end gap-2 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex-1 space-y-1">
                <Label className="text-xs">{t(locale, "settings.changeYear")}</Label>
                <Input
                  type="number"
                  value={event.year}
                  onChange={(e) => updateEvent(event.id, "year", Number(e.target.value))}
                  min={startYear}
                  max={endYear}
                  className="h-8"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">{t(locale, "settings.changeTfr")}</Label>
                <Input
                  type="number"
                  value={event.tfr}
                  onChange={(e) => updateEvent(event.id, "tfr", Number(e.target.value))}
                  min={0}
                  max={6}
                  step={0.01}
                  className="h-8"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeEvent(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <PopulationPyramid ageGroups={ageGroups} setAgeGroups={setAgeGroups} locale={locale} />
    </div>
  );
}
