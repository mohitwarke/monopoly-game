// Frontend-specific types
// Extends and complements the shared types from @monopoly/shared

import type { UUID, GameState, Player, Property, Lobby, LobbyPlayer, Move, TradeOffer, Auction, RulesConfig, Card, DiceRoll, GamePhase, PlayerAction, AIDifficulty, LobbyStatus, TournamentFormat, TournamentStatus, MatchStatus, PluginType, PluginPermission, PluginManifest } from '@monopoly/shared';

// ============================================
// UI State Types
// ============================================

/** Toast notification types */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Modal types */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

/** Dropdown item */
export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

/** Tab configuration */
export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/** Accordion item */
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/** Badge variants */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

/** Avatar types */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarShape = 'circle' | 'square';

/** Progress variants */
export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

/** Card variants */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Button variants */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/** Input types */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

/** Select option */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Switch props */
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

/** Tabs props */
export interface TabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'card';
  fullWidth?: boolean;
}

/** Accordion props */
export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

/** Tooltip props */
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

/** Badge props */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

/** Avatar props */
export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  shape?: AvatarShape;
}

/** Progress props */
export interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

/** Card props */
export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Divider props */
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
  className?: string;
}

/** Skeleton props */
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/** Empty state props */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** Loading overlay props */
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// Game UI Types
// ============================================

/** Game action for UI */
export interface GameActionUI {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Property action for UI */
export interface PropertyActionUI {
  propertyId: UUID;
  action: 'buy' | 'build' | 'sell' | 'mortgage' | 'unmortgage' | 'trade';
  label: string;
  cost?: number;
  disabled?: boolean;
  onClick: () => void;
}

/** Trade UI state */
export interface TradeUIState {
  isOpen: boolean;
  trade?: TradeOffer;
  mode: 'propose' | 'review' | 'counter';
  step: 'select-player' | 'select-items' | 'confirm';
}

/** Auction UI state */
export interface AuctionUIState {
  isOpen: boolean;
  auction?: Auction;
  currentBid: number;
  myBid: number;
  timeRemaining: number;
}

/** Dice UI state */
export interface DiceUIState {
  rolling: boolean;
  roll?: DiceRoll;
  history: DiceRoll[];
  animationPhase: 'idle' | 'shaking' | 'settling' | 'result';
}

/** Player panel props */
export interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  isMyTurn: boolean;
  onActionClick?: (action: string, data?: unknown) => void;
  showNetWorth?: boolean;
  compact?: boolean;
}

/** Game log entry for UI */
export interface GameLogEntryUI {
  id: string;
  turn: number;
  playerName: string;
  playerColor: string;
  action: string;
  timestamp: number;
  details?: string;
}

/** Property detail modal props */
export interface PropertyDetailModalProps {
  property: Property;
  gameState: GameState;
  currentPlayer: Player;
  onClose: () => void;
  onAction: (action: string, data?: unknown) => void;
}

/** Chat message for UI */
export interface ChatMessageUI {
  id: string;
  playerId: UUID;
  playerName: string;
  playerColor: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

/** Notification for UI */
export interface NotificationUI {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================
// Lobby UI Types
// ============================================

/** Lobby card props */
export interface LobbyCardProps {
  lobby: Lobby;
  currentUserId?: UUID;
  onJoin: (lobbyId: UUID) => void;
  onSpectate?: (lobbyId: UUID) => void;
  showCopyCode?: boolean;
}

/** Lobby list filters */
export interface LobbyListFilters {
  search: string;
  status: 'all' | 'waiting' | 'inGame';
  sortBy: 'created' | 'players' | 'name';
  sortOrder: 'asc' | 'desc';
}

/** Create lobby form */
export interface CreateLobbyForm {
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  rulesConfig: Partial<RulesConfig>;
}

/** Join lobby form */
export interface JoinLobbyForm {
  code: string;
  name: string;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
}

// ============================================
// Tournament UI Types
// ============================================

/** Tournament card props */
export interface TournamentCardProps {
  tournament: {
    id: UUID;
    name: string;
    format: TournamentFormat;
    status: TournamentStatus;
    maxPlayers: number;
    currentPlayers: number;
    startDate: Date;
    entryFee: number;
    prizePool: number;
  };
  onRegister: (tournamentId: UUID) => void;
  onSpectate: (tournamentId: UUID) => void;
  onViewResults: (tournamentId: UUID) => void;
}

/** Tournament filters */
export interface TournamentFilters {
  search: string;
  status: 'all' | 'registration' | 'inProgress' | 'completed';
  format: 'all' | TournamentFormat;
}

/** Tournament bracket node */
export interface TournamentBracketNode {
  id: UUID;
  matchId?: UUID;
  player1?: { id: UUID; name: string; seed?: number };
  player2?: { id: UUID; name: string; seed?: number };
  winnerId?: UUID;
  status: MatchStatus;
  round: number;
  position: number;
  children?: [TournamentBracketNode, TournamentBracketNode];
}

// ============================================
// Profile UI Types
// ============================================

/** User stats for profile */
export interface UserStatsUI {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalEarnings: number;
  highestNetWorth: number;
  favoriteProperty: string;
  averageGameTime: number;
  currentStreak: number;
}

/** Recent game for profile */
export interface RecentGameUI {
  id: UUID;
  date: Date;
  result: 'win' | 'loss';
  netWorth: number;
  duration: number;
  players: number;
}

/** Achievement for profile */
export interface AchievementUI {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  date?: Date;
  progress?: number; // 0-100 for locked achievements
}

// ============================================
// Settings UI Types
// ============================================

/** Settings tab */
export type SettingsTab = 'account' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'danger';

/** Notification preferences */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  gameInvites: boolean;
  gameUpdates: boolean;
  tournamentUpdates: boolean;
  marketing: boolean;
}

/** Appearance preferences */
export interface AppearancePreferences {
  theme: 'dark' | 'light' | 'system';
  animations: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  accentColor: string;
}

/** Privacy preferences */
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showGameHistory: boolean;
  allowFriendRequests: boolean;
}

