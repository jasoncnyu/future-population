import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { YearData } from "@/lib/population-simulator";
import type { FertilityChangeEvent } from "@/lib/population-simulator";
import { formatPopulation } from "@/lib/population-simulator";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useRef, useState } from "react";

interface SimulatorChartProps {
  data: YearData[];
  fertilityChanges: FertilityChangeEvent[];
  locale: Locale;
  selectedYear?: number | null;
  onSelectYear?: (year: number) => void;
  onUpdateTfrChange?: (year: number, tfr: number) => void;
}

export default function SimulatorChart({
  data,
  fertilityChanges,
  locale,
  selectedYear,
  onSelectYear,
  onUpdateTfrChange,
}: SimulatorChartProps) {
  const rangeRef = useRef<{ min: number; max: number; sign: number } | null>(null);
  const tfrRangeRef = useRef<number | null>(null);
  const tfrChartRef = useRef<HTMLDivElement>(null);
  const [draggingYear, setDraggingYear] = useState<number | null>(null);
  const [hoveringTfrPoint, setHoveringTfrPoint] = useState(false);

  if (data.length === 0) return null;

  const maxPop = Math.max(...data.map((d) => d.population));
  const minPop = Math.min(...data.map((d) => d.population));
  const popPadding = (maxPop - minPop) * 0.1 || maxPop * 0.1;
  const trendSign = Math.sign(data[data.length - 1].population - data[0].population);

  if (!rangeRef.current || rangeRef.current.sign !== trendSign) {
    rangeRef.current = {
      min: Math.max(0, minPop - popPadding),
      max: maxPop + popPadding,
      sign: trendSign,
    };
  } else {
    const nextMin = Math.max(0, minPop - popPadding);
    const nextMax = maxPop + popPadding;
    if (nextMin < rangeRef.current.min) rangeRef.current.min = nextMin;
    if (nextMax > rangeRef.current.max) rangeRef.current.max = nextMax;
  }

  const yDomain: [number, number] = [
    rangeRef.current.min,
    rangeRef.current.max,
  ];

  const tfrMax = Math.max(...data.map((d) => d.tfr));
  if (!tfrRangeRef.current) {
    tfrRangeRef.current = Math.max(2.5, tfrMax + 0.2);
  } else if (tfrMax > tfrRangeRef.current) {
    tfrRangeRef.current = tfrMax + 0.2;
  }

  const roundTfr = (value: number) => Math.round(value * 100) / 100;

  const getTfrFromClientY = (clientY: number) => {
    const rect = tfrChartRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const paddingTop = 5;
    const paddingBottom = 5;
    const y = Math.max(paddingTop, Math.min(rect.height - paddingBottom, clientY - rect.top));
    const plotHeight = Math.max(1, rect.height - paddingTop - paddingBottom);
    const ratio = 1 - (y - paddingTop) / plotHeight;
    const max = tfrRangeRef.current ?? 3;
    return roundTfr(Math.max(0, Math.min(max, ratio * max)));
  };

  const handleTfrMouseDown = (state: { activeLabel?: number | string; activePayload?: unknown[] }) => {
    if (!state?.activeLabel) return;
    const year = typeof state.activeLabel === "number" ? state.activeLabel : Number(state.activeLabel);
    if (Number.isNaN(year)) return;
    setDraggingYear(year);
    const payload = (state.activePayload?.[0] as { payload?: { tfr?: number } } | undefined)?.payload;
    if (typeof payload?.tfr === "number") {
      onUpdateTfrChange?.(year, roundTfr(payload.tfr));
    }
  };

  const handleTfrMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingYear == null) return;
    const tfr = getTfrFromClientY(e.clientY);
    if (tfr == null) return;
    onUpdateTfrChange?.(draggingYear, tfr);
  };

  const handleTfrMouseUp = () => {
    if (draggingYear != null) setDraggingYear(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {t(locale, "chart.populationTrend")}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{t(locale, "chart.populationHint")}</p>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              onClick={(state) => {
                const label = state?.activeLabel;
                const year = typeof label === "number" ? label : Number(label);
                if (!Number.isNaN(year)) {
                  onSelectYear?.(year);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis
                tickFormatter={(v) => formatPopulation(v, locale)}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                domain={yDomain}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${formatPopulation(value, locale)} ${t(locale, "chart.populationUnit")}`,
                  t(locale, "chart.population"),
                ]}
                labelFormatter={(label) => t(locale, "summary.inYear", { year: label })}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Legend />
              {fertilityChanges.map((event) => (
                <ReferenceLine
                  key={event.id}
                  x={event.year}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  label={{
                    value: `TFR→${event.tfr}`,
                    position: "top",
                    fontSize: 11,
                    fill: "hsl(var(--destructive))",
                  }}
                />
              ))}
              {typeof selectedYear === "number" && (
                <ReferenceLine
                  x={selectedYear}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="2 2"
                />
              )}
              <Line
                type="monotone"
                dataKey="population"
                name={t(locale, "chart.population")}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t(locale, "chart.tfrTrend")}</h3>
        <div
          ref={tfrChartRef}
          className={`h-[220px] select-none ${
            draggingYear != null || hoveringTfrPoint
              ? "cursor-ns-resize [&_.recharts-surface]:cursor-ns-resize [&_.recharts-layer]:cursor-ns-resize [&_.recharts-curve]:cursor-ns-resize [&_.recharts-dot]:cursor-ns-resize"
              : "cursor-default"
          }`}
          onMouseMove={handleTfrMouseMove}
          onMouseUp={handleTfrMouseUp}
          onMouseLeave={handleTfrMouseUp}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              onMouseDown={handleTfrMouseDown}
              onMouseMove={(state) => {
                const payload = (state?.activePayload?.[0] as { payload?: { tfr?: number } } | undefined)?.payload;
                setHoveringTfrPoint(typeof payload?.tfr === "number");
              }}
              onMouseLeave={() => setHoveringTfrPoint(false)}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                domain={[0, tfrRangeRef.current ?? "auto"]}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), t(locale, "chart.tfr")]}
                labelFormatter={(label) => t(locale, "summary.inYear", { year: label })}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Line
                type="stepAfter"
                dataKey="tfr"
                name={t(locale, "chart.tfr")}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={(props) => (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={2}
                    fill="hsl(var(--destructive))"
                    stroke="none"
                    style={{ cursor: "ns-resize" }}
                  />
                )}
              />
              <ReferenceLine
                y={2.1}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 3"
                label={{
                  value: t(locale, "chart.replacementFertility"),
                  position: "right",
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
