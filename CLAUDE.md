# SCHMACK playbooks: working rules

BrazeAI™ playbooks as browser slide decks. Vite 6, React 19, TypeScript, Tailwind 4, Motion, Biome, pnpm. Dev server on port 5195. The README covers running, addresses and where to edit; this file covers what gets broken.

## 1. Copy is British English, in the SCHMACK tone

Sentence case, numerals for quantities, no exclamation marks, plain words. No consultancy phrasing. Slides are self-guided client reading; internal editorial context belongs in `EDITORIAL.md`, outside the app bundle.

Do not present an estimate as a fact. Durations, prices and uplift figures that are not confirmed say so on the slide.

## 2. Where things live

| What | Where |
|---|---|
| One playbook: slide order and copy | `src/playbooks/<name>.tsx` |
| Slide layouts shared by every playbook | `src/playbooks/kit.tsx` |
| Production build catalogue | `config/playbooks.json` |
| Local development catalogue | `src/playbooks/index.ts` |
| Access gate and protected file serving | `server/` |
| Deck primitives: master frame, display type, reveals, hand-drawn marks | `src/components/` |
| Engine: tab-local store, URL, canvas and reader view | `src/engine/` |

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
- Everything honours `instant` (reduced motion): render the state, animate nothing.
- Playbook slides are complete on arrival. There are no extra-click reveals.

## 6. Addresses and windows

`/<playbook-id>/<slide>` opens the reader only with a valid per-playbook grant. The website Resource form issues a one-time code through Supabase; the Node server redeems it and sets a signed cookie. Every production file must pass the server gate, including JS, images and fonts. Never publish `dist` directly or expose the editorial Vite server. Builds contain one playbook each. Return links lead to SCHMACK Resources, not a local library.

One playbook per tab: the id is read once at start-up. Reading position is independent per tab and preserved in the URL on refresh. Only left/right arrows have custom keybindings; visible controls remain available.

Every asset goes through `asset("/images/x.webp")`, so it stays under the playbook's protected base path. New assets must be included by `scripts/build.mjs` or the catalogue image allowlist.

## 7. Commands

```bash
pnpm dev                      # http://localhost:5195
pnpm typecheck | lint | build
pnpm capture <playbook-id>    # needs pnpm dev running
pnpm test                     # needs pnpm build; verifies the access gate
pnpm start                    # protected production server, needs env
```
