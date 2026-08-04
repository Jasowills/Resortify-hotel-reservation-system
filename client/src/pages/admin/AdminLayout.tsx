import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, BedDouble, CalendarCheck, Users } from 'lucide-react';

const tabs = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/admin/guests', label: 'Guests', icon: Users },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <span className="label">Concierge desk</span>
      <h1 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">The back office.</h1>
      <span className="brass-rule mt-4" />

      <nav className="mt-8 flex flex-wrap gap-1 rounded-2xl border border-line bg-card p-1.5 w-fit" aria-label="Admin">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              clsx(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                isActive ? 'bg-ink text-page' : 'text-muted hover:text-brass',
              )
            }
          >
            <t.icon size={15} />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
