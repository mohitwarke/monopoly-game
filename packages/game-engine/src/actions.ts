// Action Creators - Helper functions to create move objects

import type { Move, UUID, PlayerAction, TradeOffer, DiceRoll } from '@monopoly/shared';
import { PlayerAction as PlayerActionEnum, generateUUID } from '@monopoly/shared';

/**
 * Create a roll dice move
 */
export function createRollDiceMove(playerId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0, // Will be set by engine
    phase: 'playing',
    action: PlayerActionEnum.ROLL_DICE,
    data: {},
  };
}

/**
 * Create a buy property move
 */
export function createBuyPropertyMove(playerId: UUID, propertyId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'auction',
    action: PlayerActionEnum.BUY_PROPERTY,
    data: { propertyId },
  };
}

/**
 * Create an auction bid move
 */
export function createAuctionBidMove(playerId: UUID, auctionId: UUID, amount: number): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'auction',
    action: PlayerActionEnum.AUCTION_BID,
    data: { auctionId, amount },
  };
}

/**
 * Create a pay jail bail move
 */
export function createPayJailBailMove(playerId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'jailDecision',
    action: PlayerActionEnum.PAY_JAIL_BAIL,
    data: {},
  };
}

/**
 * Create a use get out of jail free card move
 */
export function createUseGetOutOfJailFreeMove(playerId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'jailDecision',
    action: PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE,
    data: {},
  };
}

/**
 * Create a build house move
 */
export function createBuildHouseMove(playerId: UUID, propertyId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.BUILD_HOUSE,
    data: { propertyId },
  };
}

/**
 * Create a sell house move
 */
export function createSellHouseMove(playerId: UUID, propertyId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.SELL_HOUSE,
    data: { propertyId },
  };
}

/**
 * Create a mortgage property move
 */
export function createMortgagePropertyMove(playerId: UUID, propertyId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.MORTGAGE_PROPERTY,
    data: { propertyId },
  };
}

/**
 * Create an unmortgage property move
 */
export function createUnmortgagePropertyMove(playerId: UUID, propertyId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.UNMORTGAGE_PROPERTY,
    data: { propertyId },
  };
}

/**
 * Create a propose trade move
 */
export function createProposeTradeMove(
  fromPlayerId: UUID,
  toPlayerId: UUID,
  offeredMoney: number,
  requestedMoney: number,
  offeredProperties: UUID[],
  requestedProperties: UUID[],
  offeredGetOutOfJailFree: number,
  requestedGetOutOfJailFree: number
): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId: fromPlayerId,
    turn: 0,
    phase: 'trading',
    action: PlayerActionEnum.PROPOSE_TRADE,
    data: {
      fromPlayerId,
      toPlayerId,
      offeredMoney,
      requestedMoney,
      offeredProperties,
      requestedProperties,
      offeredGetOutOfJailFree,
      requestedGetOutOfJailFree,
    },
  };
}

/**
 * Create an accept trade move
 */
export function createAcceptTradeMove(playerId: UUID, tradeId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'trading',
    action: PlayerActionEnum.ACCEPT_TRADE,
    data: { tradeId },
  };
}

/**
 * Create a reject trade move
 */
export function createRejectTradeMove(playerId: UUID, tradeId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'trading',
    action: PlayerActionEnum.REJECT_TRADE,
    data: { tradeId },
  };
}

/**
 * Create an end turn move
 */
export function createEndTurnMove(playerId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.END_TURN,
    data: {},
  };
}

/**
 * Create a declare bankruptcy move
 */
export function createDeclareBankruptcyMove(playerId: UUID): Omit<Move, 'id' | 'timestamp'> {
  return {
    playerId,
    turn: 0,
    phase: 'playing',
    action: PlayerActionEnum.DECLARE_BANKRUPTCY,
    data: {},
  };
}

/**
 * Action type guards
 */
export function isRollDiceMove(move: Move): move is Move & { action: PlayerActionEnum.ROLL_DICE } {
  return move.action === PlayerActionEnum.ROLL_DICE;
}

export function isBuyPropertyMove(move: Move): move is Move & { action: PlayerActionEnum.BUY_PROPERTY; data: { propertyId: UUID } } {
  return move.action === PlayerActionEnum.BUY_PROPERTY;
}

export function isAuctionBidMove(move: Move): move is Move & { action: PlayerActionEnum.AUCTION_BID; data: { auctionId: UUID; amount: number } } {
  return move.action === PlayerActionEnum.AUCTION_BID;
}

export function isPayJailBailMove(move: Move): move is Move & { action: PlayerActionEnum.PAY_JAIL_BAIL } {
  return move.action === PlayerActionEnum.PAY_JAIL_BAIL;
}

export function isUseGetOutOfJailFreeMove(move: Move): move is Move & { action: PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE } {
  return move.action === PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE;
}

