import React from 'react';
import { Calendar, Settings, LogOut } from 'lucide-react';

export default function Navbar({ user, isAdmin, view, setView, onLogout }) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Jump Rope Manager</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setView('events')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'events'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="inline w-4 h-4 mr-1" />
                Events
              </button>
              {isAdmin && (
                <button
                  onClick={() => setView('admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    view === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="inline w-4 h-4 mr-1" />
                  Admin Panel
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Welcome, </span>
              <span className="font-medium text-gray-900">
                {user.profile?.name || user.email}
              </span>
              {isAdmin && (
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}