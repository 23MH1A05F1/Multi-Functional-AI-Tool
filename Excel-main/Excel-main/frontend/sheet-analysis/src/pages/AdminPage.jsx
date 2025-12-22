import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserList from './UserList';
import { useSelector } from 'react-redux';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const themeMode = useSelector((state) => state.adminSettings.settings.themeMode);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(res.data);
      setLoadingStats(false);
    } catch {
      setErrorStats('Failed to load platform stats');
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loadingStats) return <p>Loading platform stats...</p>;
  if (errorStats) return <p className="text-red-500">{errorStats}</p>;

  return (
    <div className={`p-6 max-w-6xl mx-auto ${themeMode === 'dark' ? 'bg-gray-900 text-white' : themeMode === 'creative' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <button
        onClick={fetchStats}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Stats
      </button>
      <div className={`mb-8 grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className={`p-4 rounded shadow ${themeMode === 'dark' ? 'bg-gray-800' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-2">Total Uploads by Users</h2>
          <p className="text-2xl">{stats.totalUploads}</p>
        </div>
        <div className={`p-4 rounded shadow ${themeMode === 'dark' ? 'bg-gray-800' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-2">Active Users (Last 30 days)</h2>
          <p className="text-2xl">{stats.activeUsersCount}</p>
        </div>
        <div className={`p-4 rounded shadow ${themeMode === 'dark' ? 'bg-gray-800' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-2">Most Used Chart Types</h2>
          <ul>
            {stats.mostUsedChartTypes.map(({ chartType, count }) => (
              <li key={chartType}>
                {chartType}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <UserList />
    </div>
  );
};

export default AdminPage;
