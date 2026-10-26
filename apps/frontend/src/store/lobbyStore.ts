import { create } from 'zustand';
import type { Lobby, LobbyPlayer, LobbyCode, UUID, RulesConfig } from '@monopoly/shared';
import { DEFAULT_RULES_CONFIG } from '@monopoly/shared';

interface LobbyState {
  // Current lobby
  currentLobby: Lobby | null;
  isHost: boolean;
  myPlayerId: UUID | null;

  // Lobby list
  lobbies: Lobby[];
  isLoadingLobbies: boolean;

  // Creating/joining
  isCreating: boolean;
  isJoining: boolean;
  createError: string | null;
  joinError: string | null;

  // Rules config for new lobby
  newLobbyRules: RulesConfig;

  // Actions
  setCurrentLobby: (lobby: Lobby | null) => void;
  setMyPlayerId: (playerId: UUID | null) => void;
  updateLobby: (lobby: Lobby) => void;
  updatePlayerInLobby: (player: LobbyPlayer) => void;
  removePlayerFromLobby: (playerId: UUID) => void;
  setLobbyStatus: (status: Lobby['status']) => void;
  setLobbyRules: (rules: Partial<RulesConfig>) => void;

  // Lobby list
  setLobbies: (lobbies: Lobby[]) => void;
  addLobby: (lobby: Lobby) => void;
  removeLobby: (lobbyId: UUID) => void;
  setLoadingLobbies: (loading: boolean) => void;

  // Creating
  setCreating: (creating: boolean) => void;
  setCreateError: (error: string | null) => void;

  // Joining
  setJoining: (joining: boolean) => void;
  setJoinError: (error: string | null) => void;

  // Rules config
  setNewLobbyRules: (rules: Partial<RulesConfig>) => void;
  resetNewLobbyRules: () => void;

  // Reset
  reset: () => void;
}

const initialRules = DEFAULT_RULES_CONFIG;

export const useLobbyStore = create<LobbyState>((set) => ({
  // Current lobby
  currentLobby: null,
  isHost: false,
  myPlayerId: null,

  // Lobby list
  lobbies: [],
  isLoadingLobbies: false,

  // Creating/joining
  isCreating: false,
  isJoining: false,
  createError: null,
  joinError: null,

  // Rules config
  newLobbyRules: initialRules,

  // Actions
  setCurrentLobby: (lobby) => set({
    currentLobby: lobby,
    isHost: lobby?.hostId === lobby?.players.find(p => p.id === lobby?.myPlayerId)?.userId,
  }),

  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),

  updateLobby: (lobby) => set((state) => ({
    currentLobby: state.currentLobby?.id === lobby.id ? lobby : state.currentLobby,
    lobbies: state.lobbies.map(l => l.id === lobby.id ? lobby : l),
  })),

  updatePlayerInLobby: (player) => set((state) => {
    if (!state.currentLobby) return state;
    return {
      currentLobby: {
        ...state.currentLobby,
        players: state.currentLobby.players.map(p => p.id === player.id ? player : p),
      },
    };
  }),

  removePlayerFromLobby: (playerId) => set((state) => {
    if (!state.currentLobby) return state;
    return {
      currentLobby: {
        ...state.currentLobby,
        players: state.currentLobby.players.filter(p => p.id !== playerId),
      },
    };
  }),

  setLobbyStatus: (status) => set((state) => ({
    currentLobby: state.currentLobby ? { ...state.currentLobby, status } : null,
  })),

  setLobbyRules: (rules) => set((state) => ({
    currentLobby: state.currentLobby ? { ...state.currentLobby, rulesConfig: { ...state.currentLobby.rulesConfig, ...rules } } : null,
  })),

  // Lobby list
  setLobbies: (lobbies) => set({ lobbies }),
  addLobby: (lobby) => set((state) => ({ lobbies: [lobby, ...state.lobbies] })),
  removeLobby: (lobbyId) => set((state) => ({ lobbies: state.lobbies.filter(l => l.id !== lobbyId) })),
  setLoadingLobbies: (loading) => set({ isLoadingLobbies: loading }),

  // Creating
  setCreating: (creating) => set({ isCreating: creating }),
  setCreateError: (error) => set({ createError: error }),

  // Joining
  setJoining: (joining) => set({ isJoining: joining }),
  setJoinError: (error) => set({ joinError: error }),

  // Rules config
  setNewLobbyRules: (rules) => set((state) => ({ newLobbyRules: { ...state.newLobbyRules, ...rules } })),
  resetNewLobbyRules: () => set({ newLobbyRules: initialRules }),

  // Reset
  reset: () => set({
    currentLobby: null,
    isHost: false,
    myPlayerId: null,
    lobbies: [],
    isLoadingLobbies: false,
    isCreating: false,
    isJoining: false,
    createError: null,
    joinError: null,
    newLobbyRules: initialRules,
  }),
}));