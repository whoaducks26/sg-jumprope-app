import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTH FUNCTIONS
// ============================================

export const authService = {
  async signUp(email, password, name) {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
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
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  async joinEvent(eventId) {
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
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async addParticipant(eventId, userId) {
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
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, profile_image_url')
      .order('name');

    if (error) throw error;
    return data;
  },

  subscribeToEvents(callback) {
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