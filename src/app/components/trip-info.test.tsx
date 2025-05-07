import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TripInfo } from './trip-info';
import { getBusRouteData } from '../actions/fetch-bus-route';
import { BusRouteMap } from './bus-route-map';
import { headers } from 'next/headers';
import { Suspense } from 'react';

vi.mock('../actions/fetch-bus-route');
vi.mock('./bus-route-map', () => ({
  BusRouteMap: vi.fn(),
}));
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.stubEnv('NODE_ENV', 'development');
vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-api-key');

const mockTripData = {
  id: '123',
  title: 'New York to Boston',
  vehicle: {
    plate_number: 'ABC123',
    type: 'Coach',
    has_toilet: true,
    has_wifi: false,
  },
  route: {
    stops: [
      { name: 'New York', location: { lat: 40.7128, lng: -74.006 } },
      { name: 'Boston', location: { lat: 42.3601, lng: -71.0589 } },
    ],
  },
} as any;

const mockHeadersList = {
  get: vi.fn((name) => {
    if (name === 'host') return 'test.example.com';
    return null;
  }),
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(headers).mockReturnValue(mockHeadersList);
});

describe('TripInfo Component', () => {
  it('renders trip information when tripId is provided', async () => {
    vi.mocked(getBusRouteData).mockResolvedValue(mockTripData);

    render(await TripInfo({ tripId: '123' }));

    expect(headers).toHaveBeenCalled();
    expect(mockHeadersList.get).toHaveBeenCalledWith('host');

    // Check if the title is rendered
    expect(screen.getByText('New York to Boston')).toBeDefined();

    // Check if vehicle information is rendered
    expect(screen.getByText('Vehicle Information')).toBeDefined();
    expect(screen.getByText(/ABC123/)).toBeDefined();
    expect(screen.getByText(/Coach/)).toBeDefined();
    expect(screen.getByText(/Yes/)).toBeDefined(); // has_toilet
    expect(screen.getByText(/No/)).toBeDefined(); // has_wifi

    // Check if the map component is rendered
    const busRouteMapCalls = vi.mocked(BusRouteMap).mock.calls;
    expect(busRouteMapCalls.length).toBeGreaterThan(0);

    const firstCallProps = busRouteMapCalls[0][0];
    expect(firstCallProps).toHaveProperty('tripData', mockTripData);
    expect(firstCallProps).toHaveProperty('googleMapsApiKey');
  });

  it('renders "No Route Data Available" when tripId is not provided', async () => {
    render(await TripInfo({ tripId: '' }));

    expect(screen.getByText('No Route Data Available')).toBeDefined();
    expect(
      screen.getByText(
        'Please provide a valid trip ID in the URL query parameters.'
      )
    ).toBeDefined();

    expect(screen.getByText('Example URL:')).toBeDefined();
    expect(
      screen.getByText('http://test.example.com?tripId=123')
    ).toBeDefined();

    // Ensure the map component is not rendered
    expect(BusRouteMap).not.toHaveBeenCalled();
  });

  it('uses https protocol in production environment', async () => {
    // Change NODE_ENV to production temporarily
    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    vi.mocked(getBusRouteData).mockResolvedValue(undefined);

    render(await TripInfo({ tripId: '' }));

    expect(
      screen.getByText('https://test.example.com?tripId=123')
    ).toBeDefined();

    vi.stubEnv('NODE_ENV', originalNodeEnv || 'development');
  });

  it('renders loading state before trip data is loaded', async () => {
    // This test is tricky because Suspense works differently in test environments
    // We need to create a wrapper component to properly test Suspense

    // Mock the getBusRouteData function to return a never-resolving promise
    // This will keep the component in a perpetual loading state
    const neverResolvingPromise = new Promise(() => {}) as any;
    vi.mocked(getBusRouteData).mockReturnValue(neverResolvingPromise);

    const { findByText } = render(
      <Suspense fallback={<div>Loading map...</div>}>
        <TripInfo tripId="123" />
      </Suspense>
    );

    // This should find the fallback content
    const loadingText = await findByText('Loading map...');
    expect(loadingText).toBeDefined();
  });

  it('handles error when fetching trip data fails', async () => {
    vi.mocked(getBusRouteData).mockRejectedValue(
      new Error('Failed to fetch trip data')
    );

    // Spy on console.error to silence the expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(async () => {
      await TripInfo({ tripId: '123' });
    }).rejects.toThrow('Failed to fetch trip data');

    consoleSpy.mockRestore();
  });

  it('handles case when getBusRouteData returns null or undefined', async () => {
    vi.mocked(getBusRouteData).mockResolvedValue(undefined);

    render(await TripInfo({ tripId: '123' }));

    expect(screen.getByText('No Route Data Available')).toBeDefined();
  });

  it('uses localhost:3000 as default host when headers.get returns null', async () => {
    const nullHostHeaders = {
      get: vi.fn(() => null),
    } as any;
    vi.mocked(headers).mockReturnValue(nullHostHeaders);

    vi.mocked(getBusRouteData).mockResolvedValue(undefined);

    render(await TripInfo({ tripId: '' }));

    // Check if the example URL uses the default host
    expect(screen.getByText('http://localhost:3000?tripId=123')).toBeDefined();
  });
});
