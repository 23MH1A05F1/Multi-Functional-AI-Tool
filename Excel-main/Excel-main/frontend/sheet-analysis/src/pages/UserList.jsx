import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);
  const themeMode = user && user.role === 'admin' ? adminThemeMode : null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Filter out admin users from the user list
        const filteredUsers = response.data.users.filter(user => user.role !== 'admin');
        setUsers(filteredUsers);
        setLoading(false);
      } catch {
        // setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in as admin to block/unblock users.');
        return;
      }
      await axios.post(
        `/api/admin/users/${userId}/toggle-block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, blocked: !user.blocked } : user
        )
      );
    } catch (error) {
      console.error('Toggle block user error:', error);
      alert('Failed to toggle block user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refetch user list after deletion to get updated data
      await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers([]);
    } catch {
      alert('Failed to delete user');
    }
  };

  if (loading) return <p>Loading users...</p>;
  // if (error) return <p className="text-red-500">{error}</p>;

  // Define theme-based classes
  const containerClass =
    themeMode === 'dark'
      ? 'p-6 max-w-4xl mx-auto bg-gray-800 text-white rounded shadow'
      : themeMode === 'creative'
      ? 'p-6 max-w-4xl mx-auto bg-purple-700 bg-opacity-80 text-white rounded shadow'
      : 'p-6 max-w-4xl mx-auto bg-white text-black rounded shadow';

  const tableClass =
    themeMode === 'dark'
      ? 'w-full table-auto border-collapse border border-gray-600'
      : themeMode === 'creative'
      ? 'w-full table-auto border-collapse border border-purple-500'
      : 'w-full table-auto border-collapse border border-gray-300';

  const thClass =
    themeMode === 'dark'
      ? 'border border-gray-600 px-4 py-2 text-left'
      : themeMode === 'creative'
      ? 'border border-purple-500 px-4 py-2 text-left'
      : 'border border-gray-300 px-4 py-2 text-left';

  const trClass =
    themeMode === 'dark'
      ? 'bg-gray-800 text-white'
      : themeMode === 'creative'
      ? 'bg-purple-600 bg-opacity-70 text-white'
      : 'bg-white text-black';

  const tdClass =
    themeMode === 'dark'
      ? 'border border-gray-600 px-4 py-2'
      : themeMode === 'creative'
      ? 'border border-purple-500 px-4 py-2'
      : 'border border-gray-300 px-4 py-2';

  return (
    <div className={containerClass}>
      <h1 className="text-3xl font-bold mb-6">User List</h1>
      <table className={tableClass}>
        <thead>
          <tr className={themeMode === 'dark' ? 'bg-gray-700 text-white' : themeMode === 'creative' ? 'bg-purple-600 bg-opacity-70 text-white' : 'bg-gray-200'}>
            <th className={thClass}>Username</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Blocked</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className={trClass}>
              <td className={tdClass}>{user.username}</td>
              <td className={tdClass}>{user.email}</td>
              <td className={tdClass}>{user.blocked ? 'Yes' : 'No'}</td>
              <td className={tdClass + ' space-x-2'}>
                <button
                  onClick={() => handleToggleBlockUser(user._id)}
                  className={`px-3 py-1 rounded text-white ${
                    user.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {user.blocked ? 'Unblock' : 'Block'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
