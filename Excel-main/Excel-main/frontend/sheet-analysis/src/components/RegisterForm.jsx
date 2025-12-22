import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role user
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    // Gmail address ending with .com and may include digits 0-9
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // Password must contain uppercase, lowercase, and either @ or .
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[@.]/.test(password);
    return hasUpperCase && hasLowerCase && hasSpecialChar;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError('Email must be a valid Gmail address ending with .com');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must contain uppercase, lowercase, and @ or .');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    dispatch(registerUser({ username, email, password, role })).then((res) => {
      if (!res.error) {
        // After successful registration, redirect to login page
        navigate('/login');
      }
    });
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
        {emailError && <p className="text-red-600 mt-1">{emailError}</p>}
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
        {passwordError && <p className="text-red-600 mt-1">{passwordError}</p>}
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
