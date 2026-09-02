---
target: apps/nextjs/src/app/page.tsx
total_score: 21
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
target_identity: "file:/mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/page.tsx"
target_fingerprint: "sha256:bab0eade7c689521bf56c3ef0691c96f31d032d145665e0e2f41cfb0bffe6b62"
target_path: /mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/page.tsx
timestamp: 2026-09-01T08-00-36Z
slug: apps-nextjs-src-app-page-tsx
---
# Critique: MatchFight Landing Page

**Target:** `apps/nextjs/src/app/page.tsx`
**Slug:** `apps-nextjs-src-app-page-tsx`

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading feedback on sign-in form action; user clicks and waits for Discord redirect with no indication |
| 2 | Match System / Real World | 4 | Strong pt-BR copy, combat sports terminology, natural three-step flow |
| 3 | User Control and Freedom | 3 | Clear nav and back paths; no traps, but sign-in CTA is the only interactive path — no way to browse without committing |
| 4 | Consistency and Standards | 3 | Token system is consistent, but SignInButton bypasses Button variant system with explicit className overrides |
| 5 | Error Prevention | 3 | Minimal interaction surface; no error states visible; sign-in is a server redirect with no inline validation |
| 6 | Recognition Rather Than Recall | 4 | Everything is visible and self-explanatory; no hidden menus, no memorization needed |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode landing page; efficiency accelerators don't apply to first-time visitors |
| 8 | Aesthetic and Minimalist Design | 2 | Hero hierarchy is crowded (tagline + headline + subheading); pt-BR/English language mix undermines cohesion |
| 9 | Error Recovery | n/a | No error states on this surface |
| 10 | Help and Documentation | n/a | Persuade-mode landing page |
| **Total** | | **21/28** | **Good (75%)** |

---

## Design Specificity Verdict

**LLM assessment:** The landing page clearly belongs to a combat sports product — the hero headline "Encontre seu próximo oponente", the three-step flow (Swipe → Match → Fight), the Blood Red accent, the sharp 0px corners, and the uppercase label treatments all signal the domain. A generic SaaS product would not use this language, this palette, or this type of vertical rhythm. However, the language inconsistency (pt-BR hero, English nav labels and feature headings) and a somewhat conventional hero layout (badge → headline → subheading → two buttons) keep it from being as distinctive as the design system promises. The Combat Minimalism system is a strong differentiator; the landing page composition does not yet fully exploit it.

**Deterministic scan (Assessment B):** detect.mjs returned `[]` (no findings). Manual rule-check found 1 hard violation: **The One Accent Rule** — Blood Red appears in the logo ("Fight" span, `text-primary`) and in the primary CTA button (`bg-primary`) on the same screen when the visitor is logged out. The remaining 8 rules pass (No-Hue, Uppercase Metadata, Weight Discipline, Flat-By-Default, spacing multiples of 8, 0px corners, semantic tokens, dark mode).

**Visual overlays:** Skipped — Chrome binary not available on this machine.

---

## Overall Impression

The landing page correctly implements the Combat Minimalism token system and follows most DESIGN.md rules. The sharp edges, two-tone palette, and uppercase labels give it a distinct personality. The biggest opportunities are: (1) resolving the language inconsistency between pt-BR hero and English labels/features, (2) tightening the hero hierarchy so the headline is the undeniable focal point, and (3) reconciling the Blood Red logo with the One Accent Rule so the CTA can be the single red element when it matters most.

---

## What's Working

1. **Typography execution is disciplined.** The weight hierarchy (display-lg on headline, label-bold on metadata, body-lg on subheading) is used correctly throughout. The uppercase label-bold with +0.05em tracking on the "Onde lutadores se encontram" tagline and the "01 / 02 / 03" feature index reads exactly like fight-card typography.

2. **The three-step feature section is well-structured.** Dividing the value proposition into Swipe → Match → Fight with numbered index labels and concise descriptions gives the visitor a clear mental model in under 5 seconds. The bold border-top separator and `gap-10` give each step breathing room.

