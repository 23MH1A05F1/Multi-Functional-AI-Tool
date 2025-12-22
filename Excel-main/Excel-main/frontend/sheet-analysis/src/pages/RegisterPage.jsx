import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 p-6">
      <header className="w-full flex justify-end p-6">
        <Link
          to="/"
          className="border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-700 text-white transition"
        >
          Home
        </Link>
      </header>
      <main className="flex flex-grow items-center justify-center text-white">
        <div>
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
