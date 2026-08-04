import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BedDouble, Box, Check, Image, Waves } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { RoomArt } from '@/components/RoomArt';
import { RoomViewer3D } from '@/components/RoomViewer3D';
import { Button, Spinner, Alert } from '@/components/ui';
import { api } from '@/lib/api';
import {
  addDays,
  fmtMoney,
  nightsBetween,
  plural,
  ROOM_TYPE_LABEL,
  todayISO,
} from '@/lib/format';
import type { Room } from '@/lib/types';
import clsx from 'clsx';

export default function RoomDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState(() => params.get('checkIn') ?? todayISO());
  const [checkOut, setCheckOut] = useState(() => params.get('checkOut') ?? addDays(todayISO(), 3));
  const [guests, setGuests] = useState(() => Number(params.get('guests')) || 2);
  const [availableNow, setAvailableNow] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    api
      .get<Room>(`/rooms/${id}`)
      .then(setRoom)
      .catch((e) => setError(e instanceof Error ? e.message : 'Room not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = useMemo(
    () => (checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0),
    [checkIn, checkOut],
  );

  useEffect(() => {
    if (!room || !checkIn || !checkOut) {
      setAvailableNow(null);
      return;
    }
    let cancelled = false;
    api
      .get<Room[]>(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
      .then((list) => {
        if (!cancelled) setAvailableNow(list.some((r) => r.id === room.id));
      })
      .catch(() => {
        if (!cancelled) setAvailableNow(null);
      });
    return () => {
      cancelled = true;
    };
  }, [room, checkIn, checkOut, guests]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-32 text-muted">
        <Spinner /> Unlocking the door…
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Alert>{error || 'Room not found'}</Alert>
        <Link to="/rooms" className="mt-6 inline-flex items-center gap-2 label text-brass">
          <ArrowLeft size={14} /> Back to rooms
        </Link>
      </div>
    );
  }

  const total = nights * room.ratePerNight;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/rooms" className="label inline-flex items-center gap-2 text-muted hover:text-brass transition-colors">
        <ArrowLeft size={14} /> The rooms
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
        <div>
          <Reveal>
            <div className="room-plate overflow-hidden rounded-2xl hairline">
              {viewMode === '2d' ? (
                <RoomArt type={room.type} className="h-auto w-full" />
              ) : (
                <RoomViewer3D type={room.type} />
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 rounded-full border border-line p-0.5 w-fit">
              <button
                onClick={() => setViewMode('2d')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === '2d' ? 'bg-ink text-page' : 'text-muted hover:text-brass',
                )}
              >
                <Image size={13} /> 2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === '3d' ? 'bg-ink text-page' : 'text-muted hover:text-brass',
                )}
              >
                <Box size={13} /> 3D
              </button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8">
              <span className="label">No. {room.number} · {ROOM_TYPE_LABEL[room.type]}</span>
              <h1 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">{room.name}</h1>
              <span className="brass-rule mt-4" />
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft">{room.description}</p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <div className="flex items-center gap-2 text-brass">
                  <BedDouble size={16} />
                  <span className="label !text-brass">The bed</span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {plural(room.capacity, 'guest')} · sleeps up to {room.capacity} in quiet comfort.
                </p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 text-brass">
                  <Waves size={16} />
                  <span className="label !text-brass">The rate</span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {fmtMoney(room.ratePerNight)} per night, direct. No resort fee, ever.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10">
              <span className="label">In the room</span>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {room.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brass/50 text-brass">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* booking rail */}
        <Reveal delay={120}>
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="card p-6">
              <div className="flex items-baseline justify-between">
                <span className="mono-num text-3xl font-semibold text-ink">{fmtMoney(room.ratePerNight)}</span>
                <span className="text-sm text-faint">per night</span>
              </div>
              <div className="mt-6 space-y-3">
                <label className="block">
                  <span className="input-label block mb-1.5">Check-in</span>
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
                  <span className="input-label block mb-1.5">Check-out</span>
                  <input
                    type="date"
                    className="input-base"
                    value={checkOut}
                    min={addDays(checkIn, 1)}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="input-label block mb-1.5">Guests</span>
                  <select className="input-base" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 space-y-2 border-y border-line py-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{fmtMoney(room.ratePerNight)} × {plural(nights, 'night')}</span>
                  <span className="mono-num text-ink">{fmtMoney(total)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Resort fee</span>
                  <span className="mono-num text-ink">Free</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="label">Total</span>
                <span className="mono-num text-xl font-semibold text-ink">{fmtMoney(total)}</span>
              </div>

              {availableNow === false && (
                <div className="mt-4">
                  <Alert>Not free for those dates — try shifting by a night.</Alert>
                </div>
              )}

              <Button
                className="mt-5 w-full"
                disabled={availableNow === false || nights <= 0}
                onClick={() =>
                  navigate(`/booking?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
                }
              >
                Book this room <ArrowRight size={16} />
              </Button>
              <p className="mt-3 text-center text-xs text-faint">Free cancellation up to 48h before check-in.</p>
            </div>

            <div className="mt-4 rounded-xl border border-line-strong/60 bg-elev p-4 text-center">
              <p className="text-sm text-muted">
                Prefer to talk it through? <span className="font-semibold text-brass">+1 555 0100</span>
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