3. **The CTA punchline is strong.** A seção "A luta começa antes do octógono" com o subtítulo "Crie seu perfil, mostre seu cartel e deixe o próximo desafio vir até você" é o melhor copy da página — captures the emotional hook and the product's value in one sentence.

---

## Priority Issues

### [P1] Language inconsistency: pt-BR hero, English features
- **What:** The hero section is in pt-BR ("Encontre seu próximo oponente", "Deslize, combine e agende lutas"), but the three feature headings are English ("Swipe", "Match", "Fight"), the nav links are mixed ("Swipe" English, "Lutas" Portuguese, "Perfil" Portuguese), and the "Ir para o app" button is Portuguese. The swipe candidates page uses "Find your opponent" (English).
- **Why it matters:** A Brazilian Portuguese user sees English labels for the core product concept. This erodes trust and signals the product was not fully translated. PRODUCT.md records pt-BR as a durable constraint.
- **Fix:** Translate all feature headings to Portuguese ("Deslizar" / "Combinar" / "Lutar" or "Swipe" / "Match" / "Luta" with consistent pt-BR). Review every user-facing string for pt-BR consistency.
- **Suggested command:** `/impeccable clarify landing-page`

### [P1] One Accent Rule violation: logo + CTA both red
- **What:** The logo renders "Fight" in `text-primary` (Blood Red, line 12). When the user is not signed in, the hero CTA button uses `bg-primary text-primary-foreground border-primary` (line 153). Two red elements on the same screen.
- **Why it matters:** The rule exists to preserve Blood Red's authority. When the logo is always red, the CTA cannot be red without violating the rule, and the CTA is the element that *should* be red — it's the critical action. The logo red dilutes the CTA's priority.
- **Fix:** Either (a) make the logo monochrome (both "Match" and "Fight" in `text-foreground`), reserving red for the CTA, or (b) accept the logo red as a brand exception and update the rule in DESIGN.md to exempt the logo from the count. The skill says "1 elemento vermelho por tela no máximo (o CTA principal)" — the logo red conflicts with this.
- **Suggested command:** `/impeccable distill landing-page` (to resolve the tension) or update DESIGN.md.

### [P2] Hero hierarchy: tagline competes with headline
- **What:** The hero section has three copy layers: (1) the tagline badge "Onde lutadores se encontram" with `border-2 bg-background text-label-bold uppercase`, (2) the headline "Encontre seu próximo oponente" in `text-display-lg`, (3) the subheading paragraph in `text-body-lg text-muted-foreground`. The tagline badge has a 2px border and background, giving it similar visual weight to the CTA buttons below it.
- **Why it matters:** The tagline's `border-2` treatment draws focus away from the headline, which is the most important message. The visitor's eye competes between the badge, the headline, and the two buttons below.
- **Fix:** Strip the tagline badge of its border-2/bg-background treatment. Use `text-label-bold text-muted-foreground` only — let it recede below the headline. Or remove the tagline entirely and let the headline and subheading carry the message.
- **Suggested command:** `/impeccable distill landing-page`

### [P2] SignInButton bypasses Button variant system
- **What:** The `SignInButton` component (line 28-51) renders a `<Button>` with `variant="outline"` (line 84) but then overrides every single class with explicit `className` (line 85: `bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6`). This effectively duplicates the outline variant's CSS inline, creating a maintenance surface that diverges from the canonical variant definition.
- **Why it matters:** If the Button outline variant is ever updated, `SignInButton` will not inherit the change. The explicit classes also make the code harder to audit for design-system compliance.
- **Fix:** Remove the inline className override and rely on the Button component's variant API. If the `variant="outline"` produce the wrong colors, fix the variant definition in `packages/ui/src/button.tsx` instead of patching it at the call site.
- **Suggested command:** `/impeccable harden signin-button`

### [P3] CTA section: "Editar meu perfil" for non-authed users
- **What:** When the user is not signed in, the CTA section shows an outline button "Editar meu perfil" (line 214-215) that triggers the Discord sign-in flow. Clicking "Edit my profile" before having a profile is confusing — the user hasn't created one yet.
- **Why it matters:** Low-severity on its own, but it creates a small cognitive gap: the user is asked to edit something that doesn't exist yet. The hero CTA ("Ver perfil") has the same problem.
- **Fix:** Change the CTA button text to "Criar perfil" or "Começar" when the user is not authenticated.
- **Suggested command:** `/impeccable clarify landing-page`

