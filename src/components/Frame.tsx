import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useSlide } from "@/engine/SlideContext";
import type { SectionLabel } from "@/engine/types";
import { homeUrl } from "@/engine/url";
import { asset } from "@/lib/asset";

/** How far a slide's content travels on the way in or out, in canvas pixels. */
const TRAVEL = 180;

type Ground = "master" | "cat" | "catProfile" | "catLookingUp";

const GROUNDS: Record<Ground, CSSProperties> = {
  master: { background: "var(--ground)" },
  cat: { background: `var(--ground) url(${asset("/images/bg-cat.webp")}) center / cover no-repeat` },
  catProfile: { background: `var(--ground) url(${asset("/images/bg-cat-profile.webp")}) center / cover no-repeat` },
  catLookingUp: {
    background: `var(--ground) url(${asset("/images/bg-cat-looking-up.webp")}) center / cover no-repeat`,
  },
};

/**
 * The SCHMACK master slide: section tag top left, the fox top right, and the
 * confidentiality line, rule, and wordmark along the bottom. Positions are
 * the master's own, converted from EMU to canvas pixels.
 *
 * `chrome={false}` drops all of it, for a full-bleed slide.
 */
export function Frame({
  label,
  ground = "master",
  chrome = true,
  children,
}: {
  label?: SectionLabel;
  ground?: Ground;
  chrome?: boolean;
  children: ReactNode;
}) {
  const { direction, instant } = useSlide();
  return (
    <section className="absolute inset-0 overflow-hidden" style={GROUNDS[ground]}>
      {/* The content layer travels with the deck; the ground and chrome stay put. */}
      <motion.div
        className="absolute inset-0"
        initial={instant ? false : { x: direction * TRAVEL }}
        animate={{ x: 0 }}
        exit={instant ? undefined : { x: -direction * TRAVEL }}
        transition={instant ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
      {chrome && (
        <>
          {label && (
            <p
              className="font-mono absolute m-0 whitespace-pre"
              style={{ left: 84, top: 44, fontSize: 21, color: "var(--red)", letterSpacing: "0.02em" }}
            >
              {label}
            </p>
          )}
          {/* The fox goes home, to the list of playbooks. */}
          <a
            href={homeUrl()}
            aria-label="All playbooks"
            title="All playbooks"
            className="absolute"
            style={{ left: 1801, top: 26, width: 53, height: 50 }}
          >
            <img src={asset("/logos/fox.webp")} alt="" className="h-full w-full" />
          </a>
          <div
            className="absolute"
            style={{ left: 40, top: 990, width: 1805, height: 2, background: "var(--paper-2)" }}
          />
          <p
            className="font-mono absolute m-0"
            style={{ left: 39, top: 1003, width: 1330, fontSize: 13, lineHeight: 1.25, color: "var(--paper-2)" }}
          >
            This document contains confidential information belonging to SCH AB. It may not be disclosed to any third
            party or used for any purpose other than its intended use without prior written permission from an
            authorised signatory of SCH AB.
          </p>
          <img
            src={asset("/logos/schmack-wordmark.webp")}
            alt="SCHMACK"
            className="absolute"
            style={{ left: 1619, top: 1008, width: 236, height: 50 }}
          />
        </>
      )}
    </section>
  );
}
