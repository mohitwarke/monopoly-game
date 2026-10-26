// Game State Machine

import type { GameState, GamePhase, PlayerAction, RulesConfig, Move, UUID, DiceRoll, Player, Property, TradeOffer, Auction, Card } from '@monopoly/shared';
import {
  GamePhase as GamePhaseEnum,
  PlayerAction as PlayerActionEnum,
  PropertyType,
  GAME_CONSTANTS,
  DEFAULT_RULES_CONFIG,
} from '@monopoly/shared';
import {
  generateUUID,
  rollDice,
  calculateNextPosition,
  didPassGo,
  calculateNetWorth,
  getPropertyAtPosition,
  getPlayerProperties,
  hasMonopoly,
  calculateRent,
  getNextPlayerIndex,
  checkGameOver,
  cloneGameState,
  mergeRulesConfig,
} from '@monopoly/shared';
import { GameNotFoundError, InvalidGamePhaseError, NotYourTurnError, PlayerNotInGameError, PlayerBankruptError, InsufficientFundsError, PropertyNotFoundError, PropertyNotOwnedError, PropertyAlreadyOwnedError, PropertyMortgagedError, CannotMortgageWithHousesError, MustBuildEvenlyError, MaxHousesReachedError, MaxHotelsReachedError, InvalidTradeError, TradeNotFoundError, TradeExpiredError, TradeAlreadyResolvedError, AuctionNotFoundError, AuctionEndedError, InvalidBidError, NotInJailError, AlreadyRolledError, MustResolveJailFirstError, NoGetOutOfJailFreeCardError } from '@monopoly/shared';

/**
 * Game Engine Class - Handles all game logic and state transitions
 */
export class GameEngine {
  private state: GameState;

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Get mutable state for internal use
   */
  protected getMutableState(): GameState {
    return this.state;
  }

  /**
   * Apply a move and return new state
   */
  applyMove(move: Omit<Move, 'id' | 'timestamp'>): GameState {
    const newState = cloneGameState(this.state);
    const fullMove: Move = {
      ...move,
      id: generateUUID(),
      timestamp: Date.now(),
    };

    // Validate move
    this.validateMove(newState, fullMove);

    // Execute move based on action
    this.executeMove(newState, fullMove);

    // Add to move log
    newState.moveLog.push(fullMove);

    // Update state
    this.state = newState;
    return newState;
  }

  /**
   * Validate a move before execution
   */
  private validateMove(state: GameState, move: Move): void {
    // Check game exists
    if (!state) {
      throw new GameNotFoundError('unknown');
    }

    // Check game not ended
    if (state.phase === GamePhaseEnum.GAME_OVER) {
      throw new InvalidGamePhaseError(state.id, state.phase, 'playing');
    }

    // Check player exists and is not bankrupt
    const player = state.players.find(p => p.id === move.playerId);
    if (!player) {
      throw new PlayerNotInGameError(state.id, move.playerId);
    }
    if (player.isBankrupt) {
      throw new PlayerBankruptError(move.playerId);
    }

    // Check it's player's turn (except for certain actions)
    const currentPlayer = state.players[state.currentPlayerIndex];
    const isCurrentPlayer = currentPlayer.id === move.playerId;

    // Actions that can be done out of turn
    const outOfTurnActions = [
      PlayerActionEnum.ACCEPT_TRADE,
      PlayerActionEnum.REJECT_TRADE,
      PlayerActionEnum.AUCTION_BID,
    ];

    if (!isCurrentPlayer && !outOfTurnActions.includes(move.action)) {
      throw new NotYourTurnError(state.id, move.playerId, currentPlayer.id);
    }

    // Phase-specific validation
    this.validatePhaseAction(state, move);
  }

