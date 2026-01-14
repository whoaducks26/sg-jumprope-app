import React, { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import { profileService } from '../services/supabase';

export default function ProfilePage({ user, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.profile?.name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const imageUrl = await profileService.uploadProfileImage(user.id, file);
      await profileService.updateProfile(user.id, { profile_image_url: imageUrl });
      setSuccess('Profile image updated!');
      onProfileUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await profileService.updateProfile(user.id, { name: name.trim() });
      setSuccess('Name updated!');
      onProfileUpdate();
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating name:', err);
      setError('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {user.profile?.profile_image_url ? (
              <img
                src={user.profile.profile_image_url}
                alt={user.profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                <span className="text-blue-600 font-bold text-4xl">
                  {user.profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            
            {/* Upload Button */}
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <p className="text-sm text-gray-600 mt-2">Uploading image...</p>
          )}
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(user.profile?.name || '');
                  setError('');
                }}
                disabled={saving}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900">{user.profile?.name}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <p className="text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            user.profile?.role === 'admin' 
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {user.profile?.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Account Info */}
        <div className="border-t pt-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Member since: {new Date(user.profile?.created_at).toLocaleDateString()}</p>
            <p>User ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 Profile Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload a profile picture so others can recognize you at events</li>
          <li>• Keep your name up to date for accurate event participant lists</li>
          <li>• Your profile image should be under 5MB and in image format (JPG, PNG, etc.)</li>
        </ul>
      </div>
    </div>
  );
}