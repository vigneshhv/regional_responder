import { useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './useNotifications';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { sendVolunteerNotification } = useNotifications();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user is a volunteer
    const checkVolunteerStatus = async () => {
      const { data } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        startListening();
      }
    };

    checkVolunteerStatus();

    return () => {
      stopListening();
    };
  }, [user]);

  const startListening = () => {
    if (isListening) return;

    // Skip real-time subscriptions in demo mode
    if (isDemoMode) {
      console.log('Demo mode: Real-time notifications disabled');
      setIsListening(true);
      return;
    }

    // Listen for new SOS events
    const sosSubscription = supabase
      .channel('sos_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_events',
          filter: 'status=eq.active'
        },
        (payload) => {
          const sosEvent = payload.new;
          
          // Calculate distance (simplified - in real app would use user's location)
          const distance = '< 1km'; // Placeholder
          
          // Send notification to volunteer
          sendVolunteerNotification(sosEvent.type, distance);
          
          // Trigger a custom event for components to listen to
          window.dispatchEvent(new CustomEvent('newSOSEvent', { 
            detail: sosEvent 
          }));
        }
      )
      .subscribe();

    setIsListening(true);

    // Cleanup function
    return () => {
      sosSubscription.unsubscribe();
      setIsListening(false);
    };
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return { isListening, startListening, stopListening };
};