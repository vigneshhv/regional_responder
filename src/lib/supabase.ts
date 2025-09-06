import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// For demo purposes, we'll create a mock client if env vars are missing
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = isDemoMode 
  ? createMockSupabaseClient() 
  : createClient(supabaseUrl, supabaseAnonKey);

// Mock Supabase client for demo purposes
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          order: () => ({
            limit: () => ({
              single: () => Promise.resolve({ data: null, error: null })
            }),
            ascending: () => Promise.resolve({ data: [], error: null })
          })
        }),
        order: () => ({
          ascending: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'demo-id' }, error: null })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      }),
      upsert: () => Promise.resolve({ error: null })
    })
  } as any;
}

// Geolocation helpers
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};