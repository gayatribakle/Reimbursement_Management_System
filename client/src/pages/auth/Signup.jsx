import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Lock, User, Globe, Loader2, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { useSignup } from '../../hooks/useAuth';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [detectedCurrency, setDetectedCurrency] = useState('');
  const { mutate: signup, isPending } = useSignup();

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then((r) => r.json())
      .then((data) => {
        const sorted = data
          .map((c) => ({
            name: c.name?.common || '',
            currency: c.currencies ? Object.keys(c.currencies)[0] : 'USD',
            currencyName: c.currencies
              ? Object.values(c.currencies)[0]?.name || ''
              : '',
          }))
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(() => {
        setCountries([
          { name: 'United States', currency: 'USD', currencyName: 'US Dollar' },
          { name: 'India', currency: 'INR', currencyName: 'Indian Rupee' },
          { name: 'United Kingdom', currency: 'GBP', currencyName: 'Pound Sterling' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (form.country) {
      const c = countries.find((cc) => cc.name === form.country);
      setDetectedCurrency(c?.currency || '');
    }
  }, [form.country, countries]);

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    signup({
      name: form.name,
      companyName: form.companyName,
      country: form.country,
      email: form.email,
      password: form.password,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
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
            Start managing<br />expenses today
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create your company account and invite your team. Set up approval workflows in minutes.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="card-elevated">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">Create Account</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Set up your company's reimbursement system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="signup-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input-elevated pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="signup-company"
                    type="text"
                    value={form.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="input-elevated pl-10"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline z-10" />
                  <select
                    id="signup-country"
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="select-elevated pl-10"
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {detectedCurrency && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Currency detected: <strong>{detectedCurrency}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="signup-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
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
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="input-elevated pl-10 pr-10"
                    placeholder="Min 8 chars"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-400'
                                : passwordStrength === 3
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                              : 'bg-surface-container-highest'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {Object.entries(passwordChecks).map(([key, ok]) => (
                        <span key={key} className={`flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-outline'}`}>
                          {ok ? <Check className="w-2.5 h-2.5" /> : <XIcon className="w-2.5 h-2.5" />}
                          {key === 'length' ? '8+ chars' : key === 'uppercase' ? 'Uppercase' : key === 'number' ? 'Number' : 'Special'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    id="signup-confirm"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="input-elevated pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-error mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={isPending || form.password !== form.confirmPassword}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
