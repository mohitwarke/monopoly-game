// WebSocket Hook
import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onConnect, onDisconnect, onError, autoConnect = true } = options;
  const { tokens } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    if (!tokens?.accessToken) return;
    if (socketService.isConnected()) return;

    socketService.connect(tokens.accessToken);

    // Set up event listeners
    const unsubConnect = socketService.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    });

    const unsubDisconnect = socketService.on('disconnect', (reason) => {
      setIsConnected(false);
      onDisconnect?.(reason);

      // Auto-reconnect logic
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    });

    const unsubError = socketService.on('connect_error', (error) => {
      setConnectionError(error.message);
      onError?.(error);
    });

    // Cleanup function
    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubError();
    };
  }, [tokens?.accessToken, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnection
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  // Auto-connect when token changes
  useEffect(() => {
    if (autoConnect && tokens?.accessToken) {
      const cleanup = connect();
      return () => {
        cleanup?.();
        disconnect();
      };
    } else if (!tokens?.accessToken) {
      disconnect();
    }
  }, [tokens?.accessToken, autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    socket: socketService.getSocket(),
  };
}