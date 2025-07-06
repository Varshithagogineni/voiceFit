export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number;
  timestamp: string;
}

export interface Exercise {
  id: string;
  session_id: string;
  name: string;
  sets?: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  date: string;
  muscle_group: string | null;
  mood_pre: string | null;
  notes: string | null;
  timestamp: string;
  exercises?: Exercise[];
}

// n8n API Response Types
export interface VoiceLogResponse {
  session_id: string;
  entries: Array<{
    exercise: string;
    weight?: number;
    reps: number;
    set_number: number;
  }>;
}

export interface TodaySessionResponse {
  date: string;
  session_id: string;
  muscle_group: string | null;
  notes: string | null;
  entries: Array<{
    exercise: string;
    reps: number;
    weight?: number;
    set_number?: number;
  }>;
}

export interface ExercisesResponse {
  session_id: string;
  exercises: Array<{
    name: string;
    sets: Array<{
      set_number: number;
      reps: number;
      weight: number | null;
    }>;
  }>;
}

// LLM Intent Types (for n8n OpenAI Chat parsing)
export interface WorkoutIntent {
  intent: 'log_exercise_set' | 'log_workout_day' | 'log_mood' | 'unknown';
  entities: {
    exercise_name?: string;
    weight?: number;
    reps?: number;
    set_number?: number;
    muscle_group?: string;
    mood?: string;
    timestamp?: string;
  };
}

// API Error Types
export interface APIError {
  error: string;
  message: string;
  status: number;
}