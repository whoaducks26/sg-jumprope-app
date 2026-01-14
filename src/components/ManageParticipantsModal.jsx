import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { eventService } from '../services/supabase';

export default function ManageParticipantsModal({ event, onClose, onAddParticipant, onRemoveParticipant }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await eventService.getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const participantIds = event.participants.map(p => p.id);
  const nonParticipants = allUsers.filter(user => !participantIds.includes(user.id));

  const filteredNonParticipants = nonParticipants.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (userId) => {
    const result = await onAddParticipant(event.id, userId);
    if (result.success) {
      // Refresh will happen via real-time subscription
    }
  };

  const handleRemove = async (userId) => {
    const result = await onRemoveParticipant(event.id, userId);
    if (result.success) {
      // Refresh will happen via real-time subscription
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Manage Participants</h3>
            <p className="text-sm text-gray-600 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Participants */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Current Participants ({event.participants.length})
                </h4>
                <div className="space-y-2">
                  {event.participants.length === 0 ? (
                    <p className="text-sm text-gray-500">No participants yet</p>
                  ) : (
                    event.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {participant.image ? (
                            <img
                              src={participant.image}
                              alt={participant.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{participant.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemove(participant.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                          title="Remove participant"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Participants */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Add Participants
                </h4>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredNonParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No users found' : 'All users are already participants'}
                    </p>
                  ) : (
                    filteredNonParticipants.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                        <button
                          onClick={() => handleAdd(user.id)}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition"
                          title="Add participant"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}