import type { RoomType } from '@/lib/types';

function Horizon({ ocean }: { ocean?: boolean }) {
  return (
    <>
      <line x1="20" y1="120" x2="380" y2="120" stroke="var(--line-strong)" strokeWidth="2" />
      {ocean ? (
        <g className="tide">
          <path d="M20 128 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
          <path d="M20 138 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
          <circle cx="320" cy="86" r="18" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="320" cy="86" r="3" fill="var(--accent)" />
        </g>
      ) : (
        <circle cx="300" cy="86" r="18" fill="none" stroke="var(--accent)" strokeWidth="2" />
      )}
    </>
  );
}

export function RoomArt({ type, className = '' }: { type: RoomType; className?: string }) {
  const garden = type === 'garden';
  const ocean = type === 'ocean';
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      className={className}
      role="img"
      aria-label={`Illustration of the ${type} room`}
    >
      {/* window frame */}
      <rect x="40" y="24" width="320" height="196" rx="4" stroke="var(--line-strong)" strokeWidth="2" />
      <line x1="200" y1="24" x2="200" y2="220" stroke="var(--line-strong)" strokeWidth="2" />
      <line x1="40" y1="122" x2="360" y2="122" stroke="var(--line-strong)" strokeWidth="1.5" />

      {/* mullion shadows */}
      <line x1="120" y1="24" x2="120" y2="122" stroke="var(--line)" strokeWidth="1" />
      <line x1="280" y1="24" x2="280" y2="122" stroke="var(--line)" strokeWidth="1" />

      {/* sky */}
      <rect x="42" y="26" width="316" height="94" fill="var(--halo)" opacity="0.35" />

      {/* the view: horizon per type */}
      {type === 'standard' ? <Horizon /> : <Horizon ocean={ocean} />}

      {/* dunes / ground inside view */}
      {type !== 'ocean' && (
        <path d="M20 132 q40 -14 80 0 q40 14 80 0" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      )}

      {/* garden foliage */}
      {garden && (
        <g stroke="var(--pine)" strokeWidth="2" opacity="0.9">
          <path d="M40 220 C 40 170, 90 170, 90 220" fill="none" />
          <path d="M70 220 C 70 150, 130 150, 130 220" fill="none" />
          <path d="M100 220 C 100 160, 150 160, 150 220" fill="none" />
        </g>
      )}

      {/* palm fronds for ocean */}
      {ocean && (
        <g stroke="var(--pine)" strokeWidth="2" opacity="0.9">
          <path d="M120 220 Q 120 150, 60 150" fill="none" />
          <path d="M120 220 Q 120 140, 90 120" fill="none" />
          <path d="M120 220 Q 120 150, 180 150" fill="none" />
          <line x1="120" y1="220" x2="120" y2="150" strokeWidth="3" />
        </g>
      )}

      {/* bed silhouette on the left half */}
      <g stroke="var(--ink-soft)" strokeWidth="2">
        <rect x="64" y="168" width="120" height="18" rx="3" />
        <rect x="56" y="168" width="14" height="40" rx="2" />
        <rect x="60" y="136" width="130" height="34" rx="4" />
        <rect x="66" y="142" width="118" height="10" fill="var(--accent-soft)" stroke="none" rx="2" />
        <circle cx="200" cy="178" r="10" />
      </g>

      {/* lamp */}
      <g stroke="var(--ink-soft)" strokeWidth="2">
        <line x1="230" y1="186" x2="230" y2="170" />
        <path d="M216 170 h28 l-4 -12 h-20 z" fill="var(--accent-soft)" />
      </g>

      {/* bench for suites */}
      {type === 'suite' && (
        <g stroke="var(--ink-soft)" strokeWidth="2">
          <rect x="244" y="186" width="96" height="8" rx="2" />
          <line x1="260" y1="194" x2="260" y2="208" />
          <line x1="320" y1="194" x2="320" y2="208" />
          <rect x="252" y="170" width="80" height="16" rx="3" fill="var(--accent-soft)" stroke="none" />
        </g>
      )}
    </svg>
  );
}
