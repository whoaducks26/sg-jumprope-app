import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Settings,
  LogOut,
  User,
  Users,
  Menu,
  X,
  Calculator,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export default function Navbar({ user, isAdmin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const NavButton = ({ path, icon: Icon, label, adminOnly }) => {
    if (adminOnly && !isAdmin) return null;
    
    return (
      <button
        onClick={() => {
          navigate(path);
          setMobileMenuOpen(false);
        }}
        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
          isActive(path)
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Jump Rope Manager</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavButton path="/events" icon={Calendar} label="Events" />
            <NavButton path="/tutorials" icon={GraduationCap} label="Tutorials" />
            <NavButton path="/reading" icon={BookOpen} label="Reading" />
            <NavButton path="/calculator" icon={Calculator} label="Calculator" />
            <NavButton path="/admin" icon={Settings} label="Admin" adminOnly />
            <NavButton path="/users" icon={Users} label="Users" adminOnly />
            <NavButton path="/profile" icon={User} label="Profile" />

            {/* User Info */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              {user.profile?.profile_image_url && (
                <img
                  src={user.profile.profile_image_url}
                  alt={user.profile.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div className="text-sm">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {user.profile?.name || user.email}
                  {isAdmin && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-2">
            <div className="flex flex-col space-y-2">
              <NavButton path="/events" icon={Calendar} label="Events" />
              <NavButton path="/tutorials" icon={GraduationCap} label="Tutorials" />
              <NavButton path="/reading" icon={BookOpen} label="Reading" />
              <NavButton path="/calculator" icon={Calculator} label="Calculator" />
              {isAdmin && (
                <>
                  <NavButton path="/admin" icon={Settings} label="Admin Panel" />
                  <NavButton path="/users" icon={Users} label="User Management" />
                </>
              )}
              <NavButton path="/profile" icon={User} label="My Profile" />

              {/* Mobile User Info */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.profile?.profile_image_url ? (
                    <img
                      src={user.profile.profile_image_url}
                      alt={user.profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.profile?.name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}