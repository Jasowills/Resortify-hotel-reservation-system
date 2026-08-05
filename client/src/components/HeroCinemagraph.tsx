const BEACH_IMG = '/images/beach-hero.jpg';

export function HeroCinemagraph() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <img
        src={BEACH_IMG}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}
