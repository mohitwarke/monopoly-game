import { create } from 'zustand';
import type { GameState, Player, Move, UUID, Lobby, TradeOffer, Auction } from '@monopoly/shared';
import { MonopolyClient, createClientHook } from '@monopoly/networking';
import { GameEngine, createRollDiceMove } from '@monopoly/game-engine';

interface GameStateExtended extends GameState {
  // Client-side predictions
  pendingMoves: Move[];
  optimisticState: GameState | null;
}

interface GameStore {
  // Connection
  client: MonopolyClient | null;
  isConnected: boolean;
  connectionError: string | null;

  // Current game
  currentGameId: UUID | null;
  gameState: GameStateExtended | null;
  currentPlayerId: UUID | null;
  isMyTurn: boolean;
  possibleActions: string[];

  // UI State
  selectedPropertyId: UUID | null;
  showPropertyDetail: boolean;
  showTradeModal: boolean;
  activeTrade: TradeOffer | null;
  showAuctionModal: boolean;
  activeAuction: Auction | null;
  diceRolling: boolean;
  lastDiceRoll: { die1: number; die2: number; isDouble: boolean; total: number } | null;

  // Actions
  initializeClient: (url: string, token: string) => void;
  disconnect: () => void;
  joinGame: (gameId: UUID) => Promise<void>;
  leaveGame: () => void;
  makeMove: (move: Omit<Move, 'id' | 'timestamp'>) => Promise<void>;
  rollDice: () => Promise<void>;
  buyProperty: (propertyId: UUID) => Promise<void>;
  auctionBid: (auctionId: UUID, amount: number) => Promise<void>;
  payJailBail: () => Promise<void>;
  useGetOutOfJailFree: () => Promise<void>;
  buildHouse: (propertyId: UUID) => Promise<void>;
  sellHouse: (propertyId: UUID) => Promise<void>;
  mortgageProperty: (propertyId: UUID) => Promise<void>;
  unmortgageProperty: (propertyId: UUID) => Promise<void>;
  proposeTrade: (trade: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>) => Promise<void>;
  acceptTrade: (tradeId: UUID) => Promise<void>;
  rejectTrade: (tradeId: UUID) => Promise<void>;
  endTurn: () => Promise<void>;
  declareBankruptcy: () => Promise<void>;

  // UI Actions
  selectProperty: (propertyId: UUID | null) => void;
  setShowPropertyDetail: (show: boolean) => void;
  setShowTradeModal: (show: boolean, trade?: TradeOffer | null) => void;
  setShowAuctionModal: (show: boolean, auction?: Auction | null) => void;
  setDiceRolling: (rolling: boolean) => void;
  setLastDiceRoll: (roll: { die1: number; die2: number; isDouble: boolean; total: number } | null) => void;

  // Event handlers (called by socket listeners)
  handleGameStateUpdate: (state: GameState) => void;
  handleMoveMade: (move: Move, state: GameState) => void;
  handleTradeProposed: (trade: TradeOffer) => void;
  handleTradeResolved: (tradeId: UUID, accepted: boolean) => void;
  handleAuctionStarted: (auction: Auction) => void;
  handleAuctionBid: (auctionId: UUID, bidderId: UUID, amount: number) => void;
  handleAuctionEnded: (auctionId: UUID, winnerId: UUID | null, amount: number) => void;
  handlePlayerEliminated: (playerId: UUID) => void;
  handleGameEnded: (winnerId: UUID, finalState: GameState) => void;
  handleError: (code: string, message: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection
  client: null,
  isConnected: false,
  connectionError: null,

  // Current game
  currentGameId: null,
  gameState: null,
  currentPlayerId: null,
  isMyTurn: false,
  possibleActions: [],

  // UI State
  selectedPropertyId: null,
  showPropertyDetail: false,
  showTradeModal: false,
  activeTrade: null,
  showAuctionModal: false,
  activeAuction: null,
  diceRolling: false,
  lastDiceRoll: null,

  // Actions
  initializeClient: (url: string, token: string) => {
    const client = new MonopolyClient({ url, auth: { token } });

    client.on('connect', () => {
      set({ isConnected: true, connectionError: null });
    });

    client.on('disconnect', (reason) => {
      set({ isConnected: false, connectionError: reason });
    });

    client.on('connect_error', (error) => {
      set({ connectionError: error.message });
    });

    client.on('game_state_update', (state) => {
      get().handleGameStateUpdate(state);
    });

    client.on('move_made', (move, state) => {
      get().handleMoveMade(move, state);
    });

    client.on('trade_proposed', (trade) => {
      get().handleTradeProposed(trade);
    });

    client.on('trade_resolved', (tradeId, accepted) => {
      get().handleTradeResolved(tradeId, accepted);
    });

    client.on('auction_started', (auction) => {
      get().handleAuctionStarted(auction);
    });

    client.on('auction_bid', (auctionId, bidderId, amount) => {
      get().handleAuctionBid(auctionId, bidderId, amount);
    });

    client.on('auction_ended', (auctionId, winnerId, amount) => {
      get().handleAuctionEnded(auctionId, winnerId, amount);
    });

    client.on('player_eliminated', (playerId) => {
      get().handlePlayerEliminated(playerId);
    });

    client.on('game_ended', (winnerId, finalState) => {
      get().handleGameEnded(winnerId, finalState);
    });

    client.on('error', (code, message) => {
      get().handleError(code, message);
    });

    client.connect();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.destroy();
      set({ client: null, isConnected: false, currentGameId: null, gameState: null });
    }
  },

