import { Frame } from "@/components/Frame";
import { Kinetic } from "@/components/Kinetic";
import { Reveal } from "@/components/Reveal";
import { display, mono } from "@/components/TextBox";
import { SlideCanvas } from "@/engine/SlideCanvas";
import { deckUrl } from "@/engine/url";
import { playbooks } from "@/playbooks";
import { LEFT, WIDTH } from "@/playbooks/kit";

/**
 * The home page: every playbook as a numbered card, on the same master and
 * canvas as the slides, so it scales to any window the way a slide does.
 */
export function Home() {
  return (
    <main className="fixed inset-0">
      <SlideCanvas>
        <Frame label="[ SCHMACK PLAYBOOKS ]">
          <div className="absolute" style={{ left: LEFT, top: 128 }}>
            <Kinetic
              lines={["BrazeAI™ playbooks.", "[{Raise the bar}]."]}
              className="headline"
              style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.1 }}
            />
          </div>
          <div className="absolute flex" style={{ left: LEFT, top: 400, width: WIDTH, height: 540, gap: 48 }}>
            {playbooks.map((p, i) => {
              const soon = p.comingSoon === true;
              const accent = soon ? "var(--grey-3)" : "var(--red)";
              const content = (
                <>
                  <span style={mono(83, { color: accent, fontWeight: 700, lineHeight: 1 })}>{p.number}</span>
                  <span className="mt-auto" style={display(50, { fontWeight: 700, lineHeight: 1.1 })}>
                    {p.title}
                  </span>
                  <span
                    style={mono(27, {
                      lineHeight: 1.3,
                      color: soon ? "var(--grey-3)" : "var(--grey-1)",
                      marginTop: 20,
                    })}
                  >
                    {p.summary}
                  </span>
                  <span style={mono(25, { lineHeight: 1.3, fontWeight: 700, marginTop: 18 })}>
                    Built on the SCHMACK Standard.
                  </span>
                  <span
                    className="flex items-center justify-between"
                    style={mono(22, { color: accent, marginTop: 30 })}
                  >
                    {soon ? (
                      <span>[ COMING SOON ]</span>
                    ) : (
                      <>
                        <span>[ {p.slides.length} SLIDES ]</span>
                        <span
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-2"
                          style={{ fontSize: 34 }}
                        >
                          →
                        </span>
                      </>
                    )}
                  </span>
                </>
              );
              const cardStyle = {
                background: "var(--ground-3)",
                border: `3px solid ${soon ? "var(--grey-6)" : "var(--grey-5)"}`,
                padding: "40px 36px 36px",
                color: soon ? "var(--grey-3)" : "var(--paper)",
              };
              return (
                <Reveal key={p.id} delay={0.3 + i * 0.15} className="min-w-0 flex-1">
                  {soon ? (
                    <div aria-disabled="true" className="flex h-full cursor-default flex-col" style={cardStyle}>
                      {content}
                    </div>
                  ) : (
                    <a
                      href={deckUrl(p.id)}
                      className="group flex h-full flex-col no-underline transition-colors"
                      style={cardStyle}
                    >
                      {content}
                    </a>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Frame>
      </SlideCanvas>
    </main>
  );
}
