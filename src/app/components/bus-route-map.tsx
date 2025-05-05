'use client';

import { useState, useEffect, useRef } from 'react';
import { RouteStop, TripData } from '@/app/lib/transform-trip-info';
import { formatTime, getTimeDifferenceInMinutes, now } from '@/app/utils/date';
import { useGoogleMaps } from '@/app/hooks/google-maps-hook';
import { RouteInfo } from './route-info';
import { StopDetail } from './stop-detail';

interface BusRouteMapProps {
  tripData: TripData;
  googleMapsApiKey: string;
}

interface MarkerConfig {
  position: google.maps.LatLngLiteral;
  title: string;
  content: HTMLElement;
  onClick?: () => void;
}

export const BusRouteMap = ({
  tripData,
  googleMapsApiKey,
}: BusRouteMapProps) => {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const routePathRef = useRef<google.maps.Polyline | null>(null);
  const mapsLoaded = useGoogleMaps(googleMapsApiKey);

  useEffect(() => {
    if (!mapsLoaded || !tripData.stops.length) return;
    const bounds = calculateBounds();
    const mapInstance = initializeMap(bounds.getCenter());
    mapInstance.fitBounds(bounds);

    mapRef.current = mapInstance;

    const routePath = drawRoutePath(mapInstance);
    routePathRef.current = routePath;

    createStopMarkers(mapInstance);
    createVehicleMarker(mapInstance);

    return cleanupMap;
  }, [mapsLoaded, tripData.stops]);

  const initializeMap = (center: google.maps.LatLng): google.maps.Map => {
    return new google.maps.Map(document.getElementById('map')!, {
      center,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      zoomControl: true,
      fullscreenControl: true,
      mapId: 'ember-map',
    });
  };

  const calculateBounds = (): google.maps.LatLngBounds => {
    const bounds = new google.maps.LatLngBounds();
    tripData.stops.forEach((stop) => {
      bounds.extend(
        new google.maps.LatLng(stop.location.latitude, stop.location.longitude)
      );
    });
    return bounds;
  };

  const drawRoutePath = (
    mapInstance: google.maps.Map
  ): google.maps.Polyline => {
    const routePath = new google.maps.Polyline({
      path: tripData.path.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
      })),
      geodesic: true,
      strokeColor: '#0088FF',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    routePath.setMap(mapInstance);
    return routePath;
  };

  const createMarker = (
    mapInstance: google.maps.Map,
    config: MarkerConfig
  ): google.maps.marker.AdvancedMarkerElement => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: config.position,
      map: mapInstance,
      title: config.title,
      content: config.content,
    });

    if (config.onClick) {
      marker.addListener('click', config.onClick);
    }

    markersRef.current.push(marker);
    return marker;
  };

  const createStopMarkers = (mapInstance: google.maps.Map): void => {
    tripData.stops.forEach((stop) => {
      const markerPosition = {
        lat: stop.location.latitude,
        lng: stop.location.longitude,
      };

      const pinElement = createStopMarkerElement(stop);

      createMarker(mapInstance, {
        position: markerPosition,
        title: stop.name,
        content: pinElement,
        onClick: () => setSelectedStop(stop),
      });
    });
  };

  const createStopMarkerElement = (stop: RouteStop): HTMLDivElement => {
    const pinElement = document.createElement('div');
    pinElement.className = 'bus-stop-marker';
    pinElement.style.width = '24px';
    pinElement.style.height = '24px';
    pinElement.style.borderRadius = '50%';
    pinElement.style.backgroundColor = stop.busStatus.color;
    pinElement.style.border = '2px solid white';
    pinElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    pinElement.style.cursor = 'pointer';
    pinElement.style.display = 'flex';
    pinElement.style.alignItems = 'center';
    pinElement.style.justifyContent = 'center';
    pinElement.style.textAlign = 'center';
    pinElement.innerText = stop.stopNumber.toString();

    if (stop.is_next_stop) {
      addPulseAnimation(pinElement);
    }

    return pinElement;
  };

  const addPulseAnimation = (element: HTMLElement): void => {
    element.style.animation = 'pulse 1.5s infinite';
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  };

  const createVehicleMarker = (mapInstance: google.maps.Map): void => {
    const vehicleLocation = {
      lat: tripData.vehicle.gps.latitude,
      lng: tripData.vehicle.gps.longitude,
    };

    const vehiclePinElement = createVehicleMarkerElement();
    const nextStop = tripData.stops.find((stop) => stop.is_next_stop);

    const vehicleMarker = createMarker(mapInstance, {
      position: vehicleLocation,
      title: 'Vehicle Location',
      content: vehiclePinElement,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: createInfoWindowContent(tripData.vehicle.gps, nextStop),
    });

    vehicleMarker.addListener('click', () => {
      infoWindow.open(mapInstance, vehicleMarker);
    });
  };

  const createVehicleMarkerElement = (): HTMLDivElement => {
    const vehiclePinElement = document.createElement('div');
    vehiclePinElement.className = 'vehicle-marker';
    vehiclePinElement.style.width = '32px';
    vehiclePinElement.style.height = '32px';
    vehiclePinElement.style.borderRadius = '50%';
    vehiclePinElement.style.backgroundColor = 'blue';
    vehiclePinElement.style.border = '2px solid white';
    vehiclePinElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    vehiclePinElement.style.cursor = 'pointer';
    vehiclePinElement.style.display = 'flex';
    vehiclePinElement.style.alignItems = 'center';
    vehiclePinElement.style.justifyContent = 'center';
    vehiclePinElement.style.textAlign = 'center';
    vehiclePinElement.innerText = 'Bus';

    return vehiclePinElement;
  };

  const createInfoWindowContent = (
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

    const arrivalTimeDiff = nextStop
      ? getTimeDifferenceInMinutes(
          new Date(nextStop.arrival.scheduled),
          new Date(vehicleLocation.last_updated)
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
              ? `<strong>Scheduled Arrival:</strong> ${arrivalTimeDiff} min<br>`
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
          Last updated: ${formatTime(
            vehicleLocation.last_updated
          )} (${lastUpdatedTimeDiff} min ago)
          ${
            isOutdated
              ? '<div style="color: #ff6b6b; font-weight: bold; margin-top: 5px;">Please refresh for current location</div>'
              : ''
          }
        </div>
      </div>
    `;
  };

  const cleanupMap = (): void => {
    markersRef.current.forEach((marker) => (marker.map = null));
    if (routePathRef.current) routePathRef.current.setMap(null);
    markersRef.current = [];
    routePathRef.current = null;
  };

  return (
    <div
      className="flex flex-col md:flex-row gap-4"
      data-testid="bus-route-map"
    >
      <div
        id="map"
        className="h-96 md:h-screen md:w-2/3 rounded-lg shadow-lg bg-gray-100"
        data-testid="google-map"
      ></div>

      <div className="md:w-1/3">
        {selectedStop ? (
          <StopDetail
            stop={selectedStop}
            onClose={() => setSelectedStop(null)}
          />
        ) : (
          <RouteInfo stops={tripData.stops} onSelectStop={setSelectedStop} />
        )}
      </div>
    </div>
  );
};
