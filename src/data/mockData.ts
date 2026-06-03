import { Route, ScheduleUpdate, VehicleType } from '@/types';

export const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Khon Kaen - Prathai',
    vehicle_type: 'songthaew',
    identifier: 'Red',
    origin_station: 'Khon Kaen Bus Terminal',
    destination_station: 'Prathai District',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T10:30:00Z',
  },
  {
    id: '2',
    name: 'Khon Kaen - Kalasin',
    vehicle_type: 'songthaew',
    identifier: 'Blue',
    origin_station: 'Khon Kaen Bus Terminal',
    destination_station: 'Kalasin City',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T09:15:00Z',
  },
  {
    id: '3',
    name: 'Khon Kaen - Bangkok',
    vehicle_type: 'tour_bus',
    identifier: 'Nakhon Chai Air',
    origin_station: 'Khon Kaen Bus Terminal 1',
    destination_station: 'Bangkok Mochit Terminal',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T11:00:00Z',
  },
  {
    id: '4',
    name: 'Khon Kaen - Udon Thani',
    vehicle_type: 'tour_bus',
    identifier: 'The Transport Co.',
    origin_station: 'Khon Kaen Bus Terminal 2',
    destination_station: 'Udon Thani Bus Terminal',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T08:45:00Z',
  },
  {
    id: '5',
    name: 'Khon Kaen - Nakhon Ratchasima',
    vehicle_type: 'minibus',
    identifier: 'Sombat Tour',
    origin_station: 'Khon Kaen Minivan Station',
    destination_station: 'Korat Bus Terminal',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T10:00:00Z',
  },
  {
    id: '6',
    name: 'Khon Kaen - Maha Sarakham',
    vehicle_type: 'minibus',
    identifier: 'Prasert Tour',
    origin_station: 'Khon Kaen Minivan Station',
    destination_station: 'Maha Sarakham City',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-04-26T09:30:00Z',
  },
];

export const mockScheduleUpdates: ScheduleUpdate[] = [
  {
    id: '1',
    route_id: '1',
    departure_time: '2024-04-26T14:00:00Z',
    image_url: 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'active',
    upvotes: 12,
    created_at: '2024-04-26T10:30:00Z',
    updated_at: '2024-04-26T10:30:00Z',
  },
  {
    id: '2',
    route_id: '2',
    departure_time: '2024-04-26T15:30:00Z',
    image_url: 'https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'delayed',
    upvotes: 8,
    created_at: '2024-04-26T09:15:00Z',
    updated_at: '2024-04-26T09:15:00Z',
  },
  {
    id: '3',
    route_id: '3',
    departure_time: '2024-04-26T20:00:00Z',
    image_url: 'https://via.placeholder.com/400x300/00FF00/FFFFFF?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'active',
    upvotes: 25,
    created_at: '2024-04-26T11:00:00Z',
    updated_at: '2024-04-26T11:00:00Z',
  },
  {
    id: '4',
    route_id: '4',
    departure_time: '2024-04-26T16:00:00Z',
    image_url: 'https://via.placeholder.com/400x300/FFFF00/000000?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'active',
    upvotes: 15,
    created_at: '2024-04-26T08:45:00Z',
    updated_at: '2024-04-26T08:45:00Z',
  },
  {
    id: '5',
    route_id: '5',
    departure_time: null,
    image_url: 'https://via.placeholder.com/400x300/FF00FF/FFFFFF?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'active',
    upvotes: 7,
    created_at: '2024-04-26T10:00:00Z',
    updated_at: '2024-04-26T10:00:00Z',
  },
  {
    id: '6',
    route_id: '6',
    departure_time: null,
    image_url: 'https://via.placeholder.com/400x300/00FFFF/000000?text=Schedule+Proof',
    lat: 16.4322,
    lng: 102.8236,
    status: 'canceled',
    upvotes: 3,
    created_at: '2024-04-26T09:30:00Z',
    updated_at: '2024-04-26T09:30:00Z',
  },
];

export const getVehicleTypeLabel = (type: VehicleType, t: (key: string) => string): string => {
  switch (type) {
    case 'songthaew':
      return t('vehicle.songthaew');
    case 'tour_bus':
      return t('vehicle.tour_bus');
    case 'minibus':
      return t('vehicle.minibus');
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'delayed':
      return 'bg-yellow-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
