// Modding System - Secure Plugin Sandbox

import { Isolation } from 'isolated-vm';
import type { UUID, PluginManifest, PluginPermission, GameState, Player, Property } from '@monopoly/shared';
import { PluginPermission as PluginPermissionEnum } from '@monopoly/shared';
import { validateManifest, checkCompatibility, CURRENT_API_VERSION } from './manifest';

/**
 * Sandbox Configuration
 */
export interface SandboxConfig {
  memoryLimit: number; // MB
  cpuLimit: number; // Percentage (0-100)
  timeout: number; // ms
  allowedPermissions: PluginPermission[];
  allowedDomains: string[]; // For network requests
}

/**
 * Default sandbox configuration
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  memoryLimit: 64,
  cpuLimit: 50,
  timeout: 5000,
  allowedPermissions: [],
  allowedDomains: [],
};

/**
 * Plugin API exposed to sandbox
 */
export interface PluginAPI {
  // Game State (read-only)
  gameState: Readonly<GameState>;
  // Events
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, data: unknown) => void;
  // Board
  board: {
    getProperty: (position: number) => Readonly<Property> | undefined;
    getPropertiesByGroup: (group: string) => Readonly<Property>[];
    getOwnedProperties: (playerId: UUID) => Readonly<Property>[];
  };
  // Players
  players: {
    getCurrent: () => Readonly<Player>;
    getById: (id: UUID) => Readonly<Player> | undefined;
    getAll: () => Readonly<Player>[];
  };
  // UI (for board skins, piece sets)
  ui: {
    registerComponent: (name: string, component: unknown) => void;
    unregisterComponent: (name: string) => void;
    getComponent: (name: string) => unknown;
  };
  // Assets
  assets: {
    loadImage: (url: string) => Promise<HTMLImageElement>;
    loadAudio: (url: string) => Promise<HTMLAudioElement>;
    loadModel: (url: string) => Promise<unknown>;
  };
  // Storage
  storage: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    delete: (key: string) => void;
    clear: () => void;
  };
  // Network (restricted)
  network: {
    fetch: (url: string, options?: RequestInit) => Promise<Response>;
  };
  // Logging
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) => void;
}

/**
 * Sandbox Result
 */
export interface SandboxResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  executionTime: number;
  memoryUsed: number;
}

/**
 * Plugin Sandbox Class
 */
