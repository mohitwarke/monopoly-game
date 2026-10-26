// Board Components

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, Building, Building2, Crown, Coins, Lock, Key, ArrowRight, ArrowLeft, RefreshCw, Settings, X } from 'lucide-react';
import type { Property, Player, GameState, GamePhase, PropertyType, PropertyGroup, UUID } from '@monopoly/shared';
import { PropertyType as PropertyTypeEnum, PropertyGroup as PropertyGroupEnum, GAME_CONSTANTS } from '@monopoly/shared';
import { formatMoney, calculateNetWorth, getPropertyAtPosition, hasMonopoly } from '@monopoly/shared';
import './board.css';

// ============================================
// Types
// ============================================

interface BoardProps {
  gameState: GameState;
  currentPlayer: Player;
  onPropertyClick?: (property: Property) => void;
  onActionClick?: (action: string, data?: unknown) => void;
  highlightedProperties?: UUID[];
  showAnimations?: boolean;
}

interface PropertySpaceProps {
  property: Property;
  players: Player[];
  currentPlayer: Player;
  highlighted?: boolean;
  onClick?: () => void;
  showAnimations?: boolean;
}

interface PlayerTokenProps {
  player: Player;
  position: { x: number; y: number };
  isCurrentPlayer: boolean;
  animation?: 'idle' | 'move' | 'jump' | 'celebrate' | 'bankrupt';
}

// ============================================
// Color Utilities
// ============================================

const GROUP_COLORS: Record<PropertyGroup, string> = {
  [PropertyGroupEnum.BROWN]: '#8B4513',
  [PropertyGroupEnum.LIGHT_BLUE]: '#87CEEB',
  [PropertyGroupEnum.PINK]: '#FF69B4',
  [PropertyGroupEnum.ORANGE]: '#FFA500',
  [PropertyGroupEnum.RED]: '#FF0000',
  [PropertyGroupEnum.YELLOW]: '#FFD700',
  [PropertyGroupEnum.GREEN]: '#008000',
  [PropertyGroupEnum.DARK_BLUE]: '#00008B',
  [PropertyGroupEnum.RAILROAD]: '#000000',
  [PropertyGroupEnum.UTILITY]: '#FFFFFF',
};

const GROUP_TEXT_COLORS: Record<PropertyGroup, string> = {
  [PropertyGroupEnum.BROWN]: '#FFFFFF',
  [PropertyGroupEnum.LIGHT_BLUE]: '#000000',
  [PropertyGroupEnum.PINK]: '#000000',
  [PropertyGroupEnum.ORANGE]: '#000000',
  [PropertyGroupEnum.RED]: '#FFFFFF',
  [PropertyGroupEnum.YELLOW]: '#000000',
  [PropertyGroupEnum.GREEN]: '#FFFFFF',
  [PropertyGroupEnum.DARK_BLUE]: '#FFFFFF',
  [PropertyGroupEnum.RAILROAD]: '#FFFFFF',
  [PropertyGroupEnum.UTILITY]: '#000000',
};

// ============================================
// Property Space Component
// ============================================

