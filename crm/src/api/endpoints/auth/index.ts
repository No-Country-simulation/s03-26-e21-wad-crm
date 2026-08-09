import { apiClient } from '@/api/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  workspaceId: string;
  role: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  role: string;
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/auth/register', data);
  return response.data;
}

export async function refresh(refreshToken: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>('/api/auth/me');
  return response.data;
}

export function setAccessToken(token: string): void {
  localStorage.setItem('crm_access_token', token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('crm_refresh_token', token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('crm_access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('crm_refresh_token');
}

export function clearTokens(): void {
  localStorage.removeItem('crm_access_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_user');
}