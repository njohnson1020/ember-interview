export interface MarkerConfig {
  position: google.maps.LatLngLiteral;
  title: string;
  content: HTMLElement;
  onClick?: () => void;
}

export const calculateBounds = (
  stops: RouteStop[]
): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();
  stops.forEach((stop) => {
    bounds.extend(
      new google.maps.LatLng(stop.location.latitude, stop.location.longitude)
    );
  });
  return bounds;
};

export const createMarker = (
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

  return marker;
};
