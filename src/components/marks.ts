import type { Pt } from "@/components/Scribble";
import { asset } from "@/lib/asset";

/**
 * Pen routes for the deck's hand-drawn marks, traced by eye over the
 * original artwork in public/illustrations/. Coordinates are 0–1 across the
 * image box. Each inner array is one pen stroke, drawn in order.
 *
 * They only need to stay within half a brush-width of the ink: the mask
 * reveals the artwork, it does not redraw it.
 */
export const MARKS = {
  arrow: {
    src: asset("/illustrations/arrow.webp"),
    routes: [
      [
        [0, 0.52],
        [0.2, 0.52],
        [0.4, 0.55],
        [0.6, 0.53],
        [0.8, 0.5],
        [0.975, 0.46],
      ],
      [
        [0.975, 0.46],
        [0.88, 0.39],
        [0.76, 0.35],
        [0.64, 0.31],
      ],
      [
        [0.975, 0.47],
        [0.9, 0.56],
        [0.8, 0.65],
        [0.69, 0.73],
      ],
    ] as Pt[][],
    /** Brush as a fraction of the box width. */
    brush: 0.14,
  },
  oval: {
    src: asset("/illustrations/oval.webp"),
    routes: [
      [
        [0.45, 0.01],
        [0.65, 0.04],
        [0.85, 0.15],
        [0.98, 0.35],
        [0.99, 0.52],
        [0.93, 0.72],
        [0.8, 0.9],
        [0.62, 0.99],
        [0.45, 0.97],
        [0.22, 0.86],
        [0.08, 0.7],
        [0.01, 0.45],
        [0.03, 0.2],
        [0.15, 0.05],
        [0.3, 0.01],
        [0.58, 0.01],
      ],
    ] as Pt[][],
    brush: 0.05,
  },
  underline: {
    src: asset("/illustrations/underline.webp"),
    routes: [
      [
        [0, 0.5],
        [1, 0.5],
      ],
    ] as Pt[][],
    brush: 0.2,
  },
  knot: {
    src: asset("/illustrations/knot.webp"),
    routes: [
      [
        // The straight tail, then the S-bend where it rises into the knot.
        [0, 0.54],
        [0.275, 0.54],
        [0.33, 0.48],
        [0.38, 0.39],
        [0.43, 0.31],
        [0.49, 0.28],
        // The knot's left lobe, before the sweeps across the rest of it.
        [0.44, 0.42],
        [0.4, 0.52],
        [0.45, 0.62],
        [0.49, 0.85],
        [0.54, 0.72],
        [0.53, 0.5],
        [0.575, 0.07],
        [0.61, 0.95],
        [0.66, 0.05],
        [0.71, 0.97],
        [0.76, 0.03],
        [0.81, 0.97],
        [0.86, 0.1],
        [0.9, 0.9],
        [0.95, 0.55],
        [1, 0.6],
      ],
    ] as Pt[][],
    brush: 0.1,
  },
  lightning: {
    src: asset("/illustrations/lightning.webp"),
    routes: [
      [
        [0.97, 0.02],
        [0.55, 0.16],
        [0.42, 0.3],
        [0.2, 0.52],
        [0.45, 0.56],
        [0.33, 0.69],
        [0.03, 0.98],
        [0.36, 0.8],
        [0.62, 0.64],
        [0.9, 0.42],
        [0.6, 0.42],
        [0.56, 0.37],
        [0.72, 0.18],
        [0.97, 0.02],
      ],
    ] as Pt[][],
    brush: 0.2,
  },
  notEqual: {
    src: asset("/illustrations/not-equal.webp"),
    routes: [
      [
        [0, 0.3],
        [1, 0.3],
      ],
      [
        [0, 0.565],
        [1, 0.565],
      ],
      [
        [0.62, 0.01],
        [0.5, 0.42],
        [0.43, 0.7],
        [0.38, 0.99],
      ],
    ] as Pt[][],
    brush: 0.12,
  },
  loopArrow: {
    src: asset("/illustrations/loop-arrow.webp"),
    routes: [
      [
        [0.005, 0.365],
        [0.035, 0.355],
        [0.025, 0.37],
        [0.035, 0.49],
        [0.065, 0.67],
        [0.11, 0.84],
        [0.2, 0.95],
        [0.35, 0.99],
        [0.5, 0.93],
        [0.65, 0.78],
        [0.73, 0.6],
        [0.8, 0.43],
        [0.86, 0.25],
        [0.92, 0.135],
        [0.975, 0.095],
      ],
      [
        [0.975, 0.095],
        [0.995, 0.09],
        [0.965, 0.1],
        [0.9, 0.065],
        [0.855, 0.02],
        [0.885, 0.01],
        [0.96, 0.05],
        [0.975, 0.075],
      ],
      [
        [0.975, 0.075],
        [0.96, 0.2],
        [0.943, 0.37],
      ],
    ] as Pt[][],
    brush: 0.045,
  },
} as const;
