import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Quick login function for testing
  const quickLogin = (email, password) => {
    setFormData({ email, password, name: '' });
    setError('');
    setMessage('');
    // Auto-submit after a brief moment
    setTimeout(() => {
      handleSubmit(email, password);
    }, 100);
  };

  const handleSubmit = async (emailOverride, passwordOverride) => {
    setError('');
    setMessage('');

    const email = emailOverride || formData.email;
    const password = passwordOverride || formData.password;

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !formData.name) {
      setError('Please enter your name');
      return;
    }

    if (isSignUp) {
      const result = await signUp(email, password, formData.name);
      if (result.success) {
        setMessage('Account created! Please check your email to verify your account.');
        setFormData({ email: '', password: '', name: '' });
      } else {
        setError(result.error);
      }
    } else {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jump Rope Manager</h1>
          <p className="text-gray-600">Track events and connect with your team</p>
        </div>

        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm">
              {message}
            </div>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>

        {/* Quick Login Buttons (Testing Only) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3 text-center font-medium">Quick Login (Testing Only)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('admin1@admin.com', 'admin123')}
              disabled={loading || isSignUp}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔑 Admin
            </button>
            <button
              onClick={() => quickLogin('user1@user.com', 'user123')}
              disabled={loading || isSignUp}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👤 User
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            These buttons will be removed in production
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
            disabled={loading}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}