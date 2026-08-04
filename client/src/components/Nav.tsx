import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, UserRound, Menu, X } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { useAuth, useTheme } from '@/lib/auth';
import clsx from 'clsx';

const links = [
  { to: '/rooms', label: 'The Rooms' },
  { to: '/stays', label: 'My Stays' },
];

export function Nav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-page/85 border-b border-line">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Resortify home">
          <Wordmark className="text-[1.35rem]" />
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  'label hover:text-brass transition-colors',
                  isActive ? 'text-brass' : 'text-muted',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                clsx('label hover:text-brass transition-colors', isActive ? 'text-brass' : 'text-muted')
              }
            >
              Admin Desk
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
            className="p-2 rounded-full text-muted hover:text-brass hover:bg-elev-soft transition-colors"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="label text-ink-soft">
                {user.role === 'admin' ? 'Concierge' : 'Guest'} · {user.name.split(' ')[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="label text-muted hover:text-danger transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-page text-sm font-semibold hover:bg-pine hover:text-cream transition-colors"
            >
              <UserRound size={15} />
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-full text-muted hover:text-brass hover:bg-elev-soft transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-line bg-page/95 backdrop-blur-md px-5 py-4 space-y-3" aria-label="Mobile">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'block label hover:text-brass transition-colors',
                  isActive ? 'text-brass' : 'text-muted',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx('block label hover:text-brass transition-colors', isActive ? 'text-brass' : 'text-muted')
              }
            >
              Admin Desk
            </NavLink>
          )}
          {user ? (
            <div className="pt-2 border-t border-line flex items-center justify-between">
              <span className="label text-ink-soft">
                {user.role === 'admin' ? 'Concierge' : 'Guest'} · {user.name.split(' ')[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate('/');
                }}
                className="label text-muted hover:text-danger transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-page text-sm font-semibold hover:bg-pine hover:text-cream transition-colors"
            >
              <UserRound size={15} />
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
