export interface MarkerConfig {
  position: google.maps.LatLngLiteral;
  title: string;
  content: HTMLElement;
  onClick?: () => void;
}

export const initializeMap = (
  mapId: string,
  center: google.maps.LatLng
): google.maps.Map => {
  return new google.maps.Map(document.getElementById('map')!, {
    center,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    streetViewControl: true,
    zoomControl: true,
    fullscreenControl: true,
    mapId,
  });
};

export const drawRoutePath = (
  mapInstance: google.maps.Map,
  path: google.maps.LatLngLiteral[]
): google.maps.Polyline => {
  const routePath = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: '#0088FF',
    strokeOpacity: 0.8,
    strokeWeight: 4,
  });

  routePath.setMap(mapInstance);
  return routePath;
};

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
