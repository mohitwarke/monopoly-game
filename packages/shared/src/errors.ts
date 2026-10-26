// Custom Error Classes

export class MonopolyError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'MonopolyError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Game Errors
export class GameNotFoundError extends MonopolyError {
  constructor(gameId: string) {
    super('GAME_NOT_FOUND', `Game ${gameId} not found`, 404, { gameId });
    this.name = 'GameNotFoundError';
  }
}

export class GameAlreadyStartedError extends MonopolyError {
  constructor(gameId: string) {
    super('GAME_ALREADY_STARTED', `Game ${gameId} has already started`, 400, { gameId });
    this.name = 'GameAlreadyStartedError';
  }
}

export class GameNotStartedError extends MonopolyError {
  constructor(gameId: string) {
    super('GAME_NOT_STARTED', `Game ${gameId} has not started yet`, 400, { gameId });
    this.name = 'GameNotStartedError';
  }
}

export class GameEndedError extends MonopolyError {
  constructor(gameId: string) {
    super('GAME_ENDED', `Game ${gameId} has already ended`, 400, { gameId });
    this.name = 'GameEndedError';
  }
}

export class InvalidGamePhaseError extends MonopolyError {
  constructor(gameId: string, currentPhase: string, expectedPhase: string) {
    super(
      'INVALID_GAME_PHASE',
      `Game ${gameId} is in phase ${currentPhase}, expected ${expectedPhase}`,
      400,
      { gameId, currentPhase, expectedPhase }
    );
    this.name = 'InvalidGamePhaseError';
  }
}

export class NotYourTurnError extends MonopolyError {
  constructor(gameId: string, playerId: string, currentPlayerId: string) {
    super(
      'NOT_YOUR_TURN',
      `It is not player ${playerId}'s turn`,
      400,
      { gameId, playerId, currentPlayerId }
    );
    this.name = 'NotYourTurnError';
  }
}

export class PlayerNotInGameError extends MonopolyError {
  constructor(gameId: string, playerId: string) {
    super('PLAYER_NOT_IN_GAME', `Player ${playerId} is not in game ${gameId}`, 404, { gameId, playerId });
    this.name = 'PlayerNotInGameError';
  }
}

export class PlayerBankruptError extends MonopolyError {
  constructor(playerId: string) {
    super('PLAYER_BANKRUPT', `Player ${playerId} is bankrupt`, 400, { playerId });
    this.name = 'PlayerBankruptError';
  }
}

export class InsufficientFundsError extends MonopolyError {
  constructor(playerId: string, required: number, available: number) {
    super(
      'INSUFFICIENT_FUNDS',
      `Player ${playerId} has insufficient funds (need ${required}, have ${available})`,
      400,
      { playerId, required, available }
    );
    this.name = 'InsufficientFundsError';
  }
}

export class PropertyNotFoundError extends MonopolyError {
  constructor(propertyId: string) {
    super('PROPERTY_NOT_FOUND', `Property ${propertyId} not found`, 404, { propertyId });
    this.name = 'PropertyNotFoundError';
  }
}

export class PropertyNotOwnedError extends MonopolyError {
  constructor(propertyId: string) {
    super('PROPERTY_NOT_OWNED', `Property ${propertyId} is not owned`, 400, { propertyId });
    this.name = 'PropertyNotOwnedError';
  }
}

export class PropertyAlreadyOwnedError extends MonopolyError {
  constructor(propertyId: string, ownerId: string) {
    super(
      'PROPERTY_ALREADY_OWNED',
      `Property ${propertyId} is already owned by ${ownerId}`,
      400,
      { propertyId, ownerId }
    );
    this.name = 'PropertyAlreadyOwnedError';
  }
}

export class PropertyMortgagedError extends MonopolyError {
  constructor(propertyId: string) {
    super('PROPERTY_MORTGAGED', `Property ${propertyId} is mortgaged`, 400, { propertyId });
    this.name = 'PropertyMortgagedError';
  }
}

