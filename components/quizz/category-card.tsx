"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PsychometricQuestion, QuestionCategory } from "./types";
import QuestionItem from "./question-item";
import { Activity, Heart, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: QuestionCategory;
  questions: PsychometricQuestion[];
  answers: Record<string, number>;
  onAnswerChange: (questionId: string, value: number) => void;
}

const categoryConfig: Record<QuestionCategory, {
  title: string;
  description: string;
  icon: React.ReactNode;
  badgeClass: string;
  cardClass: string;
}> = {
  ESTRES: {
    title: "Estrés",
    description: "Evalúa tu nivel de estrés actual",
    icon: <Activity className="w-5 h-5" />,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    cardClass: "border-l-4 border-l-destructive/40",
  },
  ANIMO: {
    title: "Ánimo",
    description: "Evalúa tu estado de ánimo",
    icon: <Heart className="w-5 h-5" />,
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    cardClass: "border-l-4 border-l-accent/40",
  },
  ANSIEDAD: {
    title: "Ansiedad",
    description: "Evalúa tu nivel de ansiedad",
    icon: <Brain className="w-5 h-5" />,
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cardClass: "border-l-4 border-l-blue-500/40",
  },
};

export default function CategoryCard({ category, questions, answers, onAnswerChange }: CategoryCardProps) {
  const config = categoryConfig[category];
  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;
  const totalCount = questions.length;
  const isComplete = answeredCount === totalCount;

  return (
    <Card className={cn("transition-all duration-200", config.cardClass)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.badgeClass)}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className="shrink-0"
          >
            {answeredCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {questions.map((question, index) => (
          <div key={question.id}>
            <QuestionItem
              question={question}
              value={answers[question.id]}
              onChange={(value) => onAnswerChange(question.id, value)}
            />
            {index < questions.length - 1 && (
              <div className="border-b border-border/50" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
