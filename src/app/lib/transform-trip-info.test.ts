import { describe, it, expect } from 'vitest';
import { getBusStatus, mapTripData } from './transform-trip-info';

describe('transform-trip-info', () => {
  describe('getBusStatus', () => {
    const baseStop = {
      location: {
        name: 'Test Stop',
        lat: 51.5074,
        lon: -0.1278,
      },
      arrival: {
        scheduled: '2025-05-05T10:00:00Z',
        estimated: '2025-05-05T10:00:00Z',
        actual: null,
      },
      departure: {
        scheduled: '2025-05-05T10:05:00Z',
        estimated: '2025-05-05T10:05:00Z',
        actual: null,
      },
      skipped: false,
      allow_boarding: true,
      allow_drop_off: true,
    };

    it('returns past status for skipped stops', () => {
      const skippedStop = { ...baseStop, skipped: true } as any;
      const result = getBusStatus(skippedStop);

      expect(result).toEqual({
        status: 'past',
        description: 'Skipped',
        color: '#808080',
      });
    });

    it('returns unknown status for missing estimated time', () => {
      const noEstimateStop = {
        ...baseStop,
        arrival: { ...baseStop.arrival, estimated: null },
      } as any;
      const result = getBusStatus(noEstimateStop);

      expect(result).toEqual({
        status: 'unknown',
        description: 'TBD',
        color: '#808080',
      });
    });

    it('returns past status for stops with actual arrival time', () => {
      const completedStop = {
        ...baseStop,
        arrival: { ...baseStop.arrival, actual: '2025-05-05T10:02:00Z' },
      } as any;
      const result = getBusStatus(completedStop);

      expect(result).toEqual({
        status: 'past',
        description: 'Past',
        color: '#808080',
      });
    });

    it('returns on-time status when within 1 minute of schedule', () => {
      const onTimeStop = {
        ...baseStop,
        arrival: {
          ...baseStop.arrival,
          estimated: '2025-05-05T10:00:30Z',
        },
      } as any;
      const result = getBusStatus(onTimeStop);

      expect(result).toEqual({
        status: 'on-time',
        description: 'On Time',
        color: '#4CAF50',
      });
    });

    it('returns early status when ahead of schedule', () => {
      const earlyStop = {
        ...baseStop,
        arrival: {
          ...baseStop.arrival,
          estimated: '2025-05-05T09:55:00Z',
        },
      } as any;
      const result = getBusStatus(earlyStop);

      expect(result).toEqual({
        status: 'early',
        description: '5 minutes early',
        color: '#2196F3',
      });
    });

    it('returns delayed status when behind schedule', () => {
      const delayedStop = {
        ...baseStop,
        arrival: {
          ...baseStop.arrival,
          estimated: '2025-05-05T10:10:00Z',
        },
      } as any;
      const result = getBusStatus(delayedStop);

      expect(result).toEqual({
        status: 'delayed',
        description: '10 minutes late',
        color: '#F44336',
      });
    });
  });

  describe('mapTripData', () => {
    const mockApiResponse: BusRouteResponse = {
      description: {
        route_number: '123',
        calendar_date: '2025-05-05',
        is_cancelled: false,
        pattern_id: 1,
        route_id: 1,
        type: 'public',
      },
      route: [
        {
          location: {
            name: 'First Stop',
            lat: 51.5074,
            lon: -0.1278,
          },
          arrival: {
            scheduled: '2025-05-05T10:00:00Z',
            estimated: '2025-05-05T10:00:00Z',
            actual: '2025-05-05T10:02:00Z',
          },
          departure: {
            scheduled: '2025-05-05T10:05:00Z',
            estimated: '2025-05-05T10:05:00Z',
            actual: '2025-05-05T10:07:00Z',
          },
          skipped: false,
          allow_boarding: true,
          allow_drop_off: true,
        },
        {
          location: {
            name: 'Second Stop',
            lat: 51.5075,
            lon: -0.1279,
          },
          arrival: {
            scheduled: '2025-05-05T10:15:00Z',
            estimated: '2025-05-05T10:25:00Z',
            actual: null,
          },
          departure: {
            scheduled: '2025-05-05T10:20:00Z',
            estimated: '2025-05-05T10:30:00Z',
            actual: null,
          },
          skipped: false,
          allow_boarding: true,
          allow_drop_off: true,
        },
      ] as any,
      vehicle: {
        gps: {
          latitude: 51.5074,
          longitude: -0.1278,
          last_updated: '2025-05-05T10:00:00Z',
          heading: 0,
        },
        plate_number: 'ABC123',
        type: 'Bus',
        has_toilet: true,
        has_wifi: true,
        wheelchair: 0,
        bicycle: 0,
        seat: 0,
        id: 1,
        name: 'Test Bus',
        brand: 'Test Brand',
        colour: 'Blue',
        is_backup_vehicle: false,
        owner_id: 1,
      },
    };

    it('transforms API response into correct format', () => {
      const result = mapTripData(mockApiResponse);

      expect(result).toEqual({
        title: 'Route 123 - 2025-05-05',
        is_cancelled: false,
        stops: [
          expect.objectContaining({
            stopNumber: 1,
            name: 'First Stop',
            location: {
              latitude: 51.5074,
              longitude: -0.1278,
            },
            is_next_stop: false,
          }),
          expect.objectContaining({
            stopNumber: 2,
            name: 'Second Stop',
            location: {
              latitude: 51.5075,
              longitude: -0.1279,
            },
            is_next_stop: true,
          }),
        ],
        path: [
          { latitude: 51.5074, longitude: -0.1278 },
          { latitude: 51.5075, longitude: -0.1279 },
        ],
        vehicle: mockApiResponse.vehicle,
      });
    });

    it('correctly identifies next stop', () => {
      const result = mapTripData(mockApiResponse);
      expect(result.stops[0].is_next_stop).toBe(false);
      expect(result.stops[1].is_next_stop).toBe(true);
    });

    it('handles cancelled routes', () => {
      const cancelledRoute = {
        ...mockApiResponse,
        description: {
          ...mockApiResponse.description,
          is_cancelled: true,
        },
      };

      const result = mapTripData(cancelledRoute);
      expect(result.is_cancelled).toBe(true);
    });

    it('preserves vehicle information', () => {
      const result = mapTripData(mockApiResponse);
      expect(result.vehicle).toEqual(mockApiResponse.vehicle);
    });
  });
});
