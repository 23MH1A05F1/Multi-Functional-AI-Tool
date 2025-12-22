import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminSettings, updateAdminSettings, clearUpdateSuccess } from '../store/adminSettingsSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const adminSettingsState = useSelector((state) => state.adminSettings || {});
  const loading = adminSettingsState?.loading || false;
  const error = adminSettingsState?.error || null;
  const updateSuccess = adminSettingsState?.updateSuccess || false;
  const [localSettings, setLocalSettings] = useState({});

  const memoizedSettings = useMemo(() => {
    return adminSettingsState?.settings || {};
  }, [adminSettingsState?.settings]);

  useEffect(() => {
    dispatch(fetchAdminSettings());
  }, [dispatch]);

  useEffect(() => {
    setLocalSettings(memoizedSettings);
  }, [memoizedSettings]);

  useEffect(() => {
    if (updateSuccess) {
      alert('Settings saved successfully');
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setLocalSettings((prev) => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value,
  //   }));
  // };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateAdminSettings(localSettings));
  };

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const themeMode = localSettings.themeMode || 'white';

  return (
    <div
      className="p-6 max-w-4xl mx-auto admin-theme"
      style={themeMode === 'dark' ? { color: 'white', WebkitTextFillColor: 'white', backgroundColor: '#1f2937' } : {}}
    >
      <h1 className="text-3xl font-bold mb-6" style={themeMode === 'dark' ? { color: 'white' } : {}}>Admin Settings</h1>
      <form onSubmit={handleSave} className="space-y-4" style={themeMode === 'dark' ? { color: 'white' } : {}}>
        {/* Theme Mode Selection */}
        <div>
          <label className="font-medium block mb-2">Theme Mode</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <label htmlFor="white-black" className="ml-2">White and Black Mode</label>
              <label className="switch">
                <input
                  type="radio"
                  id="white-black"
                  name="themeMode"
                  checked={(localSettings.themeMode || 'white-black') === 'white-black'}
                  onChange={() => {
                    setLocalSettings((prev) => ({ ...prev, themeMode: 'white-black' }));
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <label htmlFor="dark" className="ml-2">Dark Mode</label>
              <label className="switch">
                <input
                  type="radio"
                  id="dark"
                  name="themeMode"
                  checked={localSettings.themeMode === 'dark'}
                  onChange={() => {
                    setLocalSettings((prev) => ({ ...prev, themeMode: 'dark' }));
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #4ade80; /* green */
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
