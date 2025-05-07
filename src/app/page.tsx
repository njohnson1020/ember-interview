import { Suspense } from 'react';
import { getBusRouteData } from './actions/fetch-bus-route';
import { BusRouteMap } from './components/bus-route-map';
import { headers } from 'next/headers';

type PageProps = {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BusRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  const tripIdParam = (await searchParams).tripId;

  const tripData = tripIdParam
    ? await getBusRouteData(tripIdParam ? String(tripIdParam) : '')
    : undefined;

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Loading map...</div>}>
        <>
          {tripData ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">{tripData.title}</h1>
              <div className="mb-4 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold">Vehicle Information</h2>
                <p>
                  <strong>Vehicle Plate:</strong>{' '}
                  {tripData.vehicle.plate_number}
                </p>
                <p>
                  <strong>Type:</strong> {tripData.vehicle.type}
                </p>
                <p>
                  <strong>Has Toilet:</strong>{' '}
                  {tripData.vehicle.has_toilet ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Has Wifi:</strong>{' '}
                  {tripData.vehicle.has_wifi ? 'Yes' : 'No'}
                </p>
              </div>
              <BusRouteMap
                googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}
                tripData={tripData}
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                No Route Data Available
              </h2>
              <p className="text-gray-700 mb-4">
                Please provide a valid trip ID in the URL query parameters.
              </p>
              <div className="bg-white p-4 rounded shadow-sm font-mono text-sm space-y-2">
                <p className="text-gray-600">Example URL:</p>
                <code className="text-blue-600 block">
                  {`${protocol}://${host}?tripId=123`}
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  Replace "123" with your actual trip ID
                </p>
              </div>
            </div>
          )}
        </>
      </Suspense>
    </div>
  );
}
