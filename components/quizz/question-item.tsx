"use client";

import { Slider } from "@/components/ui/slider";
import { PsychometricQuestion } from "./types";

interface QuestionItemProps {
  question: PsychometricQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function QuestionItem({ question, value, onChange }: QuestionItemProps) {
  const { question_text, min_value, max_value } = question;

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-foreground flex-1">{question_text}</p>
        <span className="text-sm font-medium text-primary shrink-0 min-w-[2rem] text-center">
          {value !== undefined ? value : "-"}
        </span>
      </div>
      <Slider
        value={[value ?? min_value]}
        onValueChange={(values) => onChange(values[0])}
        min={min_value}
        max={max_value}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min_value}</span>
        <span>{max_value}</span>
      </div>
    </div>
  );
}