export class PluginSandbox {
  private isolate: Isolation;
  private context: any;
  private config: SandboxConfig;
  private api: PluginAPI;
  private startTime: number = 0;
  private memoryLimitBytes: number;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_SANDBOX_CONFIG, ...config };
    this.memoryLimitBytes = this.config.memoryLimit * 1024 * 1024;

    // Create isolate
    this.isolate = new Isolation({
      memoryLimit: this.memoryLimitBytes,
    });

    this.context = this.isolate.createContext();
  }

  /**
   * Initialize the sandbox with plugin code and API
   */
  async initialize(pluginCode: string, api: PluginAPI): Promise<void> {
    this.api = api;

    // Create global object with restricted API
    const global = this.context.global;

    // Set up console
    global.setSync('console', this.createConsole());

    // Set up API
    global.setSync('API', this.createAPIProxy());

    // Set up utilities
    global.setSync('setTimeout', (fn: Function, delay: number) => setTimeout(fn, delay));
    global.setSync('setInterval', (fn: Function, delay: number) => setInterval(fn, delay));
    global.setSync('clearTimeout', (id: NodeJS.Timeout) => clearTimeout(id));
    global.setSync('clearInterval', (id: NodeJS.Timeout) => clearInterval(id));
    global.setSync('Promise', Promise);
    global.setSync('JSON', JSON);
    global.setSync('Math', Math);
    global.setSync('Date', Date);
    global.setSync('Object', Object);
    global.setSync('Array', Array);
    global.setSync('String', String);
    global.setSync('Number', Number);
    global.setSync('Boolean', Boolean);
    global.setSync('Error', Error);
    global.setSync('Map', Map);
    global.setSync('Set', Set);
    global.setSync('WeakMap', WeakMap);
    global.setSync('WeakSet', WeakSet);

    // Compile and run plugin code
    const script = this.isolate.compileScript(pluginCode, {
      filename: 'plugin.js',
      displayErrors: true,
    });

    await script.run(this.context, { timeout: this.config.timeout });
  }

  /**
   * Create console proxy
   */
  private createConsole() {
    const self = this;
    return {
      log: (...args: unknown[]) => self.api.log('info', args.map(String).join(' ')),
      info: (...args: unknown[]) => self.api.log('info', args.map(String).join(' ')),
      warn: (...args: unknown[]) => self.api.log('warn', args.map(String).join(' ')),
      error: (...args: unknown[]) => self.api.log('error', args.map(String).join(' ')),
      debug: (...args: unknown[]) => self.api.log('debug', args.map(String).join(' ')),
    };
  }

  /**
   * Create API proxy with permission checks
   */
  private createAPIProxy() {
    const self = this;
    const api = this.api;

    return new Proxy({}, {
      get(_target, prop: string) {
        // Check permission
        const permission = self.getPermissionForAPI(prop);
        if (permission && !self.config.allowedPermissions.includes(permission)) {
          throw new Error(`Permission denied: ${permission}`);
        }

        // Return API method
        const value = (api as any)[prop];
        if (typeof value === 'function') {
          return (...args: unknown[]) => {
            self.checkTimeout();
            return value.apply(api, args);
          };
        }
        return value;
      },
    });
  }

  /**
   * Get required permission for API property
   */
  private getPermissionForAPI(prop: string): PluginPermission | null {
    const permissionMap: Record<string, PluginPermission> = {
      gameState: PluginPermissionEnum.RULES_READ,
      board: PluginPermissionEnum.BOARD_RENDER,
      players: PluginPermissionEnum.RULES_READ,
      ui: PluginPermissionEnum.BOARD_RENDER,
      assets: PluginPermissionEnum.ASSETS_LOAD,
      storage: PluginPermissionEnum.STORAGE_READ,
      network: PluginPermissionEnum.NETWORK_REQUEST,
    };
    return permissionMap[prop] ?? null;
  }

  /**
   * Check if execution has timed out
   */
  private checkTimeout(): void {
    if (Date.now() - this.startTime > this.config.timeout) {
      throw new Error('Plugin execution timeout');
    }
  }

  /**
   * Execute a function in the sandbox
   */
  async execute<T>(fn: string, ...args: unknown[]): Promise<SandboxResult<T>> {
    this.startTime = Date.now();

    try {
      const script = this.isolate.compileScript(`
        (function() {
          return ${fn}.apply(this, arguments);
        })
      `, { filename: 'execute.js' });

      const result = await script.run(this.context, {
        timeout: this.config.timeout,
        arguments: args,
      });

      return {
        success: true,
        result: result as T,
        executionTime: Date.now() - this.startTime,
        memoryUsed: 0, // Would need isolate.getMemoryUsage()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - this.startTime,
        memoryUsed: 0,
      };
    }
  }

  /**
   * Call a plugin function
   */
  async callFunction(functionName: string, ...args: unknown[]): Promise<SandboxResult> {
    return this.execute(`API.${functionName}`, ...args);
  }

  /**
   * Evaluate code in sandbox
   */
  async evaluate(code: string): Promise<SandboxResult> {
    this.startTime = Date.now();

    try {
      const script = this.isolate.compileScript(code, { filename: 'eval.js' });
      const result = await script.run(this.context, { timeout: this.config.timeout });

      return {
        success: true,
        result,
        executionTime: Date.now() - this.startTime,
        memoryUsed: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - this.startTime,
        memoryUsed: 0,
      };
    }
  }

  /**
   * Dispose of the sandbox
   */
  dispose(): void {
    this.context.dispose();
    this.isolate.dispose();
  }
}

/**
 * Plugin Manager - High-level plugin management
 */
