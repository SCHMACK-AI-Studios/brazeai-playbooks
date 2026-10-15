import { MotionConfig } from "motion/react";
import { useEffect, useState } from "react";
import { AudienceView } from "@/engine/AudienceView";
import { deck, startDeck } from "@/engine/deckStore";
import { PresenterView } from "@/engine/PresenterView";
import { parseUrl, setDeck, writeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { Home } from "@/Home";
import { playbooks } from "@/playbooks";

const initial = parseUrl(window.location);
// One playbook per window. Moving to another is a normal page load, from the home page.
const playbook = playbooks.find((p) => p.id === initial.deck) ?? null;

if (playbook) {
  setDeck(playbook.id);
  startDeck(
    playbook.slides.map((s) => s.steps),
    initial.slide,
    playbook.id,
  );
  document.title = `${playbook.title} · SCHMACK playbook`;
  // Lets scripts/capture.mjs drive the deck. It exposes navigation only,
  // which the keyboard already gives anyone at the machine.
  Object.assign(window, { __deck: deck });
}

export function App() {
  return <MotionConfig reducedMotion="user">{playbook ? <Deck /> : <Home />}</MotionConfig>;
}

function Deck() {
  const [presenter] = useState(initial.presenter);
  const { slide } = useDeck();
  const slides = playbook?.slides ?? [];

  useEffect(() => {
    writeUrl(slide, presenter);
  }, [slide, presenter]);

  return presenter ? <PresenterView slides={slides} /> : <AudienceView slides={slides} />;
}
