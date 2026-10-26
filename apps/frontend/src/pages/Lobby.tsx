// Lobby Page
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Settings, Play, Copy, Check, X, MoreVertical, Lock } from 'lucide-react';
import { useLobby } from '../hooks/useLobby';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Select, Badge } from '@monopoly/ui-components';
import { formatDistanceToNow } from 'date-fns';

export function Lobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    currentLobby,
    isHost,
    myPlayerId,
    loadLobbies,
    leaveLobby,
    startGame,
    updateLobbySettings,
    updateRules,
    kickPlayer,
    setReady,
    newLobbyRules,
    setNewLobbyRules,
    resetNewLobbyRules,
  } = useLobby();

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lobbyId) {
      // The lobby data should be loaded via socket when joining
      // For now, we'll rely on the socket connection
    }
  }, [lobbyId]);

  const handleCopyCode = async () => {
    if (currentLobby) {
      await navigator.clipboard.writeText(currentLobby.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = async () => {
    await leaveLobby();
    navigate('/lobbies');
  };

  const handleStart = async () => {
    try {
      await startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  if (!currentLobby) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 border-4 border-monopoly-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading lobby...</p>
        </motion.div>
      </div>
    );
  }

  const isPlayerReady = currentLobby.players.find(p => p.id === myPlayerId)?.isReady;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLeave}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold text-white">{currentLobby.name}</h1>
                <p className="text-sm text-gray-400">Code: {currentLobby.code} • {currentLobby.players.length}/{currentLobby.maxPlayers} players</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>

              {isHost && (
                <Button variant="primary" size="sm" onClick={handleStart} disabled={currentLobby.players.length < 2}>
                  <Play className="w-4 h-4 mr-1" />
                  Start Game
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Lobby Status Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm">
            <Badge variant={currentLobby.status === 'waiting' ? 'success' : 'info'} size="sm">
              {currentLobby.status === 'waiting' ? 'Waiting for Players' : 'Game in Progress'}
            </Badge>
            <span className="text-gray-400">
              {currentLobby.isPrivate ? (
                <>
                  <Lock className="w-3 h-3 inline mr-1" /> Private Lobby
                </>
              ) : (
                'Public Lobby'
              )}
            </span>
            <span className="text-gray-500">
              Created {formatDistanceToNow(new Date(currentLobby.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Players</h2>
                <Badge variant="info">{currentLobby.players.length}/{currentLobby.maxPlayers}</Badge>
              </div>

              <div className="space-y-3">
                {currentLobby.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-white" style={{ backgroundColor: player.color }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {player.name}
                          {player.isAI && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">AI</span>}
                          {player.id === currentLobby.hostId && <span className="text-xs bg-monopoly-red/20 text-monopoly-red px-2 py-0.5 rounded">Host</span>}
                          {player.id === myPlayerId && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">You</span>}
                        </p>
                        <p className="text-sm text-gray-400">
                          {player.isReady ? 'Ready' : 'Not Ready'}
                          {player.aiDifficulty && ` • ${player.aiDifficulty}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.id === myPlayerId && currentLobby.status === 'waiting' && (
                        <Button
                          variant={isPlayerReady ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => setReady(!isPlayerReady)}
                        >
                          {isPlayerReady ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                          {isPlayerReady ? 'Unready' : 'Ready'}
                        </Button>
                      )}

                      {isHost && player.id !== myPlayerId && (
                        <Button variant="ghost" size="sm" onClick={() => kickPlayer(player.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {currentLobby.players.length < currentLobby.maxPlayers && currentLobby.status === 'waiting' && (
                <div className="mt-4 p-4 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg text-center">
                  <p className="text-gray-400 mb-2">{currentLobby.maxPlayers - currentLobby.players.length} slot{currentLobby.maxPlayers - currentLobby.players.length > 1 ? 's' : ''} available</p>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4 mr-1" />
                    Share Invite Code
                  </Button>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Lobby Chat</h2>
              <div className="h-64 bg-gray-800/50 border border-gray-700 rounded-lg p-4 overflow-y-auto space-y-2">
                <p className="text-gray-500 text-center text-sm">Chat messages will appear here</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.value && (e.currentTarget.value = '')}
                />
                <Button variant="primary" size="sm">Send</Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lobby Settings (Host only) */}
            {isHost && currentLobby.status === 'waiting' && (
              <motion.div
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Lobby Settings
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Lobby Name"
                    value={currentLobby.name}
                    onChange={(e) => updateLobbySettings({ name: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Max Players"
                      value={currentLobby.maxPlayers.toString()}
                      onChange={(e) => updateLobbySettings({ maxPlayers: parseInt(e.target.value) })}
                      options={[
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                        { value: '4', label: '4' },
                        { value: '5', label: '5' },
                        { value: '6', label: '6' },
                        { value: '7', label: '7' },
                        { value: '8', label: '8' },
                      ]}
                    />
                    <Select
                      label="Time Limit"
                      value={currentLobby.rulesConfig.timeLimitMinutes?.toString() || 'none'}
                      onChange={(e) => updateRules({ timeLimitMinutes: e.target.value === 'none' ? undefined : parseInt(e.target.value) })}
                      options={[
                        { value: 'none', label: 'No Limit' },
                        { value: '30', label: '30 min' },
                        { value: '45', label: '45 min' },
                        { value: '60', label: '60 min' },
                        { value: '90', label: '90 min' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={currentLobby.isPrivate}
                      onChange={(e) => updateLobbySettings({ isPrivate: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                    />
                    <label htmlFor="private" className="text-sm text-gray-300">
                      Private lobby (invite only)
                    </label>
                  </div>

                  <Button variant="outline" onClick={() => setShowRulesModal(true)} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Rules
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Rules Summary */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Game Rules</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Starting Money</span>
                  <span className="text-white">${currentLobby.rulesConfig.startingMoney?.toLocaleString() || '1,500'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GO Salary</span>
                  <span className="text-white">${currentLobby.rulesConfig.goSalary?.toLocaleString() || '200'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auctions</span>
                  <span className="text-white">{currentLobby.rulesConfig.auctionOnDecline ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Free Parking Jackpot</span>
                  <span className="text-white">{currentLobby.rulesConfig.freeParkingJackpot ? 'On' : 'Off'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trading</span>
                  <span className="text-white">{currentLobby.rulesConfig.allowTrading ? 'Allowed' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">House Rules</span>
                  <span className="text-white">{currentLobby.rulesConfig.customRules?.length || 0} active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Advanced Rules</h2>
                <button className="p-1 text-gray-400 hover:text-white" onClick={() => setShowRulesModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {Object.entries({
                  Economy: ['freeParkingJackpot', 'freeParkingCollectsTaxes', 'doubleGoSalary', 'snakeEyesBonus'],
                  Property: ['auctionOnDecline', 'mustBuildEvenly', 'sellHousesAtHalfPrice', 'mortgageInterestRate'],
                  Jail: ['maxJailTurns', 'bailAmount', 'doubleRollGetsOutOfJail'],
                  Building: ['housesPerHotel', 'maxHouses', 'maxHotels'],
                  Trading: ['allowTrading', 'allowTradingWhileInJail', 'tradeRequiresApproval'],
                  Winning: ['bankruptcyOnly', 'maxTurns', 'timeLimitMinutes', 'wealthThreshold'],
                }).map(([category, rules]) => (
                  <div key={category} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">{category}</h3>
                    <div className="space-y-2">
                      {rules.map(rule => (
                        <div key={rule} className="flex items-center justify-between">
                          <label className="text-sm text-gray-300 capitalize">{rule.replace(/([A-Z])/g, ' $1').trim()}</label>
                          {typeof currentLobby.rulesConfig[rule as keyof typeof currentLobby.rulesConfig] === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={!!currentLobby.rulesConfig[rule as keyof typeof currentLobby.rulesConfig]}
                              onChange={(e) => updateRules({ [rule]: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                            />
                          ) : (
                            <Input
                              type="number"
                              value={currentLobby.rulesConfig[rule as keyof typeof currentLobby.rulesConfig]?.toString() || ''}
                              onChange={(e) => updateRules({ [rule]: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button variant="outline" className="flex-1" onClick={() => setShowRulesModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => setShowRulesModal(false)}>
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}