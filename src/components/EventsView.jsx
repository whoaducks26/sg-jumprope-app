import React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';

export default function EventsView({
  events,
  loading,
  error,
  isAdmin,
  currentUserName,
  onJoinEvent,
  onLeaveEvent,
  onCreateEvent
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateEvent = async (eventData) => {
    const result = await onCreateEvent(eventData);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md">
        Error loading events: {error}
      </div>
    );
  }
}