  /**
   * Validate action is allowed in current phase
   */
  private validatePhaseAction(state: GameState, move: Move): void {
    const { phase } = state;

    switch (move.action) {
      case PlayerActionEnum.ROLL_DICE:
        if (phase !== GamePhaseEnum.PLAYING) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.PLAYING);
        }
        break;
      case PlayerActionEnum.BUY_PROPERTY:
      case PlayerActionEnum.AUCTION_BID:
        if (phase !== GamePhaseEnum.AUCTION) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.AUCTION);
        }
        break;
      case PlayerActionEnum.PROPOSE_TRADE:
      case PlayerActionEnum.ACCEPT_TRADE:
      case PlayerActionEnum.REJECT_TRADE:
        if (phase !== GamePhaseEnum.TRADING && phase !== GamePhaseEnum.PLAYING) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.TRADING);
        }
        break;
      case PlayerActionEnum.PAY_JAIL_BAIL:
      case PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE:
        if (phase !== GamePhaseEnum.JAIL_DECISION) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.JAIL_DECISION);
        }
        break;
      case PlayerActionEnum.BUILD_HOUSE:
      case PlayerActionEnum.SELL_HOUSE:
      case PlayerActionEnum.MORTGAGE_PROPERTY:
      case PlayerActionEnum.UNMORTGAGE_PROPERTY:
        if (phase !== GamePhaseEnum.PLAYING && phase !== GamePhaseEnum.TURN_END) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.PLAYING);
        }
        break;
      case PlayerActionEnum.END_TURN:
        if (phase !== GamePhaseEnum.PLAYING && phase !== GamePhaseEnum.TURN_END) {
          throw new InvalidGamePhaseError(state.id, phase, GamePhaseEnum.PLAYING);
        }
        break;
    }
  }

  /**
   * Execute a move based on action type
   */
  private executeMove(state: GameState, move: Move): void {
    switch (move.action) {
      case PlayerActionEnum.ROLL_DICE:
        this.executeRollDice(state, move);
        break;
      case PlayerActionEnum.BUY_PROPERTY:
        this.executeBuyProperty(state, move);
        break;
      case PlayerActionEnum.AUCTION_BID:
        this.executeAuctionBid(state, move);
        break;
      case PlayerActionEnum.PAY_JAIL_BAIL:
        this.executePayJailBail(state, move);
        break;
      case PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE:
        this.executeUseGetOutOfJailFree(state, move);
        break;
      case PlayerActionEnum.BUILD_HOUSE:
        this.executeBuildHouse(state, move);
        break;
      case PlayerActionEnum.SELL_HOUSE:
        this.executeSellHouse(state, move);
        break;
      case PlayerActionEnum.MORTGAGE_PROPERTY:
        this.executeMortgageProperty(state, move);
        break;
      case PlayerActionEnum.UNMORTGAGE_PROPERTY:
        this.executeUnmortgageProperty(state, move);
        break;
      case PlayerActionEnum.PROPOSE_TRADE:
        this.executeProposeTrade(state, move);
        break;
      case PlayerActionEnum.ACCEPT_TRADE:
        this.executeAcceptTrade(state, move);
        break;
      case PlayerActionEnum.REJECT_TRADE:
        this.executeRejectTrade(state, move);
        break;
      case PlayerActionEnum.END_TURN:
        this.executeEndTurn(state, move);
        break;
      case PlayerActionEnum.DECLARE_BANKRUPTCY:
        this.executeDeclareBankruptcy(state, move);
        break;
    }
  }

  // ============================================
  // Action Implementations
  // ============================================

  private executeRollDice(state: GameState, move: Move): void {
    const player = state.players[state.currentPlayerIndex];
    
    // Check if already rolled (unless in jail)
    if (state.diceRoll && !player.inJail) {
      throw new AlreadyRolledError(player.id);
    }

    // Roll dice
    const diceRoll = rollDice();
    state.diceRoll = diceRoll;

    // Handle doubles
    if (diceRoll.isDouble) {
      state.doublesCount++;
      if (state.doublesCount >= GAME_CONSTANTS.DOUBLES_MAX) {
        // Go to jail
        this.sendToJail(state, player);
        state.doublesCount = 0;
        state.phase = GamePhaseEnum.TURN_END;
        return;
      }
    } else {
      state.doublesCount = 0;
    }

    // Handle jail
    if (player.inJail) {
      if (diceRoll.isDouble) {
        // Doubles gets out of jail
        player.inJail = false;
        player.jailTurns = 0;
        // Move normally
        this.movePlayer(state, player, diceRoll.total);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= state.rulesConfig.maxJailTurns) {
          // Must pay bail or use card
          state.phase = GamePhaseEnum.JAIL_DECISION;
          state.pendingJailDecisionPlayerId = player.id;
        }
        // Turn ends
        state.phase = GamePhaseEnum.TURN_END;
      }
      return;
    }

    // Normal movement
    this.movePlayer(state, player, diceRoll.total);
  }

  private movePlayer(state: GameState, player: Player, spaces: number): void {
    const oldPosition = player.position;
    const newPosition = calculateNextPosition(oldPosition, spaces);
    player.position = newPosition;

    // Check if passed GO
    if (didPassGo(oldPosition, newPosition)) {
      player.money += state.rulesConfig.goSalary;
    }

    // Handle landing on space
    const property = getPropertyAtPosition(state.board, newPosition);
    if (!property) return;

    switch (property.type) {
      case PropertyType.STREET:
      case PropertyType.RAILROAD:
      case PropertyType.UTILITY:
        this.handlePropertyLanding(state, player, property);
        break;
      case PropertyType.SPECIAL:
        this.handleSpecialSpace(state, player, property);
        break;
    }
  }

  private handlePropertyLanding(state: GameState, player: Player, property: Property): void {
    if (property.ownerId === null) {
      // Unowned - can buy or auction
      if (player.money >= property.price) {
        // Player can choose to buy or auction
        state.phase = GamePhaseEnum.AUCTION;
        state.activeAuction = {
          id: generateUUID(),
          propertyId: property.id,
          currentBid: 0,
          currentBidderId: null,
          bidders: state.players.filter(p => !p.isBankrupt).map(p => p.id),
          startedAt: Date.now(),
          endsAt: Date.now() + GAME_CONSTANTS.AUCTION_TIMEOUT_MS,
          status: 'active',
        };
      } else {
        // Can't afford, must auction
        this.startAuction(state, property);
      }
    } else if (property.ownerId !== player.id) {
      // Owned by another player - pay rent
      const rent = calculateRent(property, state.board, state.diceRoll);
      if (rent > 0) {
        this.transferMoney(state, player.id, property.ownerId, rent);
      }
    }
    // If owned by self, nothing happens
  }

  private handleSpecialSpace(state: GameState, player: Player, property: Property): void {
    switch (property.boardPosition) {
      case GAME_CONSTANTS.GO_POSITION:
        // Already handled in movePlayer (collect salary)
        break;
      case GAME_CONSTANTS.JAIL_POSITION:
        // Just visiting - nothing happens
        break;
      case GAME_CONSTANTS.FREE_PARKING_POSITION:
        if (state.rulesConfig.freeParkingJackpot && state.freeParkingJackpot > 0) {
          player.money += state.freeParkingJackpot;
          state.freeParkingJackpot = 0;
        }
        break;
      case GAME_CONSTANTS.GO_TO_JAIL_POSITION:
        this.sendToJail(state, player);
        break;
      // Income Tax and Luxury Tax handled by property price (0) and special logic
      default:
        // Tax spaces
        if (property.name === 'Income Tax') {
          const tax = Math.min(state.rulesConfig.incomeTaxAmount, Math.floor(player.money * 0.1));
          player.money -= tax;
          if (state.rulesConfig.freeParkingCollectsTaxes) {
            state.freeParkingJackpot += tax;
          }
        } else if (property.name === 'Luxury Tax') {
          player.money -= state.rulesConfig.luxuryTaxAmount;
          if (state.rulesConfig.freeParkingCollectsTaxes) {
            state.freeParkingJackpot += state.rulesConfig.luxuryTaxAmount;
          }
        }
        break;
    }
  }

  private sendToJail(state: GameState, player: Player): void {
    player.inJail = true;
    player.jailTurns = 0;
    player.position = GAME_CONSTANTS.JAIL_POSITION;
    state.phase = GamePhaseEnum.TURN_END;
  }

  private startAuction(state: GameState, property: Property): void {
    state.phase = GamePhaseEnum.AUCTION;
    state.activeAuction = {
      id: generateUUID(),
      propertyId: property.id,
      currentBid: 0,
      currentBidderId: null,
      bidders: state.players.filter(p => !p.isBankrupt && p.id !== state.players[state.currentPlayerIndex].id).map(p => p.id),
      startedAt: Date.now(),
      endsAt: Date.now() + GAME_CONSTANTS.AUCTION_TIMEOUT_MS,
      status: 'active',
    };
  }

  private executeBuyProperty(state: GameState, move: Move): void {
    const { propertyId } = move.data as { propertyId: UUID };
    const property = state.board.find(p => p.id === propertyId);
    if (!property) throw new PropertyNotFoundError(propertyId);
    if (property.ownerId !== null) throw new PropertyAlreadyOwnedError(propertyId, property.ownerId);

    const player = state.players[state.currentPlayerIndex];
    if (player.money < property.price) throw new InsufficientFundsError(player.id, property.price, player.money);

    // Buy property
    player.money -= property.price;
    property.ownerId = player.id;
    player.properties.push(property.id);

    // End auction phase
    state.phase = GamePhaseEnum.PLAYING;
    state.activeAuction = undefined;
  }

  private executeAuctionBid(state: GameState, move: Move): void {
    const { auctionId, amount } = move.data as { auctionId: UUID; amount: number };
    const auction = state.activeAuction;
    if (!auction || auction.id !== auctionId) throw new AuctionNotFoundError(auctionId);
    if (auction.status !== 'active') throw new AuctionEndedError(auctionId);

    const player = state.players.find(p => p.id === move.playerId);
    if (!player) throw new PlayerNotInGameError(state.id, move.playerId);
    if (player.isBankrupt) throw new PlayerBankruptError(player.id);
    if (!auction.bidders.includes(player.id)) throw new InvalidBidError('Player not in auction');
    if (amount <= auction.currentBid) throw new InvalidBidError('Bid must be higher than current bid');
    if (player.money < amount) throw new InsufficientFundsError(player.id, amount, player.money);

    auction.currentBid = amount;
    auction.currentBidderId = player.id;
  }

  private executePayJailBail(state: GameState, move: Move): void {
    const player = state.players[state.currentPlayerIndex];
    if (!player.inJail) throw new NotInJailError(player.id);

    const bail = state.rulesConfig.bailAmount;
    if (player.money < bail) throw new InsufficientFundsError(player.id, bail, player.money);

    player.money -= bail;
    player.inJail = false;
    player.jailTurns = 0;
    state.phase = GamePhaseEnum.PLAYING;
    state.pendingJailDecisionPlayerId = undefined;
  }

  private executeUseGetOutOfJailFree(state: GameState, move: Move): void {
    const player = state.players[state.currentPlayerIndex];
    if (!player.inJail) throw new NotInJailError(player.id);
    if (player.getOutOfJailFreeCards <= 0) throw new NoGetOutOfJailFreeCardError(player.id);

    player.getOutOfJailFreeCards--;
    player.inJail = false;
    player.jailTurns = 0;
    state.phase = GamePhaseEnum.PLAYING;
    state.pendingJailDecisionPlayerId = undefined;
  }

  private executeBuildHouse(state: GameState, move: Move): void {
    const { propertyId } = move.data as { propertyId: UUID };
    const property = state.board.find(p => p.id === propertyId);
    if (!property) throw new PropertyNotFoundError(propertyId);
    if (property.ownerId !== move.playerId) throw new PropertyNotOwnedError(propertyId);
    if (property.isMortgaged) throw new PropertyMortgagedError(propertyId);
    if (property.houses >= 5) throw new MaxHotelsReachedError();

    const player = state.players[state.currentPlayerIndex];
    const houseCost = property.houseCost;

    // Check monopoly
    if (!hasMonopoly(state.board, player.id, property.group!)) {
      throw new InvalidTradeError('Must own all properties in group to build');
    }

    // Check even building rule
    if (state.rulesConfig.mustBuildEvenly) {
      const groupProps = state.board.filter(p => p.group === property.group && p.type === PropertyType.STREET);
      const minHouses = Math.min(...groupProps.map(p => p.houses));
      if (property.houses > minHouses) {
        throw new MustBuildEvenlyError(property.group!);
      }
    }

    if (player.money < houseCost) throw new InsufficientFundsError(player.id, houseCost, player.money);

    // Check house/hotel limits
    const totalHouses = state.board.reduce((sum, p) => sum + (p.houses >= 1 && p.houses <= 4 ? 1 : 0), 0);
    const totalHotels = state.board.filter(p => p.houses === 5).length;

    if (property.houses === 4) {
      // Building hotel
      if (totalHotels >= state.rulesConfig.maxHotels) throw new MaxHotelsReachedError();
    } else {
      if (totalHouses >= state.rulesConfig.maxHouses) throw new MaxHousesReachedError();
    }

    player.money -= houseCost;
    property.houses++;
  }

  private executeSellHouse(state: GameState, move: Move): void {
    const { propertyId } = move.data as { propertyId: UUID };
    const property = state.board.find(p => p.id === propertyId);
    if (!property) throw new PropertyNotFoundError(propertyId);
    if (property.ownerId !== move.playerId) throw new PropertyNotOwnedError(propertyId);
    if (property.houses === 0) throw new InvalidTradeError('No houses to sell');

    const player = state.players[state.currentPlayerIndex];

    // Check even building rule
    if (state.rulesConfig.mustBuildEvenly) {
      const groupProps = state.board.filter(p => p.group === property.group && p.type === PropertyType.STREET);
      const maxHouses = Math.max(...groupProps.map(p => p.houses));
      if (property.houses < maxHouses) {
        throw new MustBuildEvenlyError(property.group!);
      }
    }

    const refund = state.rulesConfig.sellHousesAtHalfPrice ? Math.floor(property.houseCost / 2) : property.houseCost;
    player.money += refund;
    property.houses--;
  }

  private executeMortgageProperty(state: GameState, move: Move): void {
    const { propertyId } = move.data as { propertyId: UUID };
    const property = state.board.find(p => p.id === propertyId);
    if (!property) throw new PropertyNotFoundError(propertyId);
    if (property.ownerId !== move.playerId) throw new PropertyNotOwnedError(propertyId);
    if (property.isMortgaged) throw new InvalidTradeError('Property already mortgaged');
    if (property.houses > 0) throw new CannotMortgageWithHousesError(propertyId);

    const player = state.players[state.currentPlayerIndex];
    const mortgageValue = property.mortgageValue;

    property.isMortgaged = true;
    player.money += mortgageValue;
  }

  private executeUnmortgageProperty(state: GameState, move: Move): void {
    const { propertyId } = move.data as { propertyId: UUID };
    const property = state.board.find(p => p.id === propertyId);
    if (!property) throw new PropertyNotFoundError(propertyId);
    if (property.ownerId !== move.playerId) throw new PropertyNotOwnedError(propertyId);
    if (!property.isMortgaged) throw new InvalidTradeError('Property not mortgaged');

    const player = state.players[state.currentPlayerIndex];
    const unmortgageCost = Math.ceil(property.mortgageValue * (1 + state.rulesConfig.mortgageInterestRate));

    if (player.money < unmortgageCost) throw new InsufficientFundsError(player.id, unmortgageCost, player.money);

    property.isMortgaged = false;
    player.money -= unmortgageCost;
  }

  private executeProposeTrade(state: GameState, move: Move): void {
    const tradeData = move.data as Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>;
    const fromPlayer = state.players.find(p => p.id === tradeData.fromPlayerId);
    const toPlayer = state.players.find(p => p.id === tradeData.toPlayerId);

    if (!fromPlayer || !toPlayer) throw new PlayerNotInGameError(state.id, tradeData.fromPlayerId);
    if (fromPlayer.isBankrupt || toPlayer.isBankrupt) throw new PlayerBankruptError('One player is bankrupt');
    if (!state.rulesConfig.allowTrading) throw new InvalidTradeError('Trading is disabled');
    if (!state.rulesConfig.allowTradingWhileInJail && (fromPlayer.inJail || toPlayer.inJail)) {
      throw new InvalidTradeError('Cannot trade while in jail');
    }

    // Validate properties belong to correct players
    for (const propId of tradeData.offeredProperties) {
      const prop = state.board.find(p => p.id === propId);
      if (!prop || prop.ownerId !== fromPlayer.id) {
        throw new InvalidTradeError(`Property ${propId} not owned by offering player`);
      }
    }
    for (const propId of tradeData.requestedProperties) {
      const prop = state.board.find(p => p.id === propId);
      if (!prop || prop.ownerId !== toPlayer.id) {
        throw new InvalidTradeError(`Property ${propId} not owned by receiving player`);
      }
    }

    // Validate Get Out of Jail Free cards
    if (tradeData.offeredGetOutOfJailFree > fromPlayer.getOutOfJailFreeCards) {
      throw new InvalidTradeError('Offering player does not have enough Get Out of Jail Free cards');
    }
    if (tradeData.requestedGetOutOfJailFree > toPlayer.getOutOfJailFreeCards) {
      throw new InvalidTradeError('Receiving player does not have enough Get Out of Jail Free cards');
    }

    // Validate money
    if (tradeData.offeredMoney > fromPlayer.money) {
      throw new InsufficientFundsError(fromPlayer.id, tradeData.offeredMoney, fromPlayer.money);
    }
    if (tradeData.requestedMoney > toPlayer.money) {
      throw new InsufficientFundsError(toPlayer.id, tradeData.requestedMoney, toPlayer.money);
    }

    const trade: TradeOffer = {
      ...tradeData,
      id: generateUUID(),
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + GAME_CONSTANTS.TRADE_TIMEOUT_MS,
    };

    state.activeTrade = trade;
    state.phase = GamePhaseEnum.TRADING;
  }

  private executeAcceptTrade(state: GameState, move: Move): void {
    const { tradeId } = move.data as { tradeId: UUID };
    const trade = state.activeTrade;
    if (!trade || trade.id !== tradeId) throw new TradeNotFoundError(tradeId);
    if (trade.status !== 'pending') throw new TradeAlreadyResolvedError(tradeId);
    if (Date.now() > trade.expiresAt) throw new TradeExpiredError(tradeId);

    const toPlayer = state.players.find(p => p.id === trade.toPlayerId);
    if (!toPlayer || toPlayer.id !== move.playerId) {
      throw new InvalidTradeError('Not the intended recipient');
    }

    // Execute trade
    this.resolveTrade(state, trade, true);
  }

  private executeRejectTrade(state: GameState, move: Move): void {
    const { tradeId } = move.data as { tradeId: UUID };
    const trade = state.activeTrade;
    if (!trade || trade.id !== tradeId) throw new TradeNotFoundError(tradeId);
    if (trade.status !== 'pending') throw new TradeAlreadyResolvedError(tradeId);

    const toPlayer = state.players.find(p => p.id === trade.toPlayerId);
    if (!toPlayer || toPlayer.id !== move.playerId) {
      throw new InvalidTradeError('Not the intended recipient');
    }

    this.resolveTrade(state, trade, false);
  }

  private resolveTrade(state: GameState, trade: TradeOffer, accepted: boolean): void {
    if (accepted) {
      const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId)!;
      const toPlayer = state.players.find(p => p.id === trade.toPlayerId)!;

      // Transfer money
      fromPlayer.money -= trade.offeredMoney;
      toPlayer.money += trade.offeredMoney;
      toPlayer.money -= trade.requestedMoney;
      fromPlayer.money += trade.requestedMoney;

      // Transfer properties
      for (const propId of trade.offeredProperties) {
        const prop = state.board.find(p => p.id === propId)!;
        prop.ownerId = toPlayer.id;
        fromPlayer.properties = fromPlayer.properties.filter(id => id !== propId);
        toPlayer.properties.push(propId);
      }
      for (const propId of trade.requestedProperties) {
        const prop = state.board.find(p => p.id === propId)!;
        prop.ownerId = fromPlayer.id;
        toPlayer.properties = toPlayer.properties.filter(id => id !== propId);
        fromPlayer.properties.push(propId);
      }

      // Transfer Get Out of Jail Free cards
      fromPlayer.getOutOfJailFreeCards -= trade.offeredGetOutOfJailFree;
      toPlayer.getOutOfJailFreeCards += trade.offeredGetOutOfJailFree;
      toPlayer.getOutOfJailFreeCards -= trade.requestedGetOutOfJailFree;
      fromPlayer.getOutOfJailFreeCards += trade.requestedGetOutOfJailFree;
    }

    trade.status = accepted ? 'accepted' : 'rejected';
    state.activeTrade = undefined;
    state.phase = GamePhaseEnum.PLAYING;
  }

  private executeEndTurn(state: GameState, move: Move): void {
    const player = state.players[state.currentPlayerIndex];

    // Check if in jail and needs to resolve
    if (player.inJail && state.phase === GamePhaseEnum.JAIL_DECISION) {
      throw new MustResolveJailFirstError(player.id);
    }

    // Check for doubles - if rolled doubles, player gets another turn
    if (state.diceRoll?.isDouble && !player.inJail) {
      // Player gets another turn, but dice roll is cleared
      state.diceRoll = undefined;
      return;
    }

    // Move to next player
    state.currentPlayerIndex = getNextPlayerIndex(state);
    state.turn++;
    state.diceRoll = undefined;
    state.doublesCount = 0;
    state.phase = GamePhaseEnum.PLAYING;

    // Check game over
    const winnerId = checkGameOver(state);
    if (winnerId) {
      state.phase = GamePhaseEnum.GAME_OVER;
      state.winnerId = winnerId;
      state.endedAt = Date.now();
    }
  }

  private executeDeclareBankruptcy(state: GameState, move: Move): void {
    const player = state.players[state.currentPlayerIndex];
    player.isBankrupt = true;

    // Transfer all assets to bank (or creditor if owed)
    // For simplicity, return properties to bank
    for (const propId of player.properties) {
      const prop = state.board.find(p => p.id === propId);
      if (prop) {
        prop.ownerId = null;
        prop.houses = 0;
        prop.isMortgaged = false;
      }
    }
    player.properties = [];

    // Check game over
    const winnerId = checkGameOver(state);
    if (winnerId) {
      state.phase = GamePhaseEnum.GAME_OVER;
      state.winnerId = winnerId;
      state.endedAt = Date.now();
    } else {
      state.phase = GamePhaseEnum.TURN_END;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private transferMoney(state: GameState, fromId: UUID, toId: UUID, amount: number): void {
    const fromPlayer = state.players.find(p => p.id === fromId);
    const toPlayer = state.players.find(p => p.id === toId);
    if (!fromPlayer || !toPlayer) return;

    if (fromPlayer.money < amount) {
      // Player goes bankrupt - transfer all remaining money
      amount = fromPlayer.money;
    }

    fromPlayer.money -= amount;
    toPlayer.money += amount;

    // Check bankruptcy
    if (fromPlayer.money <= 0 && fromPlayer.properties.length === 0) {
      fromPlayer.isBankrupt = true;
    }
  }

  /**
   * Start a new game from lobby
   */
  static createFromLobby(
    gameId: UUID,
    lobbyId: UUID,
    players: Player[],
    rulesConfig: Partial<RulesConfig>
  ): GameEngine {
    const mergedRules = mergeRulesConfig(rulesConfig);
    const initialState = createInitialGameState(gameId, lobbyId, players, mergedRules);
    return new GameEngine(initialState);
  }

  /**
   * Replay a game from move log
   */
  static replay(initialState: GameState, moves: Move[]): GameState {
    const engine = new GameEngine(cloneGameState(initialState));
    for (const move of moves) {
      engine.applyMove(move);
    }
    return engine.getState();
  }

  /**
   * Get possible actions for current player
   */
  getPossibleActions(): PlayerAction[] {
    const state = this.state;
    const player = state.players[state.currentPlayerIndex];
    const actions: PlayerAction[] = [];

    if (state.phase === GamePhaseEnum.GAME_OVER) return actions;

    switch (state.phase) {
      case GamePhaseEnum.PLAYING:
        if (!state.diceRoll && !player.inJail) {
          actions.push(PlayerActionEnum.ROLL_DICE);
        }
        if (player.inJail) {
          if (player.getOutOfJailFreeCards > 0) {
            actions.push(PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE);
          }
          if (player.money >= state.rulesConfig.bailAmount) {
            actions.push(PlayerActionEnum.PAY_JAIL_BAIL);
          }
        }
        // Building actions
        if (!player.inJail && state.diceRoll) {
          const ownedProps = getPlayerProperties(state.board, player.id);
          for (const prop of ownedProps) {
            if (prop.type === PropertyType.STREET && !prop.isMortgaged) {
              if (hasMonopoly(state.board, player.id, prop.group!) && prop.houses < 5) {
                actions.push(PlayerActionEnum.BUILD_HOUSE);
              }
              if (prop.houses > 0) {
                actions.push(PlayerActionEnum.SELL_HOUSE);
              }
            }
            if (!prop.isMortgaged && prop.houses === 0) {
              actions.push(PlayerActionEnum.MORTGAGE_PROPERTY);
            }
            if (prop.isMortgaged) {
              actions.push(PlayerActionEnum.UNMORTGAGE_PROPERTY);
            }
          }
        }
        // Trading
        if (state.rulesConfig.allowTrading && (!player.inJail || state.rulesConfig.allowTradingWhileInJail)) {
          actions.push(PlayerActionEnum.PROPOSE_TRADE);
        }
        actions.push(PlayerActionEnum.END_TURN);
        actions.push(PlayerActionEnum.DECLARE_BANKRUPTCY);
        break;

      case GamePhaseEnum.AUCTION:
        if (state.activeAuction?.bidders.includes(player.id)) {
          actions.push(PlayerActionEnum.AUCTION_BID);
        }
        break;

      case GamePhaseEnum.TRADING:
        if (state.activeTrade?.toPlayerId === player.id) {
          actions.push(PlayerActionEnum.ACCEPT_TRADE);
          actions.push(PlayerActionEnum.REJECT_TRADE);
        }
        break;

      case GamePhaseEnum.JAIL_DECISION:
        if (state.pendingJailDecisionPlayerId === player.id) {
          if (player.getOutOfJailFreeCards > 0) {
            actions.push(PlayerActionEnum.USE_GET_OUT_OF_JAIL_FREE);
          }
          if (player.money >= state.rulesConfig.bailAmount) {
            actions.push(PlayerActionEnum.PAY_JAIL_BAIL);
          }
        }
        break;
    }

    return actions;
  }
}