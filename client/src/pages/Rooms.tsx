import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, UserRound } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { RoomArt } from '@/components/RoomArt';
import { PageHeader, Button, Spinner, Alert } from '@/components/ui';
import { api } from '@/lib/api';
import { addDays, fmtMoney, plural, ROOM_TYPE_LABEL, todayISO } from '@/lib/format';
import type { Room, RoomType } from '@/lib/types';
import clsx from 'clsx';

const TYPE_FILTERS: Array<{ key: RoomType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'standard', label: 'Standard' },
  { key: 'deluxe', label: 'Deluxe' },
  { key: 'suite', label: 'Suites' },
  { key: 'garden', label: 'Garden' },
  { key: 'ocean', label: 'Ocean' },
];

export default function Rooms() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(() => params.get('checkIn') ?? todayISO());
  const [checkOut, setCheckOut] = useState(() => params.get('checkOut') ?? addDays(todayISO(), 3));
  const [guests, setGuests] = useState(() => Number(params.get('guests')) || 2);
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [available, setAvailable] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searched = useMemo(
    () => Boolean(params.get('checkIn') || params.get('checkOut')),
    [params],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = await api.get<Room[]>('/rooms');
      setRooms(all.filter((r) => r.active));
      if (searched) {
        const avail = await api.get<Room[]>(
          `/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`,
        );
        setAvailable(new Set(avail.map((r) => r.id)));
      } else {
        setAvailable(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load rooms');
    } finally {
      setLoading(false);
    }
  }, [searched, checkIn, checkOut, guests]);

  useEffect(() => {
    void load();
  }, [load]);

  function applySearch() {
    const p = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/rooms?${p.toString()}`);
    void load();
  }

  const filtered = rooms.filter((r) => typeFilter === 'all' || r.type === typeFilter);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <PageHeader
          eyebrow="Rates & availability"
          title="Choose your room."
          aside={
            <p className="max-w-xs text-sm text-muted">
              Dates on the left are live availability. Rooms without a brass tag can be requested at the desk.
            </p>
          }
        />
      </Reveal>

      {/* search bar */}
      <Reveal delay={100}>
        <div className="card mt-10 p-4 md:p-5 grid gap-3 md:grid-cols-[1fr_1fr_150px_auto] md:items-end">
          <label className="block">
            <span className="input-label block mb-1.5">
              <CalendarDays size={12} className="mr-1 inline" /> Check-in
            </span>
            <input
              type="date"
              className="input-base"
              value={checkIn}
              min={todayISO()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1));
              }}
            />
          </label>
          <label className="block">
            <span className="input-label block mb-1.5">
              <CalendarDays size={12} className="mr-1 inline" /> Check-out
            </span>
            <input
              type="date"
              className="input-base"
              value={checkOut}
              min={addDays(checkIn, 1)}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="input-label block mb-1.5">
              <UserRound size={12} className="mr-1 inline" /> Guests
            </span>
            <select className="input-base" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={applySearch}>Update</Button>
        </div>
      </Reveal>

      {/* type filter */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by room type">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              typeFilter === f.key
                ? 'border-brass bg-brass-soft text-ink font-semibold'
                : 'border-line text-muted hover:border-brass hover:text-brass',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-8">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-24 text-muted">
          <Spinner /> Checking the register…
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-24 text-center text-muted">
          No rooms in this view. Try a different filter — or a different season.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room, i) => {
            const isFree = available === null || available.has(room.id);
            return (
              <Reveal key={room.id} delay={(i % 3) * 100}>
                <div
                  className={clsx(
                    'card overflow-hidden transition-all duration-300',
                    available !== null && !isFree ? 'opacity-55 saturate-50' : 'hover:shadow-[var(--shadow-lift)] hover:-translate-y-1',
                  )}
                >
                  <Link to={`/rooms/${room.id}`} className="block">
                    <div className="room-plate aspect-[16/10]">
                      <RoomArt type={room.type} className="h-full w-full p-2" />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="label">No. {room.number}</span>
                      <span className="mono-num text-brass text-sm font-semibold">
                        {fmtMoney(room.ratePerNight)}
                        <span className="text-faint text-xs"> / night</span>
                      </span>
                    </div>
                    <Link to={`/rooms/${room.id}`}>
                      <h3 className="mt-3 font-display text-2xl font-medium text-ink hover:text-brass transition-colors">
                        {room.name}
                      </h3>
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{room.description}</p>
                    <div className="mt-4 flex items-center justify-between pt-4 hairline-t">
                      <span className="label">{ROOM_TYPE_LABEL[room.type]} · {plural(room.capacity, 'guest')}</span>
                      {available !== null &&
                        (isFree ? (
                          <span className="font-mono text-[0.625rem] tracking-[0.2em] uppercase text-brass">Free</span>
                        ) : (
                          <span className="font-mono text-[0.625rem] tracking-[0.2em] uppercase text-danger">Booked</span>
                        ))}
                    </div>
                    <Link
                      to={`/rooms/${room.id}${searched ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : ''}`}
                      className={clsx(
                        'mt-5 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all',
                        isFree
                          ? 'bg-ink text-page hover:bg-pine-700 hover:text-cream'
                          : 'border border-line-strong text-faint pointer-events-none',
                      )}
                    >
                      {isFree ? (
                        <>
                          View room <ArrowRight size={15} />
                        </>
                      ) : (
                        'Unavailable'
                      )}
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
