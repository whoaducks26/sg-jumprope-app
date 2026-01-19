import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function ensureConfigured() {
  if (!isConfigured) {
    throw new Error(
      'Supabase is not configured. Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.'
    );
  }
}

function fetchWithTimeout(input, init) {
  const timeoutMs = 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const upstreamSignal = init?.signal;
  if (upstreamSignal) {
    if (upstreamSignal.aborted) controller.abort();
    else upstreamSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return fetch(input, { ...(init || {}), signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
});

// ============================================
// AUTH FUNCTIONS
// ============================================

export const authService = {
  async signUp(email, password, name) {
    ensureConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user'
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    ensureConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    ensureConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    ensureConfigured();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    ensureConfigured();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      profile
    };
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const profileService = {
  async updateProfile(userId, updates) {
    ensureConfigured();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadProfileImage(userId, file) {
    ensureConfigured();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};

// ============================================
// EVENT FUNCTIONS
// ============================================

export const eventService = {
  async getEvents() {
    ensureConfigured();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_categories(category),
        event_participants(
          user_id,
          profiles(name, profile_image_url)
        )
      `)
      .order('date', { ascending: true });

    if (error) throw error;
    
    return data.map(event => ({
      ...event,
      categories: event.event_categories?.map(ec => ec.category) || [],
      participants: event.event_participants?.map(ep => ({
        id: ep.user_id,
        name: ep.profiles.name,
        image: ep.profiles.profile_image_url
      })) || []
    }));
  },

  async createEvent(eventData) {
    ensureConfigured();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        date: eventData.date,
        end_date: eventData.end_date || eventData.date,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Add categories
    if (eventData.categories && eventData.categories.length > 0) {
      const categoryInserts = eventData.categories.map(cat => ({
        event_id: event.id,
        category: cat
      }));

      const { error: catError } = await supabase
        .from('event_categories')
        .insert(categoryInserts);

      if (catError) throw catError;
    }

    return event;
  },

  async updateEvent(eventId, updates) {
    ensureConfigured();
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId) {
    ensureConfigured();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  async joinEvent(eventId) {
    ensureConfigured();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('event_participants')
      .insert([{
        event_id: eventId,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async leaveEvent(eventId) {
    ensureConfigured();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async addParticipant(eventId, userId) {
    ensureConfigured();
    const { data, error } = await supabase
      .from('event_participants')
      .insert([{
        event_id: eventId,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeParticipant(eventId, userId) {
    ensureConfigured();
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getAllUsers() {
    ensureConfigured();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, profile_image_url')
      .order('name');

    if (error) throw error;
    return data;
  },

  subscribeToEvents(callback) {
    ensureConfigured();
    return supabase
      .channel('events_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'event_participants' },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'event_categories' },
        callback
      )
      .subscribe();
  }
};