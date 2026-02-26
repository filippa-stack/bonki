import bonkiLogo from '@/assets/bonki-logo.png';

export default function BackgroundWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <img
        src={bonkiLogo}
        alt=""
        className="w-64 h-64 object-contain opacity-[0.035] select-none"
        draggable={false}
      />
    </div>
  );
}
