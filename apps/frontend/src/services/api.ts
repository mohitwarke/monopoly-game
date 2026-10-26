// API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; tokens: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request<{ user: any; tokens: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Users
  async getUser(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request<any>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request<void>(`/users/${userId}`, { method: 'DELETE' });
  }

  // Lobbies
  async getLobbies(params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ items: any[]; total: number; page: number; pageSize: number }>(`/lobbies${query}`);
  }

  async getLobby(lobbyId: string) {
    return this.request<any>(`/lobbies/${lobbyId}`);
  }

  async getLobbyByCode(code: string) {
    return this.request<any>(`/lobbies/code/${code}`);
  }

  async createLobby(data: { name: string; isPrivate: boolean; maxPlayers: number; rulesConfig?: any }) {
    return this.request<any>('/lobbies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLobby(lobbyId: string, data: any) {
    return this.request<any>(`/lobbies/${lobbyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLobby(lobbyId: string) {
    return this.request<void>(`/lobbies/${lobbyId}`, { method: 'DELETE' });
  }

  async joinLobby(code: string, name: string, isAI?: boolean, aiDifficulty?: string) {
    return this.request<any>(`/lobbies/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ name, isAI, aiDifficulty }),
    });
  }

  async leaveLobby(lobbyId: string) {
    return this.request<void>(`/lobbies/${lobbyId}/leave`, { method: 'POST' });
  }

  async startGame(lobbyId: string) {
    return this.request<any>(`/lobbies/${lobbyId}/start`, { method: 'POST' });
  }

  // Games
  async getGames(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ items: any[]; total: number; page: number; pageSize: number }>(`/games${query}`);
  }

  async getGame(gameId: string) {
    return this.request<any>(`/games/${gameId}`);
  }

  async getGameReplay(gameId: string) {
    return this.request<any>(`/games/${gameId}/replay`);
  }

  // Tournaments
  async getTournaments(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ items: any[]; total: number; page: number; pageSize: number }>(`/tournaments${query}`);
  }

  async getTournament(tournamentId: string) {
    return this.request<any>(`/tournaments/${tournamentId}`);
  }

  async createTournament(data: any) {
    return this.request<any>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinTournament(tournamentId: string) {
    return this.request<any>(`/tournaments/${tournamentId}/join`, { method: 'POST' });
  }

  // Leaderboards
  async getLeaderboard(params?: { season?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.season) searchParams.set('season', params.season);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/leaderboards${query}`);
  }

  async getUserRating(userId: string) {
    return this.request<any>(`/leaderboards/user/${userId}`);
  }

  // Replays
  async getReplays(params?: { page?: number; limit?: number; gameId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.gameId) searchParams.set('gameId', params.gameId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ items: any[]; total: number; page: number; pageSize: number }>(`/replays${query}`);
  }

  async getReplay(replayId: string) {
    return this.request<any>(`/replays/${replayId}`);
  }

  // Plugins
  async getPlugins(params?: { page?: number; limit?: number; type?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ items: any[]; total: number; page: number; pageSize: number }>(`/plugins${query}`);
  }

  async getPlugin(pluginId: string) {
    return this.request<any>(`/plugins/${pluginId}`);
  }

  async createPlugin(data: any) {
    return this.request<any>('/plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlugin(pluginId: string, data: any) {
    return this.request<any>(`/plugins/${pluginId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePlugin(pluginId: string) {
    return this.request<void>(`/plugins/${pluginId}`, { method: 'DELETE' });
  }

  async downloadPlugin(pluginId: string) {
    const response = await fetch(`${this.baseUrl}/plugins/${pluginId}/download`, {
      headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {},
    });
    if (!response.ok) throw new Error('Download failed');
    return response.blob();
  }

  // Sync
  async syncDevices() {
    return this.request<any>('/sync/devices');
  }

  async registerDevice(data: { name: string; platform: string; token: string }) {
    return this.request<any>('/sync/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeDevice(deviceId: string) {
    return this.request<void>(`/sync/devices/${deviceId}`, { method: 'DELETE' });
  }

  // Generic HTTP methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);