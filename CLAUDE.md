# SCHMACK playbooks: working rules

BrazeAI™ playbooks as browser slide decks. Vite 6, React 19, TypeScript, Tailwind 4, Motion, Biome, pnpm. Dev server on port 5195. The README covers running, addresses and where to edit; this file covers what gets broken.

## 1. Copy is British English, in the SCHMACK tone

Sentence case, numerals for quantities, no exclamation marks, plain words. No consultancy phrasing. Slides are for clients; speaker notes are for the presenter, and a note starting `[NOTE]` is for SCHMACK only.

Do not present an estimate as a fact. Durations, prices and uplift figures that are not confirmed say so on the slide or in the notes.

## 2. Where things live

| What | Where |
|---|---|
| One playbook: slide order, copy, speaker notes | `src/playbooks/<name>.tsx` |
| Slide layouts shared by every playbook | `src/playbooks/kit.tsx` |
| The playbook list | `src/playbooks/index.ts` |
| Home page | `src/Home.tsx` |
| Deck primitives: master frame, display type, reveals, hand-drawn marks | `src/components/` |
| Engine: store, window sync, URL, canvas, audience and presenter views | `src/engine/` |

A playbook is data plus layouts. Change copy in the playbook file. Change how a kind of slide looks in `kit.tsx`, so all three decks stay one family.

## 3. The canvas

Every slide sits on a fixed 1920×1080 canvas, scaled to fit the window. Sizes are canvas pixels. Content sits between x 84 and 1836, below the section tag and above the footer rule at y 990.

Nothing reflows to fit, so check a slide after changing its copy:

- `Kinetic` lines (headings, openers, cover titles) never wrap. Break them by hand. About 28 characters fit a centred opener line, 40 a left-aligned point, 50 a slide heading.
- Tables, cards and step notes wrap, and size their type from the number of rows or columns. A long cell makes a tall row; too many push the table past the footer.
- `pnpm capture <playbook-id>` screenshots every slide for a look.

## 4. Design rules

- Colours come from the tokens in `src/styles/globals.css`. Red (`--red`) marks the one thing that matters on a slide.
- Albert Sans for headlines, JetBrains Mono for detail.
- Section tags are written with their brackets: `[ WHY IT MATTERS ]`.
- Boxes are hairline outlines on the dark ground, not filled panels.
- In `Kinetic`, `[text]` sets a phrase in red and `{text}` sets it bold.

## 5. Motion rules

- Navigation is horizontal. `Frame` moves a slide's content in from the side the deck is moving from; the ground and chrome stay put. `Kinetic` and `Reveal` follow the same direction.
- Everything honours `instant` (presenter previews, reduced motion): render the state, animate nothing.
- Playbook slides are complete on arrival (`steps: 0`). Give a slide steps only when a reveal earns the extra click.

## 6. Addresses and windows

`/<playbook-id>/<slide>`, with `?presenter` for the presenter view. One playbook per window: the id is read once at start-up, and moving to another playbook is a normal page load. `deckStore.ts` keeps the audience and presenter windows in step, with a separate channel per playbook.

Every public asset goes through `asset("/images/x.webp")`, so the app still works if it is hosted under a sub-path.

## 7. Commands

```bash
pnpm dev                      # http://localhost:5195
pnpm typecheck | lint | build
pnpm capture <playbook-id>    # needs pnpm dev running
```

`pnpm lint` reports 4 `useExhaustiveDependencies` findings in the presenter view and prompter. They came with the engine from SCHFORGE and are unchanged.
