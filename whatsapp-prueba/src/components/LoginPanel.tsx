import { useState } from 'react';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { LogIn } from 'lucide-react';
import { RoleType } from '@/types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  workspaceId: string;
  role: RoleType;
}

export function LoginPanel() {
  const setSession = useWhatsAppStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (emailToUse: string, passwordToUse: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passwordToUse }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();

      // Save to localStorage
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user-role', data.role);
      localStorage.setItem('workspace-id', data.workspaceId);

      // Set store session
      setSession({
        userId: 'user-from-token',
        workspaceId: data.workspaceId,
        role: data.role,
      });

      console.log('✅ Login successful:', { email: emailToUse, role: data.role, workspaceId: data.workspaceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLoginAdmin = async () => {
    await performLogin('admin@test.com', 'password');
  };

  const handleQuickLoginAgent = async () => {
    await performLogin('cj@gmail.com', 'password');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="w-full max-w-md p-8 rounded-lg bg-slate-900 border border-slate-700 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">CRM WhatsApp</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="cj@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-950 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-600 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 rounded bg-slate-800 text-sm text-slate-300">
          <p className="font-mono text-xs mb-2">Test Credentials:</p>
          <div className="font-mono text-xs space-y-1">
            <p>📧 <span className="text-blue-400">cj@gmail.com</span> / password</p>
            <p className="text-green-400">Role: AGENT</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-xs text-slate-400 text-center">🚀 Quick Login:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickLoginAdmin}
              disabled={loading}
              className="py-2 px-3 rounded bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white text-sm font-medium transition"
            >
              {loading ? '...' : '👑 Admin'}
            </button>
            <button
              type="button"
              onClick={handleQuickLoginAgent}
              disabled={loading}
              className="py-2 px-3 rounded bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white text-sm font-medium transition"
            >
              {loading ? '...' : '👤 Agent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
