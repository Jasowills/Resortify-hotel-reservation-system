import clsx from 'clsx';

export function Wordmark({ className = '', tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
  return (
    <span
      className={clsx(
        'font-display font-semibold tracking-tight select-none',
        className,
        tone === 'ink' ? 'text-ink' : 'text-cream',
      )}
    >
      Resort<span className="text-brass">·</span>ify
    </span>
  );
}
