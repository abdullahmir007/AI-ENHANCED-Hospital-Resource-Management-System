import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  
  // Combined settings state for simplicity
  const [settings, setSettings] = useState({
    account: {
      name: user?.name || 'User Name',
      email: user?.email || 'user@example.com',
      contactNumber: '',
      department: '',
      role: ''
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      colorBlindMode: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: true
    },
    notifications: {
      email: true,
      sms: false,
      browser: true,
      criticalAlertsOnly: false
    }
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Generic handler that updates nested state values
  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };
  
  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    alert('Settings saved successfully!');
  };
  
  const handleResetDefaults = () => {
    // Would reset to default values in a real app
    alert('Settings reset to defaults.');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleSaveSettings}
          >
            Save Changes
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={handleResetDefaults}
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              {['account', 'display', 'security', 'notifications'].map((tab) => (
                <button
                  key={tab}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeTab === tab ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mr-4">
                      {settings.account.name.charAt(0)}
                    </div>
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                      Change Profile Picture
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.account.name}
                      onChange={(e) => handleSettingChange('account', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.account.email}
                      onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={settings.account.contactNumber}
                      onChange={(e) => handleSettingChange('account', 'contactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your contact number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={settings.account.department}
                      onChange={(e) => handleSettingChange('account', 'department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      <option value="administration">Administration</option>
                      <option value="emergency">Emergency</option>
                      <option value="icu">Intensive Care</option>
                      <option value="surgery">Surgery</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="radiology">Radiology</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={settings.account.role}
                      onChange={(e) => handleSettingChange('account', 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Administrator</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="technician">Technician</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <h3 className="font-medium text-red-600">Danger Zone</h3>
                      <p className="text-sm text-gray-600">Permanent actions</p>
                    </div>
                    <button
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Display Settings */}
            {activeTab === 'display' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Display Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <select
                      value={settings.display.fontSize}
                      onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="colorBlindMode"
                      checked={settings.display.colorBlindMode}
                      onChange={(e) => handleSettingChange('display', 'colorBlindMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="colorBlindMode" className="ml-2 block text-sm text-gray-900">
                      Color Blind Mode
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-2fa"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-2fa"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.security.twoFactorAuth ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.security.sessionTimeout ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-timeout"
                          checked={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-timeout"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.security.sessionTimeout ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-gray-600">Last changed 45 days ago</p>
                      </div>
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.notifications.email ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-email"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-email"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.notifications.email ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via text message</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.notifications.sms ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-sms"
                          checked={settings.notifications.sms}
                          onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-sms"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.notifications.sms ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Browser Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications in browser</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.notifications.browser ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-browser"
                          checked={settings.notifications.browser}
                          onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-browser"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.notifications.browser ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Critical Alerts Only</h4>
                      <p className="text-sm text-gray-600">Only receive high-priority notifications</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-500">
                        {settings.notifications.criticalAlertsOnly ? 'Enabled' : 'Disabled'}
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-critical"
                          checked={settings.notifications.criticalAlertsOnly}
                          onChange={(e) => handleSettingChange('notifications', 'criticalAlertsOnly', e.target.checked)}
                          className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="toggle-critical"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.notifications.criticalAlertsOnly ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;