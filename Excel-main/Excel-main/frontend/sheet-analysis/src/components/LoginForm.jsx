import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    // Gmail address ending with .com and may include digits 0-9
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // Password must contain uppercase, lowercase, and either @ or . and minimum 5 characters
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[@.]/.test(password);
    const hasMinLength = password.length >= 5;
    return hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength;
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

    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-gray-900">
      <h2 className="text-4xl font-extrabold mb-8 text-center">Log In</h2>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <label className="block mb-4">
        Email
        <input
          type="email"
          autoComplete="email"
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className="text-red-600 mt-1">{emailError}</p>}
      </label>
      <label className="block mb-6">
        Password
        <input
          type="password"
          autoComplete="current-password"
          className="w-full border border-gray-300 rounded px-3 py-3 mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordError && <p className="text-red-600 mt-1">{passwordError}</p>}
      </label>
      <div className="mb-6 text-right">
        <Link to="/request-password-reset" className="text-sm text-blue-600 hover:text-blue-800">
          Forgot Password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
