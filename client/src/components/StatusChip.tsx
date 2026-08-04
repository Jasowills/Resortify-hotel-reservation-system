import clsx from 'clsx';
import type { ReservationStatus } from '@/lib/types';

const map: Record<ReservationStatus, { label: string; dot: string }> = {
  confirmed: { label: 'Confirmed', dot: 'bg-brass' },
  'checked-in': { label: 'Checked in', dot: 'bg-pine' },
  'checked-out': { label: 'Checked out', dot: 'bg-faint' },
  cancelled: { label: 'Cancelled', dot: 'bg-danger' },
};

export function StatusChip({ status, className }: { status: ReservationStatus; className?: string }) {
  const m = map[status] ?? { label: status, dot: 'bg-faint' };
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-muted',
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}
