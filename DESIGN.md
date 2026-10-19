---
name: Versa
description: Every size of a campaign from one creative, drawn and checked like a media owner's spec sheet.
colors:
  ink: "#101418"
  ink-2: "#4A5260"
  ink-3: "#6B7380"
  paper: "#FFFFFF"
  sheet: "#F6F7F9"
  rule: "#E3E6EB"
  rule-strong: "#C7CCD5"
  spec: "#2346D9"
  spec-pressed: "#1B38B4"
  spec-deep: "#162D8F"
  spec-light: "#4F6CE1"
  spec-on-ink: "#7B92EA"
  spec-select: "#CDD7F8"
  spec-tint: "#E8EDFC"
  spec-wash: "#F4F6FE"
  hatch: "#F2B705"
  hatch-ink: "#6B4E00"
  pass: "#10B981"
  fail: "#EF4444"
  pass-text: "#047857"
  fail-text: "#B91C1C"
  grid-line: "#EEF0F3"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.8vw, 54px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 4vw, 48px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: "\"ss01\""
  body-dense:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  figure:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.01em"
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 78"
rounded:
  xs: "2px"
  tag: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.spec}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.spec-pressed}"
  button-primary-active:
    backgroundColor: "{colors.spec-deep}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.spec}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "46px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "24px"
  plan-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "32px"
  segmented-track:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "4px"
  segmented-option-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.spec}"
    rounded: "{rounded.tag}"
  tag:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.tag}"
    padding: "3px 8px"
  dimension-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    typography: "{typography.figure}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  dimension-chip-selected:
    backgroundColor: "{colors.spec-tint}"
    textColor: "{colors.spec}"
  preset-tile:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  preset-tile-selected:
    backgroundColor: "{colors.spec-wash}"
    textColor: "{colors.spec}"
  credit-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px"
  nav-item:
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px 8px"
  nav-item-active:
    backgroundColor: "#E5E7EB"
  brand-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "52px 44px"
---

# Design System: Versa

## Overview

**Creative North Star: "The Media Spec Sheet"**

Versa draws every output the way a media owner's spec sheet draws a screen: a frame on paper, its width dimensioned with extension ticks and an arrowed line, its size set in condensed tabular figures, its safe zone hatched. The interface is ink on paper with hairline rules. One spec blue marks the thing you can act on or have selected, and hatch yellow appears only where a spec sheet would put it. The system rejects the AI-tool look of gradients, sparkles and glowing cards. Trust comes from measurement, not atmosphere.

Density follows the work. The app shell and admin surfaces are compact: 12–14px body, 8px-rhythm controls, hairline dividers in place of boxes. Marketing, auth and pricing open up with larger type and wider gutters, and they use the same palette, the same corners and the same flat ply. The web app (Next.js, MUI and Tailwind) and the Expo mobile app share one brand. `mobile/src/theme.ts` mirrors these tokens; there are no per-OS design languages.

Product context (users, positioning, retired names and marks) lives in PRODUCT.md. Two brand commitments from that file constrain this system directly: the old sparkle and star marks and the sky-blue gradient theme are retired everywhere, and the brand never borrows its model providers' iconography.

