import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { ReaderView } from "@/engine/ReaderView";
import { deck, startDeck } from "@/engine/deckStore";
import { parseUrl, setDeck, writeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { Home } from "@/Home";
import { playbooks } from "@/playbooks";

const initial = parseUrl(window.location);
// One playbook per window. Moving to another is a normal page load, from the home page.
const playbook = playbooks.find((p) => p.id === initial.deck) ?? null;

if (playbook) {
  setDeck(playbook.id);
  startDeck(playbook.slides.length, initial.slide);
  document.title = `${playbook.title} · SCHMACK playbook`;
  // Lets scripts/capture.mjs drive the deck. It exposes navigation only,
  // which the keyboard already gives anyone at the machine.
  Object.assign(window, { __deck: deck });
}

export function App() {
  return <MotionConfig reducedMotion="user">{playbook ? <Deck /> : <Home />}</MotionConfig>;
}

function Deck() {
  const { slide } = useDeck();
  const slides = playbook?.slides ?? [];

  useEffect(() => {
    writeUrl(slide);
  }, [slide]);

  return <ReaderView slides={slides} />;
}
