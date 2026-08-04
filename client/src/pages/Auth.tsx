import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Reveal } from '@/components/Reveal';
import { Wordmark } from '@/components/Wordmark';
import { Button, Field, Spinner, Alert } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = mode === 'signin' ? await login(email, password) : await register(name, email, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">
      <Reveal>
        <div className="hidden md:block">
          <span className="label">Front desk</span>
          <Wordmark className="mt-4 block text-4xl" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Sign in to manage your stays, or create an account in about thirty seconds. We do not
            sell your details to anyone — we do not even like the phone ringing.
          </p>
          <div className="mt-10">
            <span className="brass-rule" />
            <p className="mt-4 font-mono text-xs tracking-[0.22em] uppercase text-faint">
              Admin? Use the concierge account.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="card p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-medium text-ink">
              {mode === 'signin' ? 'Welcome back.' : 'Join the register.'}
            </h1>
            <div className="flex rounded-full border border-line p-0.5">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError('');
                  }}
                  className={clsx(
                    'rounded-full px-4 py-1 text-sm transition-colors',
                    mode === m ? 'bg-ink text-page' : 'text-muted hover:text-brass',
                  )}
                >
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'signup' && (
              <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
            )}
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={8}
            />

            {error && <Alert>{error}</Alert>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : null}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-faint">
            Demo desk · <span className="font-mono">admin@resortify.dev</span> / <span className="font-mono">AdminPass123!</span>
            <br />
            Guest · <span className="font-mono">demo@resortify.dev</span> / <span className="font-mono">DemoPass123!</span>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
