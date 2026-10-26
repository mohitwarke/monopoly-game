// Lobby List Page
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, Lock, Users, Gamepad2, ChevronDown, MoreVertical } from 'lucide-react';
import { useLobby } from '../hooks/useLobby';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Select, Dropdown, Badge } from '@monopoly/ui-components';
import { formatDistanceToNow } from 'date-fns';

export function LobbyList() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    lobbies,
    isLoadingLobbies,
    loadLobbies,
    createLobby,
    isCreating,
    createError,
    joinLobby,
    isJoining,
    joinError,
    newLobbyRules,
    setNewLobbyRules,
    resetNewLobbyRules,
  } = useLobby();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'inGame'>('all');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [createName, setCreateName] = useState('');
  const [createMaxPlayers, setCreateMaxPlayers] = useState(4);
  const [createIsPrivate, setCreateIsPrivate] = useState(false);

  // Load lobbies on mount
  useEffect(() => {
    loadLobbies();
  }, [loadLobbies]);

  const filteredLobbies = lobbies
    .filter(lobby => {
      if (filterStatus !== 'all' && lobby.status !== filterStatus) return false;
      if (searchQuery && !lobby.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleCreateLobby = async () => {
    try {
      await createLobby({
        name: createName,
        isPrivate: createIsPrivate,
        maxPlayers: createMaxPlayers,
        rulesConfig: newLobbyRules,
      });
      setShowCreateModal(false);
      resetNewLobbyRules();
      setCreateName('');
    } catch (error) {
      // Error handled by store
    }
  };

  const handleJoinLobby = async () => {
    try {
      await joinLobby(joinCode.toUpperCase(), joinName || user?.username || 'Player');
      setShowJoinModal(false);
      setJoinCode('');
      setJoinName('');
    } catch (error) {
      // Error handled by store
    }
  };

  const handleNavigateToLobby = (lobbyId: string) => {
    navigate(`/lobbies/${lobbyId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-2xl font-bold text-white">Lobbies</h1>
              <Badge variant="info">{lobbies.length} total</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => loadLobbies()} loading={isLoadingLobbies}>
                <RefreshCw className="w-4 h-4" />
              </Button>

              {isAuthenticated && (
                <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lobby
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search lobbies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'waiting', label: 'Waiting' },
                { value: 'inGame', label: 'In Game' },
              ]}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Lobby List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingLobbies ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/3" />
              </motion.div>
            ))}
          </div>
        ) : filteredLobbies.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No lobbies found' : 'No lobbies yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to create a lobby!'}
            </p>
            {isAuthenticated && (
              <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Lobby
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredLobbies.map((lobby, index) => (
                <motion.article
                  key={lobby.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-monopoly-red/50 hover:bg-gray-900 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNavigateToLobby(lobby.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-monopoly-red transition-colors">
                        {lobby.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        Host: {lobby.players.find(p => p.id === lobby.hostId)?.name || 'Unknown'}
                      </p>
                    </div>
                    {lobby.isPrivate && (
                      <Lock className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {lobby.players.length}/{lobby.maxPlayers}
                    </span>
                    <Badge
                      variant={lobby.status === 'waiting' ? 'success' : 'info'}
                      size="sm"
                    >
                      {lobby.status === 'waiting' ? 'Waiting' : 'In Game'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-xs text-gray-500">
                      Created {formatDistanceToNow(new Date(lobby.createdAt), { addSuffix: true })}
                    </span>
                    <Button
                      variant={lobby.status === 'waiting' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1 sm:flex-none"
                      disabled={lobby.status !== 'waiting' || lobby.players.length >= lobby.maxPlayers}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToLobby(lobby.id);
                      }}
                    >
                      {lobby.status === 'waiting' ? 'Join' : 'Spectate'}
                    </Button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state for non-authenticated users */}
        {!isAuthenticated && filteredLobbies.length === 0 && !isLoadingLobbies && (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sign in to join lobbies</h3>
            <p className="text-gray-400 mb-6">Create an account to play with friends</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="lg">Create Account</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Lobby Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Lobby</h2>
                <button className="p-1 text-gray-400 hover:text-white" onClick={() => setShowCreateModal(false)}>
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {(createError || joinError) && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {createError || joinError}
                </div>
              )}

              <form onSubmit={handleCreateLobby} className="space-y-4">
                <Input
                  label="Lobby Name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="My Awesome Game"
                  required
                  maxLength={64}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Players"
                    type="number"
                    value={createMaxPlayers}
                    onChange={(e) => setCreateMaxPlayers(parseInt(e.target.value) || 2)}
                    min={2}
                    max={8}
                  />
                  <Select
                    label="Game Speed"
                    value={newLobbyRules.timeLimitMinutes?.toString() || 'none'}
                    onChange={(e) => setNewLobbyRules({ timeLimitMinutes: e.target.value === 'none' ? undefined : parseInt(e.target.value) })}
                    options={[
                      { value: 'none', label: 'No Limit' },
                      { value: '30', label: '30 min' },
                      { value: '60', label: '60 min' },
                      { value: '90', label: '90 min' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={createIsPrivate}
                    onChange={(e) => setCreateIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                  />
                  <label htmlFor="private" className="text-sm text-gray-300">
                    Private lobby (invite only)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" className="flex-1" loading={isCreating}>
                    Create Lobby
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Lobby Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Join Lobby</h2>
                <button className="p-1 text-gray-400 hover:text-white" onClick={() => setShowJoinModal(false)}>
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {(joinError || createError) && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {joinError || createError}
                </div>
              )}

              <form onSubmit={handleJoinLobby} className="space-y-4">
                <Input
                  label="Lobby Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  autoComplete="off"
                />

                <Input
                  label="Your Name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder={user?.username || 'Enter your name'}
                  maxLength={32}
                />

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" className="flex-1" loading={isJoining}>
                    Join Lobby
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}