---

## Cognitive Load Assessment

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Single focus | ❌ | Hero has tagline + headline + subheading + 2 buttons competing for attention |
| Chunking | ✅ | Feature section is 3 items — ideal |
| Grouping | ✅ | Related items are visually grouped (feature cards, button pairs) |
| Visual hierarchy | ❌ | Tagline border-2 competes with headline; headline and subheading share similar visual weight |
| One thing at a time | ✅ | Sequential flow is natural for a landing page |
| Minimal choices | ✅ | 2 buttons in hero, no more than 3 visible options anywhere |
| Working memory | ✅ | No information to carry between sections |
| Progressive disclosure | ✅ | Content is linear and progressively revealing |

**Failures:** 2/8 — Low cognitive load. Addressable.

---

## Persona Red Flags

### Jordan (First-Timer)
- **Mixed language confusion:** Sees "Swipe" as a feature heading, reads Portuguese in the hero, then English nav labels. Can't tell if this app is in Portuguese or English.
- **"Ver perfil" leads to dead end:** Clicking "Ver perfil" without being logged in redirects to Discord auth. Jordan has no context for why they're being sent to a gaming platform to authenticate. No explanation of what Discord is or why it's needed.
- **No visible help or onboarding hint:** The landing page explains what the product does, but doesn't tell Jordan what to do first after signing in.

### Riley (Stress Tester)
- **No loading state on sign-in:** The SignInButton uses a server form action with no pending/disabled state. Riley clicks multiple times, each click triggers a form submission. No visual feedback that the action was received.
- **Feature section has no interaction states:** The Feature cards have no hover, no click, no link. They're static text. Riley tries to click "01 Swipe" expecting navigation and nothing happens.
- **Footer year is dynamic but no other content changes:** The `© {new Date().getFullYear()}` is the only dynamic element. Riley notices the nav links are not full-width clickable (only the text is linked, not the entire header area).

### Casey (Mobile User)
- **Hero is tall on mobile:** `pt-28 pb-24` (224px + 192px padding) + headline + subheading + 2 buttons = approximately 600-700px before any content. Casey scrolls through a lot of vertical space to reach the feature section.
- **CTA buttons are good touch targets:** h-12 (48px) is above the 44px minimum — good.
- **Feature cards stack vertically:** On mobile, three feature cards with 01/02/03 index, title, and description require significant scrolling before reaching the bottom CTA.

---

## Minor Observations

- The footer link list is empty — only the logo and copyright. No social links, no Terms/Privacy, no "Sobre" link. For a Brazilian combat sports product, linking to social media (Instagram, YouTube) would be expected.
- The "Como funciona" section heading is implicit (the feature section has no title like "How it works" — it's just the three cards). This is fine for scannability, but a subtle section identifier would help.
- The `max-w-4xl` on the headline (line 136) with `text-balance` is a nice touch for text wrapping.
- The hero `<span>` badge uses `border-border` which is Deep Charcoal — same as the buttons. The badge has the same border color as the action buttons, which makes it harder to distinguish from clickable elements.

---

## Questions to Consider

1. Should the logo use Blood Red for "Fight" if it means the CTA can never be the single red element on the screen? Is the logo red a brand invariant, or could the entire logo be charcoal with red reserved for functional actions?

2. The landing page follows a conventional hero → features → CTA structure. The Combat Minimalism system is strong enough to support a more distinctive composition. What would a landing page look like that *starts* with the tension of combat rather than a badge, a headline, and two buttons?

3. The English/pt-BR mix suggests the product was built in English first and partially translated. Is the commitment to pt-BR (recorded in PRODUCT.md) strong enough to justify a full translation pass, or is bilingual support the actual target?

---

## Trend for `apps-nextjs-src-app-page-tsx` (last 5 runs): 21/28 (First run for this target, no trend yet)
> Wrote `.impeccable/critique/apps-nextjs-src-app-page-tsx-1.md`.
