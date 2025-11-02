import React, { useState } from 'react';
import { AlertTriangle, Heart, Flame, Shield, HelpCircle } from 'lucide-react';
import { SOSTypeModal } from './SOSTypeModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SOSButtonProps {
  onSOS: (type: string, location: { lat: number; lng: number }) => Promise<void>;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onSOS }) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { user } = useAuth();

  const handleSOSPress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    setShowTypeModal(true);
  };

  const handleTypeSelect = async (type: string) => {
    try {
      // Get user profile for initiator information
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, phone')
        .eq('user_id', user?.id)
        .single();

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      await onSOS(type, {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location or sending SOS:', error);
      // Still send SOS without location if geolocation fails
      await onSOS(type, { lat: 0, lng: 0 });
    }
    setShowTypeModal(false);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        <button
          onClick={handleSOSPress}
          className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 active:from-red-700 active:to-red-900 transition-all duration-150 shadow-2xl hover:shadow-red-500/25 transform ${
            isPressed ? 'scale-95' : 'hover:scale-105'
          } focus:outline-none focus:ring-4 focus:ring-red-500/50`}
        >
          <div className="absolute inset-4 bg-red-400/20 rounded-full animate-pulse" />
          <div className="relative flex flex-col items-center justify-center h-full text-white">
            <AlertTriangle className="h-12 w-12 mb-2 drop-shadow-lg" />
            <span className="text-2xl font-bold tracking-wide drop-shadow-lg">SOS</span>
            <span className="text-sm opacity-90 mt-1">Emergency</span>
          </div>
        </button>

        <div className="text-center max-w-sm">
          <p className="text-gray-600 text-sm leading-relaxed">
            Press the SOS button to alert nearby volunteers.
            Your location will be shared to coordinate help.
          </p>
<button
  style={{
    marginTop: '1.5rem',
    padding: '1rem 0',
    backgroundColor: '#f77f00',
    color: 'white',
    fontWeight: 600,
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.2rem',
    boxShadow: '0 4px 18px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.7em',
    width: '100%',
    maxWidth: '550px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }}
  aria-label="Call emergency services (112)"
  onClick={() => window.location.href = 'tel:112'}
>
  <span style={{ fontSize: '1.5em', color: '#fff', display: 'flex', alignItems: 'center' }}>📞</span>
  Emergency Services
</button>


        </div>
      </div>

      <SOSTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectType={handleTypeSelect}
      />
    </>
  );
};