"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  isPercentage: boolean;
  data: Record<string, { month: string; value: number }[]>;
}

interface TrendChartProps {
  metrics: MetricConfig[];
}

type AreaKey = "general" | "Marketing" | "Recursos Humanos" | "Operación" | "Ventas";

const areas: { key: AreaKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "Marketing", label: "Marketing" },
  { key: "Recursos Humanos", label: "RR.HH." },
  { key: "Operación", label: "Operación" },
  { key: "Ventas", label: "Ventas" },
];

const TrendChart = ({ metrics }: TrendChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [selectedArea, setSelectedArea] = useState<AreaKey>("general");

  const currentMetric = metrics[selectedMetric];
  const chartData = currentMetric.data[selectedArea];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      {/* Metric selector buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.map((metric, index) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(index)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedMetric === index
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Tendencia de {currentMetric.label.toLowerCase()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedArea === "general"
              ? `Nivel de ${currentMetric.label.toLowerCase()} general de la empresa`
              : `Nivel de ${currentMetric.label.toLowerCase()} del área de ${selectedArea}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <button
              key={area.key}
              onClick={() => setSelectedArea(area.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedArea === area.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => currentMetric.isPercentage ? `${value}%` : `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [
                currentMetric.isPercentage ? `${value}%` : value,
                currentMetric.label
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={currentMetric.color}
              strokeWidth={3}
              dot={{
                fill: currentMetric.color,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: currentMetric.color,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
