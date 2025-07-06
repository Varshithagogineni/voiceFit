// n8n API Configuration based on your workflow
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://your-n8n-instance.com';

// Your n8n webhook endpoints from the workflow
const WEBHOOK_ID = '57ce16fe-2090-4d87-84cb-7f3806d083cc';

const API_ENDPOINTS = {
  LOG_EXERCISE: `${N8N_BASE_URL}/webhook/${WEBHOOK_ID}/log_excersice`,
  LOG_MOOD: `${N8N_BASE_URL}/webhook/${WEBHOOK_ID}/log_mood`, 
  LOG_WORKOUT_SESSION: `${N8N_BASE_URL}/webhook/${WEBHOOK_ID}/log_workout_session`,
  // Direct Supabase endpoints for reading data
  GET_TODAY_SESSION: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/workout_sessions`,
  GET_EXERCISES: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/exercises`,
};

// Mock user ID - in production, this would come from Supabase authentication
const MOCK_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export class WorkoutAPI {
  private static async makeSupabaseRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Supabase API Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase API Request failed:', error);
      throw error;
    }
  }

  /**
   * Upload audio file to n8n for exercise logging
   * Workflow: Webhook → Whisper STT → OpenAI Assistant → Parse JSON → Create Exercise/Sets
   */
  static async logExerciseAudio(audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('data0', audioBlob, 'exercise.webm');

    try {
      const response = await fetch(API_ENDPOINTS.LOG_EXERCISE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new Error(`Exercise log failed: ${response.status} - ${errorData || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Exercise log error:', error);
      throw error;
    }
  }

  /**
   * Upload audio file to n8n for mood logging
   * Workflow: Webhook → Whisper STT → OpenAI Assistant → Parse JSON → Update Session
   */
  static async logMoodAudio(audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('data0', audioBlob, 'mood.webm');

    try {
      const response = await fetch(API_ENDPOINTS.LOG_MOOD, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new Error(`Mood log failed: ${response.status} - ${errorData || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mood log error:', error);
      throw error;
    }
  }

  /**
   * Upload audio file to n8n for workout session creation
   * Workflow: Webhook → Whisper STT → OpenAI Assistant → Parse JSON → Create Session
   */
  static async logWorkoutSessionAudio(audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('data0', audioBlob, 'session.webm');

    try {
      const response = await fetch(API_ENDPOINTS.LOG_WORKOUT_SESSION, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new Error(`Workout session log failed: ${response.status} - ${errorData || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Workout session log error:', error);
      throw error;
    }
  }

  /**
   * Send text directly to n8n for exercise logging
   */
  static async logExerciseText(text: string): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('text', text);

    return fetch(API_ENDPOINTS.LOG_EXERCISE, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  }

  /**
   * Send text directly to n8n for mood logging
   */
  static async logMoodText(text: string): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('text', text);

    return fetch(API_ENDPOINTS.LOG_MOOD, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  }

  /**
   * Send text directly to n8n for workout session creation
   */
  static async logWorkoutSessionText(text: string): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', MOCK_USER_ID);
    formData.append('text', text);

    return fetch(API_ENDPOINTS.LOG_WORKOUT_SESSION, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  }

  /**
   * Get today's workout session from Supabase directly
   */
  static async getTodaySession(): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const url = `${API_ENDPOINTS.GET_TODAY_SESSION}?user_id=eq.${MOCK_USER_ID}&date=eq.${today}&select=*`;
    
    return this.makeSupabaseRequest(url, {
      method: 'GET',
    });
  }

  /**
   * Get exercises for a specific session from Supabase directly
   */
  static async getExercises(sessionId: string): Promise<any> {
    const url = `${API_ENDPOINTS.GET_EXERCISES}?session_id=eq.${sessionId}&select=*,exercise_sets(*)`;
    
    return this.makeSupabaseRequest(url, {
      method: 'GET',
    });
  }

  /**
   * Smart voice logging that determines intent and routes to appropriate n8n endpoint
   * Based on your workflow's OpenAI Assistant intent detection
   */
  static async smartVoiceLog(audioBlob: Blob, transcript?: string): Promise<any> {
    // If we have a transcript, we can pre-analyze it to determine the best endpoint
    if (transcript) {
      const lowerTranscript = transcript.toLowerCase();
      
      // Check for workout session indicators (matches your OpenAI Assistant instructions)
      if (lowerTranscript.includes('today is') || 
          lowerTranscript.includes('day') || 
          lowerTranscript.includes('muscle') ||
          lowerTranscript.includes('chest') ||
          lowerTranscript.includes('back') ||
          lowerTranscript.includes('legs') ||
          lowerTranscript.includes('arms') ||
          lowerTranscript.includes('feeling') ||
          lowerTranscript.includes('slept')) {
        return this.logWorkoutSessionAudio(audioBlob);
      }
      
      // Check for mood indicators
      if (lowerTranscript.includes('feel') || 
          lowerTranscript.includes('mood') ||
          lowerTranscript.includes('energy') ||
          lowerTranscript.includes('tired') ||
          lowerTranscript.includes('motivated') ||
          lowerTranscript.includes('sore')) {
        return this.logMoodAudio(audioBlob);
      }
      
      // Check for exercise set indicators (matches your assistant's exercise parsing)
      if (lowerTranscript.includes('set') ||
          lowerTranscript.includes('reps') ||
          lowerTranscript.includes('lbs') ||
          lowerTranscript.includes('pounds') ||
          lowerTranscript.includes('kg') ||
          /\d+\s*(reps?|rep)/.test(lowerTranscript) ||
          /\d+\s*(lbs?|pounds?)/.test(lowerTranscript)) {
        return this.logExerciseAudio(audioBlob);
      }
      
      // Default to exercise logging for exercise names
      return this.logExerciseAudio(audioBlob);
    }
    
    // If no transcript, default to exercise logging (your main workflow)
    return this.logExerciseAudio(audioBlob);
  }

  /**
   * Smart text logging that determines intent and routes to appropriate n8n endpoint
   */
  static async smartTextLog(text: string): Promise<any> {
    const lowerText = text.toLowerCase();
    
    // Check for workout session indicators
    if (lowerText.includes('today is') || 
        lowerText.includes('day') || 
        lowerText.includes('muscle') ||
        lowerText.includes('chest') ||
        lowerText.includes('back') ||
        lowerText.includes('legs') ||
        lowerText.includes('arms') ||
        lowerText.includes('feeling') ||
        lowerText.includes('slept')) {
      return this.logWorkoutSessionText(text);
    }
    
    // Check for mood indicators
    if (lowerText.includes('feel') || 
        lowerText.includes('mood') ||
        lowerText.includes('energy') ||
        lowerText.includes('tired') ||
        lowerText.includes('motivated') ||
        lowerText.includes('sore')) {
      return this.logMoodText(text);
    }
    
    // Default to exercise logging
    return this.logExerciseText(text);
  }

  // ========================================
  // MOCK API RESPONSES FOR DEVELOPMENT
  // These simulate your n8n workflow responses
  // ========================================

  static async mockLogVoice(audioBlob: Blob, transcript?: string): Promise<any> {
    // Simulate n8n processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response matching your n8n workflow output format
    const lowerTranscript = transcript?.toLowerCase() || '';
    
    // Determine intent based on your OpenAI Assistant logic
    let intent = 'log_exercise_set';
    if (lowerTranscript.includes('today is') || lowerTranscript.includes('day')) {
      intent = 'log_workout_day';
    } else if (lowerTranscript.includes('feel') || lowerTranscript.includes('mood')) {
      intent = 'log_mood';
    }
    
    return {
      success: true,
      intent: intent,
      webhook_id: WEBHOOK_ID,
      processed_by: 'n8n_workflow',
      entities: {
        exercise_name: transcript?.toLowerCase().includes('bench') ? 'bench press' : 
                     transcript?.toLowerCase().includes('squat') ? 'squats' :
                     transcript?.toLowerCase().includes('curl') ? 'bicep curls' : 'push-ups',
        weight: transcript?.includes('185') ? 185 : 
               transcript?.includes('135') ? 135 : 
               transcript?.includes('225') ? 225 : null,
        reps: transcript?.includes('10') ? 10 : 
             transcript?.includes('8') ? 8 : 
             transcript?.includes('12') ? 12 : 10,
        set_number: 1,
        muscle_group: transcript?.toLowerCase().includes('chest') ? 'chest' :
                     transcript?.toLowerCase().includes('back') ? 'back' : null,
        mood_pre: transcript?.toLowerCase().includes('energetic') ? 'energetic' :
                 transcript?.toLowerCase().includes('tired') ? 'tired' : null,
        timestamp: new Date().toISOString(),
      }
    };
  }

  static async mockGetTodaySession(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock today's session matching Supabase format
    return [{
      id: 'sess_mock_123',
      user_id: MOCK_USER_ID,
      date: new Date().toISOString().split('T')[0],
      muscle_group: 'Upper Body',
      mood_pre: 'energetic',
      notes: 'Feeling strong today! Great energy.',
      timestamp: new Date().toISOString(),
    }];
  }

  static async mockGetExercises(sessionId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'ex_1',
        session_id: sessionId,
        name: 'bench press',
        exercise_sets: [
          { id: 'set_1', exercise_id: 'ex_1', set_number: 1, weight: 185, reps: 10, timestamp: new Date().toISOString() },
          { id: 'set_2', exercise_id: 'ex_1', set_number: 2, weight: 185, reps: 8, timestamp: new Date().toISOString() },
          { id: 'set_3', exercise_id: 'ex_1', set_number: 3, weight: 185, reps: 6, timestamp: new Date().toISOString() },
        ]
      },
      {
        id: 'ex_2',
        session_id: sessionId,
        name: 'incline dumbbell press',
        exercise_sets: [
          { id: 'set_4', exercise_id: 'ex_2', set_number: 1, weight: 70, reps: 12, timestamp: new Date().toISOString() },
          { id: 'set_5', exercise_id: 'ex_2', set_number: 2, weight: 70, reps: 10, timestamp: new Date().toISOString() },
        ]
      },
      {
        id: 'ex_3',
        session_id: sessionId,
        name: 'pull-ups',
        exercise_sets: [
          { id: 'set_6', exercise_id: 'ex_3', set_number: 1, weight: null, reps: 12, timestamp: new Date().toISOString() },
          { id: 'set_7', exercise_id: 'ex_3', set_number: 2, weight: null, reps: 10, timestamp: new Date().toISOString() },
          { id: 'set_8', exercise_id: 'ex_3', set_number: 3, weight: null, reps: 8, timestamp: new Date().toISOString() },
        ]
      }
    ];
  }
}