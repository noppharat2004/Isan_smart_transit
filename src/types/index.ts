export type VehicleType = 'songthaew' | 'tour_bus' | 'minibus';
export type ScheduleStatus = 'active' | 'delayed' | 'canceled';

export interface Route {
  id: string;
  name: string;
  vehicle_type: VehicleType;
  identifier: string;
  origin_station: string;
  destination_station: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleUpdate {
  id: string;
  route_id: string;
  departure_time: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  status: ScheduleStatus;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface DriverContact {
  id: string;
  route_id: string;
  phone_number: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface RouteWithUpdates extends Route {
  schedule_updates: ScheduleUpdate[];
  driver_contacts: DriverContact[];
}
