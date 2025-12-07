export type QuestionCategory = 'ESTRES' | 'ANIMO' | 'ANSIEDAD';

export interface PsychometricQuestion {
  id: string;
  question_text: string;
  block_category: QuestionCategory;
  min_value: number;
  max_value: number;
  question_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PsychometricAnswer {
  id?: string;
  user_id: string;
  question_id: string;
  answer: number;
  created_at?: string;
}

export interface QuestionsByCategory {
  ESTRES: PsychometricQuestion[];
  ANIMO: PsychometricQuestion[];
  ANSIEDAD: PsychometricQuestion[];
}
