import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

const ProfileMenu = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative self-start mb-4 mr-4" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-600 text-white"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=2b6cb0&color=fff&size=32`}
          alt="Profile"
          className="rounded-full w-8 h-8"
        />
        <span className="hidden sm:inline text-white">{user.username}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-blue-600 rounded shadow-lg z-30">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
