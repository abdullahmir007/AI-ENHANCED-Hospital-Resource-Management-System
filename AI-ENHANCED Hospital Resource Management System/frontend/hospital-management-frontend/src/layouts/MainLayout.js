import React from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/' },
    { id: 'beds', name: 'Bed Management', icon: '🛏️', path: '/beds' },
    { id: 'staff', name: 'Staff Allocation', icon: '👨‍⚕️', path: '/staff' },
    { id: 'equipment', name: 'Equipment', icon: '🔬', path: '/equipment' },
    { id: 'patients', name: 'Patients', icon: '🧑‍⚕️', path: '/patients' },
    { id: 'ai-analytics', name: 'AI Analytics', icon: '🤖', path: '/ai-analytics' },
    { id: 'reports', name: 'Reports', icon: '📝', path: '/reports' },
    { id: 'alerts', name: 'Alerts', icon: '⚠️', path: '/alerts' },
    { id: 'settings', name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 bg-blue-600 text-white">
          <h1 className="text-xl font-bold flex items-center">
            <span className="mr-2">🏥</span> MediResource Hub
          </h1>
        </div>
        <nav className="p-4">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center p-3 mb-2 rounded cursor-pointer ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {navItems.find((item) => isActive(item.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center">
            {/* User Profile */}
            <div className="relative">
              <button
                className="flex items-center space-x-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="bg-blue-500 text-white h-8 w-8 rounded-full flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span>{user?.name || 'User'}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="p-3 border-b">
                    <div className="font-medium">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-600">{user?.email || 'user@example.com'}</div>
                  </div>
                  <div className="p-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      onClick={() => navigate('/profile')}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;