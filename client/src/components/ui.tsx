import clsx from 'clsx';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-page hover:bg-pine hover:text-cream shadow-[var(--shadow-card)]',
  outline:
    'border border-line-strong text-ink hover:border-brass hover:text-brass bg-card',
  ghost: 'text-muted hover:text-brass',
  danger: 'bg-danger text-cream hover:opacity-90',
};

export function Button({
  variant = 'primary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}

export function Field({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={clsx('block', className)}>
      <span className="input-label block mb-1.5">{label}</span>
      <input className="input-base" {...rest} />
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function PageHeader({ eyebrow, title, aside }: { eyebrow: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <span className="label">{eyebrow}</span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight text-ink">{title}</h1>
        <span className="brass-rule mt-4" />
      </div>
      {aside && <div>{aside}</div>}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={clsx('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-label="Loading">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const tone = {
    error: 'border-danger/40 text-danger',
    success: 'border-pine/40 text-pine',
    info: 'border-brass/40 text-muted',
  }[kind];
  return <p className={clsx('rounded-lg border bg-card px-4 py-3 text-sm', tone)}>{children}</p>;
}