export const PropertySpace: React.FC<PropertySpaceProps> = ({
  property,
  players,
  currentPlayer,
  highlighted,
  onClick,
  showAnimations = true,
}) => {
  const playersOnSpace = players.filter(p => p.position === property.boardPosition && !p.isBankrupt);
  const isOwned = property.ownerId !== null;
  const owner = players.find(p => p.id === property.ownerId);
  const hasMonopoly_ = isOwned && owner && hasMonopoly([property], owner.id, property.group!);
  const groupColor = property.group ? GROUP_COLORS[property.group] : '#666';
  const textColor = property.group ? GROUP_TEXT_COLORS[property.group] : '#FFFFFF';

  const getRentDisplay = () => {
    if (property.type === PropertyTypeEnum.STREET && property.group) {
      const baseRent = property.rent[0];
      if (hasMonopoly_ && property.houses === 0) {
        return baseRent * 2;
      }
      return property.rent[property.houses] ?? 0;
    }
    return property.rent[0];
  };

  return (
    <motion.div
      className={`property-space ${property.type} ${isOwned ? 'owned' : ''} ${highlighted ? 'highlighted' : ''} ${property.isMortgaged ? 'mortgaged' : ''}`}
      style={{
        '--group-color': groupColor,
        '--text-color': textColor,
      } as React.CSSProperties}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={showAnimations ? { opacity: 1, y: 0 } : undefined}
      initial={showAnimations ? { opacity: 0, y: 10 } : undefined}
    >
      <div className="property-header" style={{ backgroundColor: groupColor, color: textColor }}>
        <span className="property-name">{property.name}</span>
        {property.type === PropertyTypeEnum.STREET && property.group && (
          <span className="property-group">{property.group}</span>
        )}
      </div>

      <div className="property-body">
        {property.type === PropertyTypeEnum.STREET && (
          <>
            <div className="property-price">
              Price: {formatMoney(property.price)}
            </div>
            <div className="property-rent">
              Rent: {formatMoney(getRentDisplay())}
              {hasMonopoly_ && property.houses === 0 && <span className="monopoly-badge">★</span>}
            </div>
            {property.houses > 0 && (
              <div className="property-houses">
                {property.houses === 5 ? (
                  <Building2 className="hotel-icon" size={16} />
                ) : (
                  Array.from({ length: property.houses }, (_, i) => (
                    <Building key={i} className="house-icon" size={12} />
                  ))
                )}
              </div>
            )}
            <div className="property-house-cost">
              House: {formatMoney(property.houseCost)}
            </div>
          </>
        )}

        {property.type === PropertyTypeEnum.RAILROAD && (
          <div className="property-rent">
            Rent: {formatMoney(25)} / {formatMoney(50)} / {formatMoney(100)} / {formatMoney(200)}
          </div>
        )}

        {property.type === PropertyTypeEnum.UTILITY && (
          <div className="property-rent">
            Rent: 4× / 10× Dice Roll
          </div>
        )}

        {property.type === PropertyTypeEnum.SPECIAL && (
          <div className="special-text">{property.name}</div>
        )}

        {isOwned && owner && (
          <div className="property-owner" style={{ borderColor: owner.color }}>
            Owned by {owner.name}
          </div>
        )}

        {property.isMortgaged && (
          <div className="mortgaged-badge">
            <Lock size={12} /> MORTGAGED
          </div>
        )}
      </div>

      <div className="property-players">
        {playersOnSpace.map((player, index) => (
          <motion.div
            key={player.id}
            className="player-token"
            style={{ backgroundColor: player.color, zIndex: index + 1 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {player.name.charAt(0).toUpperCase()}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// Player Token Component
// ============================================

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  position,
  isCurrentPlayer,
  animation = 'idle',
}) => {
  const tokenVariants = {
    idle: { scale: 1, rotate: 0 },
    move: { scale: 1.1, rotate: [0, -5, 5, -5, 0] },
    jump: { scale: 1.2, y: -20, rotate: [0, 10, -10, 0] },
    celebrate: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 10, 0] },
    bankrupt: { scale: 0.5, opacity: 0.3, rotate: 90 },
  };

  return (
    <motion.div
      className={`player-token-large ${isCurrentPlayer ? 'current' : ''} ${player.isBankrupt ? 'bankrupt' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: player.color,
        borderColor: isCurrentPlayer ? '#FFD700' : 'transparent',
      }}
      animate={tokenVariants[animation]}
      transition={{ duration: 0.3 }}
    >
      <span className="token-letter">{player.name.charAt(0).toUpperCase()}</span>
      {player.getOutOfJailFreeCards > 0 && (
        <span className="goojf-badge">
          <Key size={10} />
        </span>
      )}
      {player.inJail && (
        <span className="jail-badge">
          <Lock size={10} />
        </span>
      )}
    </motion.div>
  );
};

// ============================================
// Board Component
// ============================================

export const Board: React.FC<BoardProps> = ({
  gameState,
  currentPlayer,
  onPropertyClick,
  onActionClick,
  highlightedProperties = [],
  showAnimations = true,
}) => {
  // Calculate positions for each space (simplified - would use actual board layout)
  const spaces = useMemo(() => {
    const result: Array<{ property: Property; position: { x: number; y: number }; rotation: number }> = [];
    const boardSize = 400;
    const spaceSize = 60;
    const cornerSize = 80;
    const sideSpaces = 9;

    // Bottom row (0-10) - right to left
    for (let i = 0; i <= 10; i++) {
      const prop = gameState.board.find(p => p.boardPosition === i);
      if (prop) {
        const x = boardSize - cornerSize - (i % 10) * spaceSize;
        const y = boardSize - cornerSize;
        result.push({ property: prop, position: { x, y }, rotation: 0 });
      }
    }

    // Left row (11-20) - bottom to top
    for (let i = 11; i <= 20; i++) {
      const prop = gameState.board.find(p => p.boardPosition === i);
      if (prop) {
        const x = 0;
        const y = boardSize - cornerSize - ((i - 10) % 10) * spaceSize;
        result.push({ property: prop, position: { x, y }, rotation: 90 });
      }
    }

    // Top row (21-30) - left to right
    for (let i = 21; i <= 30; i++) {
      const prop = gameState.board.find(p => p.boardPosition === i);
      if (prop) {
        const x = cornerSize + ((i - 20) % 10) * spaceSize;
        const y = 0;
        result.push({ property: prop, position: { x, y }, rotation: 180 });
      }
    }

    // Right row (31-39) - top to bottom
    for (let i = 31; i <= 39; i++) {
      const prop = gameState.board.find(p => p.boardPosition === i);
      if (prop) {
        const x = boardSize - cornerSize;
        const y = cornerSize + ((i - 30) % 10) * spaceSize;
        result.push({ property: prop, position: { x, y }, rotation: 270 });
      }
    }

    return result;
  }, [gameState.board]);

  // Get player positions on board
  const playerPositions = useMemo(() => {
    const positions: Record<UUID, { x: number; y: number }> = {} as any;
    const spaceSize = 60;
    const cornerSize = 80;

    for (const player of gameState.players) {
      if (player.isBankrupt) continue;
      const pos = player.position;
      let x = 0, y = 0;

      if (pos <= 10) {
        // Bottom row
        x = 400 - cornerSize - (pos % 10) * spaceSize + spaceSize / 2;
        y = 400 - cornerSize + spaceSize / 2;
      } else if (pos <= 20) {
        // Left row
        x = cornerSize / 2;
        y = 400 - cornerSize - ((pos - 10) % 10) * spaceSize + spaceSize / 2;
      } else if (pos <= 30) {
        // Top row
        x = cornerSize + ((pos - 20) % 10) * spaceSize + spaceSize / 2;
        y = cornerSize / 2;
      } else {
        // Right row
        x = 400 - cornerSize / 2;
        y = cornerSize + ((pos - 30) % 10) * spaceSize + spaceSize / 2;
      }

      positions[player.id] = { x, y };
    }

    return positions;
  }, [gameState.players]);

  const handlePropertyClick = (property: Property) => {
    onPropertyClick?.(property);
  };

  return (
    <div className="board-container">
      <div className="board" style={{ width: 400, height: 400 }}>
        {/* Center */}
        <div className="board-center">
          <div className="board-logo">MONOPOLY</div>
          <div className="board-info">
            <div>Turn: {gameState.turn}</div>
            <div>Phase: {gameState.phase}</div>
            {gameState.diceRoll && (
              <DiceDisplay diceRoll={gameState.diceRoll} />
            )}
          </div>
        </div>

        {/* Spaces */}
        <AnimatePresence>
          {spaces.map(({ property, position, rotation }) => (
            <motion.div
              key={property.id}
              className="board-space-wrapper"
              style={{
                left: position.x,
                top: position.y,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <PropertySpace
                property={property}
                players={gameState.players}
                currentPlayer={currentPlayer}
                highlighted={highlightedProperties.includes(property.id)}
                onClick={() => handlePropertyClick(property)}
                showAnimations={showAnimations}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Player Tokens */}
        <AnimatePresence mode="popLayout">
          {gameState.players
            .filter(p => !p.isBankrupt)
            .map(player => {
              const pos = playerPositions[player.id];
              if (!pos) return null;

              return (
                <PlayerToken
                  key={player.id}
                  player={player}
                  position={pos}
                  isCurrentPlayer={player.id === currentPlayer.id}
                  animation={player.id === currentPlayer.id && gameState.diceRoll ? 'move' : 'idle'}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Side Panel */}
      <div className="board-sidebar">
        <PlayerPanel gameState={gameState} currentPlayer={currentPlayer} />
        <ActionPanel gameState={gameState} currentPlayer={currentPlayer} onActionClick={onActionClick} />
      </div>
    </div>
  );
};

// ============================================
// Dice Display Component
// ============================================

export const DiceDisplay: React.FC<{ diceRoll: { die1: number; die2: number; isDouble: boolean; total: number } }> = ({ diceRoll }) => {
  const DiceIcons = [null, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  return (
    <div className="dice-display">
      <div className="dice-pair">
        <DiceIcons[diceRoll.die1] className="dice-icon" size={24} />
        <DiceIcons[diceRoll.die2] className="dice-icon" size={24} />
      </div>
      <div className="dice-total">
        Total: {diceRoll.total} {diceRoll.isDouble && <span className="double-badge">DOUBLE!</span>}
      </div>
    </div>
  );
};

// ============================================
// Player Panel Component
// ============================================

interface PlayerPanelProps {
  gameState: GameState;
  currentPlayer: Player;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ gameState, currentPlayer }) => {
  const activePlayers = gameState.players.filter(p => !p.isBankrupt);

  return (
    <div className="player-panel">
      <h3>Players</h3>
      <div className="player-list">
        {activePlayers.map(player => {
          const netWorth = calculateNetWorth(player, gameState.board);
          const isCurrent = player.id === currentPlayer.id;

          return (
            <motion.div
              key={player.id}
              className={`player-row ${isCurrent ? 'current' : ''} ${player.isBankrupt ? 'bankrupt' : ''} ${player.inJail ? 'in-jail' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="player-color" style={{ backgroundColor: player.color }} />
              <div className="player-info">
                <div className="player-name">
                  {player.name} {player.isAI && <span className="ai-badge">🤖</span>}
                </div>
                <div className="player-stats">
                  <span>{formatMoney(player.money)}</span>
                  <span className="net-worth">NW: {formatMoney(netWorth)}</span>
                </div>
              </div>
              {player.inJail && <span className="jail-indicator"><Lock size={14} /></span>}
              {player.getOutOfJailFreeCards > 0 && (
                <span className="goojf-indicator" title={`${player.getOutOfJailFreeCards} Get Out of Jail Free`}>
                  <Key size={14} />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Action Panel Component
// ============================================

interface ActionPanelProps {
  gameState: GameState;
  currentPlayer: Player;
  onActionClick?: (action: string, data?: unknown) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ gameState, currentPlayer, onActionClick }) => {
  const actions = getAvailableActions(gameState, currentPlayer);

  if (actions.length === 0) return null;

  return (
    <div className="action-panel">
      <h3>Available Actions</h3>
      <div className="action-buttons">
        {actions.map(action => (
          <motion.button
            key={action}
            className="action-btn"
            onClick={() => onActionClick?.(action)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {getActionLabel(action)}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

function getAvailableActions(gameState: GameState, player: Player): string[] {
  const actions: string[] = [];

  switch (gameState.phase) {
    case 'playing':
      if (!gameState.diceRoll && !player.inJail) {
        actions.push('rollDice');
      }
      if (player.inJail) {
        if (player.getOutOfJailFreeCards > 0) actions.push('useGOOJF');
        if (player.money >= gameState.rulesConfig.bailAmount) actions.push('payBail');
      }
      if (gameState.diceRoll && !player.inJail) {
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
      if (player.money >= gameState.rulesConfig.bailAmount) actions.push('payBail');
      break;
  }

  return actions;
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    rollDice: '🎲 Roll Dice',
    payBail: '💰 Pay Bail ($50)',
    useGOOJF: '🔑 Use Get Out of Jail Free',
    endTurn: '➡️ End Turn',
    manageProperties: '🏠 Manage Properties',
    proposeTrade: '🤝 Propose Trade',
    bid: '💵 Bid',
    pass: '⏭️ Pass',
    acceptTrade: '✅ Accept Trade',
    rejectTrade: '❌ Reject Trade',
  };
  return labels[action] || action;
}

// ============================================
// Property Detail Modal
// ============================================

interface PropertyDetailProps {
  property: Property;
  gameState: GameState;
  currentPlayer: Player;
  onClose: () => void;
  onAction: (action: string, data?: unknown) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  gameState,
  currentPlayer,
  onClose,
  onAction,
}) => {
  const owner = gameState.players.find(p => p.id === property.ownerId);
  const isOwner = owner?.id === currentPlayer.id;
  const canBuy = !property.ownerId && currentPlayer.money >= property.price;
  const rent = property.type === PropertyTypeEnum.STREET ? property.rent[property.houses] : property.rent[0];

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal property-detail" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ backgroundColor: property.group ? GROUP_COLORS[property.group] : '#666' }}>
          <h2>{property.name}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="property-info">
            <div className="info-row">
              <span>Type:</span>
              <span>{property.type}</span>
            </div>
            {property.group && (
              <div className="info-row">
                <span>Group:</span>
                <span style={{ color: GROUP_COLORS[property.group] }}>{property.group}</span>
              </div>
            )}
            <div className="info-row">
              <span>Price:</span>
              <span>{formatMoney(property.price)}</span>
            </div>
            <div className="info-row">
              <span>Mortgage Value:</span>
              <span>{formatMoney(property.mortgageValue)}</span>
            </div>
            <div className="info-row">
              <span>House Cost:</span>
              <span>{formatMoney(property.houseCost)}</span>
            </div>

            {property.type === PropertyTypeEnum.STREET && (
              <div className="rent-table">
                <h4>Rent</h4>
                <table>
                  <thead>
                    <tr><th>Houses</th><th>Rent</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>0</td><td>{formatMoney(property.rent[0])}</td></tr>
                    <tr><td>1</td><td>{formatMoney(property.rent[1])}</td></tr>
                    <tr><td>2</td><td>{formatMoney(property.rent[2])}</td></tr>
                    <tr><td>3</td><td>{formatMoney(property.rent[3])}</td></tr>
                    <tr><td>4</td><td>{formatMoney(property.rent[4])}</td></tr>
                    <tr><td>Hotel</td><td>{formatMoney(property.rent[5])}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {property.type === PropertyTypeEnum.RAILROAD && (
              <div className="rent-table">
                <h4>Rent</h4>
                <table>
                  <tbody>
                    <tr><td>1 Railroad</td><td>{formatMoney(25)}</td></tr>
                    <tr><td>2 Railroads</td><td>{formatMoney(50)}</td></tr>
                    <tr><td>3 Railroads</td><td>{formatMoney(100)}</td></tr>
                    <tr><td>4 Railroads</td><td>{formatMoney(200)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {property.type === PropertyTypeEnum.UTILITY && (
              <div className="rent-table">
                <h4>Rent</h4>
                <p>4× Dice Roll (1 utility)</p>
                <p>10× Dice Roll (both utilities)</p>
              </div>
            )}
          </div>

          {owner && (
            <div className="owner-info">
              <h4>Owner: {owner.name}</h4>
              <div className="owner-stats">
                <span>Properties: {owner.properties.length}</span>
                <span>Cash: {formatMoney(owner.money)}</span>
              </div>
            </div>
          )}

          {property.isMortgaged && (
            <div className="mortgaged-notice">
              <Lock size={16} /> This property is mortgaged. No rent collected.
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!property.ownerId && canBuy && (
            <button className="btn btn-primary" onClick={() => onAction('buyProperty', { propertyId: property.id })}>
              Buy for {formatMoney(property.price)}
            </button>
          )}
          {isOwner && property.type === PropertyTypeEnum.STREET && !property.isMortgaged && (
            <>
              {property.houses < 5 && (
                <button className="btn btn-secondary" onClick={() => onAction('buildHouse', { propertyId: property.id })}>
                  Build House ({formatMoney(property.houseCost)})
                </button>
              )}
              {property.houses > 0 && (
                <button className="btn btn-secondary" onClick={() => onAction('sellHouse', { propertyId: property.id })}>
                  Sell House ({formatMoney(Math.floor(property.houseCost / 2))})
                </button>
              )}
            </>
          )}
          {isOwner && !property.isMortgaged && property.houses === 0 && (
            <button className="btn btn-warning" onClick={() => onAction('mortgageProperty', { propertyId: property.id })}>
              Mortgage ({formatMoney(property.mortgageValue)})
            </button>
          )}
          {isOwner && property.isMortgaged && (
            <button className="btn btn-primary" onClick={() => onAction('unmortgageProperty', { propertyId: property.id })}>
              Unmortgage ({formatMoney(Math.ceil(property.mortgageValue * 1.1))})
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};