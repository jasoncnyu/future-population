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
  readOnly?: boolean;
  title?: string;
  compact?: boolean;
}

export const DEFAULT_AGE_GROUPS: AgeGroupGender[] = [
  { label: "0-4", minAge: 0, maxAge: 4, malePercent: 2.38, femalePercent: 2.38 },
  { label: "5-9", minAge: 5, maxAge: 9, malePercent: 2.38, femalePercent: 2.38 },
  { label: "10-14", minAge: 10, maxAge: 14, malePercent: 2.38, femalePercent: 2.38 },
  { label: "15-19", minAge: 15, maxAge: 19, malePercent: 2.38, femalePercent: 2.38 },
  { label: "20-24", minAge: 20, maxAge: 24, malePercent: 2.38, femalePercent: 2.38 },
  { label: "25-29", minAge: 25, maxAge: 29, malePercent: 2.38, femalePercent: 2.38 },
  { label: "30-34", minAge: 30, maxAge: 34, malePercent: 2.38, femalePercent: 2.38 },
  { label: "35-39", minAge: 35, maxAge: 39, malePercent: 2.38, femalePercent: 2.38 },
  { label: "40-44", minAge: 40, maxAge: 44, malePercent: 2.38, femalePercent: 2.38 },
  { label: "45-49", minAge: 45, maxAge: 49, malePercent: 2.38, femalePercent: 2.38 },
  { label: "50-54", minAge: 50, maxAge: 54, malePercent: 2.38, femalePercent: 2.38 },
  { label: "55-59", minAge: 55, maxAge: 59, malePercent: 2.38, femalePercent: 2.38 },
  { label: "60-64", minAge: 60, maxAge: 64, malePercent: 2.38, femalePercent: 2.38 },
  { label: "65-69", minAge: 65, maxAge: 69, malePercent: 2.38, femalePercent: 2.38 },
  { label: "70-74", minAge: 70, maxAge: 74, malePercent: 2.38, femalePercent: 2.38 },
  { label: "75-79", minAge: 75, maxAge: 79, malePercent: 2.38, femalePercent: 2.38 },
  { label: "80-84", minAge: 80, maxAge: 84, malePercent: 2.38, femalePercent: 2.38 },
  { label: "85-89", minAge: 85, maxAge: 89, malePercent: 2.38, femalePercent: 2.38 },
  { label: "90-94", minAge: 90, maxAge: 94, malePercent: 2.38, femalePercent: 2.38 },
  { label: "95-99", minAge: 95, maxAge: 99, malePercent: 2.38, femalePercent: 2.38 },
  { label: "100+", minAge: 100, maxAge: 100, malePercent: 2.38, femalePercent: 2.38 },
];

