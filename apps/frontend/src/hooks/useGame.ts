// Game Hook
import { useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket';

export function useGame() {
  const {
    client,
    isConnected,
    connectionError,
    currentGameId,
    gameState,
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
    initializeClient,
    disconnect,
    joinGame,
    leaveGame,
    makeMove,
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
    setDiceRolling,
    setLastDiceRoll,
  } = useGameStore();

  const { tokens } = useAuthStore();

  // Initialize socket connection when auth token changes
  useEffect(() => {
    if (tokens?.accessToken) {
      socketService.connect(tokens.accessToken);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [tokens?.accessToken]);

  // Initialize MonopolyClient when socket connects
  useEffect(() => {
    if (socketService.isConnected() && !client) {
      const socket = socketService.getSocket();
      if (socket) {
        // We can't directly use the socket.io client here since we're using our wrapper
        // The gameStore handles socket events via socketService
      }
    }
  }, [socketService.isConnected(), client]);

  const handleRollDice = useCallback(async () => {
    await rollDice();
  }, [rollDice]);

  const handleBuyProperty = useCallback(async (propertyId: string) => {
    await buyProperty(propertyId);
  }, [buyProperty]);

  const handleAuctionBid = useCallback(async (auctionId: string, amount: number) => {
    await auctionBid(auctionId, amount);
  }, [auctionBid]);

  const handlePayJailBail = useCallback(async () => {
    await payJailBail();
  }, [payJailBail]);

  const handleUseGetOutOfJailFree = useCallback(async () => {
    await useGetOutOfJailFree();
  }, [useGetOutOfJailFree]);

  const handleBuildHouse = useCallback(async (propertyId: string) => {
    await buildHouse(propertyId);
  }, [buildHouse]);

  const handleSellHouse = useCallback(async (propertyId: string) => {
    await sellHouse(propertyId);
  }, [sellHouse]);

  const handleMortgageProperty = useCallback(async (propertyId: string) => {
    await mortgageProperty(propertyId);
  }, [mortgageProperty]);

  const handleUnmortgageProperty = useCallback(async (propertyId: string) => {
    await unmortgageProperty(propertyId);
  }, [unmortgageProperty]);

  const handleProposeTrade = useCallback(async (trade: any) => {
    await proposeTrade(trade);
  }, [proposeTrade]);

  const handleAcceptTrade = useCallback(async (tradeId: string) => {
    await acceptTrade(tradeId);
  }, [acceptTrade]);

  const handleRejectTrade = useCallback(async (tradeId: string) => {
    await rejectTrade(tradeId);
  }, [rejectTrade]);

  const handleEndTurn = useCallback(async () => {
    await endTurn();
  }, [endTurn]);

  const handleDeclareBankruptcy = useCallback(async () => {
    await declareBankruptcy();
  }, [declareBankruptcy]);

  const currentPlayer = gameState?.players.find(p => p.id === currentPlayerId);

  return {
    // Connection
    isConnected,
    connectionError,

    // Game state
    currentGameId,
    gameState,
    currentPlayer,
    currentPlayerId,
    isMyTurn,
    possibleActions,

    // UI State
    selectedPropertyId,
    showPropertyDetail,
    showTradeModal,
    activeTrade,
    showAuctionModal,
    activeAuction,
    diceRolling,
    lastDiceRoll,

    // Actions
    initializeClient,
    disconnect,
    joinGame,
    leaveGame,
    makeMove,
    rollDice: handleRollDice,
    buyProperty: handleBuyProperty,
    auctionBid: handleAuctionBid,
    payJailBail: handlePayJailBail,
    useGetOutOfJailFree: handleUseGetOutOfJailFree,
    buildHouse: handleBuildHouse,
    sellHouse: handleSellHouse,
    mortgageProperty: handleMortgageProperty,
    unmortgageProperty: handleUnmortgageProperty,
    proposeTrade: handleProposeTrade,
    acceptTrade: handleAcceptTrade,
    rejectTrade: handleRejectTrade,
    endTurn: handleEndTurn,
    declareBankruptcy: handleDeclareBankruptcy,

    // UI Actions
    selectProperty,
    setShowPropertyDetail,
    setShowTradeModal,
    setShowAuctionModal,
    setDiceRolling,
    setLastDiceRoll,
  };
}