import React from 'react';
import { Weight, Repeat, Clock, TrendingUp } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  colorClass?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, colorClass = '' }) => {
  const sets = exercise.sets || [];
  
  // Calculate exercise statistics
  const totalVolume = sets.reduce((acc, set) => acc + ((set.weight || 0) * set.reps), 0);
  const maxWeight = sets.reduce((max, set) => Math.max(max, set.weight || 0), 0);
  const totalReps = sets.reduce((acc, set) => acc + set.reps, 0);
  
  return (
    <div 
      className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-slide-up mb-4 ${colorClass}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      role="article"
      aria-labelledby={`exercise-${exercise.id}-title`}
    >
      
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 id={`exercise-${exercise.id}-title`} className="font-bold text-base sm:text-lg text-gray-900 capitalize truncate">
            {exercise.name}
          </h4>
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600 mt-1">
            <span className="flex items-center space-x-1">
              <Repeat className="h-3 w-3" />
              <span>{sets.length} sets</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Just logged</span>
            </span>
          </div>
        </div>
        
        {/* Exercise Stats Badge */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-semibold text-primary-600">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : totalVolume} lbs
          </div>
          <div className="text-xs text-gray-500">Total Volume</div>
        </div>
      </div>

      {/* Sets List */}
      <div className="space-y-2 mb-4">
        {sets.map((set, setIndex) => (
          <div 
            key={set.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            role="listitem"
            aria-label={`Set ${set.set_number}: ${set.weight ? `${set.weight} lbs for ` : ''}${set.reps} reps`}
          >
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                {set.set_number}
              </div>
              
              {set.weight && (
                <div className="flex items-center space-x-1 text-xs sm:text-sm">
                  <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">{set.weight}</span>
                  <span className="text-gray-600">lbs</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <Repeat className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="font-semibold text-gray-900">{set.reps}</span>
                <span className="text-gray-600">reps</span>
              </div>

              {/* Set Volume */}
              {set.weight && (
                <div className="text-xs text-gray-500 hidden sm:block">
                  ({(set.weight * set.reps).toLocaleString()} lbs)
                </div>
              )}
            </div>

            {/* Completion Indicator */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success-100 flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success-500"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Set Progress</span>
          <span>{sets.length}/{sets.length} complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-success-400 to-success-500 h-2 rounded-full transition-all duration-500"
            style={{ width: '100%' }}
            role="progressbar"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Exercise completion progress"
          ></div>
        </div>
      </div>

      {/* Exercise Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-gray-900">{totalReps}</div>
          <div className="text-xs text-gray-600">Total Reps</div>
        </div>
        
        {maxWeight > 0 && (
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-gray-900">{maxWeight}</div>
            <div className="text-xs text-gray-600">Max Weight</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : totalVolume}
          </div>
          <div className="text-xs text-gray-600">Volume</div>
        </div>
      </div>

      {/* n8n Processing Badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2 text-xs text-blue-600">
          <TrendingUp className="h-3 w-3" />
          <span>Processed by n8n AI</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;