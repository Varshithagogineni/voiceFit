import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          muscle_group: string | null;
          mood_pre: string | null;
          notes: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          muscle_group?: string | null;
          mood_pre?: string | null;
          notes?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          muscle_group?: string | null;
          mood_pre?: string | null;
          notes?: string | null;
          timestamp?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
        };
      };
      exercise_sets: {
        Row: {
          id: string;
          exercise_id: string;
          set_number: number;
          weight: number | null;
          reps: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          set_number?: number;
          weight?: number | null;
          reps: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          exercise_id?: string;
          set_number?: number;
          weight?: number | null;
          reps?: number;
          timestamp?: string;
        };
      };
    };
  };
}