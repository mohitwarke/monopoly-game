// Card Components

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import type { Card, CardType, CardAction, Player, GameState } from '@monopoly/shared';
import { CardType as CardTypeEnum } from '@monopoly/shared';
import './cards.css';

// ============================================
// Types
// ============================================

interface CardDisplayProps {
  card: Card;
  onClose: () => void;
  onAction?: (action: CardAction) => void;
  showAnimation?: boolean;
}

interface CardDeckProps {
  deckType: CardType;
  cards: Card[];
  onDraw?: () => void;
  showCount?: boolean;
  className?: string;
}

interface CardHandProps {
  cards: Card[];
  onPlay?: (card: Card) => void;
  maxVisible?: number;
  className?: string;
}

interface ChanceCardProps extends CardDisplayProps {
  card: Card & { type: 'chance' };
}

interface CommunityChestCardProps extends CardDisplayProps {
  card: Card & { type: 'communityChest' };
}

// ============================================
// Card Action Display
// ============================================

const getActionDescription = (action: CardAction): string => {
  switch (action.type) {
    case 'advanceTo':
      return `Advance to ${action.target === 0 ? 'GO' : `space ${action.target}`}${action.collectGo ? ' (Collect $200)' : ''}`;
    case 'advanceToNearest':
      return `Advance to nearest ${action.targetType} (${action.multiplier}× rent)`;
    case 'moveRelative':
      return action.spaces > 0 ? `Move forward ${action.spaces} spaces` : `Move back ${Math.abs(action.spaces)} spaces`;
    case 'goToJail':
      return 'Go to Jail. Do not pass GO. Do not collect $200.';
    case 'receiveMoney':
      return `Receive $${action.amount} from the Bank`;
    case 'payMoney':
      return `Pay $${action.amount} to the Bank`;
    case 'receiveFromEachPlayer':
      return `Receive $${action.amount} from each player`;
    case 'payEachPlayer':
      return `Pay $${action.amount} to each player`;
    case 'payPerHouseHotel':
      return `Pay $${action.perHouse} per house and $${action.perHotel} per hotel`;
    case 'getOutOfJailFree':
      return 'Get Out of Jail Free. This card may be kept until needed or sold.';
  }
};

const getActionIcon = (action: CardAction): React.ReactNode => {
  switch (action.type) {
    case 'advanceTo':
      return <span className="action-icon">🚶</span>;
    case 'advanceToNearest':
      return <span className="action-icon">🎯</span>;
    case 'moveRelative':
      return <span className="action-icon">{action.spaces > 0 ? '➡️' : '⬅️'}</span>;
    case 'goToJail':
      return <span className="action-icon">🚔</span>;
    case 'receiveMoney':
      return <span className="action-icon">💰</span>;
    case 'payMoney':
      return <span className="action-icon">💸</span>;
    case 'receiveFromEachPlayer':
      return <span className="action-icon">🤝</span>;
    case 'payEachPlayer':
      return <span className="action-icon">💸</span>;
    case 'payPerHouseHotel':
      return <span className="action-icon">🏠</span>;
    case 'getOutOfJailFree':
      return <span className="action-icon">🔑</span>;
  }
};

