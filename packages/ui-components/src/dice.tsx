// Dice Components

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw, Sparkles } from 'lucide-react';
import './dice.css';

// ============================================
// Types
// ============================================

interface DiceRoll {
  die1: number;
  die2: number;
  isDouble: boolean;
  total: number;
}

interface DiceProps {
  value?: number;
  size?: number;
  className?: string;
  animated?: boolean;
}

interface DicePairProps {
  roll?: DiceRoll;
  rolling?: boolean;
  onRoll?: () => void;
  disabled?: boolean;
  showTotal?: boolean;
  size?: number;
  className?: string;
}

interface DiceRollAnimationProps {
  onComplete: (roll: DiceRoll) => void;
  duration?: number;
  className?: string;
}

interface DiceHistoryProps {
  rolls: DiceRoll[];
  maxVisible?: number;
  className?: string;
}

// ============================================
// Dice Icons
// ============================================

const DiceIcons = [null, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

// ============================================
// Single Dice Component
// ============================================

export const Dice: React.FC<DiceProps> = ({
  value = 1,
  size = 48,
  className = '',
  animated = false,
}) => {
  const Icon = DiceIcons[Math.max(1, Math.min(6, value))];

  return (
    <motion.div
      className={`dice ${className}`}
      style={{ width: size, height: size }}
      animate={animated ? { rotate: [0, 10, -10, 0] } : undefined}
      transition={{ duration: 0.3 }}
    >
      <Icon className="dice-icon" size={size * 0.7} />
    </motion.div>
  );
};

// ============================================
// Dice Pair Component
// ============================================

export const DicePair: React.FC<DicePairProps> = ({
  roll,
  rolling = false,
  onRoll,
  disabled = false,
  showTotal = true,
  size = 56,
  className = '',
}) => {
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(roll ?? null);

  const handleRoll = useCallback(() => {
    if (disabled || rolling) return;
    onRoll?.();
  }, [disabled, rolling, onRoll]);

  // Animate dice when rolling
  useEffect(() => {
    if (rolling && onRoll) {
      // Show rolling animation
      const animateRoll = () => {
        let iterations = 0;
        const maxIterations = 10;
        const interval = setInterval(() => {
          setCurrentRoll({
            die1: Math.floor(Math.random() * 6) + 1,
            die2: Math.floor(Math.random() * 6) + 1,
            isDouble: false,
            total: 0,
          });
          iterations++;
          if (iterations >= maxIterations) {
            clearInterval(interval);
          }
        }, 50);
      };
      animateRoll();
    } else if (roll) {
      setCurrentRoll(roll);
    }
  }, [rolling, roll, onRoll]);

  const displayRoll = currentRoll ?? { die1: 1, die2: 1, isDouble: false, total: 2 };

  return (
    <div className={`dice-pair ${className} ${rolling ? 'rolling' : ''} ${displayRoll.isDouble ? 'double' : ''}`}>
      <div className="dice-container" onClick={handleRoll} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleRoll()}>
        <motion.div
          className="dice-cube"
          style={{ width: size, height: size }}
          animate={rolling ? { rotateX: 360, rotateY: 360 } : undefined}
          transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
        >
          <DiceIcons[displayRoll.die1] className="dice-icon" size={size * 0.65} />
        </motion.div>
        <motion.div
          className="dice-cube"
          style={{ width: size, height: size }}
          animate={rolling ? { rotateX: -360, rotateY: -360 } : undefined}
          transition={{ duration: 0.5, repeat: rolling ? Infinity : 0, delay: 0.05 }}
        >
          <DiceIcons[displayRoll.die2] className="dice-icon" size={size * 0.65} />
        </motion.div>
      </div>

      {showTotal && (
        <div className="dice-total">
          <span className="total-label">Total:</span>
          <span className="total-value">{displayRoll.total}</span>
          {displayRoll.isDouble && (
            <motion.span className="double-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Sparkles size={14} /> DOUBLE!
            </motion.span>
          )}
        </div>
      )}

      {!rolling && !disabled && onRoll && (
        <motion.button
          className="roll-btn"
          onClick={handleRoll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RefreshCw size={20} className={rolling ? 'spinning' : ''} />
          <span>Roll Dice</span>
        </motion.button>
      )}

      {disabled && (
        <div className="dice-disabled">Waiting for other players...</div>
      )}
    </div>
  );
};

// ============================================
// Dice Roll Animation
// ============================================

export const DiceRollAnimation: React.FC<DiceRollAnimationProps> = ({
  onComplete,
  duration = 1500,
  className = '',
}) => {
  const [roll, setRoll] = useState<DiceRoll | null>(null);
  const [phase, setPhase] = useState<'shaking' | 'settling' | 'complete'>('shaking');

  useEffect(() => {
    // Phase 1: Shaking
    const shakeInterval = setInterval(() => {
      setRoll({
        die1: Math.floor(Math.random() * 6) + 1,
        die2: Math.floor(Math.random() * 6) + 1,
        isDouble: false,
        total: 0,
      });
    }, 50);

    // Phase 2: Settling
    setTimeout(() => {
      clearInterval(shakeInterval);
      setPhase('settling');
      
      // Slow down
      let slowInterval = 100;
      const settleInterval = setInterval(() => {
        setRoll({
          die1: Math.floor(Math.random() * 6) + 1,
          die2: Math.floor(Math.random() * 6) + 1,
          isDouble: false,
          total: 0,
        });
        slowInterval += 50;
        if (slowInterval > 300) clearInterval(settleInterval);
      }, slowInterval);

      // Phase 3: Final result
      setTimeout(() => {
        clearInterval(settleInterval);
        const finalRoll: DiceRoll = {
          die1: Math.floor(Math.random() * 6) + 1,
          die2: Math.floor(Math.random() * 6) + 1,
          isDouble: false,
          total: 0,
        };
        finalRoll.isDouble = finalRoll.die1 === finalRoll.die2;
        finalRoll.total = finalRoll.die1 + finalRoll.die2;
        setRoll(finalRoll);
        setPhase('complete');
        onComplete(finalRoll);
      }, duration);
    }, duration * 0.6);
  }, [onComplete, duration]);

  return (
    <motion.div
      className={`dice-roll-animation ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="animation-container">
        <motion.div
          className="dice-3d"
          animate={{
            rotateX: phase === 'shaking' ? [0, 20, -20, 0] : 0,
            rotateY: phase === 'shaking' ? [0, 20, -20, 0] : 0,
            scale: phase === 'complete' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: phase === 'shaking' ? 0.1 : 0.3,
            repeat: phase === 'shaking' ? Infinity : 0,
          }}
        >
          <DiceIcons[roll?.die1 ?? 1] className="dice-icon-3d" size={80} />
        </motion.div>
        <motion.div
          className="dice-3d"
          animate={{
            rotateX: phase === 'shaking' ? [0, -20, 20, 0] : 0,
            rotateY: phase === 'shaking' ? [0, -20, 20, 0] : 0,
            scale: phase === 'complete' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: phase === 'shaking' ? 0.1 : 0.3,
            repeat: phase === 'shaking' ? Infinity : 0,
            delay: 0.05,
          }}
        >
          <DiceIcons[roll?.die2 ?? 1] className="dice-icon-3d" size={80} />
        </motion.div>
      </div>

      {phase === 'complete' && roll && (
        <motion.div
          className="roll-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="result-total">Total: <span>{roll.total}</span></div>
          {roll.isDouble && (
            <motion.div className="result-double" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Sparkles size={24} /> DOUBLE! <Sparkles size={24} />
            </motion.div>
          )}
        </motion.div>
      )}

      {phase !== 'complete' && (
        <motion.div className="rolling-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Rolling...
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// Dice History Component
// ============================================

export const DiceHistory: React.FC<DiceHistoryProps> = ({
  rolls,
  maxVisible = 10,
  className = '',
}) => {
  const visibleRolls = rolls.slice(-maxVisible).reverse();

  return (
    <div className={`dice-history ${className}`}>
      <h4>Roll History</h4>
      <div className="history-list">
        {visibleRolls.map((roll, index) => (
          <motion.div
            key={`${roll.die1}-${roll.die2}-${index}`}
            className={`history-item ${roll.isDouble ? 'double' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="history-dice">
              <DiceIcons[roll.die1] className="history-dice-icon" size={20} />
              <DiceIcons[roll.die2] className="history-dice-icon" size={20} />
            </div>
            <div className="history-info">
              <span className="history-total">{roll.total}</span>
              {roll.isDouble && <span className="history-double">DOUBLE</span>}
            </div>
          </motion.div>
        ))}
        {rolls.length === 0 && (
          <div className="history-empty">No rolls yet</div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Dice Probability Display
// ============================================

interface DiceProbabilityProps {
  className?: string;
}

export const DiceProbability: React.FC<DiceProbabilityProps> = ({ className = '' }) => {
  const probabilities = [
    { total: 2, combos: 1, percent: 2.78 },
    { total: 3, combos: 2, percent: 5.56 },
    { total: 4, combos: 3, percent: 8.33 },
    { total: 5, combos: 4, percent: 11.11 },
    { total: 6, combos: 5, percent: 13.89 },
    { total: 7, combos: 6, percent: 16.67 },
    { total: 8, combos: 5, percent: 13.89 },
    { total: 9, combos: 4, percent: 11.11 },
    { total: 10, combos: 3, percent: 8.33 },
    { total: 11, combos: 2, percent: 5.56 },
    { total: 12, combos: 1, percent: 2.78 },
  ];

  return (
    <div className={`dice-probability ${className}`}>
      <h4>Roll Probabilities</h4>
      <div className="probability-chart">
        {probabilities.map(p => (
          <motion.div key={p.total} className="probability-bar" initial={{ width: 0 }} animate={{ width: `${p.percent * 2}%` }} transition={{ delay: p.total * 0.03 }}>
            <span className="prob-label">{p.total}</span>
            <span className="prob-bar" style={{ width: `${p.percent * 2}%` }} />
            <span className="prob-value">{p.percent.toFixed(2)}%</span>
          </motion.div>
        ))}
      </div>
      <div className="probability-note">
        Most likely: 7 (16.67%) | Doubles: 16.67%
      </div>
    </div>
  );
};

// ============================================
// 3D Dice for Animation
// ============================================

interface Dice3DProps {
  value: number;
  size?: number;
  className?: string;
}

export const Dice3D: React.FC<Dice3DProps> = ({ value = 1, size = 60, className = '' }) => {
  const Icon = DiceIcons[Math.max(1, Math.min(6, value))];

  return (
    <div className={`dice-3d-cube ${className}`} style={{ width: size, height: size }}>
      <div className="dice-face front"><Icon size={size * 0.7} /></div>
      <div className="dice-face back"><Icon size={size * 0.7} /></div>
      <div className="dice-face right"><Icon size={size * 0.7} /></div>
      <div className="dice-face left"><Icon size={size * 0.7} /></div>
      <div className="dice-face top"><Icon size={size * 0.7} /></div>
      <div className="dice-face bottom"><Icon size={size * 0.7} /></div>
    </div>
  );
};