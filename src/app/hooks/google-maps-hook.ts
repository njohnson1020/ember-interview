import { useEffect, useState } from 'react';

export const useGoogleMaps = (apiKey: string) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    googleMapsScript.setAttribute('loading', 'async');
    googleMapsScript.onload = () => setLoaded(true);
    document.head.appendChild(googleMapsScript);

    return () => {
      document.head.removeChild(googleMapsScript);
    };
  }, [apiKey]);

  return loaded;
};
