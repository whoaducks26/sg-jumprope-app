import React, { useState } from 'react';
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

  // THIS PART WAS MISSING!
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No events scheduled yet.</p>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Create the first event
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserName={currentUserName}
              onJoin={() => onJoinEvent(event.id)}
              onLeave={() => onLeaveEvent(event.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEvent}
        />
      )}
    </div>
  );
}