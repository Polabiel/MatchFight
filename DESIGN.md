---
name: MatchFight
description: Combate sports matchmaking — sharp, deliberate, zero decoration.
colors:
  background: "oklch(1 0 0)"
  charcoal: "oklch(0.11 0 0)"
  blood-red: "oklch(0.577 0.245 27.3)"
  tonal-muted: "oklch(0.96 0 0)"
  muted-text: "oklch(0.45 0 0)"
  dark-background: "oklch(0.06 0 0)"
  dark-surface: "oklch(0.11 0 0)"
  dark-border: "oklch(0.2 0 0)"
  dark-muted: "oklch(0.15 0 0)"
  dark-muted-text: "oklch(0.65 0 0)"
typography:
  display:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "clamp(36px, 6vw, 48px)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "clamp(28px, 4vw, 32px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "clamp(22px, 3vw, 24px)"
    fontWeight: 700
    lineHeight: 1.2
  body-lg:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label-bold:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  label-sm:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  none: "0px"
  sm: "0px"
  md: "0px"
  lg: "0px"
  xl: "0px"
  full: "0px"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.background}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.background}"
    textColor: "{colors.charcoal}"
  button-action:
    backgroundColor: "{colors.blood-red}"
    textColor: "{colors.background}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-action-hover:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.background}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 16px"
  input-focus:
    backgroundColor: "{colors.tonal-muted}"
  chip:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.background}"
    rounded: "{rounded.none}"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
    padding: "24px"
---

# Design System: MatchFight

## Overview

**Creative North Star: "The Weigh-In"**

MatchFight is a platform where fighters find opponents and judges arbitrate bouts. Its interface is the weigh-in: the moment of truth before combat, where everything is stripped to what matters and measured with absolute precision. There is no decoration, no friendliness, no "platform warmth" — only the facts that decide a fight: who you are, your weight class, your record, and what comes next.

The system is a fusion of Japanese restraint (*ma* — the power of deliberate empty space) and athletic performance language (force, clarity, intent). Every element is deliberate: sharp 0px corners, flat surfaces with no shadows, a two-tone palette of Deep Charcoal and Base White with Blood Red reserved for the single critical action on a screen. Depth is never faked with elevation — it is drawn with borders and tonal layers, the way a referee's call is unambiguous.

This is not "clean" minimalism and it is not a dashboard. It is **tense control**: high-stakes clarity where the interface communicates focus and respect, never generic friendliness. Typography carries the system's voice — heavy condensed headlines and uppercase micro-labels with letter-spacing read like fight-card typography, disciplined and authoritative.

**Key Characteristics:**
- Zero border-radius anywhere (0px), including buttons, inputs, cards, avatars, and modals
- Zero box-shadows and zero backdrop-filters; depth via 1-2px charcoal borders and muted tonal layers
- Blood Red (one accent) appears at most once per screen, only on the critical CTA or live/winner state
- Nunito Sans exclusively, with a precise weight and letter-spacing hierarchy (900/800/700/400/600)
- All spacing is a multiple of 8px; sections breathe at 80-120px vertical rhythm
- Full dark mode with equal quality — semantic tokens invert, Blood Red stays identical
- Portuguese (pt-BR) UI copy throughout

## Colors

A restrained, high-contrast palette: white paper, deep charcoal ink, and a single blood-red accent held in reserve. No gradients, no opacity washes, no colored shadows — flat and deliberate.

