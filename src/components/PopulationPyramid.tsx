import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export interface AgeGroupGender {
  label: string;
  minAge: number;
  maxAge: number;
  malePercent: number;
  femalePercent: number;
}

interface PopulationPyramidProps {
  ageGroups: AgeGroupGender[];
  setAgeGroups: (groups: AgeGroupGender[]) => void;
  locale: Locale;
}

export const DEFAULT_AGE_GROUPS: AgeGroupGender[] = [
  { label: "0-9", minAge: 0, maxAge: 9, malePercent: 8, femalePercent: 6 },
  { label: "10-19", minAge: 10, maxAge: 19, malePercent: 9, femalePercent: 8 },
  { label: "20-29", minAge: 20, maxAge: 29, malePercent: 13, femalePercent: 11 },
  { label: "30-39", minAge: 30, maxAge: 39, malePercent: 13, femalePercent: 11 },
  { label: "40-49", minAge: 40, maxAge: 49, malePercent: 16, femalePercent: 16 },
  { label: "50-59", minAge: 50, maxAge: 59, malePercent: 17, femalePercent: 17 },
  { label: "60-69", minAge: 60, maxAge: 69, malePercent: 13, femalePercent: 15 },
  { label: "70-79", minAge: 70, maxAge: 79, malePercent: 8, femalePercent: 10 },
  { label: "80+", minAge: 80, maxAge: 100, malePercent: 3, femalePercent: 6 },
];

