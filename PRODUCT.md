# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

The product has a web app (Next.js) and a native Expo app (iOS/Android) sharing the same Combat Minimalism design language via Tailwind/NativeWind. The design language does not adapt per OS — it is one system rendered equivalently across surfaces. The web app is the authoring surface; the native app mirrors it.

## Stack

- **Monorepo:** Turborepo 2.x (pnpm 10, workspaces)
- **Web app:** Next.js 16, React 19, Tailwind CSS v4
- **Native app:** Expo SDK 54, React Native 0.81, NativeWind v5
- **Backend:** tRPC v11, Drizzle ORM 0.44, Supabase (PostgreSQL)
- **Auth:** better-auth (Discord OAuth)
- **UI:** Radix UI primitives, shadcn/ui components, sonner toasts
- **Design tokens:** OKLCH semantic variables in `tooling/tailwind/theme.css`
- **Testing:** Vitest (API), Cypress (web E2E), Maestro (native E2E)
- **Tooling:** shared ESLint, Prettier, TypeScript configs

## Users

**Fighters** — amateur and competitive combat sports athletes seeking opponents in their weight class. They create profiles, swipe to find potential matches, schedule fights, chat before the bout, and track their record (wins/losses).

**Judges** — referees and arbiters who supervise fights. They are equally first-class users: they can browse available fights needing arbitration, take on judge duty, and oversee the fight from scheduling through result declaration.

Users may also register as "both" (fighter and judge).

Primary market: Brazil (pt-BR). All user-facing copy is Brazilian Portuguese.

## Product Purpose

MatchFight connects fighters with opponents and judges in their community. It replaces the informal, fragmented process of finding sparring partners or bouts through gyms, social media, or word of mouth with a structured swipe-based matching platform, complete with scheduling, chat, and judge arbitration.

## Positioning

The swipe mechanism for opponent discovery + built-in judge supervision distinguishes MatchFight from gym directories, social media groups, or event calendars. No other combat sports platform combines Tinder-style matching with a built-in referee layer.

## Operating Context

- **Discovery:** Fighters swipe through candidates (like/pass) filtered by weight class
- **Matching:** Mutual interest creates a match; a judge can take on the fight simultaneously
- **Pre-fight:** Per-fight chat for coordination (location, date, rules, weight class agreement)
- **Scheduling:** Fight moves through pending → scheduled → completed / cancelled
- **Arbitration:** Judge assigned to a fight oversees the process and records the winner
- **Records:** Each fighter has a public W/L record; judges have a history of fights overseen
- **Profile:** Nickname, bio, role (fighter/judge/both), weight class, location, record
- **Auth:** Discord OAuth (better-auth)

## Capabilities and Constraints

- **Roles:** fighter, judge, both (enforced at schema level)
- **Weight classes:** 8 UFC-style classes (flyweight through heavyweight)
- **Swipe:** like/pass per user pair; unique constraint prevents duplicate swipes
- **Fight lifecycle:** pending → scheduled → completed / cancelled; winner recorded
- **Chat:** time-ordered per fight; sender tracked
- **Location:** city-level with geocoding validation; lat/lng optional
- **Rate limiting:** enabled on API for production safety
- **Text limits:** content length constraints enforced server-side
- **Language:** pt-BR only for now — no i18n infrastructure
- **Auth:** Discord-only (single social provider)
- **Dark mode:** fully supported via theme CSS variables

## Brand Commitments

- **Name:** "MatchFight" — displayed as "Match" (charcoal) + "Fight" (blood red) in the logo
- **Design system:** Combat Minimalism — zero border-radius, zero shadows, 8px grid, Nunito Sans exclusively, two-tone palette (Deep Charcoal `#1A1A1A`, White `#FFFFFF`) with Blood Red `#DC2626` reserved for the single critical CTA per screen
- **Language:** Brazilian Portuguese (pt-BR) — all copy, labels, and error messages
- **Auth:** Discord sign-in (only social provider)
- **Repository:** hosted at `@acme` namespace (placeholder to be replaced with org name)

## Evidence on Hand

- Full landing page copy at `apps/nextjs/src/app/page.tsx` — establishes tone, positioning, and CTA flow
- Complete DB schema at `packages/db/src/schema.ts` — domain model (Profile, Swipe, Fight, ChatMessage, weight classes, roles)
- Design system at `tooling/tailwind/theme.css` — full OKLCH semantic token set, type scale, radii, spacing, dark mode
- Combat Minimalism design guide at `.opencode/skills/combat-minimalism/SKILL.md` — binding visual philosophy, component specs, palette rules
- UI surface map at `ui-surface-map.md` — all routes and components across both apps
- API router handlers at `packages/api/src/router/` — swipe, fight, chat, profile, auth business logic
- API+integration tests at `packages/api/src/test/` — swipe, fight, chat, profile test suites
- Maestro E2E flows at `apps/expo/.maestro/` — native smoke tests
- Previous design polish commits documenting the Combat Minimalism implementation history

## Product Principles

1. **Combat-first design** — every interface communicates the tension, focus, and respect of combat sports. Zero generic social-app patterns, zero "friendly platform" defaults.

2. **Equal seats for fighters and judges** — both roles are first-class; the platform enables fighters to find opponents and judges to find fights to arbitrate, with no role treated as secondary.

3. **Brazilian market context** — pt-BR language, cultural references, and community norms are product requirements, not a translation layer. The product speaks to the Brazilian combat sports community.

4. **Deliberate minimalism** — Combat Minimalism: every pixel has purpose. Zero decoration, zero shadows, zero radius. Typography, spacing, and the restrained palette are the only expressive tools. The interface feels sharp, intentional, and unapologetically austere.

5. **Trust through transparency** — pre-fight chat, visible fight status tracking, judge oversight, and public W/L records build trust in a high-stakes matching environment. The platform is a scaffold for real-world physical confrontation — clarity is a safety feature.