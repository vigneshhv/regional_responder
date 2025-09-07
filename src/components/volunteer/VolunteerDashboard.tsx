import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, MessageCircle, Heart, Flame, Shield, HelpCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRealTimeNotifications } from '../../hooks/useRealTimeNotifications';
import { generateGoogleMapsUrl, reverseGeocode } from '../../lib/maps';
import { SOSEvent } from '../../types';

interface SOSEventWithLocation extends SOSEvent {
  locationName?: string;
}

export const VolunteerDashboard: React.FC = () => {
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [availableSOSEvents, setAvailableSOSEvents] = useState<SOSEventWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isListening } = useRealTimeNotifications();

  useEffect(() => {
    checkVolunteerStatus();
  }, [user]);

  useEffect(() => {
    if (isVolunteer) {
      fetchNearbySOSEvents();
      
      // Listen for real-time SOS events
      const handleNewSOSEvent = (event: CustomEvent) => {
        const newEvent = event.detail;
        setAvailableSOSEvents(prev => [newEvent, ...prev]);
      };

      window.addEventListener('newSOSEvent', handleNewSOSEvent as EventListener);
      
      return () => {
        window.removeEventListener('newSOSEvent', handleNewSOSEvent as EventListener);
      };
    }
  }, [isVolunteer]);

  const checkVolunteerStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setIsVolunteer(!!data);
    setLoading(false);
  };

  const fetchNearbySOSEvents = async () => {
    // In a real app, this would filter by location and range
    const { data } = await supabase
      .from('sos_events')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      // Add location names to events
      const eventsWithLocation = await Promise.all(
        data.map(async (event) => {
          try {
            const locationName = await reverseGeocode(event.latitude, event.longitude);
            return { ...event, locationName };
          } catch {
            return { ...event, locationName: `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}` };
          }
        })
      );
      setAvailableSOSEvents(eventsWithLocation);
    }
  };

  const toggleVolunteerStatus = async () => {
    if (!user) return;

    if (isVolunteer) {
      await supabase
        .from('volunteers')
        .delete()
        .eq('user_id', user.id);
      setIsVolunteer(false);
    } else {
      await supabase
        .from('volunteers')
        .insert({
          user_id: user.id,
          is_available: true,
          max_range_meters: 1000
        });
      setIsVolunteer(true);
    }
  };

  const respondToSOS = async (eventId: string, responseType: 'accepted' | 'declined') => {
    if (!user) return;

    await supabase
      .from('volunteer_responses')
      .insert({
        sos_event_id: eventId,
        volunteer_id: user.id,
        response_type: responseType
      });

    // Remove from available events
    setAvailableSOSEvents(prev => prev.filter(event => event.id !== eventId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Volunteer Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {isVolunteer ? 'You are registered as a volunteer' : 'Join as a volunteer to help others'}
            </p>
            {isVolunteer && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Available for emergency responses
              </p>
            )}
          </div>
          <button
            onClick={toggleVolunteerStatus}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isVolunteer
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isVolunteer ? 'Disable' : 'Become Volunteer'}
          </button>
        </div>
      </div>

      {isVolunteer && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Emergencies Near You</h3>
          
          {availableSOSEvents.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
              <div className="text-gray-400 mb-2">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No active emergencies in your area</p>
              <p className="text-sm text-gray-400 mt-1">
                We'll notify you when someone needs help nearby
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSOSEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {event.type === 'Health' && <Heart className="h-5 w-5 text-red-500" />}
                      {event.type === 'Fire' && <Flame className="h-5 w-5 text-orange-500" />}
                      {event.type === 'Theft/Threat' && <Shield className="h-5 w-5 text-purple-500" />}
                      {event.type === 'Other' && <HelpCircle className="h-5 w-5 text-gray-500" />}
                      <span className="font-medium">{event.type} Emergency</span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                        {event.locationName || event.address || 'Getting location...'}
                      </p>
                      <button
                        onClick={() => window.open(generateGoogleMapsUrl(event.latitude, event.longitude, `${event.type} Emergency`), '_blank')}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Map
                      </button>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => respondToSOS(event.id, 'accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Accept & Respond
                    </button>
                    <button
                      onClick={() => respondToSOS(event.id, 'declined')}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};