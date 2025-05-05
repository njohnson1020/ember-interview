'use server';

import { mapTripData, TripData } from '@/app/lib/transform-trip-info';

export const getBusRouteData = async (
  routeId: string
): Promise<TripData | undefined> => {
  try {
    const data = await fetchTripData(routeId);

    if (!data) {
      console.error('No data found for the given route ID');
      return undefined;
    }

    return mapTripData(data);
  } catch (error) {
    console.error('Error fetching bus route data:', error);
  }
};

const fetchTripData = async (
  routeId: string
): Promise<BusRouteResponse | undefined> => {
  const response = await fetch(`https://api.ember.to/v1/trips/${routeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  return response.json();
};
