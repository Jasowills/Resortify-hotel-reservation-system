import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, Moon, Palmtree, Quote, Sun, Waves, Wind } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { Reveal } from '@/components/Reveal';
import { RoomArt } from '@/components/RoomArt';
import { HeroCinemagraph } from '@/components/HeroCinemagraph';
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
    <section className="relative overflow-hidden text-[#f2ead9] md:flex md:min-h-[88vh] md:flex-col">
      <HeroCinemagraph />
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
      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'rgba(6,16,12,0.38)' }} />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,28,23,0) 38%, rgba(10,28,23,0.25) 58%, rgba(10,28,23,0.6) 80%, rgba(10,28,23,0.85) 100%)',
        }}
      />

      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pt-20 pb-10 md:pt-24 md:pb-16">
        <p
          className="enter font-mono text-xs tracking-[0.3em] uppercase text-[#e0a96a]"
          style={{ ['--d' as string]: '0ms', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
        >
          A heritage seaside resort · est. 1931
        </p>

        <h1
          className="enter mt-6 font-display font-medium tracking-tight text-6xl md:text-[6.5rem] leading-[0.95]"
          style={{
            ['--d' as string]: '120ms',
            textShadow: '0 2px 18px rgba(6,20,16,0.55), 0 1px 40px rgba(6,20,16,0.35)',
          }}
        >
          Where stays
          <br />
          become <span className="text-[#e0a96a] italic">stories.</span>
        </h1>

        <div
          className="enter mt-8 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12"
          style={{ ['--d' as string]: '240ms' }}
        >
          <p className="max-w-md text-base leading-relaxed text-[#dcd3bd]" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
            Eight rooms, a walled garden, and a cove of your own. Book direct for the honest rate, the
            linen, and a front desk that remembers your name.
          </p>
          <div className="flex items-center gap-3 text-sm text-[#c4b48f]" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}>
            <Waves size={16} className="text-[#e0a96a]" />
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

function Marquee() {
  const items = [
    'Eight rooms',
    'One cove',
    'Est. 1931',
    'Breakfast under the pergola',
    'No booking fees',
    'The tide schedule is yours',
  ];
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((it) => (
        <span
          key={it}
          className="flex items-center gap-8 px-8 font-mono text-[0.6875rem] tracking-[0.28em] uppercase text-[#f2ead9]/75"
        >
          {it}
          <span className="text-[#c9995f]">·</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-[#22483e] bg-[#0e2620] py-3.5">
      <div className="marquee-track flex w-max">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}

function Grounds() {
  const tiles = [
    {
      src: '/images/cove.jpg',
      alt: 'The cove, lined with palms and turquoise water',
      title: 'The cove at low tide',
      meta: '~ est. 1931',
    },
    {
      src: '/images/garden.jpg',
      alt: 'The walled garden path in bloom',
      title: 'The walled garden',
      meta: 'figs · citrus',
    },
    {
      src: '/images/pergola.jpg',
      alt: 'Breakfast under the vine-covered pergola',
      title: 'Under the pergola',
      meta: 'breakfast',
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="flex items-end justify-between">
          <div>
            <span className="label">The grounds</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">
              Everything within the walls.
            </h2>
            <span className="brass-rule mt-4" />
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted md:block">
            A cove, a walled garden, and one long table under the pergola.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:grid-rows-2">
        <Reveal delay={0} className="md:col-span-2 md:row-span-2">
          <figure className="card h-full overflow-hidden">
            <div className="relative aspect-[16/11] overflow-hidden">
              <img
                src={tiles[0].src}
                alt={tiles[0].alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c17]/55 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <span className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#f2ead9]">{tiles[0].title}</span>
                <span className="mono-num font-mono text-xs text-[#c9995f]">{tiles[0].meta}</span>
              </figcaption>
            </div>
          </figure>
        </Reveal>
        {[1, 2].map((i) => (
          <Reveal
            key={tiles[i].title}
            delay={i * 100}
            className={i === 1 ? 'md:col-start-3 md:row-start-1' : 'md:col-start-3 md:row-start-2'}
          >
            <figure className="card h-full overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={tiles[i].src}
                  alt={tiles[i].alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c17]/45 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                  <span className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#f2ead9]">{tiles[i].title}</span>
                  <span className="mono-num font-mono text-xs text-[#c9995f]">{tiles[i].meta}</span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FieldNotes() {
  const notes = [
    {
      body: 'We came for two nights and stayed for four. The cove in the evening is reason enough to never leave the coast.',
      who: 'Marguerite & Jacques',
      room: 'Room 4 · August 2026',
    },
    {
      body: 'Breakfast under the pergola, figs still warm from the tree. Our daughter still talks about the tide.',
      who: 'Amara',
      room: 'Room 2 · July 2026',
    },
    {
      body: 'The quietest place we have ever slept. You hear the tide turn at two in the morning and call it music.',
      who: 'Tom',
      room: 'Room 7 · June 2026',
    },
  ];
  return (
    <section className="bg-elev py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <span className="label">Field notes</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">
                From the guest book.
              </h2>
              <span className="brass-rule mt-4" />
            </div>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {notes.map((n, i) => (
            <Reveal key={n.who} delay={i * 120}>
              <figure className="card relative flex h-full flex-col p-7">
                <Quote className="absolute right-6 top-6 h-9 w-9 text-brass/25" />
                <blockquote className="font-display text-xl italic leading-snug text-ink-soft">
                  &ldquo;{n.body}&rdquo;
                </blockquote>
                <figcaption className="mt-auto pt-6">
                  <div className="hairline-t pt-4">
                    <span className="block font-semibold text-ink">{n.who}</span>
                    <span className="label mt-1 block">{n.room}</span>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const TIDE_PERIOD = 12.4206;
const TIDE_EPOCH = Date.UTC(2026, 0, 1);
const TIDE_PHASE = 2.2;

function tideLevel(hours: number): number {
  const m2 = Math.sin((hours / TIDE_PERIOD) * 2 * Math.PI + TIDE_PHASE);
  const wobble = Math.sin((hours / 12.9) * 2 * Math.PI + 1.0) * 0.15;
  return 0.5 + 0.5 * (0.85 * m2 + wobble);
}

function TideSchedule() {
  const now = useMemo(() => new Date(), []);
  const { nextEvents, pts, nowFrac } = useMemo(() => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const t0 = (start.getTime() - TIDE_EPOCH) / 3600000;

    const events: { type: 'high' | 'low'; time: Date; level: number }[] = [];
    let v2 = tideLevel(t0 - 2 / 60);
    let v1 = tideLevel(t0 - 1 / 60);
    for (let m = 0; m <= 48 * 60; m++) {
      const v = tideLevel(t0 + m / 60);
      if (v1 > v2 && v1 >= v) events.push({ type: 'high', time: new Date(start.getTime() + (m - 1) * 60000), level: v1 });
      if (v1 < v2 && v1 <= v) events.push({ type: 'low', time: new Date(start.getTime() + (m - 1) * 60000), level: v1 });
      v2 = v1;
      v1 = v;
    }

    const pts: number[] = [];
    for (let i = 0; i <= 96; i++) pts.push(tideLevel(t0 + (i / 96) * 24));
    const nowFrac = (now.getTime() - start.getTime()) / 86400000;
    return { nextEvents: events.filter((e) => e.time > now).slice(0, 2), pts, nowFrac };
  }, [now]);

  const CW = 100;
  const CH = 40;
  const PAD = 5;
  const path = pts.map((v, i) => `${((i / (pts.length - 1)) * CW).toFixed(2)},${(CH - PAD - v * (CH - 2 * PAD)).toFixed(2)}`).join(' ');
  const nowX = (nowFrac * CW).toFixed(2);
  const nowY = (CH - PAD - pts[Math.round(nowFrac * 96)] * (CH - 2 * PAD)).toFixed(2);

  return (
    <section className="bg-[#0a1c17] py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1fr_1.35fr] md:items-center md:gap-16">
          <Reveal>
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#c9995f]">Today&rsquo;s tide</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-medium tracking-tight text-[#f2ead9]">
              The cove keeps
              <br />
              <span className="italic text-[#c9995f]">its own clock.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#a89a80]">
              Two highs and two lows a day, drawn for the cove behind the wall. Check the board at the
              desk on your way out; the evening swim is best an hour before low.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {nextEvents.map((e) => (
                <div key={e.time.getTime()} className="rounded-xl border border-[#2f5a4e] bg-[#12342c] p-4">
                  <span className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#a89a80]">
                    {e.type === 'high' ? <Sun size={14} className="text-[#c9995f]" /> : <Moon size={14} className="text-[#c9995f]" />}
                    {e.type === 'high' ? 'High' : 'Low'}
                  </span>
                  <span className="mono-num mt-2 block text-2xl font-semibold text-[#f2ead9]">
                    {e.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-[#a89a80]">{(0.6 + e.level * 3).toFixed(1)} m</span>
                </div>
              ))}
            </div>
            <p className="mt-6 font-mono text-[0.6875rem] tracking-[0.2em] uppercase text-[#7d735f]">
              Approximate · drawn for the cove
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-[#2f5a4e] bg-[#12342c] p-6 md:p-8">
              <div className="flex items-baseline justify-between">
                <span className="label !text-[#a89a80]">
                  {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <Waves size={18} className="text-[#c9995f]" />
              </div>
              <svg
                viewBox={`0 0 ${CW} ${CH}`}
                className="mt-6 w-full"
                preserveAspectRatio="none"
                role="img"
                aria-label="Tide curve for today"
              >
                <polyline points={path} fill="none" stroke="#c9995f" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1={nowX} y1="0" x2={nowX} y2={CH} stroke="rgba(242,234,217,0.4)" strokeDasharray="2 3" />
                <circle cx={nowX} cy={nowY} r="2.6" fill="#f2ead9" />
              </svg>
              <div className="mt-3 flex justify-between font-mono text-[0.625rem] tracking-[0.2em] text-[#7d735f]">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-[#a89a80]">
                Now at <span className="mono-num text-[#f2ead9]">{(0.6 + pts[Math.round(nowFrac * 96)] * 3).toFixed(1)} m</span> and{' '}
                {nowFrac < 0.5 ? 'rising' : 'falling'}.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StayNotes() {
  const faqs = [
    { q: 'What time is check-in and check-out?', a: 'Check-in is from three in the afternoon; check-out is by eleven. Early arrival or a late train, just let the desk know.' },
    { q: 'Is breakfast included?', a: 'Yes. Served under the pergola each morning — fruit from the walled garden, bread from the village, and coffee until it runs out.' },
    { q: 'Are there booking fees?', a: 'No. Book direct for the honest rate, and cancel free of charge up to 48 hours before arrival.' },
    { q: 'How do we reach the cove?', a: 'Half a mile of dunes past the front gate. Towels are at the desk; the tide schedule is on the board.' },
    { q: 'Are children welcome?', a: 'The garden and the cove are theirs. Rooms two through six sleep three, and a cot is on the house.' },
    { q: 'Is it quiet?', a: 'You will hear the tide and the birds. The old coast road stays behind the wall — it never finds you.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="flex items-end justify-between">
          <div>
            <span className="label">Stay notes</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">
              The fine print, honestly.
            </h2>
            <span className="brass-rule mt-4" />
          </div>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-x-14 gap-y-2 md:grid-cols-2">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={(i % 2) * 100}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 border-b border-line py-5">
                <span className="font-display text-xl font-medium text-ink transition-colors group-open:text-brass">
                  {f.q}
                </span>
                <span className="shrink-0 font-mono text-sm text-faint transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="pt-3 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          </Reveal>
        ))}
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
      <Marquee />
      <FeaturedRooms />
      <Grounds />
      <Editorial />
      <FieldNotes />
      <TideSchedule />
      <StayNotes />
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
