import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import LoginPage from './components/LoginPage';
import Navbar from './components/NavBar';
import EventsView from './components/EventsView';
import AdminPanel from './components/AdminPanel';
import ProfilePage from './components/ProfilePage';
import UserManagement from './components/UserManagement';
import Footer from './components/Footer';

function App() {
  const { user, loading: authLoading, signOut, isAdmin, refreshUser } = useAuth();
  const events = useEvents();
  const [view, setView] = useState('events');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading...</p>
          <p className="text-sm text-gray-500">This might take a moment on first load</p>
          
          {/* Timeout warning after 5 seconds */}
          <div className="mt-4 max-w-md">
            <p className="text-xs text-gray-400">
              Taking too long? Try refreshing the page or check your internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleAddParticipant = async (eventId, userId) => {
    try {
      const { eventService } = await import('./services/supabase');
      await eventService.addParticipant(eventId, userId);
      await events.refresh();
      return { success: true };
    } catch (err) {
      console.error('Error adding participant:', err);
      return { success: false, error: err.message };
    }
  };

  const handleRemoveParticipant = async (eventId, userId) => {
    try {
      const { eventService } = await import('./services/supabase');
      await eventService.removeParticipant(eventId, userId);
      await events.refresh();
      return { success: true };
    } catch (err) {
      console.error('Error removing participant:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        user={user}
        isAdmin={isAdmin}
        view={view}
        setView={setView}
        onLogout={signOut}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'events' && (
          <EventsView 
            events={events.events}
            loading={events.loading}
            error={events.error}
            isAdmin={isAdmin}
            currentUserName={user.profile?.name}
            currentUserId={user.id}
            onJoinEvent={events.joinEvent}
            onLeaveEvent={events.leaveEvent}
            onCreateEvent={events.createEvent}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}
        
        {view === 'admin' && isAdmin && (
          <AdminPanel 
            events={events.events}
            onDeleteEvent={events.deleteEvent}
          />
        )}

        {view === 'users' && isAdmin && (
          <UserManagement />
        )}

        {view === 'profile' && (
          <ProfilePage 
            user={user}
            onProfileUpdate={refreshUser}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;