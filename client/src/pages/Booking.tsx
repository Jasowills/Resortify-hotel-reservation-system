import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { RoomArt } from '@/components/RoomArt';
import { Button, Spinner, Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fmtDateShort, fmtMoney, nightsBetween, plural } from '@/lib/format';
import type { Reservation, Room } from '@/lib/types';

export default function Booking() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const roomId = params.get('roomId') ?? '';
  const checkIn = params.get('checkIn') ?? '';
  const checkOut = params.get('checkOut') ?? '';
  const guests = Number(params.get('guests')) || 2;

  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Reservation | null>(null);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!roomId) {
      setLoadingRoom(false);
      setError('No room selected. Please choose a room first.');
      return;
    }
    setLoadingRoom(true);
    api
      .get<Room>(`/rooms/${roomId}`)
      .then(setRoom)
      .catch((e) => setError(e instanceof Error ? e.message : 'Room not found'))
      .finally(() => setLoadingRoom(false));
  }, [roomId]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const total = (room?.ratePerNight ?? 0) * nights;

  useEffect(() => {
    if (user && !name) setName(user.name);
    if (user && !email) setEmail(user.email);
  }, [user, name, email]);

  async function submit() {
    if (!roomId) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<Reservation>('/reservations', {
        roomId,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        checkIn,
        checkOut,
        guests,
      });
      setDone(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="bg-[#0a1c17] px-8 py-10 text-center text-[#f2ead9]">
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#c9995f]">Reservation confirmed</span>
              <h1 className="mt-4 font-display text-4xl font-medium">{done.room.name}</h1>
              <div className="mt-8 inline-flex flex-col items-center rounded-xl border border-dashed border-[#c9995f]/50 px-10 py-6">
                <span className="font-mono text-[0.625rem] tracking-[0.3em] uppercase text-[#a89a80]">Your reference</span>
                <span className="mono-num mt-2 text-3xl font-semibold tracking-[0.12em] text-[#f2ead9]">{done.reference}</span>
                <span className="mt-3 text-[0.625rem] text-[#7d735f]">Keep this — it is your key</span>
              </div>
            </div>
            <div className="px-8 py-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-sm">
                  <PlaneTakeoff size={16} className="text-brass" />
                  <div>
                    <div className="font-semibold text-ink">{fmtDateShort(done.checkIn)}</div>
                    <div className="text-xs text-faint">Check-in · from 3 PM</div>
                  </div>
                </div>
                <div className="hidden h-8 w-px bg-line md:block" />
                <div className="flex items-center gap-3 text-sm">
                  <PlaneLanding size={16} className="text-brass" />
                  <div>
                    <div className="font-semibold text-ink">{fmtDateShort(done.checkOut)}</div>
                    <div className="text-xs text-faint">Check-out · by 11 AM</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm md:grid-cols-4">
                <div>
                  <div className="label">Nights</div>
                  <div className="mono-num mt-1 text-ink">{done.nights}</div>
                </div>
                <div>
                  <div className="label">Guests</div>
                  <div className="mono-num mt-1 text-ink">{done.guests}</div>
                </div>
                <div>
                  <div className="label">Rate / night</div>
                  <div className="mono-num mt-1 text-ink">{fmtMoney(done.room.ratePerNight)}</div>
                </div>
                <div>
                  <div className="label">Total</div>
                  <div className="mono-num mt-1 text-xl font-semibold text-brass">{fmtMoney(done.totalCost)}</div>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => navigate('/stays')}>View my stays</Button>
                <Link to="/" className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-muted hover:text-brass">
                  Back home
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  if (loadingRoom) {
    return (
      <div className="flex items-center gap-3 py-32 text-muted">
        <Spinner /> Preparing the booking…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <Alert>{error || 'Room not found'}</Alert>
        <Link to="/rooms" className="mt-6 inline-flex items-center gap-2 label text-brass">
          <ArrowLeft size={14} /> Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link to={`/rooms/${room.id}`} className="label inline-flex items-center gap-2 text-muted hover:text-brass transition-colors">
        <ArrowLeft size={14} /> {room.name}
      </Link>

      <h1 className="mt-6 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">Your stay.</h1>
      <span className="brass-rule mt-4" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <Reveal>
          <div className="space-y-6">
            <div className="card p-6">
              <span className="label">Guest details</span>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className="sm:col-span-2" />
                <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <Field label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0000" />
              </div>
            </div>

            <div className="card p-6">
              <span className="label">House rules</span>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li className="flex gap-3"><Check size={15} className="mt-0.5 shrink-0 text-brass" /> Check-in from 3 PM, check-out by 11 AM. Early arrivals are welcome to drop bags.</li>
                <li className="flex gap-3"><Check size={15} className="mt-0.5 shrink-0 text-brass" /> Free cancellation up to 48 hours before arrival.</li>
                <li className="flex gap-3"><Check size={15} className="mt-0.5 shrink-0 text-brass" /> The garden is quiet after 10 PM. The tide is not our problem.</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <aside className="lg:sticky lg:top-24">
            <div className="card overflow-hidden">
              <div className="room-plate aspect-[16/9]">
                <RoomArt type={room.type} className="h-full w-full p-2" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-medium text-ink">{room.name}</h2>
                  <span className="label">No. {room.number}</span>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>{fmtDateShort(checkIn)}</span>
                    <span className="text-faint">→</span>
                    <span>{fmtDateShort(checkOut)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>{plural(nights, 'night')} × {plural(guests, 'guest')}</span>
                    <span className="mono-num text-ink">{fmtMoney(total)}</span>
                  </div>
                </div>
                <div className="mt-5 border-t border-line pt-4 flex items-center justify-between">
                  <span className="label">Total</span>
                  <span className="mono-num text-2xl font-semibold text-ink">{fmtMoney(total)}</span>
                </div>
                {error && (
                  <div className="mt-4">
                    <Alert>{error}</Alert>
                  </div>
                )}
                <Button
                  className="mt-6 w-full"
                  disabled={submitting || !name.trim() || !email.trim()}
                  onClick={() => void submit()}
                >
                  {submitting ? <Spinner className="h-4 w-4" /> : null}
                  Confirm reservation
                </Button>
                <p className="mt-3 text-center text-xs text-faint">You will receive confirmation at your email.</p>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
