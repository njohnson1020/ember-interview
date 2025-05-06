'use client';

import { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/app/hooks/google-maps-hook';
import { RouteInfo } from './route-info';
import { StopDetail } from './stop-detail';
import {
  calculateBounds,
  createMarker,
  drawRoutePath,
  initializeMap,
} from '@/app/utils/map-utils';
import { createInfoWindowContent } from '../utils/info-window-utils';

interface BusRouteMapProps {
  tripData: TripData;
  googleMapsApiKey: string;
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
    const bounds = calculateBounds(tripData.stops);
    const mapInstance = initializeMap('ember-map', bounds.getCenter());
    mapInstance.fitBounds(bounds);

    mapRef.current = mapInstance;

    const path = tripData.path.map(
      (point): google.maps.LatLngLiteral => ({
        lat: point.latitude,
        lng: point.longitude,
      })
    );
    const routePath = drawRoutePath(mapInstance, path);
    routePathRef.current = routePath;

    createStopMarkers(mapInstance);
    createVehicleMarker(mapInstance);

    return cleanupMap;
  }, [mapsLoaded, tripData.stops]);

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
