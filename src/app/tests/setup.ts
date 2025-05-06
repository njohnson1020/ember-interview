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
