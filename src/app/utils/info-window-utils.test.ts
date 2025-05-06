import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInfoWindowContent } from './info-window-utils';

describe('info-window-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  vi.mock('@/app/utils/date-utils', async () => {
    const actual = await vi.importActual('@/app/utils/date-utils');
    return {
      ...actual,
      now: vi.fn(() => new Date('2025-05-05T10:00:00Z')),
    };
  });

  const mockGPS: GPS = {
    latitude: 51.5074,
    longitude: -0.1278,
    last_updated: '2025-05-05T09:58:00Z',
    heading: 0,
  };

  const mockNextStop: RouteStop = {
    stopNumber: 1,
    name: 'Test Stop',
    location: {
      latitude: 51.5075,
      longitude: -0.1279,
    },
    arrival: {
      scheduled: '2025-05-05T10:15:00Z',
      estimated: '2025-05-05T10:16:00Z',
    },
    departure: {
      scheduled: '2025-05-05T10:20:00Z',
    },
    busStatus: {
      status: 'on-time',
      color: '#4CAF50',
      description: 'On Time',
    },
    allow_boarding: true,
    allow_drop_off: true,
    is_next_stop: true,
  };

  it('shows live status when location is recent', () => {
    const content = createInfoWindowContent(mockGPS);
    expect(content).toContain('LIVE');
    expect(content).toContain('background-color: #4CAF50');
  });

  it('shows outdated status when location is old', () => {
    const oldGPS = {
      ...mockGPS,
      last_updated: '2025-05-05T09:50:00Z', // 10 minutes old
    };
    const content = createInfoWindowContent(oldGPS);
    expect(content).toContain('OUTDATED');
    expect(content).toContain('background-color: #ff6b6b');
    expect(content).toContain('Please refresh for current location');
  });

  it('displays next stop information when provided', () => {
    const content = createInfoWindowContent(mockGPS, mockNextStop);
    expect(content).toContain(
      `<strong>Next Stop:</strong> ${mockNextStop.name}`
    );
    expect(content).toContain('Estimated Arrival:');
    expect(content).toContain(`${mockNextStop.location.latitude.toFixed(5)}`);
  });

  it('does not display next stop information if no estimate', () => {
    const mockNextStopWithoutEstimate = {
      ...mockNextStop,
      arrival: {
        ...mockNextStop.arrival,
        estimated: null,
      },
    } as any;

    const content = createInfoWindowContent(
      mockGPS,
      mockNextStopWithoutEstimate
    );
    expect(content).toContain(
      `<strong>Next Stop:</strong> ${mockNextStopWithoutEstimate.name}`
    );
    expect(content).toContain(
      `${mockNextStopWithoutEstimate.location.latitude.toFixed(5)}`
    );
    expect(content).not.toContain('Estimated Arrival:');
  });

  it('shows trip complete when no next stop is provided', () => {
    const content = createInfoWindowContent(mockGPS);
    expect(content).toContain('Trip Complete');
    expect(content).not.toContain('Next Stop:');
  });

  it('formats time differences correctly', () => {
    const content = createInfoWindowContent(mockGPS, mockNextStop);
    expect(content).toContain('2 min ago'); // Based on mock times
  });

  it('includes GPS coordinates with correct precision', () => {
    const content = createInfoWindowContent(mockGPS, mockNextStop);
    const lat = mockNextStop.location.latitude.toFixed(5);
    const lng = mockNextStop.location.longitude.toFixed(5);
    expect(content).toContain(`${lat}, ${lng}`);
  });

  it('handles missing arrival time difference', () => {
    const stopWithNoSchedule = {
      ...mockNextStop,
      arrival: {
        scheduled: '',
        actual: null,
      },
    } as any;
    const content = createInfoWindowContent(mockGPS, stopWithNoSchedule);
    expect(content).not.toContain('Estimated Arrival:');
  });

  it('maintains consistent styling', () => {
    const content = createInfoWindowContent(mockGPS, mockNextStop);
    expect(content).toContain('style="min-width: 200px;');
    expect(content).toContain('style="display: flex;');
    expect(content).toContain('style="margin-top: 8px;');
  });
});