export class CannotMortgageWithHousesError extends MonopolyError {
  constructor(propertyId: string) {
    super('CANNOT_MORTGAGE_WITH_HOUSES', `Cannot mortgage property ${propertyId} with houses/hotel`, 400, { propertyId });
    this.name = 'CannotMortgageWithHousesError';
  }
}

export class MustBuildEvenlyError extends MonopolyError {
  constructor(group: string) {
    super('MUST_BUILD_EVENLY', `Must build evenly across ${group} properties`, 400, { group });
    this.name = 'MustBuildEvenlyError';
  }
}

export class MaxHousesReachedError extends MonopolyError {
  constructor() {
    super('MAX_HOUSES_REACHED', 'Maximum number of houses reached', 400);
    this.name = 'MaxHousesReachedError';
  }
}

export class MaxHotelsReachedError extends MonopolyError {
  constructor() {
    super('MAX_HOTELS_REACHED', 'Maximum number of hotels reached', 400);
    this.name = 'MaxHotelsReachedError';
  }
}

export class InvalidTradeError extends MonopolyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('INVALID_TRADE', message, 400, details);
    this.name = 'InvalidTradeError';
  }
}

export class TradeNotFoundError extends MonopolyError {
  constructor(tradeId: string) {
    super('TRADE_NOT_FOUND', `Trade ${tradeId} not found`, 404, { tradeId });
    this.name = 'TradeNotFoundError';
  }
}

export class TradeExpiredError extends MonopolyError {
  constructor(tradeId: string) {
    super('TRADE_EXPIRED', `Trade ${tradeId} has expired`, 400, { tradeId });
    this.name = 'TradeExpiredError';
  }
}

export class TradeAlreadyResolvedError extends MonopolyError {
  constructor(tradeId: string) {
    super('TRADE_ALREADY_RESOLVED', `Trade ${tradeId} has already been resolved`, 400, { tradeId });
    this.name = 'TradeAlreadyResolvedError';
  }
}

export class AuctionNotFoundError extends MonopolyError {
  constructor(auctionId: string) {
    super('AUCTION_NOT_FOUND', `Auction ${auctionId} not found`, 404, { auctionId });
    this.name = 'AuctionNotFoundError';
  }
}

export class AuctionEndedError extends MonopolyError {
  constructor(auctionId: string) {
    super('AUCTION_ENDED', `Auction ${auctionId} has ended`, 400, { auctionId });
    this.name = 'AuctionEndedError';
  }
}

export class InvalidBidError extends MonopolyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('INVALID_BID', message, 400, details);
    this.name = 'InvalidBidError';
  }
}

export class NotInJailError extends MonopolyError {
  constructor(playerId: string) {
    super('NOT_IN_JAIL', `Player ${playerId} is not in jail`, 400, { playerId });
    this.name = 'NotInJailError';
  }
}

export class AlreadyRolledError extends MonopolyError {
  constructor(playerId: string) {
    super('ALREADY_ROLLED', `Player ${playerId} has already rolled this turn`, 400, { playerId });
    this.name = 'AlreadyRolledError';
  }
}

export class MustResolveJailFirstError extends MonopolyError {
  constructor(playerId: string) {
    super('MUST_RESOLVE_JAIL_FIRST', `Player ${playerId} must resolve jail status first`, 400, { playerId });
    this.name = 'MustResolveJailFirstError';
  }
}

export class NoGetOutOfJailFreeCardError extends MonopolyError {
  constructor(playerId: string) {
    super('NO_GET_OUT_OF_JAIL_FREE_CARD', `Player ${playerId} has no Get Out of Jail Free cards`, 400, { playerId });
    this.name = 'NoGetOutOfJailFreeCardError';
  }
}

// Lobby Errors
export class LobbyNotFoundError extends MonopolyError {
  constructor(lobbyId: string) {
    super('LOBBY_NOT_FOUND', `Lobby ${lobbyId} not found`, 404, { lobbyId });
    this.name = 'LobbyNotFoundError';
  }
}

