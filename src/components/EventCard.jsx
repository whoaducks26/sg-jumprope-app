import React from 'react';
import { Users } from 'lucide-react';

export default function EventCard({ event, currentUserName, onJoin, onLeave }) {
  const isParticipating = event.participants.includes(currentUserName);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>📅 {new Date(event.date).toLocaleDateString()} at {event.time}</p>
        <p>📍 {event.location}</p>
        <p className="text-gray-700">{event.description}</p>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Participants ({event.participants.length})
          </span>
          <Users className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
          {event.participants.map((participant, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {participant}
            </span>
          ))}
        </div>

        {isParticipating ? (
          <button
            onClick={onLeave}
            className="w-full bg-red-50 text-red-600 py-2 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Leave Event
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
          >
            Join Event
          </button>
        )}
      </div>
    </div>
  );
}