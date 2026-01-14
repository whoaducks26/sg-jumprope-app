import React from 'react';
import { Users } from 'lucide-react';

export default function EventCard({ event, currentUserName, currentUserId, onJoin, onLeave }) {
  const isParticipating = event.participants.some(p => p.id === currentUserId);

  const categoryStyles = {
    competition: { label: '🏆 Competition', color: 'bg-yellow-100 text-yellow-800' },
    performance: { label: '🎭 Performance', color: 'bg-purple-100 text-purple-800' },
    workshop: { label: '🎓 Workshop', color: 'bg-blue-100 text-blue-800' },
    practice: { label: '💪 Training', color: 'bg-green-100 text-green-800' },
    other: { label: '📌 Other', color: 'bg-gray-100 text-gray-800' }
  };

  // Check if multi-day event
  const startDate = new Date(event.date);
  const endDate = event.end_date ? new Date(event.end_date) : startDate;
  const isMultiDay = startDate.getTime() !== endDate.getTime();

  const formatDateRange = () => {
    if (isMultiDay) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return startDate.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
      
      {/* Categories */}
      {event.categories && event.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {event.categories.map((cat, idx) => {
            const style = categoryStyles[cat] || categoryStyles.other;
            return (
              <span key={idx} className={`px-2 py-0.5 rounded text-xs font-medium ${style.color}`}>
                {style.label}
              </span>
            );
          })}
        </div>
      )}
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>📅 {formatDateRange()} at {event.time}</p>
        {isMultiDay && (
          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
            Multi-day event
          </span>
        )}
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
            <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {participant.image && (
                <img 
                  src={participant.image} 
                  alt={participant.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>{participant.name}</span>
            </div>
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