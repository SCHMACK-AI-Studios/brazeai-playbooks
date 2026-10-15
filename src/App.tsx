import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { ReaderView } from "@/engine/ReaderView";
import { deck, startDeck } from "@/engine/deckStore";
import { parseUrl, setDeck, writeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { playbooks } from "virtual:playbooks";
import { homeUrl } from "@/engine/url";

const initial = parseUrl(window.location);
// One playbook per tab. The production server checks access before serving this app.
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
  return (
    <MotionConfig reducedMotion="user">
      {playbook ? (
        <Deck />
      ) : import.meta.env.DEV ? (
        <DevelopmentLibrary />
      ) : (
        <a href={homeUrl()}>Open SCHMACK Resources</a>
      )}
    </MotionConfig>
  );
}

/** Editorial entry point only; Vite removes this from production builds. */
function DevelopmentLibrary() {
  return (
    <main className="mx-auto max-w-3xl p-8 text-white">
      <h1 className="mb-3 text-3xl font-semibold">Local playbooks</h1>
      <p className="mb-8 text-sm text-white/60">
        Development preview. All playbooks open directly without a form or access cookie.
      </p>
      <nav aria-label="Development playbooks" className="grid gap-4">
        {playbooks.map((item) => (
          <a key={item.id} href={`/${item.id}/1`} className="border border-white/20 p-5 hover:border-white/60">
            <span className="text-xl">{item.title}</span>
            <span className="mt-2 block text-sm text-white/60">
              {item.slides.length} slides{item.comingSoon ? " · Draft" : ""}
            </span>
          </a>
        ))}
      </nav>
    </main>
  );
}

function Deck() {
  const { slide } = useDeck();
  const slides = playbook?.slides ?? [];

  useEffect(() => {
    writeUrl(slide);
  }, [slide]);

  return <ReaderView slides={slides} />;
}
