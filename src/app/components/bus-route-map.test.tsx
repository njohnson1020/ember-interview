import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BusRouteMap } from './bus-route-map';
import { useGoogleMaps } from '@/app/hooks/google-maps-hook';
import {
  createMarker,
  initializeMap,
  calculateBounds,
  drawRoutePath,
} from '@/app/utils/map-utils';
import { Mock } from 'vitest';

globalThis.google = {
  maps: {
    Map: vi.fn(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    })),
    Marker: vi.fn(() => ({
      setMap: vi.fn(),
      addListener: vi.fn(),
    })),
    Polyline: vi.fn(() => ({
      setMap: vi.fn(),
    })),
    LatLngBounds: vi.fn(() => ({
      extend: vi.fn(),
      getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
    })),
    LatLng: vi.fn((lat, lng) => ({ lat, lng })),
  },
} as any;

vi.mock('@/app/hooks/google-maps-hook', () => ({
  useGoogleMaps: vi.fn(),
}));

vi.mock('@/app/utils/map-utils', () => ({
  createMarker: vi.fn((mapInstance, config) => {
    const marker = {
      setMap: vi.fn(),
      addListener: vi.fn((event, handler) => {
        if (event === 'click') {
          markerClickHandler = handler;
        }
      }),
    };
    // Immediately invoke the click handler if onClick is provided
    if (config.onClick) {
      config.onClick();
    }
    return marker;
  }),
  initializeMap: vi.fn(() => ({
    fitBounds: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
  })),
  calculateBounds: vi.fn(),
  drawRoutePath: vi.fn(() => ({
    setMap: vi.fn(),
  })),
}));

let markerClickHandler: (() => void) | null = null;

beforeEach(() => {
  vi.clearAllMocks();

  (useGoogleMaps as Mock).mockReturnValue(true);
  (calculateBounds as Mock).mockReturnValue({
    getCenter: () => ({ lat: 0, lng: 0 }),
  });

  global.google = {
    maps: {
      Polyline: vi.fn().mockImplementation(() => ({
        setMap: vi.fn(),
        getPath: vi.fn(() => ({
          push: vi.fn(),
        })),
      })),
      InfoWindow: vi.fn().mockImplementation(() => ({
        open: vi.fn(),
        close: vi.fn(),
        setContent: vi.fn(),
        setPosition: vi.fn(),
        addListener: vi.fn(),
      })),
      Marker: vi.fn().mockImplementation(() => {
        return {
          setMap: vi.fn(),
          addListener: vi.fn((event, handler) => {
            console.log('hit listener');
            if (event === 'click') {
              markerClickHandler = handler;
            }
          }),
        };
      }),
    },
  } as any;

  vi.clearAllMocks();
});

const mockTripData: TripData = {
  title: 'Test Route',
  is_cancelled: false,
  stops: [
    {
      stopNumber: 1,
      name: 'First Stop',
      location: { latitude: 51.5074, longitude: -0.1278 },
      arrival: { scheduled: '2025-05-05T10:00:00Z' },
      departure: { scheduled: '2025-05-05T10:05:00Z' },
      busStatus: {
        status: 'on-time',
        color: '#4CAF50',
        description: 'On Time',
      },
      allow_boarding: true,
      allow_drop_off: true,
      is_next_stop: true,
    },
    {
      stopNumber: 2,
      name: 'Second Stop',
      location: { latitude: 51.5074, longitude: -0.1278 },
      arrival: { scheduled: '2025-05-05T10:15:00Z' },
      departure: { scheduled: '2025-05-05T10:20:00Z' },
      busStatus: {
        status: 'delayed',
        color: '#F44336',
        description: 'Delayed',
      },
      allow_boarding: true,
      allow_drop_off: true,
      is_next_stop: false,
    },
  ],
  path: [
    { latitude: 51.5074, longitude: -0.1278 },
    { latitude: 51.5074, longitude: -0.1278 },
  ],
  vehicle: {
    gps: {
      latitude: 51.5074,
      longitude: -0.1278,
      last_updated: '2025-05-05T10:10:00Z',
      heading: 0,
    },
    plate_number: 'TEST123',
    type: 'Bus',
    has_toilet: true,
    has_wifi: true,
    wheelchair: 0,
    bicycle: 0,
    seat: 0,
    id: 0,
    name: '',
    brand: '',
    colour: '',
    is_backup_vehicle: false,
    owner_id: 0,
  },
};

describe('BusRouteMap', () => {
  it('renders the map container', () => {
    render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('initializes map when Google Maps is loaded', async () => {
    render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    await waitFor(() => {
      expect(initializeMap).toHaveBeenCalledWith(
        'ember-map',
        expect.any(Object)
      );
    });
  });

  it('creates markers for all stops', async () => {
    render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    await waitFor(() => {
      expect(createMarker).toHaveBeenCalledTimes(mockTripData.stops.length + 1); // +1 for vehicle marker
    });
  });

  it('displays stop details when a stop is selected', async () => {
    render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    await waitFor(() => {
      expect(createMarker).toHaveBeenCalled();
    });

    const markerCalls = (createMarker as Mock).mock.calls;
    const firstStopMarkerConfig = markerCalls.find(
      ([_, config]) => config.onClick
    )?.[1];

    firstStopMarkerConfig?.onClick();

    await waitFor(() => {
      expect(screen.queryByText('First Stop')).toBeInTheDocument();
      expect(screen.queryByText(/Scheduled:/)).toBeInTheDocument();
    });
  });

  it('cleans up markers and polyline on unmount', async () => {
    const { unmount } = render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    await waitFor(() => {
      expect(initializeMap).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(drawRoutePath).toHaveBeenCalled();
    });

    const polylineInstance = (drawRoutePath as Mock).mock.results[0].value;

    unmount();

    expect(polylineInstance.setMap).toHaveBeenCalledWith(null);
  });

  it('does not initialize map when Google Maps is not loaded', () => {
    (useGoogleMaps as Mock).mockReturnValue(false);

    render(
      <BusRouteMap tripData={mockTripData} googleMapsApiKey="test-api-key" />
    );

    expect(initializeMap).not.toHaveBeenCalled();
  });
});
