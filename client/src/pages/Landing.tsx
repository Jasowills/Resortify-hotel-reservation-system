import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, Palmtree, Waves, Wind } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { Reveal } from '@/components/Reveal';
import { RoomArt } from '@/components/RoomArt';
import { HeroWave } from '@/components/HeroWave';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';
import { addDays, fmtMoney, todayISO } from '@/lib/format';
import type { Room } from '@/lib/types';

function Hero() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDays(todayISO(), 3));
  const [guests, setGuests] = useState(2);

  function go() {
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/rooms?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-[#0a1c17] text-[#f2ead9]">
      <HeroWave />
      <div className="pointer-events-none absolute inset-0 z-10 grain opacity-40" />
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(900px 420px at 78% -8%, rgba(201,153,95,0.22), transparent 60%)',
            maskImage: 'radial-gradient(120% 90% at 50% 10%, black 30%, transparent 100%)',
            opacity: 0.5,
          }}
        />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-5 pt-20 pb-10 md:pt-28 md:pb-14">
        <p className="enter font-mono text-xs tracking-[0.3em] uppercase text-[#c9995f]" style={{ ['--d' as string]: '0ms' }}>
          A heritage seaside resort · est. 1931
        </p>

        <h1 className="enter mt-6 font-display font-medium tracking-tight text-6xl md:text-[6.5rem] leading-[0.95]" style={{ ['--d' as string]: '120ms' }}>
          Where stays
          <br />
          become <span className="text-[#c9995f] italic">stories.</span>
        </h1>

        <div className="enter mt-8 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12" style={{ ['--d' as string]: '240ms' }}>
          <p className="max-w-md text-base leading-relaxed text-[#a89a80]">
            Eight rooms, a walled garden, and a cove of your own. Book direct for the honest rate, the
            linen, and a front desk that remembers your name.
          </p>
          <div className="flex items-center gap-3 text-sm text-[#7d735f]">
            <Waves size={16} className="text-[#c9995f]" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">Rooms from {fmtMoney(180)} / night</span>
          </div>
        </div>

        {/* availability card */}
        <div
          className="enter mt-12 md:mt-14 max-w-3xl"
          style={{ ['--d' as string]: '360ms' }}
        >
          <div className="card !rounded-2xl p-4 md:p-5 text-ink !shadow-none grid gap-3 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
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
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={go} className="md:mb-0">
              Check rates <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* tide line */}
      <svg viewBox="0 0 1200 40" className="relative block w-full h-10 text-[#c9995f]" preserveAspectRatio="none" aria-hidden>
        <path className="tide" d="M0 20 Q 300 4 600 20 T 1200 20 V 40 H 0 Z" fill="rgba(201,153,95,0.10)" />
      </svg>
    </section>
  );
}

function FeaturedRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    api.get<Room[]>('/rooms').then(setRooms).catch(() => setRooms([]));
  }, []);

  const featured = rooms.filter((r) => r.active).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="flex items-end justify-between">
          <div>
            <span className="label">The rooms</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">
              Room to be still.
            </h2>
            <span className="brass-rule mt-4" />
          </div>
          <Link to="/rooms" className="label hidden md:inline-flex items-center gap-2 text-brass hover:gap-3 transition-all">
            See all rooms <ArrowRight size={14} />
          </Link>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {featured.map((room, i) => (
          <Reveal key={room.id} delay={i * 120}>
            <Link
              to={`/rooms/${room.id}`}
              className="group block card overflow-hidden hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="room-plate aspect-[16/10]">
                <RoomArt type={room.type} className="h-full w-full p-2" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="label">No. {room.number}</span>
                  <span className="mono-num text-brass text-sm font-semibold">{fmtMoney(room.ratePerNight)}<span className="text-faint text-xs"> / night</span></span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-medium text-ink group-hover:text-brass transition-colors">
                  {room.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{room.description}</p>
                <div className="mt-4 flex items-center justify-between pt-4 hairline-t">
                  <span className="label">{room.capacity} guests · {room.amenities.length} amenities</span>
                  <ArrowRight size={16} className="text-brass transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Editorial() {
  const items = [
    { icon: BedDouble, title: 'Eight rooms', body: 'Not ninety. Eight. Each held to the same quiet standard of linen, oak, and morning light.' },
    { icon: Palmtree, title: 'A walled garden', body: 'Citrus, figs, and a pergola that holds the evening long past the sun. Breakfast is served under it.' },
    { icon: Wind, title: 'The old coast road', body: 'Half a mile of dunes between the front gate and the cove. You will not hear the road. You will hear the tide.' },
  ];

  return (
    <section className="bg-elev py-20">
      <div className="mx-auto max-w-6xl px-5 grid gap-12 md:grid-cols-[1.1fr_1.5fr] md:gap-20">
        <Reveal>
          <div className="sticky md:top-24">
            <span className="label">The property</span>
            <div className="mt-6 font-display text-[7rem] leading-none text-brass/70 select-none">1931</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Founded as a coastal inn on the old coast road, kept in the family, and quietly restored
              one room at a time. No marble lobby. No wristbands.
            </p>
          </div>
        </Reveal>
        <div className="space-y-8">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 120}>
              <div className="flex gap-5">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-brass">
                  <item.icon size={19} />
                </div>
                <div className="pt-2.5">
                  <h3 className="font-display text-2xl font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={360}>
            <div className="ml-16 mt-4">
              <Link to="/rooms" className="inline-flex items-center gap-2 font-semibold text-brass hover:gap-3 transition-all">
                Browse the rooms <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-[#0a1c17]">
      <div className="mx-auto max-w-4xl px-5 py-24 text-center">
        <Reveal>
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#c9995f]">No booking fees · free cancellation</span>
          <h2 className="mt-6 font-display text-5xl md:text-6xl font-medium tracking-tight text-[#f2ead9]">
            A summer in a seaside resort,
            <br />
            <span className="italic text-[#c9995f]">kept simple.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#a89a80]">
            Check in from three in the afternoon. Check out by eleven. The cove, the garden, and the
            tide schedule are yours for the whole stay.
          </p>
          <div className="mt-10">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 rounded-full bg-[#f2ead9] px-7 py-3 text-sm font-semibold text-[#0a1c17] transition-all hover:gap-3 hover:brightness-110"
            >
              Plan your stay <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Landing() {
  const [checkIn] = useState(() => todayISO());
  const [checkOut] = useState(() => addDays(todayISO(), 3));
  const navParams = useMemo(() => {
    const p = new URLSearchParams({ checkIn, checkOut });
    return p.toString();
  }, [checkIn, checkOut]);

  return (
    <>
      <Hero />
      <FeaturedRooms />
      <Editorial />
      <CTA />

      {/* mobile rooms link */}
      <div className="mx-auto max-w-6xl px-5 md:hidden">
        <Link to={`/rooms?${navParams}`} className="flex items-center justify-between rounded-xl border border-line-strong px-5 py-4 font-semibold text-ink">
          See all rooms <ArrowRight size={16} className="text-brass" />
        </Link>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-4 md:hidden">
        <div className="flex items-center justify-between py-5 font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-faint hairline-t">
          <Wordmark className="text-base" />
          <span>est. 1931</span>
        </div>
      </div>
    </>
  );
}
