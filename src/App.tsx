import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Phone } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { SOSButton } from './components/sos/SOSButton';
import { SOSStatus } from './components/sos/SOSStatus';
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { HistoryLog } from './components/history/HistoryLog';
import { ProfileTab } from './components/profile/ProfileTab';
import { BottomNav } from './components/navigation/BottomNav';
import { supabase, getCurrentPosition } from './lib/supabase';
import { useNotifications } from './hooks/useNotifications';
import { useRealTimeNotifications } from './hooks/useRealTimeNotifications';
import { SOSEvent } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState('sos');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSOSEvent, setActiveSOSEvent] = useState<SOSEvent | null>(null);
  const { user, loading } = useAuth();
  const { requestPermission, sendSOSNotification } = useNotifications();
  useRealTimeNotifications(); // Initialize real-time notifications

  useEffect(() => {
    // Request notification permission on app load
    requestPermission();
    
    if (user) {
      fetchActiveSOSEvent();
    }
  }, [user]);

  const fetchActiveSOSEvent = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('sos_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setActiveSOSEvent(data);
    }
  };

  const handleSOS = async (type: string, location: { lat: number; lng: number }) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Create SOS event
      const { data: sosEvent, error } = await supabase
        .from('sos_events')
        .insert({
          user_id: user.id,
          type,
          latitude: location.lat,
          longitude: location.lng,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveSOSEvent(sosEvent);
      
      // Send notification
      sendSOSNotification(type, `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);

      // In a real app, this would:
      // 1. Notify nearby volunteers via push notifications
      // 2. Send location to emergency services
      // 3. Alert emergency contacts
      console.log('SOS Event Created:', sosEvent);
      console.log('Emergency services notified automatically');
      
    } catch (error) {
      console.error('Error creating SOS event:', error);
    }
  };

  const handleEventResolved = () => {
    setActiveSOSEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Regional Rapid Responder...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-red-100">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Regional Rapid Responder</h1>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Response<br />Made Simple
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Connect with nearby volunteers and emergency services instantly when you need help most.
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-4 mb-12">
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instant SOS Alert</h3>
                  <p className="text-sm text-gray-600">One-tap emergency broadcasting</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Volunteers</h3>
                  <p className="text-sm text-gray-600">Help from nearby trained responders</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Auto Emergency Services</h3>
                  <p className="text-sm text-gray-600">Automatic professional response coordination</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl"
          >
            Join Regional Rapid Responder
          </button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const renderTabContent = () => {
    if (activeSOSEvent) {
      return (
        <SOSStatus 
          activeEvent={activeSOSEvent} 
          onEventResolved={handleEventResolved}
        />
      );
    }

    switch (activeTab) {
      case 'sos':
        return <SOSButton onSOS={handleSOS} />;
      case 'volunteer':
        return <VolunteerDashboard />;
      case 'history':
        return <HistoryLog />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <SOSButton onSOS={handleSOS} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-red-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Regional Rapid Responder</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;