### Primary
- **Blood Red** (oklch(0.577 0.245 27.3) / #DC2626): the critical action color. Used only for the single most important CTA on a screen (Dar Match, Confirmar luta, Confirmar vitória), active/live states (Winner, Live), and performance metrics (W/L record). Never on decorative hovers, secondary badges, links, or subtle backgrounds. Identical in light and dark mode — it never adapts.

### Neutral
- **Base White** (oklch(1 0 0) / #FFFFFF): primary surface, "paper" backgrounds. In light mode: page background, cards, inputs.
- **Deep Charcoal** (oklch(0.11 0 0) / #1A1A1A): primary ink and structural color. Main text, all borders, the default button fill, heavy elements. In dark mode it becomes the surface and text flips to white.
- **Tonal Muted** (oklch(0.96 0 0) / #F4F4F4): secondary surface layer in light mode — card hover, input focus background, ghost button hover, initials placeholder backgrounds.
- **Muted Text** (oklch(0.45 0 0) / ~#737373): secondary text, timestamps, descriptions, placeholder text.
- **Dark Background** (oklch(0.06 0 0) / #0D0D0D): dark-mode page background — not pure black.
- **Dark Surface** (oklch(0.11 0 0) / #1A1A1A): dark-mode cards, modals, surfaces.
- **Dark Border** (oklch(0.2 0 0) / #333333): dark-mode dividers and borders.
- **Dark Muted** (oklch(0.15 0 0) / #262626): dark-mode tonal hover layer.
- **Dark Muted Text** (oklch(0.65 0 0) / #A3A3A3): dark-mode secondary text.

### Named Rules
**The One Accent Rule.** Blood Red appears at most once per screen on any functional element (buttons, states, chips). The logo "Fight" span is exempt — it is a brand element, not a functional accent. When a screen contains the logo, Blood Red may still be used on the single critical CTA. Multiple reds on non-logo functional elements still cancel each other's authority.

**The No-Hue Rule.** The only chromatic color in the system is Blood Red. Everything else is neutral. Introducing a second hue breaks the discipline of the weigh-in.

## Typography

**Display Font:** Nunito Sans (ui-sans-serif, system-ui fallback)
**Body Font:** Nunito Sans (same family throughout)
**Mono Font:** JetBrains Mono (available via `--font-mono`, reserved for data/code contexts)

**Character:** A single family executed with controlled weight and letter-spacing contrasts — the system's voice is discipline through restraint. Headlines are heavy (900/800) and slightly tightened; labels are uppercase with +0.05em tracking, reading like fight-card typography; body copy is open and readable at 16-18px. The hierarchy is strict: one display, three mid weights, two label sizes — no competition.

### Hierarchy
- **Display** (900, clamp(36px, 6vw, 48px), 1.05, -0.02em): hero headlines and the "VS" moment on fight detail. Reserved for the largest, most emotionally loaded text on a surface.
- **Headline-lg** (800, clamp(28px, 4vw, 32px), 1.1, -0.01em): section titles — Swipe, Lutas, Perfil.
- **Headline-md** (700, clamp(22px, 3vw, 24px), 1.2): fighter names, card titles, section headers.
- **Body-lg** (400, 18px, 1.6): landing hero body copy, profile bios. Max line length ~65ch.
- **Body-md** (400, 16px, 1.5): default UI text, chat messages, table values.
- **Label-bold** (700, 14px, 1.4, +0.05em, uppercase): form labels, metadata (LOCAL, DATA/HORÁRIO, JUIZ), button text.
- **Label-sm** (600, 12px, 1.4, +0.05em, uppercase): timestamps, status chips, counters, tags.

### Named Rules
**The Uppercase Metadata Rule.** All metadata labels and button text are uppercase with +0.05em tracking. This is the system's "referee call" voice — authority through typography, not decoration.

**The Weight Discipline Rule.** Weights are not interchangeable: 900 only for display, 800 for headline-lg, 700 for headline-md, 700/600 for labels, 400 for body. Mixing a 700 into body copy breaks the measured hierarchy.

## Layout

**Base unit:** 8px. Every spacing value — padding, gaps, heights, margins — is a multiple of 8 (p-4 = 16px, p-6 = 24px, h-12 = 48px, gap-8 = 32px).

**Desktop grid:** 12 columns, 24px gutters, 40px page margins. **Mobile grid:** 4 columns, 16px margins.

**Container:** max-width 1200px on desktop (via `--container-max`), full-width minus 32px on mobile. The landing page uses `max-w-6xl` (1152px) content columns.

**Vertical rhythm:** major sections separated by 80-120px (py-20 = 80px, py-24 = 96px, pt-28/pb-24 = 112px/96px on the hero). Surfaces breathe; nothing feels cramped.

**Density:** Operate surfaces (fight detail, profile, chat) center content in `max-w-2xl` columns with generous `p-6` spacing. Form groups stack vertically with `gap-6`/`gap-7` (48/56px) field rhythm.

**Breakpoints:** sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px.

## Elevation & Depth

**No shadows. Ever.** `box-shadow: none` and `backdrop-filter: none` are absolute. Depth is conveyed through structure, not elevation:

1. **Bold borders** — 1px on cards and dividers, 2px on buttons, inputs, and primary containers, always in Deep Charcoal (dark: Dark Border).
2. **Tonal layers** — `--muted` (#F4F4F4 / #262626 dark) for secondary surfaces: card hover, input focus, ghost button hover.
3. **Color inversion** — pressed/active states invert background and text (charcoal↔white) rather than "lifting." The default button hover goes from charcoal fill to white fill with charcoal text; the action (red) button hover goes to charcoal.

There is no shadow vocabulary because the system rejects shadow as a tool. Focus is drawn with a 2px `--ring` (charcoal light, lighter gray in dark mode) via `focus-visible:ring-2`.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest and flat under interaction. Depth is drawn with borders and tonal shifts only — elevation (shadow, translate, scale) is banned.

## Shapes

**Sharp everywhere.** Border-radius is 0px for every component: buttons, inputs, selects, textareas, cards, avatars (square, 1:1 or 4:5), modals/sheets, chips/badges, tables/lists, and the "VS" display mark. There are no rounded corners, no pills, no circles. Avatars are rectangles; the match-modal and candidate cards are hard-edged frames. Borders are structural: 1px for dividers/cards, 2px for interactive elements (buttons, inputs, primary cards).

## Components

### Buttons
- **Shape:** sharp corners (0px), 2px border, uppercase label-bold text (14px, +0.05em).
- **Primary:** charcoal fill, white text, charcoal border (h-12 = 48px, px-6 = 24px). Hover: white fill, charcoal text. Default action.
- **Action (Blood Red):** red fill, white text, red border. The only red on the screen. Hover: charcoal fill/border. Reserved for the critical CTA — Dar Match, Confirmar luta, Confirmar vitória.
- **Outline:** white fill, charcoal text, 2px charcoal border. Hover: charcoal fill, white text. Used for secondary/cancel/ghost-equivalent actions.
- **Destructive:** red fill/border (same Blood Red token), hover to charcoal. For cancellation/destructive confirmations.
- **Secondary:** muted fill, charcoal text, 1px charcoal border; hover inverts to charcoal.
- **Ghost:** transparent, charcoal text, muted hover fill, no border.
- **Link:** charcoal text, transparent, underline-on-hover — reserved for inline navigation.
- **Focus:** 2px ring, `focus-visible:ring-2`. Disabled: `opacity-50`, no pointer events.

### Inputs / Fields
- **Style:** 2px charcoal border, transparent background, sharp corners, 48px height (h-12), 16px horizontal padding, body-md text, muted placeholder.
- **Focus:** muted (#F4F4F4 / #262626) background + charcoal border.
- **Error:** destructive border + `aria-invalid` ring treatment; field error text in destructive color, body-md.
- **Disabled:** opacity-50, no pointer events.
- **Field system:** labels uppercase label-bold with `gap-6` field rhythm; descriptions in muted body-md; legends in headline-md; inline links underline and turn primary on hover. Textarea/select share the same 2px sharp treatment.

### Chips / Tags
- **Style:** charcoal fill, white text, 0px corners, label-sm (12px, 600, +0.05em uppercase), px-3 py-1 (12/4px). Used for weight class, W/L record (e.g. "5-2"), and status (PENDING, CONFIRMADA).
- **Winner / Live state:** Blood Red fill, white text — the only red element allowed on the screen besides the CTA.

### Cards / Containers
- **Corner Style:** 0px.
- **Background:** `--card` (white light / Deep Charcoal dark).
- **Shadow Strategy:** none (see Elevation).
- **Border:** 2px charcoal for primary cards (candidate card, match modal), 1px for secondary/detail cards; section rows separated by `border-t`/`border-b` 1px dividers.
- **Internal Padding:** p-6 (24px) standard; p-4 (16px) for dense rows.

### Avatars
- **Shape:** rectangle, 0px corners. Small 40px (h-10 w-10, fight detail), large 80px (w-20 h-20, profile/swipe).
- **With photo:** image with 1px charcoal border, `object-cover`.
- **Without photo:** charcoal fill with white initial(s), or muted fill with uppercase "LUTAR" placeholder for empty candidates.

### Navigation
- **Style:** sticky top bar, 64px tall (h-16), 1px charcoal bottom border (`border-b`), white/charcoal background, 24px horizontal padding. Logo is "Match" in charcoal + "Fight" in Blood Red, headline-md.
- **Links:** body-md muted-text, `hover:text-foreground`. Primary nav includes a compact button (Ir para o app / Entrar).
- **Mobile:** links and actions condense to the essential CTA; spacing remains on the 8px grid.

### Signature: The Fight Detail
The fight detail is the system's signature composition: a display-scale "VS" centered between two fighter columns, each with a rectangular avatar and headline-md name. Status is a charcoal chip; details are uppercase metadata rows (LOCAL / DATA-HORÁRIO / JUIZ) with body-md values on 1px dividers. Action state is contextual: proposal, confirm, judge acceptance, winner declaration — with the single red element reserved for the confirm/victory decision.

## Do's and Don'ts

### Do:
- **Do** use Blood Red once per screen, on the single critical action or live/winner state.
- **Do** keep every corner at 0px — buttons, inputs, cards, avatars, modals, chips.
- **Do** keep every spacing value a multiple of 8px.
- **Do** express depth with 1-2px charcoal borders and muted tonal layers, never shadows.
- **Do** use the strict weight hierarchy (900/800/700/600/400) and uppercase +0.05em labels.
- **Do** write UI copy in Brazilian Portuguese (pt-BR), uppercase for labels and button text.
- **Do** support dark mode with equal quality — semantic tokens invert, Blood Red stays identical.

### Don't:
- **Don't** add border-radius, box-shadow, backdrop-filter, or gradient to any element.
- **Don't** use Blood Red on secondary elements, hovers, links, or subtle backgrounds — one accent per screen, at most.
- **Don't** introduce a second chromatic hue or an opacity-washed color.
- **Don't** use hardcoded colors, sizes, or arbitrary Tailwind values (`bg-red-500`, `text-xl`, `p-5`) — only semantic tokens.
- **Don't** mix font weights outside the hierarchy or drop the uppercase label treatment.
- **Don't** make the interface read as a generic SaaS or friendly social platform — the tone is tense control, not warmth.
- **Don't** squeeze sections; major sections need 80-120px of vertical breathing room.
