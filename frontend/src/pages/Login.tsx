import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Lock, User, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, sessionTimedOut, clearTimeoutFlag } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearTimeoutFlag();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      navigate({ to: '/dashboard' });
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'oklch(0.97 0.005 240)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-orange"
                style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
              >
                🐔
              </div>
            </div>
            <h1 className="font-display font-bold text-2xl text-white">ChickNGo</h1>
            <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.01 240)' }}>
              Loyalty Management System
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-foreground mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6">Sign in to your admin account</p>

            {/* Session timeout alert */}
            {sessionTimedOut && (
              <Alert className="mb-4 border-warning/50 bg-warning/10">
                <Clock className="h-4 w-4" style={{ color: 'oklch(0.78 0.17 75)' }} />
                <AlertDescription style={{ color: 'oklch(0.78 0.17 75)' }}>
                  Your session expired due to inactivity. Please sign in again.
                </AlertDescription>
              </Alert>
            )}

            {/* Error alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold h-11 shadow-orange"
                disabled={isLoading}
                style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Default: <span className="font-mono font-medium">admin</span> /{' '}
              <span className="font-mono font-medium">admin123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'chickngo')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: 'oklch(0.65 0.19 45)' }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
