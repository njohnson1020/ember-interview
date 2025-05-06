import { Suspense } from 'react';
import { getBusRouteData } from './actions/fetch-bus-route';
import { BusRouteMap } from './components/bus-route-map';

type PageProps = {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BusRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const routeIdParam = (await searchParams).routeId;

  const tripData = await getBusRouteData(
    routeIdParam ? String(routeIdParam) : ''
  );

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
            <div className="text-red-500">No route data available</div>
          )}
        </>
      </Suspense>
    </div>
  );
}
