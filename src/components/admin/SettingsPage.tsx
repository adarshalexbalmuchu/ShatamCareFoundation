import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Mail, 
  ToggleLeft, 
  ToggleRight, 
  Database, 
  Save, 
  Plus, 
  Trash2,
  Eye,
  Key
} from 'lucide-react';
import {
  getSiteSettings,
  updateSiteSettings,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  logAdminActivity,
  type SiteSettings,
  type AdminUser
} from '../../lib/supabase-secure';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'admins' | 'email' | 'features' | 'database'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Shatam Care Foundation',
    siteDescription: 'Caring for Our Elderly with Compassion and Dignity',
    contactEmail: 'shatamcare@gmail.com',
    contactPhone: '+91 9158566665',
    address: 'Mumbai, Maharashtra, India',
    socialLinks: {
      facebook: '',
      linkedin: '',
      instagram: '',
    },
    emailSettings: {
      fromName: 'Shatam Care Foundation',
      fromEmail: 'shatamcare@gmail.com',
      replyTo: 'shatamcare@gmail.com',
    },
    features: {
      enableNewsletterSignup: true,
      enableEventRegistration: true,
      enableContactForm: true,
      enableDonations: false,
    },
  });

  useEffect(() => {
    loadSettings();
    loadAdmins();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      // Filter out Twitter from loaded data to ensure UI consistency
      const filteredData = {
        ...data,
        socialLinks: {
          facebook: data.socialLinks.facebook || '',
          linkedin: data.socialLinks.linkedin || '',
          instagram: data.socialLinks.instagram || '',
        }
      };
      setSettings(filteredData);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await getAdminUsers();
      if (data && Array.isArray(data)) {
        setAdmins(data);
      } else {
        // If we get an empty or invalid response, set an empty array
        setAdmins([]);
        console.warn('No admin users returned or invalid data format');
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setError('Failed to load admin users - you may not have sufficient permissions');
      // Still set an empty array to prevent UI errors
      setAdmins([]);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateSiteSettings(settings);
      
      // Only log activity if the settings were successfully updated
      try {
        await logAdminActivity(
          'update_settings',
          'site_settings',
          null,
          { message: 'Site settings updated' }
        );
      } catch (logError) {
        console.warn('Failed to log admin activity, but settings were saved', logError);
      }
      
      setSuccess('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      // Provide more specific error messages based on the error
      if (error?.message?.includes('duplicate key')) {
        setError('Failed to save settings: duplicate key detected. Try refreshing the page.');
      } else if (error?.status === 403) {
        setError('Permission denied: You may not have admin rights to update settings.');
      } else {
        setError(`Failed to save settings: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      setLoading(true);
      await createAdminUser(newAdminEmail, 'admin');
      await logAdminActivity(
        'create_admin',
        'admin_user',
        null,
        { email: newAdminEmail }
      );
      
      setNewAdminEmail('');
      setSuccess('Admin user added successfully!');
      await loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      await deleteAdminUser(adminId);
      await logAdminActivity(
        'delete_admin',
        'admin_user',
        adminId,
        { message: 'Admin user deleted' }
      );
      
      setSuccess('Admin user removed successfully!');
      await loadAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      setError('Failed to remove admin user');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'admins', label: 'Admin Users', icon: Users },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'features', label: 'Features', icon: ToggleLeft },
    { id: 'database', label: 'Database', icon: Database },
  ] as const;

  const TabButton = ({ tab, isActive, onClick }: {
    tab: { id: string; label: string; icon: React.ComponentType<{ className?: string }> };
    isActive: boolean;
    onClick: () => void;
  }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-medium">{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your site configuration and preferences.</p>
      </div>

      {(error || success) && (
        <div className={`mb-6 p-4 rounded-lg border ${
          error 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <div className="flex justify-between items-center">
            <span>{error || success}</span>
            <button 
              onClick={clearMessages}
              className="text-sm underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['facebook', 'linkedin', 'instagram'].map((platform) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {platform}
                      </label>
                      <input
                        type="url"
                        value={settings.socialLinks[platform as keyof typeof settings.socialLinks] || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                        }))}
                        placeholder={`https://${platform}.com/yourpage`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Users */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Admin Users</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddAdmin}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Admin</span>
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{admin.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{admin.name || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Email Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.emailSettings.fromName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromEmail: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply To
                  </label>
                  <input
                    type="email"
                    value={settings.emailSettings.replyTo}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, replyTo: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Feature Toggles</h2>
              
              <div className="space-y-4">
                {Object.entries(settings.features).map(([feature, enabled]) => {
                  const ToggleIcon = enabled ? ToggleRight : ToggleLeft;
                  return (
                    <div key={feature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {feature === 'enableNewsletterSignup' && 'Allow visitors to subscribe to newsletters'}
                          {feature === 'enableEventRegistration' && 'Enable event registration functionality'}
                          {feature === 'enableContactForm' && 'Show contact form on contact page'}
                          {feature === 'enableDonations' && 'Enable donation functionality'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, [feature]: !enabled }
                        }))}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                          enabled 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <ToggleIcon className="w-5 h-5" />
                        <span className="font-medium">{enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Database */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Database Management</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Database Operations</p>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  Use these tools carefully. Database operations can affect your entire application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Connection Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Connected to Supabase</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Schema Version</h3>
                  <p className="text-sm text-gray-600">Latest (with admin enhancements)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
                  <div className="text-sm text-gray-600">
                    <p>• Admin panel settings table created</p>
                    <p>• Content management tables initialized</p>
                    <p>• Media upload functionality enabled</p>
                    <p>• Activity logging system active</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
