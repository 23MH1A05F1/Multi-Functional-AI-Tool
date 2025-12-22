import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UserList from './pages/UserList.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UserSettingsPage from './pages/UserSettingsPage.jsx';
import SideNav from './components/SideNav.jsx';

import ProfileMenu from './components/ProfileMenu.jsx';
import ExcelFileUploader from './components/ExcelFileUploader.jsx';

const Layout = ({ children }) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);
  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);

  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Show SideNav only if user is logged in and not on login/register/home pages
  const hideNavPaths = ['/', '/login', '/register'];
  const showSideNav = user && !hideNavPaths.includes(location.pathname);

  const fullScreenPaths = ['/', '/login', '/register'];
  const isFullScreen = fullScreenPaths.includes(location.pathname);

  // Determine theme class based on themeMode and user role
  let themeClass = '';
  if (user && user.role === 'admin') {
    if (adminThemeMode === 'dark') {
      themeClass = 'dark-theme';
    } else if (adminThemeMode === 'creative') {
      themeClass = 'creative-theme';
    } else {
      themeClass = ''; // white-black or default
    }
  } else {
    if (userThemeMode === 'dark') {
      themeClass = 'dark-theme';
    } else if (userThemeMode === 'creative') {
      themeClass = 'creative-theme';
    } else {
      themeClass = ''; // white-black or default
    }
  }

  const toggleSideNav = () => {
    setSideNavOpen(!sideNavOpen);
  };

  return (
    <div className={`flex min-h-screen flex-col ${themeClass}`}>
      <div className="fixed top-0 right-0 z-50 m-4">
        <ProfileMenu />
      </div>
      <div className="flex flex-grow min-h-screen">
        {showSideNav && (
          <>
            {/* Hamburger button for small screens */}
            <button
              className="md:hidden fixed top-4 left-4 z-60 p-2 rounded bg-gray-700 text-white focus:outline-none"
              onClick={toggleSideNav}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* SideNav with responsive visibility */}
            <div className={`${sideNavOpen ? 'block' : 'hidden'} md:block`}>
              <SideNav />
            </div>
          </>
        )}
        <main
          className={
            showSideNav
              ? `flex-grow p-6 ${sideNavOpen ? 'ml-64' : 'ml-0'} md:ml-64`
              : isFullScreen
              ? 'flex-grow m-0 p-0 pt-0'
              : 'flex-grow p-0 pt-0'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const user = useSelector((state) => state.auth.user);

  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
          <Route path="/charts" element={user ? <ChartPage /> : <Navigate to="/login" replace />} />
          <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/user-list"
            element={
              <AdminRoute>
                <UserList />
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <SettingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/user-settings"
            element={user ? <UserSettingsPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/excel-upload" element={<ExcelFileUploader />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
