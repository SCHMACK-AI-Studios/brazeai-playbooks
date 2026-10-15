import { asset } from "@/lib/asset";

/**
 * The deck's hand-drawn red arrow (public/illustrations/arrow.webp, from the
 * source slides), pointing right at rotation 0. abridge-sessions shipped a
 * placeholder here and noted the real brand arrow should replace it; this
 * deck has one.
 */
export function BrandedArrow({ size, rotation = 0 }: { size: number; rotation?: number }) {
  return (
    <img
      src={asset("/illustrations/arrow.webp")}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotation}deg)` }}
      draggable={false}
    />
  );
}

/**
 * Edge navigation, adapted from abridge-sessions' EdgeNavArrows: forward is
 * the bigger, stronger arrow with a slow drift suggesting motion; back is
 * smaller and quieter. Controls stay visible while reading.
 */
export function EdgeNavArrows({
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous"
        className="group fixed top-1/2 left-4 z-40 hidden h-28 w-24 -translate-y-1/2 items-center justify-start pl-3 transition-opacity duration-300 disabled:pointer-events-none disabled:!opacity-0 sm:flex"
        style={{ opacity: 0.45 }}
      >
        <span className="inline-flex transition-transform duration-200 ease-out group-hover:-translate-x-1.5">
          <BrandedArrow rotation={180} size={64} />
        </span>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next"
        className="group fixed top-1/2 right-4 z-40 hidden h-36 w-36 -translate-y-1/2 items-center justify-end pr-3 transition-opacity duration-300 hover:!opacity-100 disabled:pointer-events-none disabled:!opacity-0 sm:flex"
        style={{ opacity: 0.8 }}
      >
        <span className="next-arrow-idle inline-flex transition-transform duration-150 ease-out group-hover:translate-x-2 group-active:translate-x-3 group-active:scale-90">
          <BrandedArrow size={112} />
        </span>
      </button>
    </>
  );
}
