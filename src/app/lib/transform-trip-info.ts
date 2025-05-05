import {
  getTimeDifferenceInMinutes,
  isValidDate,
} from '@/app/utils/date-utils';

/**
 * Determines the bus status based on route point data
 * @param stop - Route point information
 * @returns Bus status object
 */
const getBusStatus = (stop: RoutePoint): BusStatus => {
  if (stop.skipped) {
    return {
      status: 'past',
      description: 'Skipped',
      color: '#808080',
    };
  }

  if (
    !stop.arrival.estimated ||
    !isValidDate(stop.arrival.estimated) ||
    !isValidDate(stop.arrival.scheduled)
  ) {
    return {
      status: 'unknown',
      description: 'TBD',
      color: '#808080',
    };
  }

  if (stop.arrival.actual) {
    return {
      status: 'past',
      description: 'Past',
      color: '#808080',
    };
  }

  const scheduledDate = new Date(stop.arrival.scheduled);
  const estimatedDate = new Date(stop.arrival.estimated);
  const timeDiff = getTimeDifferenceInMinutes(scheduledDate, estimatedDate);
  const absTimeDiff = Math.abs(timeDiff);

  if (absTimeDiff <= 1) {
    return {
      status: 'on-time',
      description: 'On Time',
      color: '#4CAF50',
    };
  }

  return timeDiff > 0
    ? {
        status: 'early',
        description: `${absTimeDiff} minutes early`,
        color: '#2196F3',
      }
    : {
        status: 'delayed',
        description: `${absTimeDiff} minutes late`,
        color: '#F44336',
      };
};

/**
 * Transforms API data into application-friendly format
 * @param apiData - Raw API response data
 * @returns Transformed trip data
 */
export const mapTripData = (apiData: BusRouteResponse): TripData => {
  let foundNextStop = false;

  const stops = apiData.route.map((point, idx): RouteStop => {
    const isNextStop =
      !foundNextStop && !point.arrival.actual && !point.skipped;

    if (isNextStop) {
      foundNextStop = true;
    }

    return {
      stopNumber: idx + 1,
      name: point.location.name,
      location: {
        latitude: point.location.lat,
        longitude: point.location.lon,
      },
      arrival: point.arrival,
      departure: point.departure,
      busStatus: getBusStatus(point),
      allow_boarding: point.allow_boarding,
      allow_drop_off: point.allow_drop_off,
      is_next_stop: isNextStop,
    };
  });

  const path = apiData.route.map(
    (point): GeoPoint => ({
      latitude: point.location.lat,
      longitude: point.location.lon,
    })
  );

  return {
    title: `Route ${apiData.description.route_number} - ${apiData.description.calendar_date}`,
    is_cancelled: apiData.description.is_cancelled,
    stops,
    path,
    vehicle: apiData.vehicle,
  };
};