export class LobbyCodeInvalidError extends MonopolyError {
  constructor(code: string) {
    super('LOBBY_CODE_INVALID', `Invalid lobby code: ${code}`, 400, { code });
    this.name = 'LobbyCodeInvalidError';
  }
}

export class LobbyFullError extends MonopolyError {
  constructor(lobbyId: string) {
    super('LOBBY_FULL', `Lobby ${lobbyId} is full`, 400, { lobbyId });
    this.name = 'LobbyFullError';
  }
}

export class LobbyNotJoinableError extends MonopolyError {
  constructor(lobbyId: string, reason: string) {
    super('LOBBY_NOT_JOINABLE', `Cannot join lobby ${lobbyId}: ${reason}`, 400, { lobbyId, reason });
    this.name = 'LobbyNotJoinableError';
  }
}

export class NotLobbyHostError extends MonopolyError {
  constructor(lobbyId: string, playerId: string) {
    super('NOT_LOBBY_HOST', `Player ${playerId} is not the host of lobby ${lobbyId}`, 403, { lobbyId, playerId });
    this.name = 'NotLobbyHostError';
  }
}

export class GameAlreadyInProgressError extends MonopolyError {
  constructor(lobbyId: string) {
    super('GAME_ALREADY_IN_PROGRESS', `Lobby ${lobbyId} already has a game in progress`, 400, { lobbyId });
    this.name = 'GameAlreadyInProgressError';
  }
}

export class NotEnoughPlayersError extends MonopolyError {
  constructor(lobbyId: string, current: number, minimum: number) {
    super(
      'NOT_ENOUGH_PLAYERS',
      `Lobby ${lobbyId} needs at least ${minimum} players (currently ${current})`,
      400,
      { lobbyId, current, minimum }
    );
    this.name = 'NotEnoughPlayersError';
  }
}

// Authentication Errors
export class AuthenticationError extends MonopolyError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_REQUIRED', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class InvalidCredentialsError extends MonopolyError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenExpiredError extends MonopolyError {
  constructor() {
    super('TOKEN_EXPIRED', 'Authentication token has expired', 401);
    this.name = 'TokenExpiredError';
  }
}

export class TokenInvalidError extends MonopolyError {
  constructor() {
    super('TOKEN_INVALID', 'Invalid authentication token', 401);
    this.name = 'TokenInvalidError';
  }
}

