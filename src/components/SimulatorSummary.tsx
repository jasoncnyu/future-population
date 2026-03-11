import { Card, CardContent } from "@/components/ui/card";
import type { YearData } from "@/lib/population-simulator";
import { formatPopulation } from "@/lib/population-simulator";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface SimulatorSummaryProps {
  data: YearData[];
  initialPopulation: number;
  locale: Locale;
}

export default function SimulatorSummary({ data, initialPopulation, locale }: SimulatorSummaryProps) {
  if (data.length === 0) return null;

  const finalPop = data[data.length - 1].population;
  const maxEntry = data.reduce((a, b) => (a.population > b.population ? a : b));
  const minEntry = data.reduce((a, b) => (a.population < b.population ? a : b));
  const totalChange = ((finalPop - initialPopulation) / initialPopulation) * 100;
  const isDecline = totalChange < 0;

  const stats = [
    {
      label: t(locale, "summary.finalPopulation"),
      value: formatPopulation(finalPop, locale),
      sub: t(locale, "summary.inYear", { year: data[data.length - 1].year }),
      icon: Users,
    },
    {
      label: t(locale, "summary.totalChange"),
      value: `${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(1)}%`,
      sub: isDecline ? t(locale, "summary.populationDecrease") : t(locale, "summary.populationIncrease"),
      icon: isDecline ? TrendingDown : TrendingUp,
      highlight: true,
    },
    {
      label: t(locale, "summary.maxPopulation"),
      value: formatPopulation(maxEntry.population, locale),
      sub: t(locale, "summary.inYear", { year: maxEntry.year }),
      icon: TrendingUp,
    },
    {
      label: t(locale, "summary.minPopulation"),
      value: formatPopulation(minEntry.population, locale),
      sub: t(locale, "summary.inYear", { year: minEntry.year }),
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className={`text-xl font-bold ${stat.highlight && isDecline ? "text-destructive" : ""}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
