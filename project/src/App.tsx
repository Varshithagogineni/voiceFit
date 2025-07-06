import React, { useState } from 'react';
import Header from './components/Header';
import TodaySession from './components/TodaySession';
import RecentWorkouts from './components/RecentWorkouts';
import QuickStats from './components/QuickStats';
import VoiceRecorder from './components/VoiceRecorder';
import Navigation from './components/Navigation';
import { User, WorkoutSession } from './types';

// Mock user data
const mockUser: User = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Alex Johnson',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

// Mock session data (null means no session today)
const mockSession: WorkoutSession | null = {
  id: 'session-1',
  user_id: mockUser.id,
  date: new Date().toISOString().slice(0, 10),
  muscle_group: 'chest and back',
  mood_pre: 'energetic',
  notes: 'Felt strong today!',
  timestamp: new Date().toISOString(),
  exercises: [],
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'record' | 'analytics' | 'profile'>('home');
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>(mockUser.avatar);

  // Handler for voice log (stub)
  const handleVoiceLog = async (audioBlob: Blob, transcript?: string) => {
    setIsVoiceLoading(true);
    // TODO: Integrate with n8n API
    setTimeout(() => setIsVoiceLoading(false), 2000);
  };

  // Handler for photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header user={{ ...mockUser, avatar: profilePhoto }} />
      <main className="max-w-2xl mx-auto px-2 sm:px-4 py-4 space-y-6">
        {currentView === 'home' && (
          <>
            <TodaySession session={mockSession} />
            <QuickStats />
            <RecentWorkouts />
          </>
        )}
        {currentView === 'record' && (
          <div className="pt-4">
            <VoiceRecorder onVoiceLog={handleVoiceLog} isLoading={isVoiceLoading} />
          </div>
        )}
        {currentView === 'analytics' && (
          <div className="pt-4">
            <QuickStats />
            <RecentWorkouts />
          </div>
        )}
        {currentView === 'profile' && (
          <div className="pt-4 flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={profilePhoto}
                  alt={mockUser.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-primary-200"
                />
                <label
                  htmlFor="profile-photo-upload"
                  className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 cursor-pointer shadow hover:bg-primary-700 transition"
                  title="Change profile photo"
                  style={{ fontSize: 0 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <h2 className="text-3xl font-bold mb-1">{mockUser.name}</h2>
              <p className="text-lg text-gray-500">Voice-Powered Fitness Enthusiast</p>
            </div>
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="font-medium text-gray-900 flex items-center">
                  <span className="mr-2">🩺</span> Total Workouts
                </span>
                <span className="text-primary-600 font-bold text-lg">24</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="font-medium text-gray-900 flex items-center">
                  <span className="mr-2">📈</span> Current Streak
                </span>
                <span className="text-green-600 font-bold text-lg">7 days</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="font-medium text-gray-900 flex items-center">
                  <span className="mr-2">📅</span> Member Since
                </span>
                <span className="text-orange-600 font-bold text-lg">Jan 2024</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default App;