export default function PopulationPyramid({
  ageGroups,
  setAgeGroups,
  locale,
  readOnly,
  title,
  compact,
}: PopulationPyramidProps) {
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
  const totalPercent = r2(maleTotal + femaleTotal);

  const normalizeDraft = (groups: AgeGroupGender[]) => {
    const values = groups.flatMap((g) => [g.malePercent, g.femalePercent]).map((v) => Math.max(0, v));
    const sum = values.reduce((s, v) => s + v, 0);
    if (sum <= 0) {
      const reset = groups.map((g, i) => ({
        ...g,
        malePercent: i === 0 ? 50 : 0,
        femalePercent: i === 0 ? 50 : 0,
      }));
      return reset;
    }

    const scale = 100 / sum;
    const scaled = groups.map((g) => ({
      ...g,
      malePercent: r2(Math.max(0, g.malePercent * scale)),
      femalePercent: r2(Math.max(0, g.femalePercent * scale)),
    }));

    const roundedSum = r2(
      scaled.reduce((s, g) => s + g.malePercent + g.femalePercent, 0)
    );
    let residual = r2(100 - roundedSum);
    if (Math.abs(residual) < 0.01) return scaled;

    const candidates = scaled
      .map((g, i) => ({
        i,
        total: g.malePercent + g.femalePercent,
      }))
      .sort((a, b) => b.total - a.total);

    for (const c of candidates) {
      if (Math.abs(residual) < 0.01) break;
      const target = scaled[c.i];
      const add = residual >= 0 ? residual : Math.max(residual, -target.malePercent - target.femalePercent);
      if (add === 0) continue;
      const half = r2(add / 2);
      const newMale = r2(Math.max(0, target.malePercent + half));
      const newFemale = r2(Math.max(0, target.femalePercent + (add - half)));
      residual = r2(residual - (newMale + newFemale - target.malePercent - target.femalePercent));
      scaled[c.i] = { ...target, malePercent: newMale, femalePercent: newFemale };
    }

    return scaled;
  };

  const redistributeValues = useCallback(
    (index: number, side: "male" | "female", newValue: number) => {
      const field = side === "male" ? "malePercent" : "femalePercent";
      const clampedValue = r2(Math.max(0.01, Math.min(60, newValue)));

      const oldValue = draft[index][field];
      const total = draft.reduce((sum, g) => sum + g.malePercent + g.femalePercent, 0);
      const otherTotal = total - oldValue;
      if (otherTotal <= 0) return;

      const remaining = 100 - clampedValue;
      const scale = remaining / otherTotal;

      const scaledDraft = draft.map((group, i) => {
        if (i === index) {
          return { ...group, [field]: clampedValue };
        }
        return {
          ...group,
          malePercent: r2(group.malePercent * scale),
          femalePercent: r2(group.femalePercent * scale),
        };
      });

      const normalizedDraft = normalizeDraft(scaledDraft);

      setDraft(normalizedDraft);
      setError(null);
    },
    [draft]
  );

  const dragRef = useRef<{
    index: number;
    side: "male" | "female";
    startX: number;
    startValue: number;
  } | null>(null);

  const handleMouseDown = (index: number, side: "male" | "female") => {
    if (readOnly) return;
    setDragging({ index, side });
    const field = side === "male" ? "malePercent" : "femalePercent";
    dragRef.current = {
      index,
      side,
      startX: 0,
      startValue: draft[index][field],
    };
    if (containerRef.current) {
      const barContainer = containerRef.current.querySelector(
        `[data-bar="${index}-${side}"]`
      ) as HTMLElement;
      if (barContainer) {
        const rect = barContainer.getBoundingClientRect();
        dragRef.current.startX = side === "male" ? rect.right : rect.left;
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly || !dragging || !containerRef.current) return;

      const barContainer = containerRef.current.querySelector(
        `[data-bar="${dragging.index}-${dragging.side}"]`
      ) as HTMLElement;
      if (!barContainer) return;

      const drag = dragRef.current;
      if (!drag || drag.index !== dragging.index || drag.side !== dragging.side) return;

      const deltaX = dragging.side === "male" ? drag.startX - e.clientX : e.clientX - drag.startX;
      const nextValue = drag.startValue + deltaX * 0.01;

      redistributeValues(dragging.index, dragging.side, nextValue);
    },
    [dragging, redistributeValues, readOnly]
  );

  const handleMouseUp = () => {
    setDragging(null);
    dragRef.current = null;
  };

  const handleInputChange = (index: number, field: "malePercent" | "femalePercent", value: number) => {
    if (readOnly) return;
    redistributeValues(index, field === "malePercent" ? "male" : "female", value);
  };

  const handleApply = () => {
    const total = draft.reduce((s, g) => s + g.malePercent + g.femalePercent, 0);
    const roundedTotal = r2(total);
    if (Math.abs(roundedTotal - 100) > 0.1) {
      setError(`${t(locale, "pyramid.maleTotal")}+${t(locale, "pyramid.femaleTotal")} ${roundedTotal}%`);
      return;
    }
    setError(null);
    if (readOnly) return;
    setAgeGroups(draft);
  };

  const maxPercent = Math.max(
    5,
    ...draft.flatMap((g) => [g.malePercent, g.femalePercent])
  );

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
  const isCompact = Boolean(compact);
  const rowHeightClass = isCompact ? "h-7" : "h-8";
  const rowGapClass = isCompact ? "gap-0.5" : "gap-1";
  const inputClass = isCompact ? "h-5 text-[10px]" : "h-6 text-[11px]";
  const headerPaddingClass = isCompact ? "pb-2" : "pb-3";
  const stackGapClass = isCompact ? "space-y-2" : "space-y-3";
  const rowStackGapClass = isCompact ? "space-y-0.5" : "space-y-1";

  return (
    <Card>
      <CardHeader className={headerPaddingClass}>
        <CardTitle className="text-lg">{title ?? t(locale, "pyramid.title")}</CardTitle>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-sky-500 font-medium">
            {t(locale, "pyramid.male")} ({maleTotal}%)
          </span>
          <span className="text-rose-500 font-medium">
            {t(locale, "pyramid.female")} ({femaleTotal}%)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {readOnly ? `Total ${totalPercent}%` : `${t(locale, "pyramid.instructions")} · Total ${totalPercent}%`}
        </p>
      </CardHeader>
      <CardContent className={stackGapClass}>
        <div
          ref={containerRef}
          className={`${rowStackGapClass} select-none`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {draft
            .map((group, index) => ({ group, index }))
            .reverse()
            .map(({ group, index }) => (
            <div key={`${group.label}-${index}`} className={`flex items-center ${rowGapClass} ${rowHeightClass}`}>
              <Input
                type="number"
                value={group.malePercent}
                onChange={(e) => handleInputChange(index, "malePercent", Number(e.target.value))}
                className={`w-14 ${inputClass} text-center p-0.5`}
                min={0}
                max={100}
                step={0.01}
                disabled={readOnly}
              />

              <div className="flex-1 flex justify-end" data-bar={`${index}-male`}>
                <div
                  className={`h-6 rounded-l ${barColors[index % barColors.length].male} ${readOnly ? "cursor-default" : "cursor-ew-resize"} transition-[width] duration-75 hover:opacity-80`}
                  style={{ width: `${(group.malePercent / maxPercent) * 100}%` }}
                  onMouseDown={() => handleMouseDown(index, "male")}
                />
              </div>

              <div className="w-14 text-center text-[10px] font-medium shrink-0 text-muted-foreground">
                {group.label}
              </div>

              <div className="flex-1 flex justify-start" data-bar={`${index}-female`}>
                <div
                  className={`h-6 rounded-r ${barColors[index % barColors.length].female} ${readOnly ? "cursor-default" : "cursor-ew-resize"} transition-[width] duration-75 hover:opacity-80`}
                  style={{ width: `${(group.femalePercent / maxPercent) * 100}%` }}
                  onMouseDown={() => handleMouseDown(index, "female")}
                />
              </div>

              <Input
                type="number"
                value={group.femalePercent}
                onChange={(e) => handleInputChange(index, "femalePercent", Number(e.target.value))}
                className={`w-14 ${inputClass} text-center p-0.5`}
                min={0}
                max={100}
                step={0.01}
                disabled={readOnly}
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

        {!readOnly && error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {!readOnly && (
          <Button onClick={handleApply} className="w-full" size="sm" disabled={!isDirty && !error}>
            <Check className="h-4 w-4 mr-1" />
            {t(locale, "pyramid.apply")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
