import { useState } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { useDispatch } from 'react-redux';
import { registerUser, logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function AuthFlow() {
  const [showLogin] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    // Clear user state after registration to prevent auto redirect to dashboard
    dispatch(logout());
    // Redirect to login page route instead of showing login form inline
    navigate('/login');
  };

  return (
    <div className="auth-flow-container">
      {!showLogin ? (
        <RegisterFormWithCallback onSuccess={handleRegistrationSuccess} />
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

// Wrapper around RegisterForm to handle success callback
function RegisterFormWithCallback({ onSuccess }) {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(registerUser({ username, email, password, role })).unwrap();
      onSuccess();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-gray-900">
      <h2 className="text-4xl font-extrabold mb-8 text-center">Register</h2>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <label className="block mb-4">
        Username
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <label className="block mb-4">
        Email
        <input
          type="email"
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block mb-4">
        Password
        <input
          type="password"
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label className="block mb-6">
        Role
        <select
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
