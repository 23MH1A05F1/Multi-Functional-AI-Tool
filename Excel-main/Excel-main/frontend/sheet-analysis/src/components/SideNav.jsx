import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SideNav = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <nav className="w-64 h-screen bg-gray-700 text-white p-4 fixed left-0 top-0 shadow-md overflow-hidden" style={{ height: '100vh' }}>
      <h2 className="text-xl font-bold mb-6">Excel Analytics</h2>
      <ul className="flex flex-col space-y-4">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
            }
          >
            Upload File
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/charts"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
            }
          >
            Charts
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
            }
          >
            History
          </NavLink>
        </li>
        {user && user.role !== 'admin' && (
          <li>
            <NavLink
              to="/user-settings"
              className={({ isActive }) =>
                isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
              }
            >
              Settings
            </NavLink>
          </li>
        )}
        {user && user.role === 'admin' && (
          <>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
                }
              >
                Admin Panel
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-blue-400'
                }
              >
                Settings
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default SideNav;
