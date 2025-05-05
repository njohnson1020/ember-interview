interface BusRouteResponse {
  route: RoutePoint[];
  vehicle: Vehicle;
  description: RouteDescription;
}

interface RoutePoint {
  id: number;
  departure: ScheduledTime;
  arrival: ScheduledTime;
  location: Location;
  allow_boarding: boolean;
  allow_drop_off: boolean;
  booking_cut_off_mins: number;
  pre_booked_only: boolean;
  skipped: boolean;
}

interface ScheduledTime {
  scheduled: string; // ISO 8601 date string
  estimated?: string | undefined; // ISO 8601 date string
  actual?: string | undefined; // ISO 8601 date string
}

interface Location {
  id: number;
  type: 'STOP_POINT' | string;
  name: string;
  region_name: string;
  code: string;
  code_detail: string;
  detailed_name: string;
  direction: 'WESTBOUND' | 'EASTBOUND' | 'NORTHBOUND' | 'SOUTHBOUND' | string;
  lon: number;
  lat: number;
  atco_code: string;
  has_future_activity: boolean;
  timezone: string;
  zone: GeoPoint[];
  heading: number;
  hub_id: number;
}

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface Vehicle {
  wheelchair: number;
  bicycle: number;
  seat: number;
  id: number;
  plate_number: string;
  name: string;
  has_wifi: boolean;
  has_toilet: boolean;
  type: 'coach' | 'bus' | string;
  brand: string;
  colour: string;
  is_backup_vehicle: boolean;
  owner_id: number;
  gps: GPS;
}

interface GPS {
  last_updated: string; // ISO 8601 date string
  longitude: number;
  latitude: number;
  heading: number;
}

interface RouteDescription {
  route_number: string;
  pattern_id: number;
  calendar_date: string; // YYYY-MM-DD format
  type: 'public' | 'private' | string;
  is_cancelled: boolean;
  route_id: number;
}

type BusStatusLabel = 'past' | 'on-time' | 'early' | 'delayed' | 'unknown';

interface TripData {
  title: string;
  is_cancelled: boolean;
  vehicle: Vehicle;
  stops: RouteStop[];
  path: GeoPoint[];
}

interface BusStatus {
  status: BusStatusLabel;
  description: string;
  color: string;
}

interface RouteStop {
  stopNumber: number;
  name: string;
  location: GeoPoint;
  arrival: ScheduledTime;
  departure: ScheduledTime;
  busStatus: BusStatus;
  allow_boarding: boolean;
  allow_drop_off: boolean;
  is_next_stop: boolean;
}
