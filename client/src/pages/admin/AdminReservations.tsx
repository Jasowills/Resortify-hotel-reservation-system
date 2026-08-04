import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Spinner, Alert } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Reservation, ReservationStatus } from '@/lib/types';
import clsx from 'clsx';

const STATUS_OPTIONS: ReservationStatus[] = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];

export default function AdminReservations() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Reservation[]>('/reservations')
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load reservations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: ReservationStatus) {
    setBusy(id);
    setError('');
    try {
      await api.put(`/reservations/${id}/status`, { status });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this reservation permanently?')) return;
    setBusy(id);
    setError('');
    try {
      await api.del(`/reservations/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(null);
    }
  }

  const visible = rows.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors',
              filter === s ? 'border-brass bg-brass-soft font-semibold text-ink' : 'border-line text-muted hover:text-brass',
            )}
          >
            {s === 'all' ? 'All' : s.replace('-', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-muted">
          <Spinner /> Fetching the register…
        </div>
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Guest', 'Room', 'Arrival', 'Departure', 'Guests', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-faint font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-faint">
                    Nothing here.
                  </td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-elev/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{r.guestName}</p>
                    <p className="font-mono text-[0.625rem] tracking-[0.15em] text-faint">REF {r.reference}</p>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {r.room.name}
                    <p className="text-xs text-faint">No. {r.room.number}</p>
                  </td>
                  <td className="px-5 py-4 text-muted">{fmtDate(r.checkIn)}</td>
                  <td className="px-5 py-4 text-muted">{fmtDate(r.checkOut)}</td>
                  <td className="px-5 py-4 text-muted">{r.guests}</td>
                  <td className="mono-num px-5 py-4 font-semibold text-ink">{fmtMoney(r.totalCost)}</td>
                  <td className="px-5 py-4">
                    <select
                      value={r.status}
                      disabled={busy === r.id}
                      onChange={(e) => void setStatus(r.id, e.target.value as ReservationStatus)}
                      className="rounded-lg border border-line-strong bg-card px-2.5 py-1.5 text-sm outline-none focus:border-brass"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void remove(r.id)}
                      disabled={busy === r.id}
                      aria-label={`Delete ${r.reference}`}
                      className="text-faint hover:text-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
