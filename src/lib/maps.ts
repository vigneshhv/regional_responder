// Google Maps integration utilities
export const generateGoogleMapsUrl = (lat: number, lng: number, label?: string): string => {
  const baseUrl = 'https://www.google.com/maps';
  const params = new URLSearchParams({
    q: `${lat},${lng}`,
    ...(label && { query: label })
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateGoogleMapsDirectionsUrl = (
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number
): string => {
  const baseUrl = 'https://www.google.com/maps/dir';
  return `${baseUrl}/${fromLat},${fromLng}/${toLat},${toLng}`;
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using a free geocoding service (in production, use Google Maps Geocoding API)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.display_name || data.locality || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
  
  // Fallback to coordinates
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};