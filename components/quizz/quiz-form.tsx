"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionsByCategory } from "./types";
import CategoryCard from "./category-card";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/utils/supabase/client";
import { CheckCircle2 } from "lucide-react";

interface QuizFormProps {
  questionsByCategory: QuestionsByCategory;
  userId: string;
}

export default function QuizForm({ questionsByCategory, userId }: QuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allQuestions = [
    ...questionsByCategory.ESTRES,
    ...questionsByCategory.ANIMO,
    ...questionsByCategory.ANSIEDAD,
  ];

  const answeredCount = Object.keys(answers).length;
  const totalCount = allQuestions.length;
  const isComplete = answeredCount === totalCount;

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error("Por favor responde todas las preguntas", {
        description: `Te faltan ${totalCount - answeredCount} preguntas por responder`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Prepare answers for insertion
      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
        user_id: userId,
        question_id: questionId,
        answer,
      }));

      // Insert all answers
      const { error } = await supabase
        .from("psychometric_answers")
        .insert(answersToInsert);

      if (error) throw error;

      toast.success("¡Evaluación completada!", {
        description: "Tus respuestas han sido guardadas exitosamente",
      });

      // Redirect to chat or another page
      router.push("/chat");
    } catch (error) {
      console.error("Error submitting answers:", error);
      toast.error("Error al guardar", {
        description: "No se pudieron guardar tus respuestas. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Cards */}
      <div className="grid gap-6 lg:grid-cols-1">
        <CategoryCard
          category="ESTRES"
          questions={questionsByCategory.ESTRES}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
        <CategoryCard
          category="ANIMO"
          questions={questionsByCategory.ANIMO}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
        <CategoryCard
          category="ANSIEDAD"
          questions={questionsByCategory.ANSIEDAD}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4 -mx-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Progreso: {answeredCount}/{totalCount} preguntas
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              size="lg"
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : isComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizar
                </>
              ) : (
                "Finalizar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
