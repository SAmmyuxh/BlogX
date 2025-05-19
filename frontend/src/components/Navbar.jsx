import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { handlesuccess } from '../utils';
import {
  HomeIcon,
  BookOpenIcon, // For Blogs
  SquaresPlusIcon, // For Dashboard
  PencilSquareIcon, // For Write
  ArrowRightOnRectangleIcon, // For Login/Logout
  UserPlusIcon, // For Signup
  UserCircleIcon, // For User profile/name
  Bars3Icon, // Hamburger menu
  XMarkIcon, // Close icon
  SparklesIcon, // For App Logo
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    handlesuccess('Logged out successfully!');
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-controls="mobile-menu"]')) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center ${
      isActive
        ? 'bg-indigo-700 text-white shadow-inner'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 flex items-center ${
      isActive
        ? 'bg-indigo-700 text-white shadow-inner'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50" ref={mobileMenuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Nav Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-white hover:text-indigo-300 transition-colors" onClick={closeMobileMenu}>
              <SparklesIcon className="h-8 w-auto text-indigo-400 mr-2" />
              <span className="font-bold text-xl tracking-tight">BlogSphere</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                <NavLink to="/" className={navLinkClass} end>
                  <HomeIcon className="h-5 w-5 mr-1.5 opacity-80" /> Home
                </NavLink>
                <NavLink to="/blogs" className={navLinkClass}>
                  <BookOpenIcon className="h-5 w-5 mr-1.5 opacity-80" /> Blogs
                </NavLink>
                {isAuthenticated() && (
                  <>
                    <NavLink to="/dashboard" className={navLinkClass}>
                      <SquaresPlusIcon className="h-5 w-5 mr-1.5 opacity-80" /> Dashboard
                    </NavLink>
                    <NavLink to="/new-blog" className={navLinkClass}>
                      <PencilSquareIcon className="h-5 w-5 mr-1.5 opacity-80" /> Write
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Auth Links */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated() ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-gray-300">
                    <UserCircleIcon className="h-6 w-6 mr-2 text-indigo-400" />
                    <span className="text-sm">Hello, {user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-gray-700 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                    Logout
                  </button>
                </div>
              ) : (
                // Modified: Login and Signup buttons side by side on desktop
                <div className="flex items-center space-x-2"> 
                  <NavLink to="/login" className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5 opacity-80" /> Login
                  </NavLink>
                  <NavLink to="/signup" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-md">
                    <UserPlusIcon className="h-5 w-5 mr-1.5" /> Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-gray-800 border-t border-gray-700 shadow-xl pb-3 z-40" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClass} onClick={closeMobileMenu} end>
              <HomeIcon className="h-5 w-5 mr-2 opacity-80" /> Home
            </NavLink>
            <NavLink to="/blogs" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              <BookOpenIcon className="h-5 w-5 mr-2 opacity-80" /> Blogs
            </NavLink>
            {isAuthenticated() && (
              <>
                <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                  <SquaresPlusIcon className="h-5 w-5 mr-2 opacity-80" /> Dashboard
                </NavLink>
                <NavLink to="/new-blog" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                  <PencilSquareIcon className="h-5 w-5 mr-2 opacity-80" /> Write
                </NavLink>
              </>
            )}
          </div>
          {/* Mobile Auth Links / User Info */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center px-5 mb-3">
                  <UserCircleIcon className="h-8 w-8 mr-3 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="text-base font-medium leading-none text-white">{user?.name || 'User'}</div>
                    {user?.email && <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user.email}</div> }
                  </div>
                </div>
                <div className="px-2 space-y-1">
                   <button
                    onClick={handleLogout} // handleLogout already calls closeMobileMenu
                    className="w-full flex items-center text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 opacity-80" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Modified: Login and Signup buttons side by side on mobile
              <div className="px-2 flex flex-row space-x-2"> 
                <NavLink to="/login" 
                  onClick={closeMobileMenu}
                  className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-base font-medium flex items-center justify-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 opacity-80" /> Login
                </NavLink>
                <NavLink to="/signup" 
                  onClick={closeMobileMenu}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md text-base font-medium shadow-md flex items-center justify-center">
                  <UserPlusIcon className="h-5 w-5 mr-2" /> Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;