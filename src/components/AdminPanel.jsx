import React from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminPanel({ events, onDeleteEvent }) {
  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      await onDeleteEvent(eventId);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Tools</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Database Status</h4>
            <p className="text-sm text-gray-600 mb-2">Connected to Supabase</p>
            <div className="text-xs text-gray-500">
              Total Events: {events.length}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">System Info</h4>
            <p className="text-sm text-gray-600">Real-time updates enabled</p>
            <div className="text-xs text-gray-500 mt-1">
              Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Events</h3>
        
        {events.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No events to manage</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} at {event.time} | {event.participants.length} participants
                  </p>
                  <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                </div>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                  title="Delete event"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 Admin Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Events are updated in real-time for all users</li>
          <li>• Deleting an event will remove all participant data</li>
          <li>• All users can see events, only admins can create/delete</li>
        </ul>
      </div>
    </div>
  );
}