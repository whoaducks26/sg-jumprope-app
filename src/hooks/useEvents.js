import { useState, useEffect } from 'react';
import { eventService } from '../services/supabase';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();

    // Subscribe to real-time updates
    const subscription = eventService.subscribeToEvents(() => {
      loadEvents();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const createEvent = async (eventData) => {
    try {
      await eventService.createEvent(eventData);
      await loadEvents(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error creating event:', err);
      return { success: false, error: err.message };
    }
  };

  const updateEvent = async (eventId, updates) => {
    try {
      await eventService.updateEvent(eventId, updates);
      await loadEvents();
      return { success: true };
    } catch (err) {
      console.error('Error updating event:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      await loadEvents();
      return { success: true };
    } catch (err) {
      console.error('Error deleting event:', err);
      return { success: false, error: err.message };
    }
  };

  const joinEvent = async (eventId) => {
    try {
      await eventService.joinEvent(eventId);
      await loadEvents();
      return { success: true };
    } catch (err) {
      console.error('Error joining event:', err);
      return { success: false, error: err.message };
    }
  };

  const leaveEvent = async (eventId) => {
    try {
      await eventService.leaveEvent(eventId);
      await loadEvents();
      return { success: true };
    } catch (err) {
      console.error('Error leaving event:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    refresh: loadEvents
  };
}