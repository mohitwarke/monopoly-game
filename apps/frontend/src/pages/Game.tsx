// Game Page
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, Building, Building2, Crown, Coins, Lock, Key, MoreVertical, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../hooks/useAuth';
import { Board, DicePair, PropertyDetail, Piece, Button, Modal, Toast } from '@monopoly/ui-components';
import { formatMoney } from '@monopoly/shared';

export function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isConnected,
    gameState,
    currentPlayer,
    currentPlayerId,
    isMyTurn,
    possibleActions,
    selectedPropertyId,
    showPropertyDetail,
    showTradeModal,
    activeTrade,
    showAuctionModal,
    activeAuction,
    diceRolling,
    lastDiceRoll,
    joinGame,
    leaveGame,
    rollDice,
    buyProperty,
    auctionBid,
    payJailBail,
    useGetOutOfJailFree,
    buildHouse,
    sellHouse,
    mortgageProperty,
    unmortgageProperty,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    endTurn,
    declareBankruptcy,
    selectProperty,
    setShowPropertyDetail,
    setShowTradeModal,
    setShowAuctionModal,
  } = useGame();

  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (gameId) {
      joinGame(gameId);
    }
    return () => {
      leaveGame();
    };
  }, [gameId, joinGame, leaveGame]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 border-4 border-monopoly-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  const handleActionClick = (action: string, data?: any) => {
    switch (action) {
      case 'rollDice':
        rollDice();
        break;
      case 'buyProperty':
        buyProperty(data.propertyId);
        break;
      case 'bid':
        auctionBid(activeAuction!.id, data.amount);
        break;
      case 'pass':
        // Pass on auction
        break;
      case 'payBail':
        payJailBail();
        break;
      case 'useGOOJF':
        useGetOutOfJailFree();
        break;
      case 'endTurn':
        endTurn();
        break;
      case 'manageProperties':
        // Open property management
        break;
      case 'proposeTrade':
        // Open trade modal
        break;
      case 'acceptTrade':
        acceptTrade(activeTrade!.id);
        break;
      case 'rejectTrade':
        rejectTrade(activeTrade!.id);
        break;
    }
  };

  const handlePropertyClick = (property: any) => {
    selectProperty(property.id);
    setShowPropertyDetail(true);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Game Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/lobbies')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Lobby
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-monopoly-red rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">M</span>
                </div>
                <span className="font-display text-lg font-bold text-white">Game #{gameId?.slice(0, 8)}</span>
                <Badge variant="info" size="sm">Turn {gameState.turn}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Board */}
          <div className="relative">
            <Board
              gameState={gameState}
              currentPlayer={currentPlayer}
              onPropertyClick={handlePropertyClick}
              onActionClick={handleActionClick}
              highlightedProperties={selectedPropertyId ? [selectedPropertyId] : []}
              showAnimations={true}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Current Player Info */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Piece player={currentPlayer} size={40} />
                <div>
                  <p className="font-semibold text-white">{currentPlayer.name}</p>
                  <p className="text-sm text-gray-400">
                    {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Cash</p>
                  <p className="font-bold text-green-400">{formatMoney(currentPlayer.money)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Net Worth</p>
                  <p className="font-bold text-yellow-400">{formatMoney(currentPlayer.netWorth)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Properties</p>
                  <p className="font-bold text-blue-400">{currentPlayer.properties.length}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="font-bold text-purple-400">{currentPlayer.position}</p>
                </div>
              </div>

              {currentPlayer.inJail && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    In Jail - Turn {currentPlayer.jailTurns}/{gameState.rulesConfig.maxJailTurns}
                  </p>
                </div>
              )}

              {currentPlayer.getOutOfJailFreeCards > 0 && (
                <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    {currentPlayer.getOutOfJailFreeCards} Get Out of Jail Free Card{currentPlayer.getOutOfJailFreeCards > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Dice */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DicePair
                roll={gameState.diceRoll || undefined}
                rolling={diceRolling}
                onRoll={rollDice}
                disabled={!isMyTurn || diceRolling}
                showTotal={true}
                size={64}
              />
            </motion.div>

            {/* Other Players */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-semibold text-white mb-3">Other Players</h3>
              <div className="space-y-2">
                {gameState.players
                  .filter(p => p.id !== currentPlayerId && !p.isBankrupt)
                  .map((player) => (
                    <motion.div
                      key={player.id}
                      className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Piece player={player} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{player.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> {formatMoney(player.money)}
                          {' | '}
                          <Building className="w-3 h-3" /> {player.properties.length} props
                        </p>
                      </div>
                      {player.inJail && <Lock className="w-4 h-4 text-yellow-400" />}
                      {player.getOutOfJailFreeCards > 0 && <Key className="w-4 h-4 text-green-400" />}
                    </motion.div>
                  ))}
              </div>
            </motion.div>

            {/* Game Log */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Game Log</h3>
                <Button variant="ghost" size="sm">Clear</Button>
              </div>
              <div className="h-48 overflow-y-auto space-y-1 text-sm">
                {gameState.moveLog.slice(-20).reverse().map((move, index) => (
                  <motion.div
                    key={move.id}
                    className="text-gray-400 hover:text-gray-300 p-1 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <span className="text-gray-500">Turn {move.turn}:</span>{' '}
                    <span className="text-white">{gameState.players.find(p => p.id === move.playerId)?.name || 'Unknown'}</span>{' '}
                    {move.action.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </motion.div>
                ))}
                {gameState.moveLog.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No moves yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {showPropertyDetail && selectedPropertyId && (
          <Modal
            isOpen={true}
            onClose={() => setShowPropertyDetail(false)}
            size="lg"
            title={gameState.board.find(p => p.id === selectedPropertyId)?.name}
          >
            <PropertyDetail
              property={gameState.board.find(p => p.id === selectedPropertyId)!}
              gameState={gameState}
              currentPlayer={currentPlayer}
              onClose={() => setShowPropertyDetail(false)}
              onAction={handleActionClick}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {showTradeModal && activeTrade && (
          <Modal
            isOpen={true}
            onClose={() => setShowTradeModal(false)}
            size="lg"
            title="Trade Offer"
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                {gameState.players.find(p => p.id === activeTrade.fromPlayerId)?.name} wants to trade with you.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">They Offer</h4>
                  <p className="text-green-400">${activeTrade.offeredMoney}</p>
                  <p className="text-gray-400">{activeTrade.offeredProperties.length} properties</p>
                  <p className="text-gray-400">{activeTrade.offeredGetOutOfJailFree} GOOJF cards</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">They Want</h4>
                  <p className="text-red-400">${activeTrade.requestedMoney}</p>
                  <p className="text-gray-400">{activeTrade.requestedProperties.length} properties</p>
                  <p className="text-gray-400">{activeTrade.requestedGetOutOfJailFree} GOOJF cards</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1" onClick={() => rejectTrade(activeTrade.id)}>
                  Reject
                </Button>
                <Button variant="success" className="flex-1" onClick={() => acceptTrade(activeTrade.id)}>
                  Accept
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Auction Modal */}
      <AnimatePresence>
        {showAuctionModal && activeAuction && (
          <Modal
            isOpen={true}
            onClose={() => setShowAuctionModal(false)}
            size="md"
            title="Auction"
          >
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400">Current Bid</p>
                <p className="text-3xl font-bold text-yellow-400">${activeAuction.currentBid}</p>
                <p className="text-sm text-gray-500">
                  {activeAuction.currentBidderId
                    ? `By ${gameState.players.find(p => p.id === activeAuction.currentBidderId)?.name}`
                    : 'No bids yet'}
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Your bid"
                  min={activeAuction.currentBid + 1}
                />
                <Button variant="primary" onClick={() => {}}>Bid</Button>
                <Button variant="outline" onClick={() => setShowAuctionModal(false)}>Pass</Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal
            isOpen={true}
            onClose={() => setShowSettings(false)}
            size="md"
            title="Game Settings"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!muted}
                    onChange={(e) => setMuted(!e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                  />
                  <span className="text-white">Sound Effects</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Dice1 className="w-5 h-5" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                  />
                  <span className="text-white">Dice Animations</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-monopoly-red focus:ring-monopoly-red"
                  />
                  <span className="text-white">Piece Animations</span>
                </label>
              </div>
              <hr className="border-gray-700" />
              <Button variant="danger" className="w-full" onClick={() => declareBankruptcy()}>
                Declare Bankruptcy
              </Button>
              <Button variant="outline" className="w-full" onClick={() => leaveGame()}>
                Leave Game
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-40 flex flex-col"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Chat</h3>
              <button className="p-1 text-gray-400 hover:text-white" onClick={() => setShowChat(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-gray-500 text-center text-sm">Chat messages will appear here</p>
            </div>
            <div className="p-4 border-t border-gray-800">
              <Input placeholder="Type a message..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}