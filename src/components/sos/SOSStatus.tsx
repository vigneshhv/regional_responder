import React, { useState, useEffect } from 'react';
import { CheckCircle, X, MapPin, Phone, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateGoogleMapsUrl, reverseGeocode } from '../../lib/maps';
import { SOSEvent, VolunteerResponse } from '../../types';

interface SOSStatusProps {
  activeEvent: SOSEvent | null;
  onEventResolved: () => void;
}

export const SOSStatus: React.FC<SOSStatusProps> = ({ activeEvent, onEventResolved }) => {
  const [responses, setResponses] = useState<(VolunteerResponse & { volunteer_name?: string; volunteer_phone?: string })[]>([]);

  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (activeEvent) {
      fetchResponses();
      const interval = setInterval(fetchResponses, 5000); // Poll every 5 seconds
      getLocationName();
      return () => clearInterval(interval);
    }
  }, [activeEvent]);

  const fetchResponses = async () => {
    
    if (!activeEvent) return;

const { data } = await supabase
  .from('volunteer_responses')
  .select('*')
  .eq('sos_event_id', activeEvent.id)
  .eq('response_type', 'accepted');

setResponses(data || []);

    if (data) {
      interface SupabaseVolunteerProfiles {
        name?: string | null;
        phone?: string | null;
      }

      interface SupabaseVolunteer {
        user_profiles?: SupabaseVolunteerProfiles | null;
      }

      interface SupabaseResponseRow extends VolunteerResponse {
        volunteers?: SupabaseVolunteer | null;
      }

const formattedResponses = (data as any[]).map((response) => ({
  ...response,
  volunteer_name: response.volunteers?.user_profiles?.name || 'Unknown Volunteer',
  volunteer_phone: response.volunteers?.user_profiles?.phone || ''
}));
console.log("formattedResponses", formattedResponses);
setResponses(formattedResponses);


    }
  };
  

  const getLocationName = async () => {
    if (!activeEvent) return;
    
    try {
      const name = await reverseGeocode(activeEvent.latitude, activeEvent.longitude);
      setLocationName(name);
    } catch (error) {
      setLocationName(`${activeEvent.latitude.toFixed(4)}, ${activeEvent.longitude.toFixed(4)}`);
    }
  };

  const resolveEvent = async () => {
    if (!activeEvent || !user) return;

    setLoading(true);
    const { error } = await supabase
      .from('sos_events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', activeEvent.id);

    if (!error) {
      onEventResolved();
    }
    setLoading(false);
  };

  const cancelEvent = async () => {
    if (!activeEvent || !user) return;

    setLoading(true);
    const { error } = await supabase
      .from('sos_events')
      .update({
        status: 'cancelled',
        resolved_at: new Date().toISOString()
      })
      .eq('id', activeEvent.id);

    if (!error) {
      onEventResolved();
    }
    setLoading(false);
  };

  if (!activeEvent) return null;

  const timeElapsed = Math.floor((Date.now() - new Date(activeEvent.created_at).getTime()) / 1000 / 60);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-xl font-semibold text-red-700">SOS Active</h2>
        <p className="text-gray-600">{activeEvent.type} Emergency</p>
        <div className="flex items-center justify-center text-sm text-gray-500 mt-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>{timeElapsed} minutes ago</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{locationName || activeEvent.address || 'Getting location...'}</span>
          </div>
          <button
            onClick={() => window.open(generateGoogleMapsUrl(activeEvent.latitude, activeEvent.longitude, `${activeEvent.type} Emergency`), '_blank')}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Map
          </button>
        </div>

        {activeEvent.description && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">{activeEvent.description}</p>
          </div>
        )}
      </div>

      {/* Volunteer Responses */}
      {responses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-green-700">
            ✓ {responses.length} Volunteer{responses.length > 1 ? 's' : ''} Responding
          </h3>
          <div className="space-y-2">
            {responses.map((response: VolunteerResponse & { volunteer_name?: string; volunteer_phone?: string }) => (
              <div key={response.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">{response.volunteer_name}</p>
                  {response.estimated_arrival && (
                    <p className="text-sm text-green-600">ETA: {response.estimated_arrival}</p>
                  )}
                  {response.message && (
                    <p className="text-sm text-gray-600 mt-1">{response.message}</p>
                  )}
                </div>
                <div className="flex space-x-2">
         {responses.map((response) => (
  <div key={response.id}>
    <p>{response.volunteer_name || 'Unknown Volunteer'}</p>
    {response.volunteer_phone && (
      <button onClick={() => window.location.href = `tel:${response.volunteer_phone}`}>
        📞
      </button>
    )}
  </div>
))}


                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={resolveEvent}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Mark Resolved
        </button>
        <button
          onClick={cancelEvent}
          disabled={loading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <X className="h-5 w-5 mr-2" />
          Cancel
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm text-center">
          📞 Emergency services have been notified automatically
        </p>
      </div>
    </div>
  );
};
