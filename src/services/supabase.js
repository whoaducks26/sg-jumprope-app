import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTH FUNCTIONS
// ============================================

export const authService = {
  // Sign up new user
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

  // Sign in existing user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user with profile
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (!user) return null;

    // Get user profile with role
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

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// EVENT FUNCTIONS
// ============================================

export const eventService = {
  // Get all events with participants
    async getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select(`
        *,
        event_participants(
            user_id,
            profiles(name)
        )
        `)
        .order('date', { ascending: true });

    if (error) throw error;
    
    // Transform data to include participant names
    return data.map(event => ({
        ...event,
        participants: event.event_participants?.map(ep => ep.profiles.name) || []
    }));
    },

  // Create new event (admin only)
  async createEvent(eventData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update event (admin only)
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

  // Delete event (admin only)
  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  // Join event
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

  // Leave event
  async leaveEvent(eventId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Subscribe to event changes
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
      .subscribe();
  }
};