export default function PopulationPyramid({ ageGroups, setAgeGroups, locale }: PopulationPyramidProps) {
  const [draft, setDraft] = useState<AgeGroupGender[]>(ageGroups);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ index: number; side: "male" | "female" } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(ageGroups);
  }, [ageGroups]);

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const maleTotal = r2(draft.reduce((s, g) => s + g.malePercent, 0));
  const femaleTotal = r2(draft.reduce((s, g) => s + g.femalePercent, 0));

  const redistributeValues = useCallback(
    (index: number, side: "male" | "female", newValue: number) => {
      const field = side === "male" ? "malePercent" : "femalePercent";
      const clampedValue = r2(Math.max(0.01, Math.min(40, newValue)));

      const oldValue = draft[index][field];
      const diff = r2(clampedValue - oldValue);
      if (diff === 0) return;

      const otherCount = draft.length - 1;
      const perItem = r2(diff / otherCount);

      const newDraft = draft.map((group, i) => {
        if (i === index) {
          return { ...group, [field]: clampedValue };
        }
        const adjusted = r2(Math.max(0.01, group[field] - perItem));
        return { ...group, [field]: adjusted };
      });

      const total = r2(newDraft.reduce((sum, g) => sum + g[field], 0));
      if (total !== 100) {
        const residual = r2(100 - total);
        const lastOther = index === newDraft.length - 1 ? newDraft.length - 2 : newDraft.length - 1;
        newDraft[lastOther] = {
          ...newDraft[lastOther],
          [field]: r2(newDraft[lastOther][field] + residual),
        };
      }

      setDraft(newDraft);
      setError(null);
    },
    [draft]
  );

  const handleMouseDown = (index: number, side: "male" | "female") => {
    setDragging({ index, side });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !containerRef.current) return;

      const barContainer = containerRef.current.querySelector(
        `[data-bar="${dragging.index}-${dragging.side}"]`
      ) as HTMLElement;
      if (!barContainer) return;

      const rect = barContainer.getBoundingClientRect();
      const maxWidth = rect.width;

      let distance: number;
      if (dragging.side === "male") {
        distance = rect.right - e.clientX;
      } else {
        distance = e.clientX - rect.left;
      }

      const percentage = Math.round(((distance / maxWidth) * 40) * 100) / 100;
      redistributeValues(dragging.index, dragging.side, percentage);
    },
    [dragging, redistributeValues]
  );

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleInputChange = (index: number, field: "malePercent" | "femalePercent", value: number) => {
    setDraft(draft.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
    setError(null);
  };

  const handleApply = () => {
    const mt = draft.reduce((s, g) => s + g.malePercent, 0);
    const ft = draft.reduce((s, g) => s + g.femalePercent, 0);
    if (mt !== 100) {
      setError(`${t(locale, "pyramid.maleTotal")} ${mt}%`);
      return;
    }
    if (ft !== 100) {
      setError(`${t(locale, "pyramid.femaleTotal")} ${ft}%`);
      return;
    }
    setError(null);
    setAgeGroups(draft);
  };

  const maxPercent = 40;

  const barColors = [
    { male: "bg-sky-400", female: "bg-rose-400" },
    { male: "bg-sky-500", female: "bg-rose-400" },
    { male: "bg-sky-500", female: "bg-rose-500" },
    { male: "bg-blue-500", female: "bg-rose-500" },
    { male: "bg-blue-500", female: "bg-pink-500" },
    { male: "bg-blue-600", female: "bg-pink-500" },
    { male: "bg-indigo-500", female: "bg-pink-600" },
    { male: "bg-indigo-600", female: "bg-fuchsia-500" },
    { male: "bg-violet-600", female: "bg-fuchsia-600" },
  ];

  const isDirty = JSON.stringify(draft) !== JSON.stringify(ageGroups);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t(locale, "pyramid.title")}</CardTitle>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-sky-500 font-medium">
            {t(locale, "pyramid.male")} ({maleTotal}%)
          </span>
          <span className="text-rose-500 font-medium">
            {t(locale, "pyramid.female")} ({femaleTotal}%)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t(locale, "pyramid.instructions")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={containerRef}
          className="space-y-1 select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {draft.map((group, index) => (
            <div key={group.label} className="flex items-center gap-1 h-8">
              <Input
                type="number"
                value={group.malePercent}
                onChange={(e) => handleInputChange(index, "malePercent", Number(e.target.value))}
                className="w-14 h-6 text-[11px] text-center p-0.5"
                min={0}
                max={100}
                step={0.01}
              />

              <div className="flex-1 flex justify-end" data-bar={`${index}-male`}>
                <div
                  className={`h-6 rounded-l ${barColors[index % barColors.length].male} cursor-ew-resize transition-[width] duration-75 hover:opacity-80`}
                  style={{ width: `${(group.malePercent / maxPercent) * 100}%` }}
                  onMouseDown={() => handleMouseDown(index, "male")}
                />
              </div>

              <div className="w-14 text-center text-[10px] font-medium shrink-0 text-muted-foreground">
                {group.label}
              </div>

              <div className="flex-1 flex justify-start" data-bar={`${index}-female`}>
                <div
                  className={`h-6 rounded-r ${barColors[index % barColors.length].female} cursor-ew-resize transition-[width] duration-75 hover:opacity-80`}
                  style={{ width: `${(group.femalePercent / maxPercent) * 100}%` }}
                  onMouseDown={() => handleMouseDown(index, "female")}
                />
              </div>

              <Input
                type="number"
                value={group.femalePercent}
                onChange={(e) => handleInputChange(index, "femalePercent", Number(e.target.value))}
                className="w-14 h-6 text-[11px] text-center p-0.5"
                min={0}
                max={100}
                step={0.01}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs border-t border-border pt-2">
          <span className={maleTotal === 100 ? "text-emerald-500" : "text-destructive font-medium"}>
            {t(locale, "pyramid.maleTotal")}: {maleTotal}%
          </span>
          <span className={femaleTotal === 100 ? "text-emerald-500" : "text-destructive font-medium"}>
            {t(locale, "pyramid.femaleTotal")}: {femaleTotal}%
          </span>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleApply} className="w-full" size="sm" disabled={!isDirty && !error}>
          <Check className="h-4 w-4 mr-1" />
          {t(locale, "pyramid.apply")}
        </Button>
      </CardContent>
    </Card>
  );
}