export class PluginManager {
  private sandboxes: Map<UUID, PluginSandbox> = new Map();
  private plugins: Map<UUID, LoadedPlugin> = new Map();
  private config: SandboxConfig;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_SANDBOX_CONFIG, ...config };
  }

  /**
   * Load a plugin
   */
  async loadPlugin(
    pluginId: UUID,
    userId: UUID,
    manifest: PluginManifest,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    // Validate manifest
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      return { success: false, error: `Invalid manifest: ${validation.errors.join(', ')}` };
    }

    // Check compatibility
    const compat = checkCompatibility(manifest, CURRENT_API_VERSION);
    if (!compat.compatible) {
      return { success: false, error: compat.reason };
    }

    // Check permissions
    for (const perm of manifest.permissions) {
      if (!this.config.allowedPermissions.includes(perm)) {
        return { success: false, error: `Permission not allowed: ${perm}` };
      }
    }

    // Create sandbox
    const sandbox = new PluginSandbox({
      ...this.config,
      allowedPermissions: manifest.permissions,
    });

    try {
      // Create API for this plugin
      const api = this.createPluginAPI(pluginId);
      await sandbox.initialize(code, api);

      // Store plugin
      this.sandboxes.set(pluginId, sandbox);
      this.plugins.set(pluginId, {
        id: pluginId,
        userId,
        manifest,
        code,
        loaded: true,
        loadedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      sandbox.dispose();
      return { success: false, error: error instanceof Error ? error.message : 'Failed to load plugin' };
    }
  }

  /**
   * Unload a plugin
   */
  unloadPlugin(pluginId: UUID): boolean {
    const sandbox = this.sandboxes.get(pluginId);
    if (sandbox) {
      sandbox.dispose();
      this.sandboxes.delete(pluginId);
    }
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.loaded = false;
    }
    return true;
  }

  /**
   * Get loaded plugin
   */
  getPlugin(pluginId: UUID): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.loaded);
  }

  /**
   * Execute plugin function
   */
  async executePluginFunction(pluginId: UUID, functionName: string, ...args: unknown[]): Promise<SandboxResult> {
    const sandbox = this.sandboxes.get(pluginId);
    if (!sandbox) {
      return { success: false, error: 'Plugin not loaded', executionTime: 0, memoryUsed: 0 };
    }

    return sandbox.callFunction(functionName, ...args);
  }

  /**
   * Create API for a specific plugin
   */
  private createPluginAPI(pluginId: UUID): PluginAPI {
    // This would be implemented with actual game state access
    // For now, return a mock API
    return {
      gameState: {} as GameState,
      on: () => {},
      off: () => {},
      emit: () => {},
      board: {
        getProperty: () => undefined,
        getPropertiesByGroup: () => [],
        getOwnedProperties: () => [],
      },
      players: {
        getCurrent: () => ({} as Player),
        getById: () => undefined,
        getAll: () => [],
      },
      ui: {
        registerComponent: () => {},
        unregisterComponent: () => {},
        getComponent: () => undefined,
      },
      assets: {
        loadImage: async () => new Image(),
        loadAudio: async () => new Audio(),
        loadModel: async () => ({}),
      },
      storage: {
        get: () => undefined,
        set: () => {},
        delete: () => {},
        clear: () => {},
      },
      network: {
        fetch: async () => new Response(),
      },
      log: () => {},
    };
  }

  /**
   * Dispose all sandboxes
   */
  dispose(): void {
    for (const sandbox of this.sandboxes.values()) {
      sandbox.dispose();
    }
    this.sandboxes.clear();
    this.plugins.clear();
  }
}

export interface LoadedPlugin {
  id: UUID;
  userId: UUID;
  manifest: PluginManifest;
  code: string;
  loaded: boolean;
  loadedAt: number;
}

/**
 * Plugin Registry - For discovering and managing plugins
 */
export class PluginRegistry {
  private plugins: Map<UUID, RegistryPlugin> = new Map();

  register(plugin: RegistryPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  unregister(pluginId: UUID): boolean {
    return this.plugins.delete(pluginId);
  }

  get(pluginId: UUID): RegistryPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): RegistryPlugin[] {
    return Array.from(this.plugins.values());
  }

  getByType(type: string): RegistryPlugin[] {
    return this.getAll().filter(p => p.manifest.type === type);
  }

  getByUser(userId: UUID): RegistryPlugin[] {
    return this.getAll().filter(p => p.userId === userId);
  }

  getPublic(): RegistryPlugin[] {
    return this.getAll().filter(p => p.isPublic);
  }

  search(query: string): RegistryPlugin[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(p =>
      p.manifest.name.toLowerCase().includes(lower) ||
      p.manifest.description.toLowerCase().includes(lower) ||
      p.manifest.tags?.some(t => t.toLowerCase().includes(lower))
    );
  }
}

export interface RegistryPlugin {
  id: UUID;
  userId: UUID;
  manifest: PluginManifest;
  isPublic: boolean;
  downloads: number;
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
}