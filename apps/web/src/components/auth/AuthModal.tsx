import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../types/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (tab === 'register') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        await login(email, password);
      } else {
        await register(email, password, displayName || undefined);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || err.detail || 'Authentication failed. Please verify credentials.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0F1216] border border-[#232934] rounded-2xl shadow-2xl overflow-hidden p-6 relative text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1A1F29] border border-[#2B3242] flex items-center justify-center text-[#FF7138]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg font-serif font-bold text-white tracking-tight">
              {tab === 'signin' ? 'Sign In to Sovereign Vault' : 'Create Sovereign Vault'}
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              {tab === 'signin'
                ? 'Resume authenticated access to your cloud chronicle'
                : 'Establish a persistent personal archive account'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#161B22] p-1 mb-5 border border-[#232934]">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-[#FF7138] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-[#FF7138] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            New Vault
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                Display Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Chronicler"
                  className="w-full bg-[#161B22] border border-[#2B3242] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#161B22] border border-[#2B3242] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#161B22] border border-[#2B3242] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] transition-all font-sans"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161B22] border border-[#2B3242] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] transition-all font-sans"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 bg-[#FF7138] hover:bg-[#ff8555] active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{tab === 'signin' ? 'Access Sovereign Vault' : 'Initialize Vault'}</span>
            )}
          </button>
        </form>

        {/* Security Note */}
        <p className="mt-5 text-[11px] font-mono text-center text-neutral-500">
          Argon2id cryptography • Zero-plaintext tokens • Reduced persistence
        </p>
      </div>
    </div>
  );
};
