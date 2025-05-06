import { formatTime, getTimeDifferenceInMinutes, now } from './date-utils';

export const createInfoWindowContent = (
  vehicleLocation: GPS,
  nextStop?: RouteStop
): string => {
  const currentTime = now();
  const lastUpdated = new Date(vehicleLocation.last_updated);
  const lastUpdatedTimeDiff = getTimeDifferenceInMinutes(
    currentTime,
    lastUpdated
  );
  const isOutdated = Math.abs(lastUpdatedTimeDiff) >= 5;

  const arrivalTimeDiff =
    nextStop && nextStop.arrival.estimated
      ? getTimeDifferenceInMinutes(
          currentTime,
          new Date(nextStop.arrival.estimated)
        )
      : undefined;

  return `
    <div style="min-width: 200px; padding: 8px; color: black;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 16px;">Bus #42</strong>
        ${
          isOutdated
            ? `<span style="background-color: #ff6b6b; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
            OUTDATED
          </span>`
            : `<span style="background-color: #4CAF50; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
            LIVE
          </span>`
        }
      </div>
      <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
      ${
        nextStop
          ? `
        <strong>Next Stop:</strong> ${nextStop.name}<br>
        ${
          arrivalTimeDiff
            ? `<strong>Estimated Arrival:</strong> ${Math.abs(
                arrivalTimeDiff
              )} min<br>`
            : ''
        }
        <strong>GPS:</strong> ${nextStop.location.latitude.toFixed(
          5
        )}, ${nextStop.location.longitude.toFixed(5)}
      `
          : '<strong>Trip Complete</strong>'
      }
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: ${
        isOutdated ? '#ff6b6b' : '#777'
      };">
        Last updated: ${formatTime(vehicleLocation.last_updated)} (${Math.abs(
    lastUpdatedTimeDiff
  )} min ago)
        ${
          isOutdated
            ? '<div style="color: #ff6b6b; font-weight: bold; margin-top: 5px;">Please refresh for current location</div>'
            : ''
        }
      </div>
    </div>
  `;
};
