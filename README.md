# SCHMACK playbooks

Three BrazeAI™ playbooks as self-guided browser decks. Production access is issued by the Resource lead-capture form on SCHMACK's SvelteKit website.

| Playbook | Reader address | Publication |
| --- | --- | --- |
| Decisioning Studio Go | `/decisioning-studio-go/1` | Resource entry added in the website repo |
| Agentic Standards | `/agentic-standards/1` | Draft; no website resource entry yet |
| Conversational Agents | `/conversational-agents/1` | Draft; no website resource entry yet |

## Access flow

1. The website validates the Resource form and atomically stores the submission and a hashed access code in Supabase.
2. The reader receives a random, single-use code at `/access/<id>?code=...`. Codes expire after 5 minutes.
3. The Node server atomically redeems the code, sets an HttpOnly, Secure, SameSite=Lax cookie scoped to that playbook, and redirects to a clean slide URL.
4. Every request for the playbook's HTML, JavaScript, CSS, fonts and images checks that grant. Missing, expired or invalid grants redirect to `https://schmack.com/?folder=resources&resource=<id>`.
5. Grants default to 7 days, configurable on the website between 1 and 30 days. Another playbook requires another completed form.

Root and unknown URLs return to SCHMACK Resources. There is no public playbook library. All responses are private/no-store and noindex; those headers supplement the access checks rather than replace them.

Each production build includes exactly one playbook under `dist/<id>/`. Unlocking one never downloads another playbook's copy. Access enforces form submission, not email ownership; no verification email is sent. Already delivered content cannot be made impossible to copy.

## Deploy as a Node web service

**Do not publish `dist` as a static site, expose Vite, or configure a static-file bypass in front of Node.** The Node server must handle every request, including assets and alternate deployment hostnames. `render.yaml` provides a Render Web Service blueprint.

```text
Build: pnpm install --frozen-lockfile && pnpm build
Start: pnpm start
Health check: /health
Domain: playbooks.schmack.com
```

Required server environment variables (see `.env.example`):

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: same project as SCHMACK-website, kept server-side.
- `PLAYBOOK_SESSION_SECRET`: a randomly generated secret of at least 32 bytes. Rotating it invalidates all browser grants.
- `PUBLIC_ORIGIN`: `https://playbooks.schmack.com`.
- `WEBSITE_ORIGIN`: `https://schmack.com`.
- `PORT`: provided by the host; defaults to 5195.

`VITE_RESOURCES_URL` is a build-time setting for the visible return links; it defaults to `https://schmack.com/?folder=resources`.

### Coordinated website setup

1. Apply `SCHMACK-website/supabase/migrations/20261015000000_playbook_access.sql` to the shared Supabase project.
2. Deploy this Node service with the environment above, attach the domain and enable HTTPS.
3. Set `PLAYBOOKS_ORIGIN=https://playbooks.schmack.com` and optionally `PLAYBOOK_ACCESS_DAYS=7` in the website environment.
4. Deploy the website changes. Protected entries in `src/lib/data/guides.ts` use `playbookId` instead of `redirectUrl`; the slug must match the playbook ID.
5. Verify a real Resource submission is stored, redirects to the reader, survives refresh, and cannot be reused from a browser without a grant. Confirm direct assets redirect without a grant too.

Keep access-code query strings and cookies out of host/proxy logs and analytics. The application does not log them. Do not cache protected responses at the CDN. Expired code rows can be periodically deleted (`delete from public.playbook_access_codes where expires_at < now() - interval '1 day'`); resource submission records are retained separately.

The access submission record is not an Attio integration. The website's existing tracking remains in place; the separate CRM migration issue covers Attio delivery.

## Local editing

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5195/` for the dev-only playbook selector, or go directly to `http://localhost:5195/decisioning-studio-go/1`. All 3 playbooks, including drafts, open without a form or cookie. Reader return links stay on this local selector in development. The Vite development server is deliberately ungated for editorial work and must stay local. Production/preview use the gated Node server.

The website's Vite dev server also bypasses grant issuance for protected playbooks: after form validation it redirects directly to this local reader, without saving a lead or using Supabase. `PLAYBOOKS_DEV_ORIGIN` on the website defaults to `http://localhost:5195` and accepts localhost destinations only. Production builds never use that bypass.

For local access-flow testing, use `NODE_ENV=development`, localhost origins and a disposable/local Supabase project with the migration applied. Load environment settings through your shell or `node --env-file=.env server/index.mjs`; `pnpm start` expects the hosting environment to supply them. HTTP cookies are allowed only when the configured public origin is localhost in development.

## Editing and checks

| What | Where |
| --- | --- |
| Slide content | `src/playbooks/<name>.tsx` |
| Shared slide layouts | `src/playbooks/kit.tsx` |
| Production build IDs, exports and image allowlists | `config/playbooks.json` |
| Development-only registry | `src/playbooks/index.ts` |
| Access checks and redemption | `server/` |
| Frame, colours and fonts | `src/components/Frame.tsx`, `src/styles/globals.css` |
| Internal editorial follow-ups | `EDITORIAL.md` |

```bash
pnpm typecheck
pnpm lint
pnpm build                     # isolated build for each playbook
pnpm test                      # HTTP gate and bundle-isolation tests; needs build
pnpm start                     # protected Node server; needs env and build
node scripts/access-browser-check.mjs # production Chrome checks, with a test-only redeemer
node scripts/reader-check.mjs   # reader navigation checks, needs pnpm dev
pnpm capture agentic-standards  # slide screenshots, needs pnpm dev
pnpm capture decisioning-studio-go --cover # clean 1920×1080 cover, without reader controls
```

To update the website's Resources thumbnail from this repo, with `pnpm dev` running:

```bash
pnpm capture decisioning-studio-go --cover ../SCHMACK-website/static/resources/decisioning-studio-go.png
```

The website selects its thumbnail via the `image` field in `src/lib/data/guides.ts`. Replace that PNG or change the field to use a different image.

Chrome checks use the default macOS Google Chrome path, or `CHROME_PATH`. The production-browser test uses local test servers and never issues real leads or production grants. Database regression checks live in the website repo at `supabase/tests/playbook_access.sql`.

## Still to finish editorially

Team details, the Campaign ruleset list, and draft delivery estimates are tracked in `EDITORIAL.md`. See `CLAUDE.md` for slide layout and copy rules.
