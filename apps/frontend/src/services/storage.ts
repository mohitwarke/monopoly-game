// Storage Service - IndexedDB wrapper for offline-first support
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MonopolyDB extends DBSchema {
  games: {
    key: string;
    value: {
      id: string;
      gameState: any;
      lastSynced: number;
      pendingMoves: any[];
    };
    indexes: { 'by-last-synced': number };
  };
  lobbies: {
    key: string;
    value: {
      id: string;
      lobby: any;
      lastSynced: number;
    };
  };
  replays: {
    key: string;
    value: {
      id: string;
      replay: any;
      savedAt: number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
  plugins: {
    key: string;
    value: {
      id: string;
      manifest: any;
      code: string;
      installedAt: number;
    };
  };
}

const DB_NAME = 'monopoly-game';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<MonopolyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MonopolyDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<MonopolyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Games store
      const gameStore = db.createObjectStore('games', { keyPath: 'id' });
      gameStore.createIndex('by-last-synced', 'lastSynced');

      // Lobbies store
      db.createObjectStore('lobbies', { keyPath: 'id' });

      // Replays store
      db.createObjectStore('replays', { keyPath: 'id' });

      // Settings store
      db.createObjectStore('settings', { keyPath: 'key' });

      // Plugins store
      db.createObjectStore('plugins', { keyPath: 'id' });
    },
  });

  return dbInstance;
}

// Games
export async function saveGameOffline(gameId: string, gameState: any, pendingMoves: any[] = []): Promise<void> {
  const db = await getDB();
  await db.put('games', {
    id: gameId,
    gameState,
    lastSynced: Date.now(),
    pendingMoves,
  });
}

export async function getGameOffline(gameId: string): Promise<{ gameState: any; pendingMoves: any[] } | null> {
  const db = await getDB();
  const record = await db.get('games', gameId);
  return record ? { gameState: record.gameState, pendingMoves: record.pendingMoves } : null;
}

export async function getAllGamesOffline(): Promise<Array<{ id: string; gameState: any; lastSynced: number }>> {
  const db = await getDB();
  return db.getAll('games');
}

export async function deleteGameOffline(gameId: string): Promise<void> {
  const db = await getDB();
  await db.delete('games', gameId);
}

export async function markGameSynced(gameId: string): Promise<void> {
  const db = await getDB();
  const record = await db.get('games', gameId);
  if (record) {
    record.lastSynced = Date.now();
    record.pendingMoves = [];
    await db.put('games', record);
  }
}

// Lobbies
export async function saveLobbyOffline(lobbyId: string, lobby: any): Promise<void> {
  const db = await getDB();
  await db.put('lobbies', { id: lobbyId, lobby, lastSynced: Date.now() });
}

export async function getLobbyOffline(lobbyId: string): Promise<any | null> {
  const db = await getDB();
  const record = await db.get('lobbies', lobbyId);
  return record?.lobby ?? null;
}

export async function deleteLobbyOffline(lobbyId: string): Promise<void> {
  const db = await getDB();
  await db.delete('lobbies', lobbyId);
}

// Replays
export async function saveReplayOffline(replayId: string, replay: any): Promise<void> {
  const db = await getDB();
  await db.put('replays', { id: replayId, replay, savedAt: Date.now() });
}

export async function getReplayOffline(replayId: string): Promise<any | null> {
  const db = await getDB();
  const record = await db.get('replays', replayId);
  return record?.replay ?? null;
}

export async function getAllReplaysOffline(): Promise<Array<{ id: string; replay: any; savedAt: number }>> {
  const db = await getDB();
  return db.getAll('replays');
}

export async function deleteReplayOffline(replayId: string): Promise<void> {
  const db = await getDB();
  await db.delete('replays', replayId);
}

// Settings
export async function setSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value, updatedAt: Date.now() });
}

export async function getSetting(key: string): Promise<any | null> {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, any>> {
  const db = await getDB();
  const records = await db.getAll('settings');
  return Object.fromEntries(records.map(r => [r.key, r.value]));
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('settings', key);
}

// Plugins
export async function savePluginOffline(pluginId: string, manifest: any, code: string): Promise<void> {
  const db = await getDB();
  await db.put('plugins', { id: pluginId, manifest, code, installedAt: Date.now() });
}

export async function getPluginOffline(pluginId: string): Promise<{ manifest: any; code: string } | null> {
  const db = await getDB();
  const record = await db.get('plugins', pluginId);
  return record ? { manifest: record.manifest, code: record.code } : null;
}

export async function getAllPluginsOffline(): Promise<Array<{ id: string; manifest: any; code: string; installedAt: number }>> {
  const db = await getDB();
  return db.getAll('plugins');
}

export async function deletePluginOffline(pluginId: string): Promise<void> {
  const db = await getDB();
  await db.delete('plugins', pluginId);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('games');
  await db.clear('lobbies');
  await db.clear('replays');
  await db.clear('settings');
  await db.clear('plugins');
}

// Sync queue for offline mutations
interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'game' | 'lobby' | 'replay' | 'plugin';
  entityId: string;
  data?: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = 'monopoly-sync-queue';

export async function addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await getSyncQueue();
  queue.push({
    ...operation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  });
  await setSetting(SYNC_QUEUE_KEY, queue);
}

export async function getSyncQueue(): Promise<SyncOperation[]> {
  return (await getSetting(SYNC_QUEUE_KEY)) || [];
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const queue = await getSyncQueue();
  await setSetting(SYNC_QUEUE_KEY, queue.filter(op => op.id !== id));
}

export async function incrementSyncRetry(id: string): Promise<void> {
  const queue = await getSyncQueue();
  const op = queue.find(o => o.id === id);
  if (op) {
    op.retries++;
    await setSetting(SYNC_QUEUE_KEY, queue);
  }
}

export async function clearSyncQueue(): Promise<void> {
  await setSetting(SYNC_QUEUE_KEY, []);
}