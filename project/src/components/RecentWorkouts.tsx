import React, { useEffect, useState } from 'react';
import { Calendar, Target, Clock } from 'lucide-react';
import { SupabaseAPI } from '../services/supabase-api';
import { WorkoutSession } from '../types';

const RecentWorkouts: React.FC = () => {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user ID - in production, get from auth context
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    try {
      setIsLoading(true);
      const sessions = await SupabaseAPI.getRecentSessions(userId, 5);
      setRecentWorkouts(sessions);
    } catch (error) {
      console.error('Failed to load recent workouts:', error);
      // Keep empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodColor = (mood: string | null) => {
    if (!mood) return 'bg-gray-100 text-gray-700';
    
    const colors = {
      energetic: 'bg-success-100 text-success-700',
      focused: 'bg-primary-100 text-primary-700',
      motivated: 'bg-accent-100 text-accent-700',
      tired: 'bg-warning-100 text-warning-700',
      strong: 'bg-secondary-100 text-secondary-700'
    };
    
    const moodKey = mood.toLowerCase();
    return colors[moodKey as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentWorkouts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h4>
          <p className="text-gray-600">Start logging your workouts to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Live from Supabase</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {recentWorkouts.map((workout, index) => (
          <div 
            key={workout.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formatDate(workout.date)}
                </span>
              </div>
              {workout.mood_pre && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMoodColor(workout.mood_pre)}`}>
                  {workout.mood_pre}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900 capitalize">
                    {workout.muscle_group || 'General Workout'}
                  </span>
                </div>
                {workout.notes && (
                  <div className="text-sm text-gray-600 truncate max-w-48">
                    {workout.notes}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(workout.timestamp).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWorkouts;