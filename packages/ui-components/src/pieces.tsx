// Piece Components

import React from 'react';
import { motion } from 'framer-motion';
import type { Player, UUID } from '@monopoly/shared';

// ============================================
// Types
// ============================================

interface PieceProps {
  player: Player;
  size?: number;
  animation?: 'idle' | 'move' | 'jump' | 'celebrate' | 'bankrupt';
  className?: string;
  onClick?: () => void;
}

interface PieceSetProps {
  players: Player[];
  size?: number;
  className?: string;
}

// ============================================
// Default Piece Designs
// ============================================

const PIECE_DESIGNS: Record<string, React.ReactNode> = {
  car: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H6V14H18V21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 7H17.5C17.78 7 18 7.22 18 7.5S17.78 8 17.5 8H6.5C6.22 8 6 7.78 6 7.5S6.22 7 6.5 7ZM19 12V8H5V12H19ZM7 18C7 18.55 6.55 19 6 19S5 18.55 5 18S5.45 17 6 17S7 17.45 7 18ZM18 18C18 18.55 17.55 19 17 19S16 18.55 16 18S16.45 17 17 17S18 17.45 18 18Z"/>
    </svg>
  ),
  hat: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 10.38 5.45 11.63 6.27 12.6L11 18.59V22H13V18.59L17.73 12.6C18.55 11.63 19 10.38 19 9C19 5.13 15.87 2 12 2ZM7 9C7 7.34 8.34 6 10 6S13 7.34 13 9C13 10.1 12.55 11 11.83 11.5L12 11.71V15H11V11.71L10.17 11.5C9.45 11 9 10.1 9 9C9 7.9 9.9 7 11 7S13 7.9 13 9Z"/>
    </svg>
  ),
  dog: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C10.9 2 9.9 2.2 9 2.5L7 7H5C3.9 7 3 7.9 3 9V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7H17L15 2.5C14.1 2.2 13.1 2 12 2ZM12 4C12.55 4 13 4.45 13 5S12.55 6 12 6S11 5.55 11 5S11.45 4 12 4ZM19 19H5V9H19V19ZM9 14C9 13.45 9.45 13 10 13S11 13.45 11 14S10.55 15 10 15S9 14.55 9 14ZM15 14C15 13.45 15.45 13 16 13S17 13.45 17 14S16.55 15 16 15S15 14.55 15 14Z"/>
    </svg>
  ),
  ship: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8.5V4A2.5 2.5 0 0 0 17.5 1.5H6.5A2.5 2.5 0 0 0 4 4V8.5C4 9.33 4.67 10 5.5 10H18.5C19.33 10 20 9.33 20 8.5ZM18.5 12H5.5C4.67 12 4 12.67 4 13.5V17C4 17.83 4.67 18.5 5.5 18.5H18.5C19.33 18.5 20 17.83 20 17V13.5C20 12.67 19.33 12 18.5 12ZM12 14C11.45 14 11 13.55 11 13S11.45 12 12 12S13 12.45 13 13S12.55 14 12 14ZM12 16C11.45 16 11 15.55 11 15S11.45 14 12 14S13 14.45 13 15S12.55 16 12 16Z"/>
    </svg>
  ),
  iron: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
  boot: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 17V9C18 7.34 16.66 6 15 6H9C7.34 6 6 7.34 6 9V17C6 18.66 7.34 20 9 20H15C16.66 20 18 18.66 18 17ZM15 8H9V17H15V8ZM12 10C10.9 10 10 10.9 10 12S10.9 14 12 14 14 13.1 14 12 13.1 10 12 10ZM12 16C10.9 16 10 15.1 10 14S10.9 12 12 12 14 12.9 14 14 13.1 16 12 16Z"/>
    </svg>
  ),
  thimble: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
  wheelbarrow: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 17H5C3.9 17 3 16.1 3 15V9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9V15C21 16.1 20.1 17 19 17ZM19 9H5V15H19V9ZM12 11C10.9 11 10 11.9 10 13S10.9 15 12 15 14 14.1 14 13 13.1 11 12 11ZM7 11C5.9 11 5 11.9 5 13S5.9 15 7 15 9 14.1 9 13 8.1 11 7 11ZM17 11C15.9 11 15 11.9 15 13S15.9 15 17 15 19 14.1 19 13 18.1 11 17 11Z"/>
    </svg>
  ),
  cat: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
  dinosaur: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
  penguin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
  rubberDuck: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12S16.42 20 12 20 4 16.42 4 12 7.58 4 12 4ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 8C10.9 8 10 8.9 10 10S10.9 12 12 12 14 11.1 14 10 13.1 8 12 8Z"/>
    </svg>
  ),
};

