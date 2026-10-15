# SCHMACK playbooks

Three BrazeAI™ playbooks as web slide decks, in the SCHMACK deck format first built for the Forge talk (`SCHMACK-AI-Studios/SCHFORGE`).

| # | Playbook | Address |
| --- | --- | --- |
| 01 | Agentic Standards | `/agentic-standards` |
| 02 | Decisioning Studio Go | `/decisioning-studio-go` |
| 03 | Conversational Agents | `/conversational-agents` |

The home page at `/` lists all three.

## Run it

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5195`.

## Present it

| Address | What it is |
| --- | --- |
| `/agentic-standards/4` | Slide 4. The address updates as you present, so a refresh stays put |
| `/agentic-standards/4?presenter` | Presenter view on slide 4: speaker notes, next slide, timer |
| `/agentic-standards/presenter` | Presenter view, joining whatever slide the audience window shows |

The audience window and the presenter window stay in step with each other on the same machine.

Keys: → Space PageDown forward, ← PageUp back, Home / End, `12` Enter to jump, F fullscreen, P to open the other view, H back to all playbooks. The fox top right also goes back to all playbooks.

## Edit it

| What | Where |
| --- | --- |
| A playbook's slides, copy and speaker notes | `src/playbooks/<name>.tsx` |
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

Speaker notes carry the caveats behind each slide. A line starting `[NOTE]` is for SCHMACK only.

## Other commands

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm build        # typecheck, then a production build in dist/
pnpm preview      # serve the production build
pnpm capture agentic-standards   # screenshot every slide into captures/, with pnpm dev running
```

Any host for the production build must send every unknown path to `index.html`.

## Where this came from

This project began as a copy of SCHFORGE. The audience polling app, its server and the Forge talk's own slides were removed, and the deck engine was changed to hold several decks. The git history before that point is SCHFORGE's.
