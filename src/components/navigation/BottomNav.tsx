import React from 'react';
import { AlertTriangle, Clock, User, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'sos', label: 'SOS', icon: AlertTriangle },
    { id: 'volunteer', label: 'Help', icon: Users },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};