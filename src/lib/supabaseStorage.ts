import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface ScheduleUpdateData {
  route_id?: string;
  route_name?: string;
  company_name: string;
  vehicle_type: string;
  origin: string;
  destination: string;
  status: string;
  status_note?: string;
  phone_numbers?: any[];
  lat?: number;
  lng?: number;
  image_url?: string;
}

export async function addScheduleUpdateToSupabase(data: ScheduleUpdateData) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data: result, error } = await supabase
    .from('schedule_updates')
    .insert([
      {
        route_id: data.route_id || null,
        route_name: data.route_name,
        company_name: data.company_name,
        vehicle_type: data.vehicle_type,
        origin: data.origin,
        destination: data.destination,
        status: data.status,
        status_note: data.status_note,
        phone_numbers: data.phone_numbers || [],
        lat: data.lat,
        lng: data.lng,
        image_url: data.image_url,
        upvotes: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }

  return result;
}

export async function getScheduleUpdatesFromSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('schedule_updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }

  return data || [];
}

export async function getScheduleUpdateByIdFromSupabase(id: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('schedule_updates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }

  return data;
}
