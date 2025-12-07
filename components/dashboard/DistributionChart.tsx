"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  data: Record<string, { score: number; count: number }[]>;
}

interface DistributionChartProps {
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

const DistributionChart = ({ metrics }: DistributionChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [selectedArea, setSelectedArea] = useState<AreaKey>("general");

  const currentMetric = metrics[selectedMetric];
  const chartData = currentMetric.data[selectedArea] || [];

  // Get max count for Y-axis scaling
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

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
            Distribución de {currentMetric.label.toLowerCase()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedArea === "general"
              ? `Distribución de niveles de ${currentMetric.label.toLowerCase()} en la empresa`
              : `Distribución de niveles de ${currentMetric.label.toLowerCase()} en ${selectedArea}`}
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

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="score"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: "Nivel", position: "insideBottom", offset: -10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: "Cantidad de usuarios", angle: -90, position: "insideLeft" }}
              domain={[0, maxCount > 0 ? maxCount : 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [value, "Usuarios"]}
              labelFormatter={(label: number) => `Nivel ${label}`}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={currentMetric.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionChart;