export function isBuildHouseMove(move: Move): move is Move & { action: PlayerActionEnum.BUILD_HOUSE; data: { propertyId: UUID } } {
  return move.action === PlayerActionEnum.BUILD_HOUSE;
}

export function isSellHouseMove(move: Move): move is Move & { action: PlayerActionEnum.SELL_HOUSE; data: { propertyId: UUID } } {
  return move.action === PlayerActionEnum.SELL_HOUSE;
}

export function isMortgagePropertyMove(move: Move): move is Move & { action: PlayerActionEnum.MORTGAGE_PROPERTY; data: { propertyId: UUID } } {
  return move.action === PlayerActionEnum.MORTGAGE_PROPERTY;
}

export function isUnmortgagePropertyMove(move: Move): move is Move & { action: PlayerActionEnum.UNMORTGAGE_PROPERTY; data: { propertyId: UUID } } {
  return move.action === PlayerActionEnum.UNMORTGAGE_PROPERTY;
}

export function isProposeTradeMove(move: Move): move is Move & { action: PlayerActionEnum.PROPOSE_TRADE; data: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'> } {
  return move.action === PlayerActionEnum.PROPOSE_TRADE;
}

export function isAcceptTradeMove(move: Move): move is Move & { action: PlayerActionEnum.ACCEPT_TRADE; data: { tradeId: UUID } } {
  return move.action === PlayerActionEnum.ACCEPT_TRADE;
}

export function isRejectTradeMove(move: Move): move is Move & { action: PlayerActionEnum.REJECT_TRADE; data: { tradeId: UUID } } {
  return move.action === PlayerActionEnum.REJECT_TRADE;
}

export function isEndTurnMove(move: Move): move is Move & { action: PlayerActionEnum.END_TURN } {
  return move.action === PlayerActionEnum.END_TURN;
}

export function isDeclareBankruptcyMove(move: Move): move is Move & { action: PlayerActionEnum.DECLARE_BANKRUPTCY } {
  return move.action === PlayerActionEnum.DECLARE_BANKRUPTCY;
}

/**
 * Get action display name
 */
export function getActionDisplayName(action: PlayerAction): string {
  const names: Record<PlayerAction, string> = {
    [PlayerActionEnum.ROLL_DICE]: 'Roll Dice',
    [PlayerActionEnum.BUY_PROPERTY]: 'Buy Property',
    [PlayerActionEnum.AUCTION_BID]: 'Bid in Auction',
    [PlayerActionEnum.PAY_JAIL_BAIL]: 'Pay Jail Bail',
    [PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE]: 'Use Get Out of Jail Free',
    [PlayerActionEnum.BUILD_HOUSE]: 'Build House/Hotel',
    [PlayerActionEnum.SELL_HOUSE]: 'Sell House/Hotel',
    [PlayerActionEnum.MORTGAGE_PROPERTY]: 'Mortgage Property',
    [PlayerActionEnum.UNMORTGAGE_PROPERTY]: 'Unmortgage Property',
    [PlayerActionEnum.PROPOSE_TRADE]: 'Propose Trade',
    [PlayerActionEnum.ACCEPT_TRADE]: 'Accept Trade',
    [PlayerActionEnum.REJECT_TRADE]: 'Reject Trade',
    [PlayerActionEnum.END_TURN]: 'End Turn',
    [PlayerActionEnum.DECLARE_BANKRUPTCY]: 'Declare Bankruptcy',
  };
  return names[action] || action;
}

/**
 * Get action description
 */
export function getActionDescription(action: PlayerAction): string {
  const descriptions: Record<PlayerAction, string> = {
    [PlayerActionEnum.ROLL_DICE]: 'Roll two dice and move your token',
    [PlayerActionEnum.BUY_PROPERTY]: 'Purchase the landed-on property',
    [PlayerActionEnum.AUCTION_BID]: 'Place a bid in the current auction',
    [PlayerActionEnum.PAY_JAIL_BAIL]: 'Pay $50 to get out of jail',
    [PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE]: 'Use a Get Out of Jail Free card',
    [PlayerActionEnum.BUILD_HOUSE]: 'Build a house or hotel on a property',
    [PlayerActionEnum.SELL_HOUSE]: 'Sell a house or hotel back to the bank',
    [PlayerActionEnum.MORTGAGE_PROPERTY]: 'Mortgage a property for cash',
    [PlayerActionEnum.UNMORTGAGE_PROPERTY]: 'Pay to unmortgage a property',
    [PlayerActionEnum.PROPOSE_TRADE]: 'Propose a trade to another player',
    [PlayerActionEnum.ACCEPT_TRADE]: 'Accept a proposed trade',
    [PlayerActionEnum.REJECT_TRADE]: 'Reject a proposed trade',
    [PlayerActionEnum.END_TURN]: 'End your turn',
    [PlayerActionEnum.DECLARE_BANKRUPTCY]: 'Declare bankruptcy and exit the game',
  };
  return descriptions[action] || '';
}