import { useState, useEffect } from 'react';
import { authService } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          await loadUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setUser(null);
        setLoading(false);
      }
    })();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUser();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email, password, name) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, name);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add refresh function
  const refreshUser = async () => {
    await loadUser();
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isAdmin: user?.profile?.role === 'admin'
  };
}