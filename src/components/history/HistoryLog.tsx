import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Heart, Flame, Shield, HelpCircle, CheckCircle, X, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateGoogleMapsUrl, reverseGeocode } from '../../lib/maps';
import { SOSEvent } from '../../types';

interface SOSEventWithLocation extends SOSEvent {
  locationName?: string;
}

export const HistoryLog: React.FC = () => {
  const [events, setEvents] = useState<SOSEventWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserSOSHistory();
  }, [user]);

  const fetchUserSOSHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('sos_events')
      .select('*')
      .eq('user_id', user.id)
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
      setEvents(eventsWithLocation);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Health': return <Heart className="h-5 w-5 text-red-500" />;
      case 'Fire': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'Theft/Threat': return <Shield className="h-5 w-5 text-purple-500" />;
      case 'Other': return <HelpCircle className="h-5 w-5 text-gray-500" />;
      default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
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
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Emergency History</h2>
        <p className="text-gray-600">Your past SOS events and responses</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
          <div className="text-gray-400 mb-2">
            <Clock className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">No emergency events yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your SOS history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(event.type)}
                  <div>
                    <h3 className="font-medium">{event.type} Emergency</h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {event.address || `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(generateGoogleMapsUrl(event.latitude, event.longitude, `${event.type} Emergency - ${new Date(event.created_at).toLocaleDateString()}`), '_blank')}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Map
                  </button>
                </div>

                {event.description && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm">{event.description}</p>
                  </div>
                )}

                {event.resolved_at && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>
                      Resolved at {new Date(event.resolved_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};