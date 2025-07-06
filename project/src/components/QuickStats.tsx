import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react';
import { SupabaseAPI } from '../services/supabase-api';

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock user ID - in production, get from auth context
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const workoutStats = await SupabaseAPI.getWorkoutStats(userId);
      setStats(workoutStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Keep default stats on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const statsData = [
    {
      icon: Calendar,
      label: 'Streak',
      value: stats.currentStreak.toString(),
      unit: 'days',
      color: 'success',
      trend: stats.currentStreak > 0 ? `${stats.currentStreak} day streak!` : 'Start your streak'
    },
    {
      icon: Target,
      label: 'Workouts',
      value: stats.totalWorkouts.toString(),
      unit: 'total',
      color: 'primary',
      trend: 'All time'
    },
    {
      icon: TrendingUp,
      label: 'Sets',
      value: stats.totalSets.toString(),
      unit: 'completed',
      color: 'secondary',
      trend: `${stats.totalReps} total reps`
    },
    {
      icon: Zap,
      label: 'Volume',
      value: formatVolume(stats.totalVolume),
      unit: 'lbs',
      color: 'accent',
      trend: 'Total weight lifted'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      success: 'bg-success-100 text-success-600',
      primary: 'bg-primary-100 text-primary-600',
      secondary: 'bg-secondary-100 text-secondary-600',
      accent: 'bg-accent-100 text-accent-600'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Live from Supabase</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
              
              <div className="mb-1">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-600">{stat.unit}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.trend}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStats;