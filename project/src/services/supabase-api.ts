import { supabase } from '../lib/supabase';
import { WorkoutSession, Exercise, ExerciseSet } from '../types';

export class SupabaseAPI {
  /**
   * Get today's workout session for the current user
   */
  static async getTodaySession(userId: string): Promise<WorkoutSession | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No session found for today
          return null;
        }
        throw error;
      }

      return {
        id: session.id,
        user_id: session.user_id,
        date: session.date,
        muscle_group: session.muscle_group,
        mood_pre: session.mood_pre,
        notes: session.notes,
        timestamp: session.timestamp,
      };
    } catch (error) {
      console.error('Error fetching today session:', error);
      throw error;
    }
  }

  /**
   * Get exercises for a specific session with their sets
   */
  static async getExercisesForSession(sessionId: string): Promise<Exercise[]> {
    try {
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          id,
          session_id,
          name,
          exercise_sets (
            id,
            exercise_id,
            set_number,
            weight,
            reps,
            timestamp
          )
        `)
        .eq('session_id', sessionId)
        .order('name');

      if (exercisesError) throw exercisesError;

      return exercises.map(exercise => ({
        id: exercise.id,
        session_id: exercise.session_id,
        name: exercise.name,
        sets: exercise.exercise_sets.map((set: any) => ({
          id: set.id,
          exercise_id: set.exercise_id,
          set_number: set.set_number,
          weight: set.weight,
          reps: set.reps,
          timestamp: set.timestamp,
        })).sort((a: ExerciseSet, b: ExerciseSet) => a.set_number - b.set_number),
      }));
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  /**
   * Create a new workout session
   */
  static async createWorkoutSession(
    userId: string,
    data: {
      date?: string;
      muscle_group?: string;
      mood_pre?: string;
      notes?: string;
    }
  ): Promise<WorkoutSession> {
    try {
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          date: data.date || new Date().toISOString().split('T')[0],
          muscle_group: data.muscle_group,
          mood_pre: data.mood_pre,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: session.id,
        user_id: session.user_id,
        date: session.date,
        muscle_group: session.muscle_group,
        mood_pre: session.mood_pre,
        notes: session.notes,
        timestamp: session.timestamp,
      };
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }
  }

  /**
   * Add an exercise to a session
   */
  static async addExercise(sessionId: string, exerciseName: string): Promise<Exercise> {
    try {
      const { data: exercise, error } = await supabase
        .from('exercises')
        .insert({
          session_id: sessionId,
          name: exerciseName.toLowerCase().trim(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: exercise.id,
        session_id: exercise.session_id,
        name: exercise.name,
        sets: [],
      };
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  /**
   * Add a set to an exercise
   */
  static async addExerciseSet(
    exerciseId: string,
    setData: {
      set_number: number;
      weight?: number;
      reps: number;
    }
  ): Promise<ExerciseSet> {
    try {
      const { data: set, error } = await supabase
        .from('exercise_sets')
        .insert({
          exercise_id: exerciseId,
          set_number: setData.set_number,
          weight: setData.weight,
          reps: setData.reps,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: set.id,
        exercise_id: set.exercise_id,
        set_number: set.set_number,
        weight: set.weight,
        reps: set.reps,
        timestamp: set.timestamp,
      };
    } catch (error) {
      console.error('Error adding exercise set:', error);
      throw error;
    }
  }

  /**
   * Get recent workout sessions for analytics
   */
  static async getRecentSessions(userId: string, limit: number = 10): Promise<WorkoutSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return sessions.map(session => ({
        id: session.id,
        user_id: session.user_id,
        date: session.date,
        muscle_group: session.muscle_group,
        mood_pre: session.mood_pre,
        notes: session.notes,
        timestamp: session.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      throw error;
    }
  }

  /**
   * Get workout statistics for analytics
   */
  static async getWorkoutStats(userId: string): Promise<{
    totalWorkouts: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    currentStreak: number;
  }> {
    try {
      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total sets and calculate reps/volume
      const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select(`
          reps,
          weight,
          exercises!inner (
            workout_sessions!inner (
              user_id
            )
          )
        `)
        .eq('exercises.workout_sessions.user_id', userId);

      if (setsError) throw setsError;

      const totalSets = sets?.length || 0;
      const totalReps = sets?.reduce((sum, set) => sum + set.reps, 0) || 0;
      const totalVolume = sets?.reduce((sum, set) => sum + ((set.weight || 0) * set.reps), 0) || 0;

      // Calculate current streak (simplified - consecutive days with workouts)
      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      let currentStreak = 0;
      if (recentSessions && recentSessions.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (const session of recentSessions) {
          const sessionDate = new Date(session.date);
          if (sessionDate.toDateString() === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      return {
        totalWorkouts: totalWorkouts || 0,
        totalSets,
        totalReps,
        totalVolume,
        currentStreak,
      };
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      return {
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        currentStreak: 0,
      };
    }
  }
}