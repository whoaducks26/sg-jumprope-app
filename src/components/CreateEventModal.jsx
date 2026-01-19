import React, { useState } from 'react';

export default function CreateEventModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    end_date: '',
    time: '',
    location: '',
    description: '',
    categories: []
  });
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = [
    { value: 'competition', label: '🏆 Competition', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'performance', label: '🎭 Performance', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { value: 'workshop', label: '🎓 Workshop', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'training', label: '💪 Training', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'other', label: '📌 Other', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  ];

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
      setError('Please fill in all fields');
      return;
    }

    if (isMultiDay && !formData.end_date) {
      setError('Please select an end date for multi-day events');
      return;
    }

    if (isMultiDay && new Date(formData.end_date) < new Date(formData.date)) {
      setError('End date must be after start date');
      return;
    }

    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setSaving(true);
    setError('');

    const eventData = {
      ...formData,
      end_date: isMultiDay ? formData.end_date : formData.date
    };

    const result = await onSave(eventData);
    
    if (!result.success) {
      setError(result.error || 'Failed to create event');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Event</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              placeholder="Weekly Practice Session"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories (select multiple)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition border-2 ${
                    formData.categories.includes(cat.value)
                      ? cat.color + ' border-current'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                  disabled={saving}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.categories.length} category(ies) selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          {/* Multi-day toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="multi-day"
              checked={isMultiDay}
              onChange={(e) => {
                setIsMultiDay(e.target.checked);
                if (!e.target.checked) {
                  setFormData({ ...formData, end_date: '' });
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={saving}
            />
            <label htmlFor="multi-day" className="text-sm font-medium text-gray-700">
              This is a multi-day event
            </label>
          </div>

          {/* End date (only shown if multi-day) */}
          {isMultiDay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.date}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              placeholder="Central Park"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={saving}
              placeholder="Regular weekly practice for all skill levels"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}