import React, { useEffect, useState } from 'react';
import { Calendar, Target, Zap, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { WorkoutSession, Exercise, ExerciseSet } from '../types';
import { WorkoutAPI } from '../services/api';
import ExerciseCard from './ExerciseCard';

interface TodaySessionProps {
  session: WorkoutSession | null;
  onRefresh?: () => void;
}

const colorPalette = [
  'bg-pastel-blue text-blue-900',    // pastel blue
  'bg-pastel-green text-green-900',  // pastel green
  'bg-pastel-yellow text-yellow-900',// pastel yellow
  'bg-pastel-pink text-pink-900',    // pastel pink
  'bg-pastel-purple text-purple-900',// pastel purple
  'bg-pastel-orange text-orange-900',// pastel orange
  'bg-pastel-teal text-teal-900',    // pastel teal
  'bg-pastel-red text-red-900',      // pastel red
];

const TodaySession: React.FC<TodaySessionProps> = ({ session, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (session?.id) {
      loadExercises(session.id);
    }
  }, [session?.id]);

  const loadExercises = async (sessionId: string) => {
    try {
      setIsLoading(true);
      // In development, use mock data
      // In production, uncomment: const response = await WorkoutAPI.getExercises(sessionId);
      const response = await WorkoutAPI.mockGetExercises(sessionId);
      
      // The response is already in the correct Exercise[] format
      setExercises(response);
    } catch (error) {
      console.error('Failed to load exercises from n8n:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <Target className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No workout today</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Start your first workout session with voice commands</p>
          <div className="bg-white rounded-xl p-4 mb-4 max-w-sm mx-auto">
            <p className="text-sm text-gray-700 mb-2">Try saying:</p>
            <div className="text-sm font-medium text-primary-600">
              "Today is chest and back day"
            </div>
          </div>
          <button 
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 mx-auto focus:outline-none focus:ring-4 focus:ring-primary-300"
            aria-label="Start recording workout"
          >
            <Plus className="h-5 w-5" />
            <span>Start Recording</span>
          </button>
        </div>
      </div>
    );
  }

  const totalSets = exercises.reduce((acc, exercise) => acc + (exercise.sets?.length || 0), 0);
  const totalReps = exercises.reduce((acc, exercise) => 
    acc + (exercise.sets?.reduce((setAcc, set) => setAcc + set.reps, 0) || 0), 0
  );
  const totalVolume = exercises.reduce((acc, exercise) => 
    acc + (exercise.sets?.reduce((setAcc, set) => setAcc + ((set.weight || 0) * set.reps), 0) || 0), 0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Session Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate">Today's Workout</h2>
            <div className="flex items-center space-x-2 text-primary-100">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{new Date(session.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
              title="Refresh from n8n"
              aria-label="Refresh workout data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold">{exercises.length}</div>
              <div className="text-xs sm:text-sm text-primary-100">Exercises</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {session.muscle_group && (
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary-200 flex-shrink-0" />
              <span className="text-sm font-medium capitalize">{session.muscle_group}</span>
            </div>
          )}
          {session.mood_pre && (
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-200 flex-shrink-0" />
              <span className="text-sm font-medium capitalize">{session.mood_pre}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg sm:text-2xl font-bold text-secondary-600">{totalSets}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Sets</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg sm:text-2xl font-bold text-accent-600">{totalReps}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Reps</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-lg sm:text-2xl font-bold text-success-600">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : totalVolume}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Volume (lbs)</div>
        </div>
      </div>

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Parsed by n8n AI</span>
              <span className="sm:hidden">AI Parsed</span>
            </div>
          </div>
          {exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} colorClass={colorPalette[index % colorPalette.length]} />
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin mx-auto mb-2" />
            <p className="text-sm sm:text-base text-gray-600">Loading exercises from n8n...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && exercises.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center">
          <Target className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No exercises logged yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Use the voice recorder to log your first exercise</p>
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-700 max-w-sm mx-auto">
            <strong>Try saying:</strong> "Set 1 bench press 185 for 10 reps"
          </div>
        </div>
      )}

      {/* Session Notes */}
      {session.notes && (
        <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
          <h3 className="font-semibold text-accent-900 mb-2">Session Notes</h3>
          <p className="text-sm sm:text-base text-accent-800">{session.notes}</p>
        </div>
      )}

      {/* n8n Integration Status */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" aria-hidden="true"></div>
          <h3 className="font-semibold text-blue-900">n8n Integration Status</h3>
        </div>
        <p className="text-sm text-blue-800">
          Connected to n8n workflows for voice processing and data storage via Supabase
        </p>
      </div>
    </div>
  );
};

export default TodaySession;