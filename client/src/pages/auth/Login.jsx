import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-container to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl">Elevated Ledger</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-4">
            The Elevated<br />Ledger
          </h1>
          <p className="text-white/80 text-lg max-w-md mb-10">
            Precision expense management for modern teams. Submit, track, and approve — all in one place.
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md border border-white/20">
            <p className="text-white/90 italic text-sm leading-relaxed">
              "This platform has transformed how we handle reimbursements. What used to take weeks now takes hours."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                SA
              </div>
              <div>
                <p className="font-medium text-sm">Sarah Anderson</p>
                <p className="text-white/60 text-xs">Finance Director, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl text-on-surface">Elevated Ledger</span>
          </div>

          <div className="card-elevated">
            <div className="text-center mb-6">
              <div className="hidden lg:flex mx-auto w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-2xl items-center justify-center shadow-lg mb-4">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">Welcome back</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Sign in to your reimbursement system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-elevated pl-10"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-elevated pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-primary cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              New company?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
