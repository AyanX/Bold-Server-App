import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * LoginView Component
 *
 * Handles user authentication with email and password.
 * Validates credentials and redirects to dashboard on success.
 */
const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-20">
      <div className="max-w-md w-full bg-white p-12 shadow-2xl border border-gray-100">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black logo-brand italic text-[#001733] mb-3">The Bold East Africa</h1>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Admin Intelligence Portal</p>
        </div>

        {error && <div className="mb-8 p-5 bg-red-50 text-red-600 text-sm font-bold border-l-4 border-red-500">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733] bg-gray-100"
              placeholder="name@belfortech.dev"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Security Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733]"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#001733]">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#001733] text-white py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Authorizing...' : 'Authorize Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
