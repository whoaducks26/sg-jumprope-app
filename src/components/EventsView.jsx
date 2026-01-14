import React, { useState } from 'react';
import { Plus, Filter, UserPlus } from 'lucide-react';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';
import ManageParticipantsModal from './ManageParticipantsModal';

export default function EventsView({
  events,
  loading,
  error,
  isAdmin,
  currentUserName,
  currentUserId,
  onJoinEvent,
  onLeaveEvent,
  onCreateEvent,
  onAddParticipant,
  onRemoveParticipant
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMyEventsOnly, setShowMyEventsOnly] = useState(false);
  const [selectedEventForManage, setSelectedEventForManage] = useState(null);

  const handleCreateEvent = async (eventData) => {
    const result = await onCreateEvent(eventData);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  // Filter events based on toggle
  const filteredEvents = showMyEventsOnly
    ? events.filter(event => event.participants.some(p => p.id === currentUserId))
    : events;

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {showMyEventsOnly ? 'My Events' : 'Upcoming Events'}
        </h2>
        
        <div className="flex gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowMyEventsOnly(!showMyEventsOnly)}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition ${
              showMyEventsOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showMyEventsOnly ? 'Show All Events' : 'My Events Only'}
          </button>

          {/* Create Event Button */}
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
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            {showMyEventsOnly 
              ? "You haven't joined any events yet." 
              : "No events scheduled yet."}
          </p>
          {isAdmin && !showMyEventsOnly && (
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
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative">
              <EventCard
                event={event}
                currentUserName={currentUserName}
                currentUserId={currentUserId}
                onJoin={() => onJoinEvent(event.id)}
                onLeave={() => onLeaveEvent(event.id)}
              />
              
              {/* Admin: Manage Participants Button */}
              {isAdmin && (
                <button
                  onClick={() => setSelectedEventForManage(event)}
                  className="absolute top-2 right-2 bg-white shadow-md hover:shadow-lg p-2 rounded-full text-gray-600 hover:text-blue-600 transition"
                  title="Manage participants"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEvent}
        />
      )}

      {selectedEventForManage && (
        <ManageParticipantsModal
          event={selectedEventForManage}
          onClose={() => setSelectedEventForManage(null)}
          onAddParticipant={onAddParticipant}
          onRemoveParticipant={onRemoveParticipant}
        />
      )}
    </div>
  );
}