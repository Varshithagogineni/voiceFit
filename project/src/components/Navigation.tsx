import React from 'react';
import { Home, Mic, BarChart3, User } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'record' | 'analytics' | 'profile';
  onViewChange: (view: 'home' | 'record' | 'analytics' | 'profile') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      id: 'home' as const,
      icon: Home,
      label: 'Home',
      color: 'primary'
    },
    {
      id: 'record' as const,
      icon: Mic,
      label: 'Record',
      color: 'secondary'
    },
    {
      id: 'analytics' as const,
      icon: BarChart3,
      label: 'Analytics',
      color: 'accent'
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Profile',
      color: 'gray'
    }
  ];

  const getActiveClasses = (itemId: string, color: string) => {
    if (currentView === itemId) {
      const colors = {
        primary: 'bg-primary-600 text-white shadow-lg',
        secondary: 'bg-secondary-600 text-white shadow-lg',
        accent: 'bg-accent-600 text-white shadow-lg',
        gray: 'bg-gray-600 text-white shadow-lg'
      };
      return colors[color as keyof typeof colors];
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  };

  const getLabelClasses = (itemId: string) => {
    return currentView === itemId 
      ? 'text-gray-900 font-semibold' 
      : 'text-gray-600';
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-2 z-50 safe-area-pb"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-300 ${
                isActive ? 'transform scale-105' : 'hover:bg-gray-50'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${getActiveClasses(item.id, item.color)}`}>
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className={`text-xs font-medium transition-colors ${getLabelClasses(item.id)}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;