/** Active session */
export interface ActiveSessionUI {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

// ============================================
// Modding UI Types
// ============================================

/** Plugin card props */
export interface PluginCardProps {
  plugin: {
    id: UUID;
    name: string;
    version: string;
    author: string;
    description: string;
    type: PluginType;
    downloads: number;
    rating: number;
    tags: string[];
    isInstalled: boolean;
    isPublic: boolean;
  };
  onInstall: (pluginId: UUID) => void;
  onUninstall: (pluginId: UUID) => void;
  onConfigure: (pluginId: UUID) => void;
}

/** Plugin filters */
export interface PluginFilters {
  search: string;
  type: 'all' | PluginType;
  sortBy: 'downloads' | 'rating' | 'updated' | 'name';
  sortOrder: 'asc' | 'desc';
}

/** Create plugin form */
export interface CreatePluginForm {
  name: string;
  type: PluginType;
  apiVersion: string;
  description: string;
  entryPoint: string;
  permissions: PluginPermission[];
  tags: string[];
}

/** Plugin type info */
export interface PluginTypeInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  permissions: PluginPermission[];
}

// ============================================
// API Response Types
// ============================================

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API error */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

/** API response wrapper */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Record<string, unknown>;
}

// ============================================
// WebSocket Event Types
// ============================================

/** Client-to-server events */
export interface ClientEvents {
  'create-lobby': { name: string; isPrivate: boolean; maxPlayers: number; rulesConfig?: Partial<RulesConfig> };
  'join-lobby': { code: string; name: string; isAI?: boolean; aiDifficulty?: AIDifficulty };
  'leave-lobby': void;
  'start-game': void;
  'make-move': { move: Omit<Move, 'id' | 'timestamp'> };
  'propose-trade': Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>;
  'respond-trade': { tradeId: UUID; accept: boolean };
  'chat-message': { text: string };
  'sync-request': { gameId: UUID };
  'heartbeat': void;
}

/** Server-to-client events */
export interface ServerEvents {
  'lobby-created': { lobby: Lobby };
  'lobby-updated': { lobby: Lobby };
  'player-joined': { player: LobbyPlayer };
  'player-left': { playerId: UUID };
  'game-started': { gameState: GameState };
  'game-state-update': { gameState: GameState };
  'move-made': { move: Move; gameState: GameState };
  'trade-proposed': { trade: TradeOffer };
  'trade-resolved': { tradeId: UUID; accepted: boolean };
  'auction-started': { auction: Auction };
  'auction-bid': { auctionId: UUID; bidderId: UUID; amount: number };
  'auction-ended': { auctionId: UUID; winnerId: UUID | null; amount: number };
  'player-eliminated': { playerId: UUID };
  'game-ended': { winnerId: UUID; finalState: GameState };
  'chat-message': { playerId: UUID; playerName: string; text: string; timestamp: number };
  'error': { code: string; message: string; details?: Record<string, unknown> };
  'sync-response': { gameState: GameState };
  'heartbeat-ack': void;
}

// ============================================
// Form Validation Types
// ============================================

/** Form field error */
export interface FieldError {
  field: string;
  message: string;
}

/** Form state */
export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/** Validation rule */
export interface ValidationRule<T> {
  validate: (value: T) => string | null;
  message: string;
}

// ============================================
// Theme Types
// ============================================

/** Theme mode */
export type ThemeMode = 'dark' | 'light' | 'system';

/** Color palette */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

/** Theme configuration */
export interface ThemeConfig {
  mode: ThemeMode;
  palette: ColorPalette;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndices: Record<string, number>;
}

// ============================================
// Utility Types
// ============================================

/** Deep partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Required keys */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Optional keys */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Non-nullable */
export type NonNullable<T> = T extends null | undefined ? never : T;

/** Array element type */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/** Promise resolve type */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** Constructor type */
export type Constructor<T = {}> = new (...args: unknown[]) => T;

/** Event handler type */
export type EventHandler<T = Event> = (event: T) => void;

/** Async event handler */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/** Debounced function */
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void;

/** Throttled function */
export type ThrottledFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void;