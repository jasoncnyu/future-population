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
import { useRef } from "react";

interface SimulatorChartProps {
  data: YearData[];
  fertilityChanges: FertilityChangeEvent[];
  locale: Locale;
  selectedYear?: number | null;
  onSelectYear?: (year: number) => void;
}

export default function SimulatorChart({
  data,
  fertilityChanges,
  locale,
  selectedYear,
  onSelectYear,
}: SimulatorChartProps) {
  const rangeRef = useRef<{ min: number; max: number; sign: number } | null>(null);
  const tfrRangeRef = useRef<number | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {t(locale, "chart.populationTrend")}
        </h3>
        <div className="h-[350px]">
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
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                dot={false}
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
