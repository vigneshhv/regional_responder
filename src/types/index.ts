export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  medical_info?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

export interface SOSEvent {
  id: string;
  user_id: string;
  type: 'Health' | 'Fire' | 'Theft/Threat' | 'Other';
  latitude: number;
  longitude: number;
  address?: string;
  status: 'active' | 'resolved' | 'cancelled';
  description?: string;
  created_at: string;
  resolved_at?: string;
}

export interface VolunteerResponse {
  id: string;
  sos_event_id: string;
  volunteer_id: string;
  response_type: 'accepted' | 'declined';
  estimated_arrival?: string;
  message?: string;
  created_at: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  is_available: boolean;
  max_range_meters: number;
  skills?: string[];
  created_at: string;
}