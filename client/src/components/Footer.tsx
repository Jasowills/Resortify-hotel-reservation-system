import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0a1c17] text-[#a89a80]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="text-2xl" tone="light" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#7d735f]">
              A heritage seaside resort on the old coast road. Linen, citrus, and long afternoon light.
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#a89a80]">Stay</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-[#f2ead9] transition-colors" to="/rooms">The Rooms</Link></li>
              <li><Link className="hover:text-[#f2ead9] transition-colors" to="/stays">My Stays</Link></li>
              <li><Link className="hover:text-[#f2ead9] transition-colors" to="/auth">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#a89a80]">The Resort</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Old Coast Road, 12</li>
              <li>Palm Cove</li>
              <li>+1 555 0100</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#a89a80]">Hours</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Check-in from 3 PM</li>
              <li>Check-out by 11 AM</li>
              <li>Front desk · always</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#22483e] flex flex-wrap items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-[#5a5f4f]">
          <span>© {new Date().getFullYear()} Resortify</span>
          <span>Where stays become stories</span>
        </div>
      </div>
    </footer>
  );
}
