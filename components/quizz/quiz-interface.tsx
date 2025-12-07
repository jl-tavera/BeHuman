"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import QuizForm from "./quiz-form";
import { QuestionsByCategory } from "./types";

interface QuizInterfaceProps {
  questionsByCategory: QuestionsByCategory;
  userId: string;
}

export function QuizInterface({ questionsByCategory, userId }: QuizInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "min-h-screen bg-background flex flex-col transition-all",
        !isMobile && "ml-64"
      )}>
        {/* Header */}
        <header className="flex-shrink-0 pt-6 pb-3 px-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-3 relative">
              {/* Hamburger menu button - only on mobile */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl font-bold text-foreground">
                Quizz
              </h1>
            </div>
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Responde todas las preguntas para continuar
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32 w-full">
          <QuizForm questionsByCategory={questionsByCategory} userId={userId} />
        </div>
      </div>
    </>
  );
}