  joinGame: async (gameId: UUID) => {
    const { client } = get();
    if (!client) throw new Error('Client not initialized');

    set({ currentGameId: gameId });
    client.requestSync(gameId);
  },

  leaveGame: () => {
    const { client } = get();
    if (client) {
      client.leaveLobby();
    }
    set({ currentGameId: null, gameState: null, currentPlayerId: null });
  },

  makeMove: async (move) => {
    const { client } = get();
    if (!client) throw new Error('Client not initialized');
    client.makeMove(move);
  },

  rollDice: async () => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    set({ diceRolling: true });
    const move = createRollDiceMove(currentPlayerId);
    client.makeMove(move);
  },

  buyProperty: async (propertyId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'auction' as const,
      action: 'buyProperty' as const,
      data: { propertyId },
    };
    client.makeMove(move);
  },

  auctionBid: async (auctionId: UUID, amount: number) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'auction' as const,
      action: 'auctionBid' as const,
      data: { auctionId, amount },
    };
    client.makeMove(move);
  },

  payJailBail: async () => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'jailDecision' as const,
      action: 'payJailBail' as const,
      data: {},
    };
    client.makeMove(move);
  },

  useGetOutOfJailFree: async () => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'jailDecision' as const,
      action: 'useGetOutOfJailFree' as const,
      data: {},
    };
    client.makeMove(move);
  },

  buildHouse: async (propertyId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'buildHouse' as const,
      data: { propertyId },
    };
    client.makeMove(move);
  },

  sellHouse: async (propertyId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'sellHouse' as const,
      data: { propertyId },
    };
    client.makeMove(move);
  },

  mortgageProperty: async (propertyId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'mortgageProperty' as const,
      data: { propertyId },
    };
    client.makeMove(move);
  },

  unmortgageProperty: async (propertyId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'unmortgageProperty' as const,
      data: { propertyId },
    };
    client.makeMove(move);
  },

  proposeTrade: async (trade) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'trading' as const,
      action: 'proposeTrade' as const,
      data: trade,
    };
    client.makeMove(move);
  },

  acceptTrade: async (tradeId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'trading' as const,
      action: 'acceptTrade' as const,
      data: { tradeId },
    };
    client.makeMove(move);
  },

  rejectTrade: async (tradeId: UUID) => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'trading' as const,
      action: 'rejectTrade' as const,
      data: { tradeId },
    };
    client.makeMove(move);
  },

  endTurn: async () => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'endTurn' as const,
      data: {},
    };
    client.makeMove(move);
  },

  declareBankruptcy: async () => {
    const { client, currentPlayerId, gameState } = get();
    if (!client || !currentPlayerId || !gameState) return;

    const move = {
      playerId: currentPlayerId,
      turn: gameState.turn,
      phase: 'playing' as const,
      action: 'declareBankruptcy' as const,
      data: {},
    };
    client.makeMove(move);
  },

  // UI Actions
  selectProperty: (propertyId) => set({ selectedPropertyId: propertyId }),
  setShowPropertyDetail: (show) => set({ showPropertyDetail: show }),
  setShowTradeModal: (show, trade = null) => set({ showTradeModal: show, activeTrade: trade }),
  setShowAuctionModal: (show, auction = null) => set({ showAuctionModal: show, activeAuction: auction }),
  setDiceRolling: (rolling) => set({ diceRolling: rolling }),
  setLastDiceRoll: (roll) => set({ lastDiceRoll: roll }),

  // Event handlers
  handleGameStateUpdate: (state) => {
    const { currentPlayerId } = get();
    const currentPlayer = state.players.find(p => p.id === currentPlayerId);
    const isMyTurn = state.currentPlayerIndex >= 0 && state.players[state.currentPlayerIndex]?.id === currentPlayerId;

    set({
      gameState: {
        ...state,
        pendingMoves: [],
        optimisticState: null,
      },
      currentPlayerId: currentPlayerId || state.players[0]?.id || null,
      isMyTurn,
      possibleActions: currentPlayer ? getPossibleActions(state, currentPlayer) : [],
    });
  },

  handleMoveMade: (move, state) => {
    const { currentPlayerId } = get();
    const currentPlayer = state.players.find(p => p.id === currentPlayerId);
    const isMyTurn = state.currentPlayerIndex >= 0 && state.players[state.currentPlayerIndex]?.id === currentPlayerId;

    set({
      gameState: {
        ...state,
        pendingMoves: [],
        optimisticState: null,
      },
      isMyTurn,
      possibleActions: currentPlayer ? getPossibleActions(state, currentPlayer) : [],
      diceRolling: false,
      lastDiceRoll: move.action === 'rollDice' ? state.diceRoll ?? null : get().lastDiceRoll,
    });
  },

  handleTradeProposed: (trade) => {
    set({ showTradeModal: true, activeTrade: trade });
  },

  handleTradeResolved: (tradeId, accepted) => {
    set({ showTradeModal: false, activeTrade: null });
  },

  handleAuctionStarted: (auction) => {
    set({ showAuctionModal: true, activeAuction: auction });
  },

  handleAuctionBid: (auctionId, bidderId, amount) => {
    const { gameState } = get();
    if (gameState?.activeAuction?.id === auctionId) {
      set({
        gameState: {
          ...gameState,
          activeAuction: {
            ...gameState.activeAuction,
            currentBid: amount,
            currentBidderId: bidderId,
          },
        },
      });
    }
  },

  handleAuctionEnded: (auctionId, winnerId, amount) => {
    set({ showAuctionModal: false, activeAuction: null });
  },

  handlePlayerEliminated: (playerId) => {
    const { gameState } = get();
    if (gameState) {
      set({
        gameState: {
          ...gameState,
          players: gameState.players.map(p =>
            p.id === playerId ? { ...p, isBankrupt: true } : p
          ),
        },
      });
    }
  },

  handleGameEnded: (winnerId, finalState) => {
    set({
      gameState: {
        ...finalState,
        pendingMoves: [],
        optimisticState: null,
      },
      isMyTurn: false,
      possibleActions: [],
    });
  },

  handleError: (code, message) => {
    set({ connectionError: `${code}: ${message}` });
    // Could also show toast notification here
  },
}));

// Helper function to determine possible actions
function getPossibleActions(state: GameState, player: Player): string[] {
  const actions: string[] = [];

  switch (state.phase) {
    case 'playing':
      if (!state.diceRoll && !player.inJail) {
        actions.push('rollDice');
      }
      if (player.inJail) {
        if (player.getOutOfJailFreeCards > 0) actions.push('useGOOJF');
        if (player.money >= state.rulesConfig.bailAmount) actions.push('payBail');
      }
      if (state.diceRoll && !player.inJail) {
        actions.push('endTurn');
        actions.push('manageProperties');
        actions.push('proposeTrade');
      }
      break;
    case 'auction':
      actions.push('bid');
      actions.push('pass');
      break;
    case 'trading':
      actions.push('acceptTrade');
      actions.push('rejectTrade');
      break;
    case 'jailDecision':
      if (player.getOutOfJailFreeCards > 0) actions.push('useGOOJF');
      if (player.money >= state.rulesConfig.bailAmount) actions.push('payBail');
      break;
  }

  return actions;
}