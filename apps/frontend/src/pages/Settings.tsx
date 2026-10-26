// Settings Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, HardDrive, Globe, Key, Trash2, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Select, Switch, Card, Tabs, Badge } from '@monopoly/ui-components';
import { formatDistanceToNow } from 'date-fns';

const mockSessions = [
  { id: '1', device: 'Chrome on Windows', location: 'New York, US', lastActive: new Date(), current: true },
  { id: '2', device: 'Safari on iPhone', location: 'San Francisco, US', lastActive: new Date(Date.now() - 86400000), current: false },
  { id: '3', device: 'Firefox on Mac', location: 'London, UK', lastActive: new Date(Date.now() - 86400000 * 3), current: false },
];

export function Settings() {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);

  // Form states
  const [accountForm, setAccountForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    gameInvites: true,
    gameUpdates: true,
    tournamentUpdates: true,
    marketing: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    animations: true,
    reducedMotion: false,
    compactMode: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showGameHistory: true,
    allowFriendRequests: true,
  });

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      await updateProfile(accountForm);
      // Show success toast
    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      // Call password change API
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    // Call revoke session API
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) return;
    // Call delete account API
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
            <Button variant="primary" size="sm" onClick={handleSaveAccount} loading={saving}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <Tabs
            tabs={[
              { id: 'account', label: 'Account', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'privacy', label: 'Privacy', icon: HardDrive },
              { id: 'danger', label: 'Danger Zone', icon: Trash2 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
            fullWidth
          />
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Account Tab */}
          {activeTab === 'account' && (
            <>
              <Card variant="outlined" padding="lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center relative">
                    <span className="text-2xl font-bold text-white">{user?.username?.charAt(0).toUpperCase()}</span>
                    <label className="absolute bottom-0 right-0 bg-monopoly-red hover:bg-red-600 text-white p-2 rounded-full cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input type="file" className="sr-only" accept="image/*" />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                    <p className="text-gray-400">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Username"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={32}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <Input
                  label="Bio"
                  value={accountForm.bio}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                  className="mt-6"
                />
                <div className="mt-6 flex gap-3">
                  <Button variant="primary" onClick={handleSaveAccount} loading={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Preferences
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    label="Language"
                    value="en"
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                      { value: 'de', label: 'German' },
                      { value: 'ja', label: 'Japanese' },
                    ]}
                  />
                  <Select
                    label="Timezone"
                    value="UTC"
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'EST', label: 'Eastern Time' },
                      { value: 'PST', label: 'Pacific Time' },
                      { value: 'CET', label: 'Central European Time' },
                    ]}
                  />
                </div>
              </Card>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button type="button" className="text-gray-400 hover:text-white">
                        <Eye className="w-5 h-5" />
                      </button>
                    }
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button type="button" className="text-gray-400 hover:text-white">
                        <Eye className="w-5 h-5" />
                      </button>
                    }
                    helperText="At least 8 characters with uppercase, lowercase, and number"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button type="button" className="text-gray-400 hover:text-white">
                        <Eye className="w-5 h-5" />
                      </button>
                    }
                  />
                  <Button variant="primary" onClick={handleSavePassword} loading={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Authenticator App</p>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Active Sessions
                </h3>
                <div className="space-y-3">
                  {mockSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          <HardDrive className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{session.device}</p>
                          <p className="text-sm text-gray-400">{session.location} • {session.current ? 'Current session' : `Last active ${formatDistanceToNow(session.lastActive, { addSuffix: true })}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.current && <Badge variant="success" size="sm">Current</Badge>}
                        {!session.current && (
                          <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">Sessions automatically expire after 30 days of inactivity.</p>
              </Card>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <>
              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
                    { key: 'gameInvites', label: 'Game Invites', description: 'When someone invites you to a game' },
                    { key: 'gameUpdates', label: 'Game Updates', description: 'When it\'s your turn or game state changes' },
                    { key: 'tournamentUpdates', label: 'Tournament Updates', description: 'Tournament announcements and results' },
                    { key: 'marketing', label: 'Marketing Emails', description: 'News, updates, and special offers' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Timing
                </h3>
                <div className="space-y-4">
                  <Select
                    label="Turn Notifications"
                    value="immediate"
                    options={[
                      { value: 'immediate', label: 'Immediate' },
                      { value: '1min', label: '1 minute delay' },
                      { value: '5min', label: '5 minutes delay' },
                    ]}
                  />
                  <Select
                    label: "Daily Summary"
                    value="none"
                    options={[
                      { value: 'none', label: 'Off' },
                      { value: 'morning', label: '8:00 AM' },
                      { value: 'evening', label: '6:00 PM' },
                    ]}
                  />
                </div>
              </Card>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {['dark', 'light', 'system'].map((theme) => (
                    <button
                      key={theme}
                      className={`p-4 rounded-xl border-2 transition-all ${appearance.theme === theme ? 'border-monopoly-red bg-monopoly-red/10' : 'border-gray-700 hover:border-gray-600'}`}
                      onClick={() => setAppearance(prev => ({ ...prev, theme }))}
                    >
                      <div className={`w-full h-20 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-900' : theme === 'light' ? 'bg-white' : 'bg-gradient-to-r from-gray-900 to-white'}`} />
                      <p className="capitalize font-medium text-white">{theme}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Animations & Effects
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Animations</p>
                      <p className="text-sm text-gray-400">Enable UI animations and transitions</p>
                    </div>
                    <Switch
                      checked={appearance.animations}
                      onChange={(checked) => setAppearance(prev => ({ ...prev, animations: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Reduced Motion</p>
                      <p className="text-sm text-gray-400">Minimize motion for accessibility</p>
                    </div>
                    <Switch
                      checked={appearance.reducedMotion}
                      onChange={(checked) => setAppearance(prev => ({ ...prev, reducedMotion: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Compact Mode</p>
                      <p className="text-sm text-gray-400">Reduce spacing for more content</p>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onChange={(checked) => setAppearance(prev => ({ ...prev, compactMode: checked }))}
                    />
                  </div>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Accent Color
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${color === '#FF0000' ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Profile Visibility
                </h3>
                <div className="space-y-4">
                  <Select
                    label: "Who can see your profile"
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    options={[
                      { value: 'public', label: 'Public - Everyone' },
                      { value: 'friends', label: 'Friends Only' },
                      { value: 'private', label: 'Private - Only Me' },
                    ]}
                  />
                  <div className="space-y-3">
                    {[
                      { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re online' },
                      { key: 'showGameHistory', label: 'Show Game History', description: 'Display your recent games on profile' },
                      { key: 'allowFriendRequests', label: 'Allow Friend Requests', description: 'Let others send you friend requests' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <Switch
                          checked={privacy[item.key as keyof typeof privacy]}
                          onChange={(checked) => setPrivacy(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Data & Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Analytics</p>
                      <p className="text-sm text-gray-400">Help improve the game by sharing anonymous usage data</p>
                    </div>
                    <Switch checked={true} onChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Crash Reports</p>
                      <p className="text-sm text-gray-400">Automatically send crash reports for debugging</p>
                    </div>
                    <Switch checked={true} onChange={() => {}} />
                  </div>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Your Data
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline">Download My Data</Button>
                  <Button variant="outline">Request Data Deletion</Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">We'll email you a link to download your data within 48 hours.</p>
              </Card>
            </>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <>
              <Card variant="outlined" padding="lg" className="border-red-700/50 bg-red-900/10">
                <h3 className="font-semibold text-red-400 mb-6 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-gray-400 mb-6">These actions are irreversible. Please be careful.</p>

                <div className="space-y-6">
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-300">Delete Account</p>
                        <p className="text-sm text-gray-400">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="danger" onClick={handleDeleteAccount}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Account
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-300">Revoke All Sessions</p>
                        <p className="text-sm text-gray-400">Sign out of all devices except current one</p>
                      </div>
                      <Button variant="outline" onClick={() => mockSessions.filter(s => !s.current).forEach(s => handleRevokeSession(s.id))}>
                        Revoke All
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}