import { useState } from 'react';
import { useAuthStore } from '../features/auth/store';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function Login() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { email: 'admin@nexo.com', role: 'ADMIN' },
    { email: 'manager@nexo.com', role: 'MANAGER' },
    { email: 'agent@nexo.com', role: 'AGENT' },
    { email: 'viewer@nexo.com', role: 'VIEWER' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl">Nexo CRM</CardTitle>
            <p className="text-gray-500">Ingresa a tu cuenta</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500 text-center mb-4">Cuentas de prueba (cualquier contraseña)</p>
            <div className="grid grid-cols-2 gap-2">
              {testUsers.map(user => (
                <Button
                  key={user.email}
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail(user.email); setPassword('test'); }}
                >
                  {user.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}