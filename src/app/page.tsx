import { TripInfo } from './components/trip-info';

export default async function BusRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const tripIdParam = (await searchParams).tripId;

  return (
    <div className="container mx-auto p-4">
      <TripInfo tripId={tripIdParam as string} />
    </div>
  );
}
