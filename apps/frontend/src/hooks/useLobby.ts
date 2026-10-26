// Lobby Hook
import { useCallback, useEffect } from 'react';
import { useLobbyStore } from '../store/lobbyStore';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import type { Lobby, LobbyPlayer, RulesConfig, UUID } from '@monopoly/shared';

export function useLobby() {
  const {
    currentLobby,
    isHost,
    myPlayerId,
    lobbies,
    isLoadingLobbies,
    isCreating,
    isJoining,
    createError,
    joinError,
    newLobbyRules,
    setCurrentLobby,
    setMyPlayerId,
    updateLobby,
    updatePlayerInLobby,
    removePlayerFromLobby,
    setLobbyStatus,
    setLobbyRules,
    setLobbies,
    addLobby,
    removeLobby,
    setLoadingLobbies,
    setCreating,
    setCreateError,
    setJoining,
    setJoinError,
    setNewLobbyRules,
    resetNewLobbyRules,
    reset,
  } = useLobbyStore();

  // Load lobbies on mount
  const loadLobbies = useCallback(async () => {
    setLoadingLobbies(true);
    try {
      const response = await api.getLobbies();
      setLobbies(response.items);
    } catch (error: any) {
      console.error('Failed to load lobbies:', error);
    } finally {
      setLoadingLobbies(false);
    }
  }, [setLobbies, setLoadingLobbies]);

  // Create lobby
  const createLobby = useCallback(async (data: {
    name: string;
    isPrivate: boolean;
    maxPlayers: number;
    rulesConfig?: Partial<RulesConfig>;
  }) => {
    setCreating(true);
    setCreateError(null);
    try {
      const lobby = await socketService.createLobby(
        data.name,
        data.isPrivate,
        data.maxPlayers,
        data.rulesConfig
      );
      setCurrentLobby(lobby);
      setMyPlayerId(lobby.players[0]?.id ?? null);
      addLobby(lobby);
      return lobby;
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create lobby');
      throw error;
    } finally {
      setCreating(false);
    }
  }, [setCreating, setCreateError, setCurrentLobby, setMyPlayerId, addLobby]);

  // Join lobby
  const joinLobby = useCallback(async (code: string, name: string, isAI?: boolean, aiDifficulty?: string) => {
    setJoining(true);
    setJoinError(null);
    try {
      const lobby = await socketService.joinLobby(code, name, isAI, aiDifficulty);
      setCurrentLobby(lobby);
      setMyPlayerId(lobby.players.find(p => p.name === name && !p.isAI)?.id ?? null);
      return lobby;
    } catch (error: any) {
      setJoinError(error.message || 'Failed to join lobby');
      throw error;
    } finally {
      setJoining(false);
    }
  }, [setJoining, setJoinError, setCurrentLobby, setMyPlayerId]);

  // Leave lobby
  const leaveLobby = useCallback(async () => {
    try {
      await socketService.leaveLobby();
    } catch (error) {
      console.error('Failed to leave lobby:', error);
    } finally {
      reset();
    }
  }, [reset]);

  // Start game
  const startGame = useCallback(async () => {
    try {
      const gameState = await socketService.startGame();
      return gameState;
    } catch (error: any) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }, []);

  // Update lobby settings (host only)
  const updateLobbySettings = useCallback(async (settings: Partial<Lobby>) => {
    if (!currentLobby || !isHost) return;
    try {
      const updated = await api.updateLobby(currentLobby.id, settings);
      updateLobby(updated);
    } catch (error) {
      console.error('Failed to update lobby:', error);
    }
  }, [currentLobby, isHost, updateLobby]);

  // Update rules config
  const updateRules = useCallback(async (rules: Partial<RulesConfig>) => {
    if (!currentLobby || !isHost) return;
    try {
      const updated = await api.updateLobby(currentLobby.id, { rulesConfig: { ...currentLobby.rulesConfig, ...rules } });
      setLobbyRules(rules);
      updateLobby(updated);
    } catch (error) {
      console.error('Failed to update rules:', error);
    }
  }, [currentLobby, isHost, setLobbyRules, updateLobby]);

  // Kick player (host only)
  const kickPlayer = useCallback(async (playerId: UUID) => {
    if (!currentLobby || !isHost) return;
    try {
      await api.updateLobby(currentLobby.id, { kickPlayer: playerId });
      removePlayerFromLobby(playerId);
    } catch (error) {
      console.error('Failed to kick player:', error);
    }
  }, [currentLobby, isHost, removePlayerFromLobby]);

  // Set player ready
  const setReady = useCallback(async (ready: boolean) => {
    if (!currentLobby || !myPlayerId) return;
    try {
      await api.updateLobby(currentLobby.id, { playerReady: { playerId: myPlayerId, ready } });
      // The server will broadcast the update
    } catch (error) {
      console.error('Failed to set ready:', error);
    }
  }, [currentLobby, myPlayerId]);

  // Listen for lobby updates via socket
  useEffect(() => {
    const unsubLobbyUpdated = socketService.on('lobby_updated', (lobby) => {
      updateLobby(lobby);
    });

    const unsubPlayerJoined = socketService.on('player_joined', (player) => {
      updatePlayerInLobby(player);
    });

    const unsubPlayerLeft = socketService.on('player_left', (playerId) => {
      removePlayerFromLobby(playerId);
    });

    const unsubGameStarted = socketService.on('game_started', (gameState) => {
      setLobbyStatus('inGame');
    });

    return () => {
      unsubLobbyUpdated();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubGameStarted();
    };
  }, [updateLobby, updatePlayerInLobby, removePlayerFromLobby, setLobbyStatus]);

  return {
    // Current lobby
    currentLobby,
    isHost,
    myPlayerId,
    myPlayer: currentLobby?.players.find(p => p.id === myPlayerId),

    // Lobby list
    lobbies,
    isLoadingLobbies,
    loadLobbies,

    // Creating/joining
    isCreating,
    isJoining,
    createError,
    joinError,
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,

    // Settings
    updateLobbySettings,
    updateRules,
    kickPlayer,
    setReady,

    // Rules config for new lobby
    newLobbyRules,
    setNewLobbyRules,
    resetNewLobbyRules,
  };
}