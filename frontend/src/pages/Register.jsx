import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="p-8 rounded-2xl shadow-xl w-full max-w-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-primary)' }}>
            <span className="text-white text-2xl font-bold">CRM</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Create Account</h1>
          <p className="mt-1" style={{ color: 'var(--color-muted)' }}>Get started with your free account</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg mb-6 text-sm" style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name',     name: 'name',        type: 'text',     icon: User,     placeholder: 'Enter your full name' },
            { label: 'Email Address', name: 'email',       type: 'email',    icon: Mail,     placeholder: 'Enter your email' },
            { label: 'Password',      name: 'password',    type: 'password', icon: Lock,     placeholder: 'Create a password (min 8 chars)', minLength: 8 },
            { label: 'Company Name',  name: 'companyName', type: 'text',     icon: Building, placeholder: 'Enter your company name', optional: true },
          ].map(({ label, name, type, icon: Icon, placeholder, minLength, optional }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {label} {optional && <span style={{ color: 'var(--color-muted)' }}>(optional)</span>}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-muted)' }} />
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-colors"
                  style={inputStyle}
                  required={!optional}
                  minLength={minLength}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 mt-6"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {loading ? <span className="animate-spin">⟳</span> : <><UserPlus size={18} />Create Account</>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
