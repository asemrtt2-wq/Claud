/**
 * Star display for a real average score. Renders partial stars by clipping a filled row over
 * an empty one, so 4.3 looks like 4.3 rather than being rounded to a whole star.
 *
 * Deliberately has no "no rating yet" fallback of its own — callers show their own wording,
 * because a book nobody has rated must never render as zero stars, which reads as a bad score
 * rather than an absent one.
 */
export default function StarRating({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const percent = (clamped / 5) * 100;

  return (
    <span
      className={`relative inline-block leading-none ${className}`}
      style={{ fontSize: `${size}px` }}
      aria-label={`${clamped} sur 5`}
      role="img"
    >
      <span className="text-current opacity-25">★★★★★</span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#f5b301]"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        ★★★★★
      </span>
    </span>
  );
}
