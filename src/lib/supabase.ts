import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

export const isDemoMode = !hasValidCredentials;

// Mock Supabase client for demo purposes
function createMockSupabaseClient() {
  let mockUsers: any[] = [];
  let mockProfiles: any[] = [];
  let mockSOSEvents: any[] = [];
  let mockVolunteers: any[] = [];
  let mockContacts: any[] = [];
  let mockResponses: any[] = [];
  let currentUser: any = null;

  return {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: currentUser ? { user: currentUser } : null }, 
        error: null 
      }),
      onAuthStateChange: (callback: any) => {
        // Simulate auth state changes
        setTimeout(() => callback('SIGNED_IN', currentUser ? { user: currentUser } : null), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signUp: async ({ email, password, options }: any) => {
        // Simulate email confirmation requirement
        const user = {
          id: `demo-${Date.now()}`,
          email,
          user_metadata: options?.data || {},
          email_confirmed_at: null // Not confirmed initially
        };
        mockUsers.push(user);
        return { 
          data: { user, session: null }, 
          error: null 
        };
      },
      signInWithPassword: async ({ email, password }: any) => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          // Simulate email confirmation check
          if (!user.email_confirmed_at) {
            return {
              data: { user: null, session: null },
              error: { message: 'Email not confirmed' }
            };
          }
          currentUser = user;
          return { 
            data: { user, session: { user } }, 
            error: null 
          };
        }
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid credentials' }
        };
      },
      signOut: () => {
        currentUser = null;
        return Promise.resolve({ error: null });
      }
    },
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: () => {
            let data = null;
            if (table === 'user_profiles') {
              data = mockProfiles.find(p => p[column] === value);
            } else if (table === 'volunteers') {
              data = mockVolunteers.find(v => v[column] === value);
            }
            return Promise.resolve({ 
              data, 
              error: data ? null : { code: 'PGRST116' } 
            });
          },
          order: (orderColumn: string, options?: any) => ({
            limit: (limitNum: number) => ({
              single: () => {
                let items: any[] = [];
                if (table === 'sos_events') {
                  items = mockSOSEvents.filter(e => e[column] === value);
                }
                const sorted = items.sort((a, b) => {
                  const aVal = new Date(a[orderColumn]).getTime();
                  const bVal = new Date(b[orderColumn]).getTime();
                  return options?.ascending ? aVal - bVal : bVal - aVal;
                });
                return Promise.resolve({ 
                  data: sorted[0] || null, 
                  error: null 
                });
              }
            }),
            ascending: () => {
              let items: any[] = [];
              if (table === 'sos_events') {
                items = mockSOSEvents.filter(e => e[column] === value);
              } else if (table === 'emergency_contacts') {
                items = mockContacts.filter(c => c[column] === value);
              }
              return Promise.resolve({ data: items, error: null });
            }
          })
        }),
        order: (orderColumn: string, options?: any) => ({
          ascending: () => {
            let items: any[] = [];
            if (table === 'sos_events') {
              items = [...mockSOSEvents];
            } else if (table === 'emergency_contacts') {
              items = [...mockContacts];
            }
            const sorted = items.sort((a, b) => {
              const aVal = new Date(a[orderColumn]).getTime();
              const bVal = new Date(b[orderColumn]).getTime();
              return options?.ascending ? aVal - bVal : bVal - aVal;
            });
            return Promise.resolve({ data: sorted, error: null });
          }
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => {
            const newItem = { 
              ...data, 
              id: `demo-${Date.now()}-${Math.random()}`,
              created_at: new Date().toISOString()
            };
            
            if (table === 'user_profiles') {
              mockProfiles.push(newItem);
            } else if (table === 'sos_events') {
              mockSOSEvents.push(newItem);
            } else if (table === 'volunteers') {
              mockVolunteers.push(newItem);
            } else if (table === 'emergency_contacts') {
              mockContacts.push(newItem);
            } else if (table === 'volunteer_responses') {
              mockResponses.push(newItem);
            }
            
            return Promise.resolve({ data: newItem, error: null });
          }
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          if (table === 'user_profiles') {
            const index = mockProfiles.findIndex(p => p[column] === value);
            if (index >= 0) {
              mockProfiles[index] = { ...mockProfiles[index], ...data };
            }
          } else if (table === 'sos_events') {
            const index = mockSOSEvents.findIndex(e => e[column] === value);
            if (index >= 0) {
              mockSOSEvents[index] = { ...mockSOSEvents[index], ...data };
            }
          }
          return Promise.resolve({ error: null });
        }
      }),
      delete: () => ({
        eq: (column: string, value: any) => {
          if (table === 'emergency_contacts') {
            const index = mockContacts.findIndex(c => c[column] === value);
            if (index >= 0) {
              mockContacts.splice(index, 1);
            }
          } else if (table === 'volunteers') {
            const index = mockVolunteers.findIndex(v => v[column] === value);
            if (index >= 0) {
              mockVolunteers.splice(index, 1);
            }
          }
          return Promise.resolve({ error: null });
        }
      }),
      upsert: (data: any) => {
        const newItem = { 
          ...data, 
          id: data.id || `demo-${Date.now()}-${Math.random()}`,
          created_at: data.created_at || new Date().toISOString()
        };
        
        if (table === 'user_profiles') {
          const index = mockProfiles.findIndex(p => p.user_id === data.user_id);
          if (index >= 0) {
            mockProfiles[index] = { ...mockProfiles[index], ...data };
          } else {
            mockProfiles.push(newItem);
          }
        }
        
        return Promise.resolve({ error: null });
      }
    }),
    channel: (name: string) => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({})
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