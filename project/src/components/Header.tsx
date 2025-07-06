import React from 'react';
import { Dumbbell, Bell } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl shadow-sm">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">VoiceFit</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{currentDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full" aria-hidden="true"></span>
              <span className="sr-only">You have new notifications</span>
            </button>
            
            <button 
              className="focus:outline-none focus:ring-2 focus:ring-primary-300 rounded-xl"
              aria-label={`View profile for ${user.name}`}
            >
              <img 
                src={user.avatar} 
                alt={`${user.name}'s profile picture`}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl object-cover border-2 border-primary-100 hover:border-primary-200 transition-colors"
              />
            </button>
          </div>
        </div>
        
        {/* Mobile date display */}
        <div className="sm:hidden mt-2">
          <p className="text-xs text-gray-600">{currentDate}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;