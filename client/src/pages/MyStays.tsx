import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarX2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHeader, Button, Spinner, Alert } from '@/components/ui';
import { StatusChip } from '@/components/StatusChip';
import { api } from '@/lib/api';
import { fmtDate, fmtMoney, plural } from '@/lib/format';
import type { Reservation } from '@/lib/types';

export default function MyStays() {
  const [stays, setStays] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Reservation[]>('/reservations')
      .then(setStays)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your stays'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    setCancelling(id);
    setError('');
    try {
      await api.put(`/reservations/${id}/status`, { status: 'cancelled' });
      setStays((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' as const } : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel');
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = stays.filter((s) => s.status !== 'cancelled');
  const cancelled = stays.filter((s) => s.status === 'cancelled');

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <PageHeader eyebrow="The register" title="My stays." />
      </Reveal>

      {error && (
        <div className="mt-8">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-24 text-muted">
          <Spinner /> Opening the register…
        </div>
      ) : stays.length === 0 ? (
        <div className="mt-16 card p-12 text-center">
          <CalendarX2 size={28} className="mx-auto text-faint" />
          <h2 className="mt-4 font-display text-2xl font-medium text-ink">No stays yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            The cove is patient. Whenever you are ready, the first room is on the other side of this button.
          </p>
          <Link to="/rooms" className="mt-6 inline-flex items-center gap-2 font-semibold text-brass hover:gap-3 transition-all">
            Browse the rooms <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-10 space-y-4">
            {upcoming.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <div className="card p-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-2xl font-medium text-ink">{s.room.name}</span>
                      <StatusChip status={s.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {fmtDate(s.checkIn)} → {fmtDate(s.checkOut)} · {plural(s.nights, 'night')} · {plural(s.guests, 'guest')}
                    </p>
                    <p className="mono-num mt-1 font-mono text-xs tracking-[0.15em] text-faint">REF {s.reference}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <span className="label">Total</span>
                      <p className="mono-num text-xl font-semibold text-ink">{fmtMoney(s.totalCost)}</p>
                    </div>
                    {s.status === 'confirmed' && (
                      <Button variant="outline" onClick={() => void cancel(s.id)} disabled={cancelling === s.id}>
                        {cancelling === s.id ? <Spinner className="h-4 w-4" /> : null}
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {cancelled.length > 0 && (
            <div className="mt-12">
              <span className="label">Cancelled</span>
              <div className="mt-4 space-y-3">
                {cancelled.map((s) => (
                  <div key={s.id} className="card p-5 flex items-center justify-between opacity-70">
                    <div>
                      <span className="font-display text-lg font-medium text-ink line-through decoration-faint/50">{s.room.name}</span>
                      <p className="mt-1 text-sm text-muted">
                        {fmtDate(s.checkIn)} → {fmtDate(s.checkOut)}
                      </p>
                    </div>
                    <StatusChip status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