**Key Characteristics:**
- Ink (#101418) on paper and sheet gray, separated by 1px rules rather than shadows.
- One action color, spec blue, plus a tonal scale (brand-25 to brand-800) for tints, selection and pressed states.
- Hatch yellow is a signal, not decoration: safe zones, warnings, and the × between width and height.
- Archivo is the only family. Its width axis condenses every measurement into tabular figures.
- Small corners (2–8px, controls at 4px, tags at 3px) and one barely-there ply shadow. No pills, no glows, no hover lifts.
- The brand mark is a dimensioned screen frame. It has no sparkle, star or orb.

## Colors

Ink and paper carry the structure, spec blue is the single voice of action, and hatch yellow is a reserved signal.

### Primary
- **Spec Blue** (spec): Primary buttons, links, focus outlines, the caret, selected tabs and options, active toggles, progress spinners, the recommended pricing plan's border and CTA, and the fill of the brand mark's frame. In MUI it is `palette.primary.main`. In Tailwind it is `primary` / `brand-500`.
- **Spec Pressed** (spec-pressed, brand-600): Hover on primary buttons. It is also the mobile pressed state.
- **Spec Deep** (spec-deep, brand-700): The active (mouse-down) state. In MUI it is `primary.dark`.
- **Spec Light** (spec-light, brand-300): MUI `primary.light` and the secondary accent variable.
- **Spec on Ink** (spec-on-ink, brand-200): The solid blue for emphasised words on an ink ground, as in "Checked to spec." on the auth panel. On paper (the landing hero) the same line is plain spec blue. It is always a flat color, never a gradient.
- **Spec Select / Tint / Wash** (spec-select brand-75, spec-tint brand-50, spec-wash brand-25): Text-selection highlight; selected-chip and icon-well fills; the faintest panel tint. The full scale runs brand-25 to brand-800 in `globals.css` `@theme`.

### Tertiary
- **Hatch Yellow** (hatch): Fills safe-zone hatching (`.spec-hatch`, 45° stripes at 55% strength), turns the sidebar credit meter yellow at 90% used or more, backs warning surfaces (MUI `palette.warning`, with ink text on top), sets the × in "2640 × 288" on ink grounds, and draws the dimension lines of the light-tone brand mark and the app icons.
- **Hatch Ink** (hatch-ink): Text on hatch-tinted warning surfaces wherever ink would be too heavy.

### Neutral
- **Ink** (ink): Primary text, headings, the brand wordmark, dark brand panels (auth left panel, the intro screen), the landing closing band, the Settings initial avatar, and the dimension lines of the ink-tone mark.
- **Ink 2** (ink-2): Secondary text: descriptions, plan blurbs, feature lists. MUI `text.secondary`.
- **Ink 3** (ink-3): Tertiary text and meta: sidebar group labels, placeholders, the scrollbar thumb on hover.
- **Paper** (paper): Cards, inputs, the app canvas, the auth form panel.
- **Sheet** (sheet): Recessed grounds: page backgrounds behind cards, segmented-control tracks, the scrollbar track, illustration stages.
- **Rule** (rule): Every hairline divider and card border, and the track of the credit meter. MUI `palette.divider`.
- **Grid Line** (grid-line): The drawing-sheet grid behind the landing hero (32px cells) and the engine Outputs stage (24px cells). It is never used for text or borders.
- **Rule Strong** (rule-strong): Borders that must hold their edge against sheet (the selected segment, outline buttons) and the scrollbar thumb.

### Status
- **Pass** (pass) and **Fail** (fail): Compliance PASS and FAIL marks, icons and success and error toasts. Mobile uses the slightly deeper #059669 and #DC2626. WARN uses hatch, not a separate orange.
- **Pass Text** (pass-text) and **Fail Text** (fail-text): Pass and fail words set as text in tables and comparison rows (the landing Manual vs Versa comparison, dashboard error lines), where the lighter marks would not hold contrast on paper.

### Named Rules
**The One Voice Rule.** Spec blue is the only color that means "act here" or "this is selected". Secondary actions are ink or outline, never a second hue. Green never marks selection; it means pass or success and nothing else.

**The Hatch Reservation Rule.** Hatch yellow appears only in a safe zone, a warning, or the dimension marks (the × between figures and the mark's dimension lines). It is never a highlight, a badge fill or a decorative accent.

**The Two Engines Rule.** The Transformation Engine's accent is spec blue and the Creation Engine's accent is ink, including their icon wells, selected borders and Active marks. The two engines are told apart by these accents, not by new hues.

## Typography

**Display Font:** Archivo (with ui-sans-serif, system-ui fallbacks), loaded once through `next/font` with the `wdth` axis and exposed as `--font-archivo`.
**Body Font:** Archivo.
**Label/Mono Font:** Archivo at condensed width (`font-stretch: 78%`) with tabular numerals. There is no separate monospace.

**Character:** A sturdy grotesque that reads like the type on technical drawings. It is set tight and semibold for headings, open for body, and condensed for the numbers that matter.

### Hierarchy
- **Display** (600, clamp(28px, 3.8vw, 54px), 1.08): Landing hero and auth panel statements. Set tight (-0.03em).
- **Headline** (600, clamp(22px, 4vw, 48px), 1.15): Landing section titles, the pricing page title.
- **Title** (600, 20px, -0.02em): App page headings and card titles. The CSS heading scale runs h1 30/36, h2 20/32, subhead 14/20, and MUI h1–h6 runs 2.5rem to 0.95rem, all at 600.
- **Body** (400, 14px, 1.65): Marketing and auth copy, held to about 320–560px measure. App body is denser at 12/16 and 13px (MUI body1 0.85rem).
- **Label** (500, 13px): Form labels, nav items, button text (600, no text-transform).
- **Figure** (600, condensed 78% width, tabular-nums, +0.01em): Every measurement and quantity: pixel dimensions, prices, credit counts, the recomposer readout. Apply it with the `.spec-figure` utility.

### Named Rules
**The Single Family Rule.** Archivo is the only typeface. Hierarchy comes from size, weight (400/500/600) and the width axis, never from a second family.

**The Weight Ceiling Rule.** Headings and bold text stop at 600. `globals.css` forces h1–h6, b, strong and `.font-bold` to 600 even where source asks for 700.

**The Spec Figure Rule.** A number a buyer would check against a screen owner's spec (dimensions, prices, credits) is set as a figure: condensed, tabular, semibold. Dimensions always read `W × H` with a true multiplication sign.

## Layout

The app is a fixed left sidebar plus a workspace. The sidebar carries the Versa mark, nav groups split by a small uppercase group label with a trailing hairline ("Engines"), and a white credit panel above the account menu at its foot. The workspace sits on paper or sheet, with content in paper cards. Marketing pages center a 1280px max container with clamp-based gutters (clamp(28px, 4vw, 60px) between hero columns), and content sections cap at 1120px. The landing hero is the Live Recomposer: a full-width ink headline on plain paper, then one resizable frame holding a sample ad that re-lays its layers as it snaps through real OOH sizes, with its readout and size snaps beneath. No drawing-grid ground, no left/right split, no ticker. Pricing centers three plan cards.

Spacing follows a 4px base used in 8px steps (4, 8, 12, 16, 24, 32). Controls are 8px vertical and 16px horizontal, and cards are padded 24–32px. MUI spacing is the default 8px unit.

Responsive behavior: the auth ink panel appears from 900px and stacks away below it. The app sidebar collapses below Tailwind `lg` (1024px). Hero grids drop to one column on phones, with the 16–32px side gutter visible in the mobile captures. The mobile app is portrait-only with a bottom tab bar whose active tint is spec blue.

### Named Rules
**The Hairline Rule.** Use a 1px rule between things before reaching for a box. Tables, figure rows and nav groups are divided by rules, not by card stacks.

**The Distinct Landing Rule.** The landing must not look like the owner's other products (CacheNet, Infinium). It never uses a left-headline/right-panel hero, ruled feature tables or step tracks, a blueprint or checkered grid ground, a centered badge over the headline, a feature-card grid, or any scrolling ticker or marquee. It demonstrates the mechanism instead: the recomposer, the layers row and verdict-carrying outputs.

## Elevation & Depth

The system is flat. Depth is a ply of paper on sheet: a 1px rule border plus a shadow so faint it reads as paper thickness, not lift. The ply is the only resting elevation. Floating layers (dropdown menus, popovers) are the only things that cast a real shadow, because they actually float. Nothing lifts on hover: hover changes border or fill color, never position. Shadows are always neutral ink. No surface glows.

### Shadow Vocabulary
- **Ply** (`box-shadow: 0 1px 2px rgba(16, 20, 24, 0.05)`): Cards, plan cards, landing cards. The MUI Card override uses 0.04.
- **Ply control** (`box-shadow: 0 1px 2px rgba(16, 20, 24, 0.06)`): Buttons, header controls, focused inputs, the "Most Popular" badge.
- **Overlay** (`box-shadow: 0 12px 28px -12px rgba(16, 20, 24, 0.22)`, over a 1px rule border): Dropdown menus and popovers only, as in the header menus. Catalyst menus use the equivalent Tailwind `shadow-lg` plus a 1px black/10 ring.

### Named Rules
**The No Glow Rule.** Shadows are ink at 4–6% opacity and 1–2px blur on resting surfaces. A shadow is never tinted with spec blue or any accent, never blurred wide to suggest light, and never animated as a hover lift.

## Shapes

Corners are small and squared off, like trimmed paper and drawn frames. The scale runs 1–2px (hatched frames, ratio glyphs, the credit meter, the scrollbar thumb), 3px (tags, dimension chips, the selected segment; MUI Chip is overridden to 3px theme-wide in `ThemeRegistry.tsx`), 4px (buttons, inputs, segmented tracks, icon wells on app panels, mobile controls), 6px (cards, panels, preset tiles, pricing CTAs, mobile cards) and 8px (plan cards, large landing cards, sidebar nav items). Anything rectangular stays within 2–8px, and controls sit at 4px. Full rounding is kept only for things that are round by nature: avatars in tables, radio dots, switches, spinners and status dots. Square avatars (Settings) use 6px.

The signature geometry is the dimension callout: two vertical extension ticks off a frame's edges, joined by a hairline with arrowheads or tick ends, and the size set as a figure below or above. The brand mark is exactly this: a 48×30 frame (1.5 corner on a 64 grid) with its width dimensioned. Hatching is 45° stripes, 2px on and 5px off.

### Named Rules
**The Eight Pixel Ceiling Rule.** No rectangular container, button or field rounds beyond 8px. Pills are not part of the system: there are no 999px chips, badges or buttons anywhere in the app.

## Components

### Buttons
Direct and flat. They read like a stamp, not a gel.
- **Shape:** Squared corners (4px). Large CTAs on pricing and plan cards use 6px.
- **Primary:** Spec blue fill with white 600 text, 8px × 16px padding (46px tall on auth). No shadow at rest or on hover.
- **Hover / Active / Focus:** Hover darkens to spec-pressed and mouse-down to spec-deep. Focus shows a 2px spec-blue outline at 2px offset. Background transitions run about 150–180ms.
- **Ink:** Ink fill, white text, hover to black. Used for non-recommended plan CTAs and on the Creation engine.
- **Outline:** Paper or transparent with a rule-strong (or white-on-ink) 1px border and spec-blue or white text: "Sign In", "View Pricing", "Back to Home".

### Chips and Tags
There are no pill chips. Every chip is a squared tag.
- **Hairline tag:** Sheet fill, 1px rule border, 3px corners, 12px 500 ink-2 text, 3px × 8px padding. Used for feature lists on dashboard engine panels ("Layer-aware recomposition") in place of MUI chips.
- **Dimension chip:** Paper with a 1px rule border, 3px corners, ink-2 figure text ("OOH 504 × 1008"). Selected is spec-tint fill, a spec border and spec text.
- **Fact tag:** Paper with a 1px rule border, 3px corners, a small spec-blue icon and an ink-2 label ("Layer-aware", "Exact pixels", "Spec report") under the landing hero CTAs.
- **Badge:** "Most Popular" is a spec fill with white 600 text in a small squared block.

### Cards / Containers
- **Corner Style:** Gently squared (6px for app cards, 8px for plan and landing cards).
- **Background:** Paper on a sheet ground.
- **Shadow Strategy:** Ply only (see Elevation & Depth).
- **Border:** 1px rule, turning rule-strong on hover. The selected or recommended card swaps to a 1px accent border (spec blue, or ink for the Creation Engine) instead of gaining a shadow or lifting.
- **Internal Padding:** 24px app, 28–32px marketing and pricing.

### Inputs / Fields
- **Style:** 46px tall (38px in the dense token set), 4px corners, a 1.5px light border, and a near-white fill that turns paper on focus.
- **Focus:** The border turns spec blue and a ply-control shadow appears. The global `:focus-visible` outline covers everything else.
- **Labels:** 13px, 500, above the field, 6px gap.

### Navigation
- **Sidebar:** Nav items are 14px, 500, ink, with 8px corners and 10px × 8px padding. Hover and active both fill gray-200. Expandable groups use a spec-select border and spec-blue label text. Group labels are 11px, 600, uppercase, 0.08em tracking, in ink-3, followed by a hairline. The foot holds the credit panel and the account menu.
- **Top bar (marketing):** Mark left, ink-2 text links center, outline "Sign In" plus a primary "Get Started" right, with a 1px rule beneath. Mobile collapses to a menu button on a spec-wash tile.
- **Mobile app:** A bottom tab bar with the spec-blue active tint and ink-3 inactive, on paper with a rule above. Tab icons are drawn from plain Views in the brand grammar (frame plus width dimension, frame plus cross, stacked frames, head and shoulders) in `mobile/src/components/spec.tsx`. Never emoji, never a sparkle. The same kit supplies the lockup, `RatioGlyph` size tiles with a selection mark, `SpecFrame` (dimension line, frame, dashed hatch-yellow safe zone, tabular label) and `RuledRow` label/value rows. Headers are paper with a hairline rule and a 17pt 600 ink title; the engine screens do not repeat that title in the body. Outputs are viewed on ink.

### Segmented Control
The Transformation / Creation engine switch on pricing. The track is a sheet fill with a 1px rule border, 4px corners and 4px padding. The selected option is a paper block with 3px corners, a rule-strong border and spec-blue 600 text. Unselected text is gray and turns spec blue on hover.

### Credit Panel
The sidebar's credit read-out. A paper panel with a 1px rule border and 6px corners, 12px padding. A 12px 500 ink-2 "Credit usage" label sits left with the percentage in ink-3 right. Below it the figure reads `used / total`: the used count at 22px figure weight in ink, the slash and total at 14px in ink-3. Under that, a 6px linear meter on a rule-colored track (1px corners) fills in spec blue and switches to hatch yellow at 90% used or more, with an 11px ink-2 line ("1,860 credits left this period." or "Running low. Top up in Billing."). It has no ring and no ink fill.

### Ruled Figures Row
The head of the dashboard, drawn like the title block of a spec sheet. One paper panel (6px, ply): a title block on top (34px 600 title, a 15px ink-2 line, outline and primary actions right), then a 1px rule and three equal cells divided by 1px rule verticals. Each cell holds a 13px 500 ink-2 label, a 36px `.spec-figure` value in ink and a 13px ink-3 hint. Below `md` the cells stack with horizontal rules between them.

### Selection Mark
On dashboard engine panels, selection is stated in a fixed cell at the panel's top right: a 10px round mark (filled with the engine's accent when selected, a rule-strong ring when not) beside a 12px 600 word, "Active" in the accent or "Available" in ink-3. The panel's accent border repeats it. The mark never moves and selection is never shown by color alone.

### Preset Tile and Ratio Glyph
Size presets in the engines are 6px tiles with a 1.5px border: rule-gray at rest, spec blue at 55% with a spec-wash fill when selected, plus a small spec-blue check at the corner. Each tile leads with a Ratio Glyph: a 24px-max frame drawn at the preset's true proportion with ink width ticks above it, spec-blue outline, tinted at rest and hatched (`.spec-hatch`) when selected. The label is 13px and the size is a 12px figure.

### Spec Stage and Spec Frame (signature)
The engine Outputs area is a sheet stage with a 24px drawing-sheet grid and 4px corners. Each chosen size is drawn as a Spec Frame: scaled to fit 200 × 150, with ink width ticks and a hairline above, a spec-blue 1px border at 2px corners, a hatched margin around a spec-tint safe area (12% inset), and a condensed `W × H` figure below. Before any size is chosen, the stage shows dashed rule-strong example outlines (16:9, 9:16, 1:1) with ink-3 figures and says they are examples.

### Public pages and stage surfaces
- **Landing mirrors the reel** (`docs/media/versa-demo.html`), scene for scene, with no photographs or screenshots: "One creative. More formats." beside the drawn frame study (16:9, 9:16, 1:1 with hatched safe zones and width dimensions); the five-format ratio board whose active box fills spec blue in turn; "Generate. Fit. Store." pipeline with travelling packets and the `POST /api/resize` box; "Review the output." check row with PASS / WARN / FAIL; the team and mobile scenes as text and tags; and "Create. Adapt. Review. Export." to close. When the reel changes, the landing changes with it.
- **No checkered or grid fills.** Stage and panel backgrounds are plain sheet or ink. Where a surface needs a measuring cue, use edge rulers (tick marks along the top and left edges only, as on the engine Outputs stage) or the Versa mark drawn large and faint (as in the sign-in panel's corner), never a full-surface grid.
- **The reel must match the product.** `docs/media/versa-demo.html` embeds real UI captures; whenever a captured screen changes visibly, re-capture it, replace the embedded image, re-export the MP4 and update `checksums.json` and `provenance.json`.
### Spec Title Block
The header strip of the landing demo card: a sheet band with a 1px rule beneath, the Versa mark, a 12px 600 ink panel name ("Transformation Engine") and, at the right, an 11px ink-2 status with a spec-blue icon ("Spec check on"). Use it for any panel that stands in for a tool window. It replaces browser chrome.

### Empty and Failure States
Empty and failed surfaces say what happened and offer the next step in a paper panel (6px, rule border, centered): an 18px 600 ink line, a 14px ink-2 explanation and one spec-blue action. The Users table uses the shared `EmptyState`; the Reports empty CTA opens the Transformation Engine; pricing shows "We couldn't load the plans" with a "Try again" button when plans fail to load.

### Spec Table (signature)
A list of real media-site sizes set as a ruled table on the ink auth brand panel: a top rule, then each row with a 12px white/60 label on the left and a 15px figure on the right ("2640 × 288"), rows divided by 1px white/14% rules, and the × in hatch yellow. Use it wherever sizes are listed for reading rather than picking.

### Dimension Callout (signature)
A frame drawn at true relative scale. Above it, extension ticks and a hairline mark its width. Inside it, a hatched margin surrounds a safe area. Below it sits the size figure. The landing recomposer frame, the engine Spec Frames, the Ratio Glyphs and the brand mark all use it.

### Brand Mark
`VersaMark` / `VersaLogo` in two tones. The **ink** tone has a spec-blue frame with ink dimensions and wordmark, for paper grounds. The **light** tone has a white frame, hatch dimensions and a white wordmark, for ink grounds. The app icon is the light mark on a spec-blue tile. The wordmark is Archivo Bold Semi-Expanded (wdth 112), outlined. `scripts/brand/build-brand.mjs` generates every SVG and PNG from one geometry, so change the geometry there and in the component together.

## Do's and Don'ts

### Do:
- **Do** use spec blue for the one primary action per panel and for selection. Use ink or outline for everything else.
- **Do** set every dimension, price and credit count with `.spec-figure` (condensed 78%, tabular-nums), as `W × H`.
- **Do** separate content with 1px rule hairlines, and keep resting shadows to the ply (`0 1px 2px rgba(16,20,24,.05/.06)`).
- **Do** keep rectangular corners on the 2 / 3 / 4 / 6 / 8px scale, with controls at 4px and tags at 3px.
- **Do** give the Transformation Engine spec blue and the Creation Engine ink wherever the two are shown side by side.
- **Do** use the ink-tone mark on paper and the light-tone mark on ink. Never recolor it ad hoc.
- **Do** show compliance PASS / WARN / FAIL with pass green, hatch and fail red, each paired with a label or mark so color is never the only signal. Set pass and fail words in tables in pass-text and fail-text.
- **Do** draw sizes as dimensioned frames (width ticks, hatched safe margin, `W × H` figure), and show dashed example outlines when nothing is chosen yet.
- **Do** state selection with a mark in a fixed cell ("Active" / "Available") plus the accent border.
- **Do** give every empty or failed surface one plain explanation and one next action.

### Don't:
- **Don't** use hatch yellow for highlights, badges, loaders or decoration. It means safe zone, warning, or a dimension mark.
- **Don't** use gradient text or gradient fills on brand surfaces. Emphasis on ink is a flat spec-on-ink color.
- **Don't** tint, widen or animate shadows into glows, and don't lift cards on hover (no translateY). The overlay shadow is for floating menus only.
- **Don't** use sparkle, star, magic-wand, orb or other AI-vendor iconography anywhere, including the brand mark, icons, favicons and emails.
- **Don't** put an uppercase eyebrow label above a heading. Let the heading stand alone. Sidebar group labels are navigation, not eyebrows.
- **Don't** introduce a second typeface or headings heavier than 600.
- **Don't** round rectangular controls, chips or badges into pills (no 999px anywhere).
- **Don't** use green for a selected state. Selection is spec blue (or ink for the Creation Engine).
- **Don't** use filled icons in Settings or other account surfaces; use the MUI Outline/Outlined set.

### Legacy exceptions (recorded, not rules)
- **Catalyst UI kit** components (`frontend/src/components/ui/`, e.g. `badge.tsx`, `button.tsx`) keep their stock multi-color variant maps (cyan, indigo, fuchsia and others). Use the spec, ink and outline variants in product surfaces.
