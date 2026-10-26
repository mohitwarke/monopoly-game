import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icons = [
    'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6',
    'Home', 'Building', 'Building2', 'Crown', 'Coins', 'Lock', 'Key',
    'ArrowRight', 'ArrowLeft', 'RefreshCw', 'Settings', 'X',
    'ChevronDown', 'ChevronUp', 'Check', 'AlertCircle', 'Info',
    'Loader2', 'Copy', 'ExternalLink', 'User', 'Trophy', 'History',
    'Palette', 'Puzzle', 'Bot', 'Shield', 'Bell', 'Mail',
    'Unlock', 'Eye', 'EyeOff', 'Sparkles'
  ];
  
  const mockComponents: Record<string, React.FC> = {};
  for (const icon of icons) {
    mockComponents[icon] = ({ size = 24, className = '', ...props }: any) => (
      <svg width={size} height={size} className={className} {...props} data-testid={`icon-${icon.toLowerCase()}`} />
    );
  }
  
  return mockComponents;
});

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: 'test-socket-id',
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console.error in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});