'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, signOut, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      setIsSigningOut(true);
      await signOut();
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.email}</h2>
          <p className="text-sm text-gray-600">Garden Enthusiast</p>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Account Information</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2">
            <span className="text-gray-600">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="text-gray-600">Email Verified:</span>
            <span>{user.email_confirmed_at ? 'Yes' : 'No'}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="text-gray-600">Member Since:</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`px-4 py-2 rounded-lg text-white ${
            isSigningOut ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