export class UserNotFoundError extends MonopolyError {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User ${userId} not found`, 404, { userId });
    this.name = 'UserNotFoundError';
  }
}

export class UsernameTakenError extends MonopolyError {
  constructor(username: string) {
    super('USERNAME_TAKEN', `Username ${username} is already taken`, 409, { username });
    this.name = 'UsernameTakenError';
  }
}

export class EmailTakenError extends MonopolyError {
  constructor(email: string) {
    super('EMAIL_TAKEN', `Email ${email} is already registered`, 409, { email });
    this.name = 'EmailTakenError';
  }
}

export class ForbiddenError extends MonopolyError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

// Validation Errors
export class ValidationError extends MonopolyError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Validation failed', 400, { fieldErrors });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

// Tournament Errors
export class TournamentNotFoundError extends MonopolyError {
  constructor(tournamentId: string) {
    super('TOURNAMENT_NOT_FOUND', `Tournament ${tournamentId} not found`, 404, { tournamentId });
    this.name = 'TournamentNotFoundError';
  }
}

export class TournamentNotJoinableError extends MonopolyError {
  constructor(tournamentId: string, reason: string) {
    super('TOURNAMENT_NOT_JOINABLE', `Cannot join tournament ${tournamentId}: ${reason}`, 400, { tournamentId, reason });
    this.name = 'TournamentNotJoinableError';
  }
}

export class TournamentFullError extends MonopolyError {
  constructor(tournamentId: string) {
    super('TOURNAMENT_FULL', `Tournament ${tournamentId} is full`, 400, { tournamentId });
    this.name = 'TournamentFullError';
  }
}

export class AlreadyInTournamentError extends MonopolyError {
  constructor(tournamentId: string, userId: string) {
    super('ALREADY_IN_TOURNAMENT', `User ${userId} is already in tournament ${tournamentId}`, 400, { tournamentId, userId });
    this.name = 'AlreadyInTournamentError';
  }
}

// Plugin Errors
export class PluginNotFoundError extends MonopolyError {
  constructor(pluginId: string) {
    super('PLUGIN_NOT_FOUND', `Plugin ${pluginId} not found`, 404, { pluginId });
    this.name = 'PluginNotFoundError';
  }
}

export class PluginValidationError extends MonopolyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('PLUGIN_VALIDATION_ERROR', message, 400, details);
    this.name = 'PluginValidationError';
  }
}

export class PluginPermissionDeniedError extends MonopolyError {
  constructor(pluginId: string, permission: string) {
    super('PLUGIN_PERMISSION_DENIED', `Plugin ${pluginId} does not have permission: ${permission}`, 403, { pluginId, permission });
    this.name = 'PluginPermissionDeniedError';
  }
}

export class PluginExecutionError extends MonopolyError {
  constructor(pluginId: string, message: string) {
    super('PLUGIN_EXECUTION_ERROR', `Plugin ${pluginId} execution failed: ${message}`, 500, { pluginId, message });
    this.name = 'PluginExecutionError';
  }
}

// Rate Limiting
export class RateLimitError extends MonopolyError {
  constructor(retryAfter: number) {
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// WebSocket Errors
export class WebSocketError extends MonopolyError {
  constructor(message: string, code: string = 'WEBSOCKET_ERROR') {
    super(code, message, 400);
    this.name = 'WebSocketError';
  }
}

export class ConnectionLostError extends WebSocketError {
  constructor(playerId: string) {
    super(`Connection lost for player ${playerId}`, 'CONNECTION_LOST');
    this.name = 'ConnectionLostError';
  }
}

export class ReconnectWindowExpiredError extends WebSocketError {
  constructor(playerId: string) {
    super(`Reconnection window expired for player ${playerId}`, 'RECONNECT_WINDOW_EXPIRED');
    this.name = 'ReconnectWindowExpiredError';
  }
}

// AI Errors
export class AIError extends MonopolyError {
  constructor(message: string) {
    super('AI_ERROR', message, 500);
    this.name = 'AIError';
  }
}

export class AITimeoutError extends AIError {
  constructor(difficulty: string) {
    super(`AI (${difficulty}) timed out`);
    this.name = 'AITimeoutError';
  }
}

// Database Errors
export class DatabaseError extends MonopolyError {
  constructor(message: string, originalError?: Error) {
    super('DATABASE_ERROR', message, 500, { originalError: originalError?.message });
    this.name = 'DatabaseError';
  }
}

export class RecordNotFoundError extends MonopolyError {
  constructor(model: string, id: string) {
    super('RECORD_NOT_FOUND', `${model} with id ${id} not found`, 404, { model, id });
    this.name = 'RecordNotFoundError';
  }
}

export class UniqueConstraintError extends MonopolyError {
  constructor(field: string, value: string) {
    super('UNIQUE_CONSTRAINT', `${field} '${value}' already exists`, 409, { field, value });
    this.name = 'UniqueConstraintError';
  }
}

// Error code to class mapping for deserialization
export const ERROR_CLASSES: Record<string, new (...args: unknown[]) => MonopolyError> = {
  GAME_NOT_FOUND: GameNotFoundError,
  GAME_ALREADY_STARTED: GameAlreadyStartedError,
  GAME_NOT_STARTED: GameNotStartedError,
  GAME_ENDED: GameEndedError,
  INVALID_GAME_PHASE: InvalidGamePhaseError,
  NOT_YOUR_TURN: NotYourTurnError,
  PLAYER_NOT_IN_GAME: PlayerNotInGameError,
  PLAYER_BANKRUPT: PlayerBankruptError,
  INSUFFICIENT_FUNDS: InsufficientFundsError,
  PROPERTY_NOT_FOUND: PropertyNotFoundError,
  PROPERTY_NOT_OWNED: PropertyNotOwnedError,
  PROPERTY_ALREADY_OWNED: PropertyAlreadyOwnedError,
  PROPERTY_MORTGAGED: PropertyMortgagedError,
  CANNOT_MORTGAGE_WITH_HOUSES: CannotMortgageWithHousesError,
  MUST_BUILD_EVENLY: MustBuildEvenlyError,
  MAX_HOUSES_REACHED: MaxHousesReachedError,
  MAX_HOTELS_REACHED: MaxHotelsReachedError,
  INVALID_TRADE: InvalidTradeError,
  TRADE_NOT_FOUND: TradeNotFoundError,
  TRADE_EXPIRED: TradeExpiredError,
  TRADE_ALREADY_RESOLVED: TradeAlreadyResolvedError,
  AUCTION_NOT_FOUND: AuctionNotFoundError,
  AUCTION_ENDED: AuctionEndedError,
  INVALID_BID: InvalidBidError,
  NOT_IN_JAIL: NotInJailError,
  ALREADY_ROLLED: AlreadyRolledError,
  MUST_RESOLVE_JAIL_FIRST: MustResolveJailFirstError,
  NO_GET_OUT_OF_JAIL_FREE_CARD: NoGetOutOfJailFreeCardError,
  LOBBY_NOT_FOUND: LobbyNotFoundError,
  LOBBY_CODE_INVALID: LobbyCodeInvalidError,
  LOBBY_FULL: LobbyFullError,
  LOBBY_NOT_JOINABLE: LobbyNotJoinableError,
  NOT_LOBBY_HOST: NotLobbyHostError,
  GAME_ALREADY_IN_PROGRESS: GameAlreadyInProgressError,
  NOT_ENOUGH_PLAYERS: NotEnoughPlayersError,
  AUTHENTICATION_REQUIRED: AuthenticationError,
  INVALID_CREDENTIALS: InvalidCredentialsError,
  TOKEN_EXPIRED: TokenExpiredError,
  TOKEN_INVALID: TokenInvalidError,
  USER_NOT_FOUND: UserNotFoundError,
  USERNAME_TAKEN: UsernameTakenError,
  EMAIL_TAKEN: EmailTakenError,
  FORBIDDEN: ForbiddenError,
  VALIDATION_ERROR: ValidationError,
  TOURNAMENT_NOT_FOUND: TournamentNotFoundError,
  TOURNAMENT_NOT_JOINABLE: TournamentNotJoinableError,
  TOURNAMENT_FULL: TournamentFullError,
  ALREADY_IN_TOURNAMENT: AlreadyInTournamentError,
  PLUGIN_NOT_FOUND: PluginNotFoundError,
  PLUGIN_VALIDATION_ERROR: PluginValidationError,
  PLUGIN_PERMISSION_DENIED: PluginPermissionDeniedError,
  PLUGIN_EXECUTION_ERROR: PluginExecutionError,
  RATE_LIMITED: RateLimitError,
  CONNECTION_LOST: ConnectionLostError,
  RECONNECT_WINDOW_EXPIRED: ReconnectWindowExpiredError,
  AI_ERROR: AIError,
  AI_TIMEOUT: AITimeoutError,
  DATABASE_ERROR: DatabaseError,
  RECORD_NOT_FOUND: RecordNotFoundError,
  UNIQUE_CONSTRAINT: UniqueConstraintError,
};

/**
 * Create error instance from serialized error
 */
export function deserializeError(error: { code: string; message: string; details?: Record<string, unknown> }): MonopolyError {
  const ErrorClass = ERROR_CLASSES[error.code] || MonopolyError;
  return new ErrorClass(error.message, error.details);
}

/**
 * Check if error is a MonopolyError
 */
export function isMonopolyError(error: unknown): error is MonopolyError {
  return error instanceof MonopolyError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isMonopolyError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}