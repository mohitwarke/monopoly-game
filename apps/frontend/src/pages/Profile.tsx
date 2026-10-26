// Profile Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Gamepad2, Calendar, Settings, Edit, Camera, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Badge, Avatar, Card, Tabs } from '@monopoly/ui-components';
import { formatDistanceToNow } from 'date-fns';

const mockStats = {
  gamesPlayed: 47,
  gamesWon: 12,
  winRate: 25.5,
  totalEarnings: 125000,
  highestNetWorth: 8500,
  favoriteProperty: 'Boardwalk',
  averageGameTime: 45,
  currentStreak: 3,
};

const mockRecentGames = [
  { id: '1', date: new Date(Date.now() - 86400000), result: 'win', netWorth: 5200, duration: 42, players: 4 },
  { id: '2', date: new Date(Date.now() - 86400000 * 2), result: 'loss', netWorth: 3100, duration: 38, players: 3 },
  { id: '3', date: new Date(Date.now() - 86400000 * 3), result: 'win', netWorth: 6800, duration: 52, players: 4 },
  { id: '4', date: new Date(Date.now() - 86400000 * 5), result: 'loss', netWorth: 2200, duration: 31, players: 2 },
  { id: '5', date: new Date(Date.now() - 86400000 * 7), result: 'win', netWorth: 4500, duration: 47, players: 3 },
];

const mockAchievements = [
  { id: '1', name: 'First Win', description: 'Win your first game', icon: Trophy, unlocked: true, date: new Date(Date.now() - 86400000 * 30) },
  { id: '2', name: 'Property Mogul', description: 'Own 10 properties in a single game', icon: Building, unlocked: true, date: new Date(Date.now() - 86400000 * 15) },
  { id: '3', name: 'High Roller', description: 'Reach $10,000 net worth', icon: Coins, unlocked: false },
  { id: '4', name: 'Speed Demon', description: 'Win a game in under 30 minutes', icon: Clock, unlocked: false },
  { id: '5', name: 'Tournament Champion', description: 'Win a tournament', icon: Trophy, unlocked: false },
  { id: '6', name: 'Social Butterfly', description: 'Play with 50 different players', icon: Users, unlocked: false },
];

export function Profile() {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSave} loading={isLoading}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="relative">
              <Avatar
                src={user?.avatarUrl}
                name={user?.username}
                size="xl"
                status="online"
              />
              {editing && (
                <label className="absolute bottom-0 right-0 bg-monopoly-red hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="sr-only" accept="image/*" />
                </label>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-3">
                  <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={32}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white">{user?.username}</h2>
                  <p className="text-gray-400 mt-1">{user?.email}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <Badge variant="info">Rating: {user?.rating || 1200}</Badge>
                    <Badge variant="success">RD: ±{user?.ratingDeviation || 350}</Badge>
                    <Badge variant="warning">Vol: {(user?.volatility || 0.06).toFixed(3)}</Badge>
                  </div>
                  {formData.bio && (
                    <p className="text-gray-300 mt-4 italic">"{formData.bio}"</p>
                  )}
                </>
              )}
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium text-white">{formatDistanceToNow(new Date(user?.createdAt || Date.now()), { addSuffix: true })}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: 'Games Played', value: mockStats.gamesPlayed, icon: Gamepad2, color: 'blue' },
            { label: 'Games Won', value: mockStats.gamesWon, icon: Trophy, color: 'yellow' },
            { label: 'Win Rate', value: `${mockStats.winRate}%`, icon: Trophy, color: 'green' },
            { label: 'Total Earnings', value: `$${mockStats.totalEarnings.toLocaleString()}`, icon: Coins, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{stat.label}</span>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'stats', label: 'Statistics', icon: Gamepad2 },
              { id: 'history', label: 'Game History', icon: Gamepad2 },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
          />

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card variant="outlined" padding="lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Favorite Properties
                  </h3>
                  <div className="space-y-2">
                    {['Boardwalk', 'Park Place', 'Pennsylvania Ave', 'North Carolina Ave', 'Pacific Ave'].map((prop, i) => (
                      <div key={prop} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                        <span className="font-medium text-white">{prop}</span>
                        <Badge variant="info" size="sm">{Math.floor(Math.random() * 10) + 1}x landed</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card variant="outlined" padding="lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {mockRecentGames.slice(0, 5).map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${game.result === 'win' ? 'bg-green-400' : 'bg-red-400'}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{game.result === 'win' ? 'Victory' : 'Defeat'}</p>
                            <p className="text-xs text-gray-400">{formatDistanceToNow(game.date, { addSuffix: true })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${game.netWorth.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{game.duration} min • {game.players}p</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Highest Net Worth', value: `$${mockStats.highestNetWorth.toLocaleString()}`, icon: Coins },
                  { label: 'Favorite Property', value: mockStats.favoriteProperty, icon: Building },
                  { label: 'Avg Game Time', value: `${mockStats.averageGameTime} min`, icon: Clock },
                  { label: 'Current Streak', value: `${mockStats.currentStreak} ${mockStats.currentStreak > 0 ? '🔥' : ''}`, icon: Trophy },
                  { label: 'Total Playtime', value: `${Math.floor(mockStats.gamesPlayed * mockStats.averageGameTime / 60)} hrs`, icon: Clock },
                  { label: 'Properties Owned', value: '234', icon: Building },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-monopoly-red" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                        <p className="font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <Card variant="outlined" padding="lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Result</th>
                        <th className="pb-3 font-medium">Net Worth</th>
                        <th className="pb-3 font-medium">Duration</th>
                        <th className="pb-3 font-medium">Players</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockRecentGames.map((game) => (
                        <tr key={game.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 text-sm text-gray-400">{formatDistanceToNow(game.date, { addSuffix: true })}</td>
                          <td className="py-3">
                            <Badge variant={game.result === 'win' ? 'success' : 'danger'} size="sm">
                              {game.result === 'win' ? 'Victory' : 'Defeat'}
                            </Badge>
                          </td>
                          <td className="py-3 font-medium text-white">${game.netWorth.toLocaleString()}</td>
                          <td className="py-3 text-sm text-gray-400">{game.duration} min</td>
                          <td className="py-3 text-sm text-gray-400">{game.players}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'achievements' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`bg-gray-900/50 border rounded-xl p-5 transition-all ${achievement.unlocked ? 'border-yellow-500/50' : 'border-gray-800 opacity-50'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mockAchievements.indexOf(achievement) * 0.05 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-800'}`}>
                        <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>{achievement.name}</h4>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.description}</p>
                        {achievement.unlocked && (
                          <p className="text-xs text-yellow-400 mt-1">Unlocked {formatDistanceToNow(achievement.date, { addSuffix: true })}</p>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}