import React from 'react';
import { Heart, Flame, Shield, HelpCircle, X } from 'lucide-react';

interface SOSTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

export const SOSTypeModal: React.FC<SOSTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  if (!isOpen) return null;

  const emergencyTypes = [
    {
      type: 'Health',
      icon: Heart,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Medical emergency or health crisis'
    },
    {
      type: 'Fire',
      icon: Flame,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Fire emergency or evacuation needed'
    },
    {
      type: 'Theft/Threat',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Security threat or dangerous situation'
    },
    {
      type: 'Other',
      icon: HelpCircle,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Other emergency requiring assistance'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Emergency Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Choose the type of emergency to help responders prepare appropriately.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {emergencyTypes.map(({ type, icon: Icon, color, description }) => (
              <button
                key={type}
                onClick={() => onSelectType(type)}
                className={`${color} text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{type}</h3>
                    <p className="text-sm opacity-90">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm text-center">
              ⚠️ Emergency services will be notified automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};