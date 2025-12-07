import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import BehumanLogo from "@/components/BehumanLogo";
import QuizForm from "@/components/quizz/quiz-form";
import { PsychometricQuestion, QuestionsByCategory } from "@/components/quizz/types";

export default async function QuizzPage() {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all active questions ordered by category and question_order
  const { data: questions, error: questionsError } = await supabase
    .from("psychometric_questions")
    .select("*")
    .eq("is_active", true)
    .order("block_category")
    .order("question_order");

  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <BehumanLogo size={64} />
          <h1 className="text-2xl font-bold text-foreground">Error al cargar el cuestionario</h1>
          <p className="text-muted-foreground">
            No se pudieron cargar las preguntas. Intenta nuevamente más tarde.
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <BehumanLogo size={64} />
          <h1 className="text-2xl font-bold text-foreground">No hay preguntas disponibles</h1>
          <p className="text-muted-foreground">
            El cuestionario aún no está configurado.
          </p>
        </div>
      </div>
    );
  }

  // Group questions by category
  const questionsByCategory: QuestionsByCategory = {
    ESTRES: [],
    ANIMO: [],
    ANSIEDAD: [],
  };

  questions.forEach((question: PsychometricQuestion) => {
    if (question.block_category in questionsByCategory) {
      questionsByCategory[question.block_category].push(question);
    }
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <BehumanLogo size={48} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Evaluación Psicométrica</h1>
              <p className="text-sm text-muted-foreground">
                Responde todas las preguntas para continuar
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <QuizForm questionsByCategory={questionsByCategory} userId={user.id} />
      </div>
    </main>
  );
}
