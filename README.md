# SCHMACK playbooks

Three BrazeAI™ playbooks as web slide decks, in the SCHMACK deck format first built for the Forge talk (`SCHMACK-AI-Studios/SCHFORGE`).

| # | Playbook | Address |
| --- | --- | --- |
| 01 | Decisioning Studio Go | `/decisioning-studio-go` |
| 02 | Agentic Standards | `/agentic-standards` |
| 03 | Conversational Agents | `/conversational-agents` |

The home page at `/` lists all three. Agentic Standards and Conversational Agents are currently marked coming soon.

## Run it

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5195`.

## Read it

| Address | What it is |
| --- | --- |
| `/decisioning-studio-go` | Start the playbook at slide 1 |
| `/decisioning-studio-go/4` | Slide 4. The address updates as you read, so a refresh stays put |

Each tab has its own reading position. All slides show their content without extra reveal clicks.

Use the visible previous/next arrows, ← / → keys, or swipe on a touchscreen. The controls stay visible and include progress, an All playbooks link and a fullscreen button. Clicking slide text does not advance. Other keys retain their normal browser behaviour.

## Edit it

| What | Where |
| --- | --- |
| A playbook's slides and copy | `src/playbooks/<name>.tsx` |
| The slide layouts every playbook uses | `src/playbooks/kit.tsx` |
| The list of playbooks, and their order on the home page | `src/playbooks/index.ts` |
| The home page | `src/Home.tsx` |
| The SCHMACK master: section tag, fox, footer, grounds | `src/components/Frame.tsx` |
| Colours and fonts | `src/styles/globals.css` |
| Images, logos, hand-drawn marks | `public/` |

To add a playbook, copy one of the files in `src/playbooks/`, change its `id`, `number` and slides, and add it to `src/playbooks/index.ts`.

`CLAUDE.md` has the working rules.

## Still to fill in

- Team names, roles and contact details on each playbook's last slide.
- The Campaign ruleset list for the SCHMACK Standard (the deck shows the Canvas one).
- Delivery steps and durations are a first draft, not agreed figures.

Estimates and reader-facing caveats belong on the slides. Internal editorial follow-ups live in `EDITORIAL.md`, outside the app bundle.

## Other commands

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm build        # typecheck, then a production build in dist/
pnpm preview      # serve the production build
pnpm capture agentic-standards   # screenshot every slide into captures/, with pnpm dev running
node scripts/reader-check.mjs   # browser navigation checks, with pnpm dev running
```

The capture and browser checks use Chrome. Set `CHROME_PATH` if it is installed outside the default macOS location.

Any host for the production build must send every unknown path to `index.html`.

## Where this came from

This project began as a copy of SCHFORGE. The audience polling app, its server and the Forge talk's own slides were removed, and the deck engine was changed to hold several decks. The git history before that point is SCHFORGE's.
