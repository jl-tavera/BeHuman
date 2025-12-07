"use client";

import { useState } from "react";

interface AreaData {
  stress: number;
  emotion: number;
  anxiety: number;
}

interface AreaCardProps {
  name: string;
  data: AreaData;
}

const getEmotionColor = (value: number) => {
  if (value <= 40) return "bg-red-100 border-red-400";
  if (value <= 70) return "bg-yellow-100 border-yellow-400";
  return "bg-green-100 border-green-400";
};

const getEmotionTextColor = (value: number) => {
  if (value <= 40) return "text-red-600";
  if (value <= 70) return "text-yellow-600";
  return "text-green-600";
};

const AreaCard = ({ name, data }: AreaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClasses = getEmotionColor(data.emotion);
  const emotionTextColor = getEmotionTextColor(data.emotion);

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 rounded-2xl border-2 ${colorClasses} p-4 w-full h-40`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-sm font-semibold text-foreground text-center leading-tight">{name}</p>

        <div
          className={`overflow-hidden transition-all duration-300 w-full ${
            isHovered ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 text-center">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-muted-foreground">Estrés</span>
              <span className="text-[10px] font-medium text-foreground">{data.stress}%</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-muted-foreground">Emoción</span>
              <span className={`text-[10px] font-medium ${emotionTextColor}`}>{data.emotion}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-muted-foreground">Ansiedad</span>
              <span className="text-[10px] font-medium text-foreground">{data.anxiety}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AreaDataItem {
  name: string;
  data: AreaData;
}

interface PuzzleAreaCardsProps {
  areas: AreaDataItem[];
}

const PuzzleAreaCards = ({ areas }: PuzzleAreaCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {areas.slice(0, 4).map((area) => (
        <AreaCard
          key={area.name}
          name={area.name}
          data={area.data}
        />
      ))}
    </div>
  );
};

export default PuzzleAreaCards;
