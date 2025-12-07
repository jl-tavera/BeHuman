"use client";

import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: number;
  subtitle: string;
  showPercentage?: boolean;
  invertColors?: boolean; // true = lower is better (stress, anxiety), false = higher is better (emotional)
  forceColor?: "red" | "green" | "yellow"; // Force a specific color regardless of value
}

const getColorByValue = (value: number, invert: boolean) => {
  if (invert) {
    // For stress/anxiety: low = green, high = red
    if (value <= 40) return "bg-green-500/15 border-green-500/30";
    if (value <= 70) return "bg-yellow-500/15 border-yellow-500/30";
    return "bg-red-500/15 border-red-500/30";
  } else {
    // For emotional state: low = red, high = green
    if (value <= 40) return "bg-red-500/15 border-red-500/30";
    if (value <= 70) return "bg-yellow-500/15 border-yellow-500/30";
    return "bg-green-500/15 border-green-500/30";
  }
};

const getTextColorByValue = (value: number, invert: boolean) => {
  if (invert) {
    if (value <= 40) return "text-green-600";
    if (value <= 70) return "text-yellow-600";
    return "text-red-600";
  } else {
    if (value <= 40) return "text-red-600";
    if (value <= 70) return "text-yellow-600";
    return "text-green-600";
  }
};

const KpiCard = ({ title, value, subtitle, showPercentage = false, invertColors = false, forceColor }: KpiCardProps) => {
  const getForceCardColor = () => {
    if (forceColor === "red") return "bg-red-500/15 border-red-500/30";
    if (forceColor === "green") return "bg-green-500/15 border-green-500/30";
    if (forceColor === "yellow") return "bg-yellow-500/15 border-yellow-500/30";
    return null;
  };
  const getForceTextColor = () => {
    if (forceColor === "red") return "text-red-600";
    if (forceColor === "green") return "text-green-600";
    if (forceColor === "yellow") return "text-yellow-600";
    return null;
  };
  const cardColor = getForceCardColor() || getColorByValue(value, invertColors);
  const textColor = getForceTextColor() || getTextColorByValue(value, invertColors);

  return (
    <Card className={`shadow-md border ${cardColor}`}>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <p className={`text-4xl font-bold mb-2 ${textColor}`}>
          {value}{showPercentage && "%"}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
