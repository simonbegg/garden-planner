'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-green-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Garden Management
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/plants"
              className={`px-3 py-2 rounded-md ${
                isActive('/plants') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Plants
            </Link>
            <Link
              href="/vegetable-patch"
              className={`px-3 py-2 rounded-md ${
                isActive('/vegetable-patch') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Vegetable Planner
            </Link>
            <Link
              href="/activities"
              className={`px-3 py-2 rounded-md ${
                isActive('/activities') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Activities
            </Link>
            <Link
              href="/calendar"
              className={`px-3 py-2 rounded-md ${
                isActive('/calendar') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Calendar
            </Link>
            <Link
              href="/resources"
              className={`px-3 py-2 rounded-md ${
                isActive('/resources') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
            >
              Resources
            </Link>
            {user ? (
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md ${
                  isActive('/profile') ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/auth"
                className={`px-3 py-2 rounded-md ${
                  isActive('/auth') ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link
              href="/plants"
              className={`block px-3 py-2 rounded-md ${
                isActive('/plants') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Plants
            </Link>
            <Link
              href="/vegetable-patch"
              className={`block px-3 py-2 rounded-md ${
                isActive('/vegetable-patch') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Vegetable Planner
            </Link>
            <Link
              href="/activities"
              className={`block px-3 py-2 rounded-md ${
                isActive('/activities') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Activities
            </Link>
            <Link
              href="/calendar"
              className={`block px-3 py-2 rounded-md ${
                isActive('/calendar') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Calendar
            </Link>
            <Link
              href="/resources"
              className={`block px-3 py-2 rounded-md ${
                isActive('/resources') ? 'bg-green-700' : 'hover:bg-green-700'
              }`}
              onClick={closeMenu}
            >
              Resources
            </Link>
            {user ? (
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/profile') ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
                onClick={closeMenu}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/auth"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/auth') ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
