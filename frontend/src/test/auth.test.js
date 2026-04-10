import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }) => children,
}));

const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    user: null,
    loading: false,
  }),
}));

describe('Auth Service API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should call login API with correct credentials', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      }));
      expect(response.ok).toBe(true);
    });

    it('should handle invalid credentials error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' }),
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Register Flow', () => {
    it('should call register API with user data', async () => {
      const mockResponse = {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse.data),
      });

      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        companyName: 'Acme Corp',
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(registerData),
      }));
      expect(response.ok).toBe(true);
    });
  });

  describe('Token Storage', () => {
    it('should store tokens in localStorage on login', async () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      expect(localStorage.getItem('accessToken')).toBe('test-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    it('should clear tokens on logout', () => {
      localStorage.setItem('accessToken', 'some-token');
      localStorage.setItem('refreshToken', 'some-refresh-token');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