// ============================================
// Piece Component
// ============================================

export const Piece: React.FC<PieceProps> = ({
  player,
  size = 40,
  animation = 'idle',
  className = '',
  onClick,
}) => {
  const design = PIECE_DESIGNS[player.name.toLowerCase()] || PIECE_DESIGNS.car;

  const variants = {
    idle: { scale: 1, rotate: 0 },
    move: { scale: 1.1, rotate: [0, -5, 5, -5, 0] },
    jump: { scale: 1.2, y: -10, rotate: [0, 10, -10, 0] },
    celebrate: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 10, 0] },
    bankrupt: { scale: 0.5, opacity: 0.3, rotate: 90 },
  };

  return (
    <motion.div
      className={`piece ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: player.color,
        borderColor: player.isBankrupt ? '#666' : 'transparent',
      }}
      animate={variants[animation]}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="piece-design" style={{ color: '#000' }}>
        {design}
      </div>
      {player.getOutOfJailFreeCards > 0 && (
        <div className="piece-badge goojf">🔑</div>
      )}
      {player.inJail && (
        <div className="piece-badge jail">🔒</div>
      )}
    </motion.div>
  );
};

// ============================================
// Piece Set Component
// ============================================

export const PieceSet: React.FC<PieceSetProps> = ({ players, size = 40, className = '' }) => {
  return (
    <div className={`piece-set ${className}`} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {players.map(player => (
        <Piece key={player.id} player={player} size={size} />
      ))}
    </div>
  );
};

// ============================================
// Animated Piece for Board
// ============================================

interface AnimatedPieceProps {
  player: Player;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedPiece: React.FC<AnimatedPieceProps> = ({
  player,
  fromPosition,
  toPosition,
  duration = 500,
  onComplete,
}) => {
  const design = PIECE_DESIGNS[player.name.toLowerCase()] || PIECE_DESIGNS.car;

  return (
    <motion.div
      className="animated-piece"
      style={{
        position: 'absolute',
        left: fromPosition.x,
        top: fromPosition.y,
        width: 36,
        height: 36,
        backgroundColor: player.color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      animate={{
        left: toPosition.x,
        top: toPosition.y,
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 5, 0],
      }}
      transition={{ duration: duration / 1000, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
    >
      <div style={{ color: '#000', transform: 'scale(0.8)' }}>
        {design}
      </div>
    </motion.div>
  );
};

// ============================================
// Piece Selection for Setup
// ============================================

interface PieceSelectionProps {
  availablePieces: string[];
  selectedPiece: string;
  onSelect: (piece: string) => void;
  playerColor: string;
}

export const PieceSelection: React.FC<PieceSelectionProps> = ({
  availablePieces,
  selectedPiece,
  onSelect,
  playerColor,
}) => {
  return (
    <div className="piece-selection">
      <div className="piece-grid">
        {availablePieces.map(pieceName => {
          const design = PIECE_DESIGNS[pieceName.toLowerCase()] || PIECE_DESIGNS.car;
          const isSelected = pieceName === selectedPiece;

          return (
            <motion.button
              key={pieceName}
              className={`piece-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(pieceName)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="piece-preview" style={{ backgroundColor: playerColor }}>
                <div className="piece-design" style={{ color: '#000' }}>
                  {design}
                </div>
              </div>
              <span className="piece-name">{pieceName}</span>
              {isSelected && <div className="selection-check">✓</div>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};