// ============================================
// Card Display Component
// ============================================

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onClose,
  onAction,
  showAnimation = true,
}) => {
  const isChance = card.type === CardTypeEnum.CHANCE;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setFlipped(true), 300);
      return () => clearTimeout(timer);
    } else {
      setFlipped(true);
    }
  }, [showAnimation]);

  return (
    <AnimatePresence>
      <motion.div
        className="card-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`card-modal ${isChance ? 'chance' : 'community-chest'}`}
          initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
          animate={{ scale: 1, rotateY: flipped ? 0 : 90, opacity: 1 }}
          exit={{ scale: 0.8, rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="card-inner">
            {/* Front */}
            <div className="card-front">
              <div className="card-header">
                <div className="card-type-badge">
                  {isChance ? '?' : '🏛️'}
                </div>
                <h2 className="card-title">{isChance ? 'CHANCE' : 'COMMUNITY CHEST'}</h2>
              </div>
              <div className="card-back-design">
                {isChance ? (
                  <div className="chance-pattern">
                    <span>?</span>
                  </div>
                ) : (
                  <div className="community-chest-pattern">
                    <span>🏛️</span>
                  </div>
                )}
              </div>
              <button
                className="flip-btn"
                onClick={() => setFlipped(true)}
                disabled={flipped}
              >
                <Sparkles size={20} />
                <span>Tap to Reveal</span>
              </button>
            </div>

            {/* Back */}
            <AnimatePresence mode="wait">
              {flipped && (
                <motion.div
                  className="card-back"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -180 }}
                  transition={{ duration: 0.3 }}
                >
                  <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                  </button>
                  <div className="card-content">
                    <div className="card-action-icon">
                      {getActionIcon(card.action)}
                    </div>
                    <p className="card-text">{card.text}</p>
                    <p className="card-description">{getActionDescription(card.action)}</p>
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        onAction?.(card.action);
                        onClose();
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// Chance Card Component
// ============================================

export const ChanceCard: React.FC<ChanceCardProps> = ({ card, ...props }) => (
  <CardDisplay card={card} {...props} />
);

// ============================================
// Community Chest Card Component
// ============================================

export const CommunityChestCard: React.FC<CommunityChestCardProps> = ({ card, ...props }) => (
  <CardDisplay card={card} {...props} />
);

// ============================================
// Card Deck Component
// ============================================

export const CardDeck: React.FC<CardDeckProps> = ({
  deckType,
  cards,
  onDraw,
  showCount = true,
  className = '',
}) => {
  const isChance = deckType === CardTypeEnum.CHANCE;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`card-deck ${isChance ? 'chance-deck' : 'community-chest-deck'} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDraw}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="deck-stack">
        {/* Bottom cards */}
        <div className="deck-card bottom-2" />
        <div className="deck-card bottom-1" />
        {/* Top card */}
        <div className="deck-card top">
          <div className="card-face">
            <div className="card-type-badge">
              {isChance ? '?' : '🏛️'}
            </div>
            <h3 className="deck-title">{isChance ? 'CHANCE' : 'COMMUNITY CHEST'}</h3>
            <div className="deck-icon">
              {isChance ? '?' : '🏛️'}
            </div>
          </div>
        </div>
      </div>

      {showCount && (
        <motion.div
          className="deck-count"
          animate={{ scale: hovered ? 1.2 : 1 }}
        >
          {cards.length}
        </motion.div>
      )}

      {hovered && onDraw && (
        <motion.div className="draw-hint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Click to draw
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// Card Hand Component
// ============================================

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  onPlay,
  maxVisible = 5,
  className = '',
}) => {
  const visibleCards = cards.slice(0, maxVisible);
  const hiddenCount = cards.length - maxVisible;

  return (
    <div className={`card-hand ${className}`}>
      <div className="hand-cards">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`hand-card ${card.type === CardTypeEnum.CHANCE ? 'chance' : 'community-chest'}`}
            style={{ zIndex: index }}
            initial={{ opacity: 0, y: 20, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onPlay?.(card)}
          >
            <div className="hand-card-inner">
              <div className="hand-card-type">
                {card.type === CardTypeEnum.CHANCE ? '?' : '🏛️'}
              </div>
              <p className="hand-card-text">{card.text}</p>
            </div>
          </motion.div>
        ))}
        {hiddenCount > 0 && (
          <motion.div className="hand-card hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hand-card-inner">
              <span className="hidden-count">+{hiddenCount}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Card Animation Components
// ============================================

interface CardDrawAnimationProps {
  deckType: CardType;
  onComplete: () => void;
  duration?: number;
}

export const CardDrawAnimation: React.FC<CardDrawAnimationProps> = ({
  deckType,
  onComplete,
  duration = 800,
}) => {
  const isChance = deckType === CardTypeEnum.CHANCE;

  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <motion.div
      className={`card-draw-animation ${isChance ? 'chance' : 'community-chest'}`}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0, rotate: 180, opacity: 0 }}
      transition={{ duration: duration / 1000 }}
    >
      <div className="draw-card">
        <div className="draw-card-inner">
          <div className="draw-card-type">
            {isChance ? '?' : '🏛️'}
          </div>
          <h3 className="draw-title">{isChance ? 'CHANCE' : 'COMMUNITY CHEST'}</h3>
          <div className="draw-icon">
            {isChance ? '?' : '🏛️'}
          </div>
        </div>
      </div>
      <motion.div
        className="draw-particles"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="particle"
            style={{
              '--angle': `${i * 30}deg`,
              '--distance': `${60 + Math.random() * 40}px`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {isChance ? '✨' : '⭐'}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// Card Flip Animation
// ============================================

interface CardFlipProps {
  card: Card;
  onFlipComplete: () => void;
}

export const CardFlip: React.FC<CardFlipProps> = ({ card, onFlipComplete }) => {
  const isChance = card.type === CardTypeEnum.CHANCE;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlipped(true);
      setTimeout(onFlipComplete, 300);
    }, 400);
    return () => clearTimeout(timer);
  }, [onFlipComplete]);

  return (
    <motion.div className={`card-flip ${isChance ? 'chance' : 'community-chest'}`}>
      <div className="flip-card" style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div className="flip-face front">
          <div className="card-type-badge">{isChance ? '?' : '🏛️'}</div>
          <h3>{isChance ? 'CHANCE' : 'COMMUNITY CHEST'}</h3>
        </div>
        <div className="flip-face back">
          <div className="card-content">
            <p>{card.text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};