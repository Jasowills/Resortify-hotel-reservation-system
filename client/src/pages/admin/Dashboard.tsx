import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, CalendarCheck, CircleDollarSign, Percent } from 'lucide-react';
import { Spinner, Alert } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtMoney } from '@/lib/format';
import type { Metrics, Reservation } from '@/lib/types';

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-brass">
        <Icon size={16} />
        <span className="label !text-brass">{label}</span>
      </div>
      <p className="mono-num mt-4 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-xs text-faint">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [today, setToday] = useState<Reservation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const date = `${y}-${m}-${d}`;
    Promise.all([
      api.get<Metrics>('/reservations/metrics'),
      api.get<Reservation[]>(`/reservations?date=${date}`),
    ])
      .then(([m, t]) => {
        setMetrics(m);
        setToday(t);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the desk'));
  }, []);

  if (error) {
    return <Alert>{error}</Alert>;
  }
  if (!metrics) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted">
        <Spinner /> Tallying the register…
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={CalendarCheck} label="Bookings" value={String(metrics.totalBookings)} hint="Active reservations" />
        <MetricCard icon={BedDouble} label="In house" value={String(metrics.checkedIn)} hint="Checked in now" />
        <MetricCard icon={CircleDollarSign} label="Revenue" value={fmtMoney(metrics.revenue)} hint="Confirmed + completed" />
        <MetricCard icon={Percent} label="Occupancy" value={`${metrics.occupancyPercent}%`} hint="Rooms in use now" />
      </div>

      <div className="mt-10 card p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="label">Today’s register</span>
            <h2 className="mt-2 font-display text-2xl font-medium text-ink">Arrivals & departures</h2>
          </div>
          <Link to="/admin/reservations" className="label inline-flex items-center gap-2 text-brass hover:gap-3 transition-all">
            All reservations <ArrowRight size={14} />
          </Link>
        </div>

        {today.length === 0 ? (
          <p className="mt-8 py-8 text-center text-sm text-faint">A quiet day at the desk. No arrivals.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {today.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-ink">{r.guestName}</p>
                  <p className="text-sm text-muted">{r.room.name} · {r.nights} nights</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono-num text-sm font-semibold text-brass">{fmtMoney(r.totalCost)}</span>
                  <span className="font-mono text-xs tracking-[0.15em] text-faint">REF {r.reference}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
