import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import LoginPage from './components/LoginPage';
import Navbar from './components/NavBar';
import EventsView from './components/EventsView';
import AdminPanel from './components/AdminPanel';

function App() {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const events = useEvents();
  const [view, setView] = useState('events');

   // ADD THIS DEBUG CODE
  console.log('User:', user);
  console.log('User Profile:', user?.profile);
  console.log('Is Admin:', isAdmin);
  console.log('Role:', user?.profile?.role);
  // END DEBUG CODE


  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user}
        isAdmin={isAdmin}
        view={view}
        setView={setView}
        onLogout={signOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'events' && (
          <EventsView 
            events={events.events}
            loading={events.loading}
            error={events.error}
            isAdmin={isAdmin}
            currentUserName={user.profile?.name}
            onJoinEvent={events.joinEvent}
            onLeaveEvent={events.leaveEvent}
            onCreateEvent={events.createEvent}
          />
        )}
        
        {view === 'admin' && isAdmin && (
          <AdminPanel 
            events={events.events}
            onDeleteEvent={events.deleteEvent}
          />
        )}
      </main>
    </div>
  );
}

export default App;