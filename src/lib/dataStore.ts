import { supabase, isSupabaseConfigured } from './supabaseClient';

// Simple in-memory data store for development fallback
// Will be replaced with Supabase when configured

// Module-level variable to persist data (resets on server restart)
let scheduleUpdates: any[] = [];

export async function getScheduleUpdates() {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('schedule_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Getting schedule updates from Supabase, count:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Supabase fetch failed, using in-memory:', error);
    }
  }
  
  // Fallback to in-memory
  console.log('Getting schedule updates from memory, count:', scheduleUpdates.length);
  return [...scheduleUpdates];
}

export async function addScheduleUpdate(update: any) {
  console.log('Adding schedule update:', update);
  
  const newUpdate = {
    ...update,
    upvotes: 0,
    created_at: new Date().toISOString(),
  };

  // Try Supabase first
  if (isSupabaseConfigured()) {
    console.log('Supabase is configured, attempting insert...');
    try {
      const { data, error } = await supabase
        .from('schedule_updates')
        .insert([newUpdate])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      console.log('Schedule update added to Supabase successfully:', data);
      return data;
    } catch (error) {
      console.error('Supabase insert failed, using in-memory:', error);
    }
  } else {
    console.log('Supabase is NOT configured, using in-memory');
  }
  
  // Fallback to in-memory
  newUpdate.id = Date.now().toString();
  scheduleUpdates.unshift(newUpdate);
  console.log('Schedule update added to memory, count:', scheduleUpdates.length);
  return newUpdate;
}

export async function getScheduleUpdateById(id: string) {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('schedule_updates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase fetch by ID failed, using in-memory:', error);
    }
  }
  
  // Fallback to in-memory
  return scheduleUpdates.find((u: any) => u.id === id);
}
