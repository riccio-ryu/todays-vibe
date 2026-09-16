# Reflect Notes — Style Reference
> starlit violet cosmos — a dark observatory where notes float like constellations against a near-black indigo void.

**Theme:** dark

Reflect Notes is a starlit thinking environment: near-black canvas tinted with violet (#030014), illuminated text in a soft lavender-white, and a single vivid lavender accent (#9382ff) that functions as a point of focus against the dark. The interface stays monochromatic and quiet — surfaces are separated by inset rim-light glows rather than borders or elevation shadows, giving components the feel of dark glass panels catching ambient light. Display headlines use AeonikPro at weight 500 (deliberately medium, not bold), creating a calm editorial voice rather than marketing bombast. A pastel pink-to-violet-to-blue gradient is reserved exclusively for accent text and decorative strokes — never for large fills. Components are compact and tight: 5px button radii, 16px card radii, 4px base spacing. The whole system reads as a constellation map, not a dashboard.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Void Canvas | `#030014` | `--color-void-canvas` | Page background, hero canvas, deepest surface layer |
| Midnight Surface | `#060317` | `--color-midnight-surface` | Elevated surface, card backgrounds |
| Deep Indigo | `#10093a` | `--color-deep-indigo` | Most elevated surface, hover states, filled button surface |
| Lilac White | `#f4f0ff` | `--color-lilac-white` | Primary text, headings, icons |
| Pearl | `#ffffff` | `--color-pearl` | Pure white — sparingly, on violet-filled elements |
| Ash | `#a8a6b7` | `--color-ash` | Secondary body text, card labels |
| Fog | `#918ea0` | `--color-fog` | Tertiary text, metadata, inactive controls |
| Steel | `#54525f` | `--color-steel` | Deepest muted text, disabled labels |
| Mercury | `#cdccd0` | `--color-mercury` | Dividers, subtle borders |
| Dusk | `#72707b` | `--color-dusk` | Mid-neutral for secondary borders, inactive icons |
| Lavender Accent | `#9382ff` | `--color-lavender-accent` | Brand accent — links, active icons, focus rings |
| Iris | `#5046e4` | `--color-iris` | Violet supporting accent for decorative details |
| Cosmic Gradient | `linear-gradient(90.01deg, #e59cff 0.01%, #ba9cff 50.01%, #9cb2ff 100%)` | `--color-cosmic-gradient` | Accent text and thin highlight strokes only — never fills |
| Aurora | `linear-gradient(180deg, rgba(183,164,251,0) 0%, #b7a4fb 50%, #8562ff 100%, rgba(133,98,255,0) 100%)` | `--color-aurora` | Vertical violet glow for dividers and edge highlights |

## Tokens — Typography

### AeonikPro (`--font-aeonikpro`)
- Substitute: Aeonik, Inter, DM Sans
- **Weights:** 500 only
- **Sizes:** 24px, 32px, 48px, 56px, 72px
- **Line height:** 1.11–1.33
- **Role:** Display/heading at 24px+ — weight 500 (medium), never bold

### Inter V (`--font-inter-v`)
- Substitute: Inter, Geist, system-ui
- **Weights:** 400, 500
- **Sizes:** 12px, 13px, 14px, 15px, 16px, 18px
- **Line height:** 1.20–1.85
- **OpenType:** `"calt" 0, "cv10", "liga" 0, "ss01"`
- **Role:** Body and UI text below heading level

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.33 | — | `--text-caption` |
| body-sm | 14px | 1.43 | — | `--text-body-sm` |
| body | 16px | 1.5 | — | `--text-body` |
| body-lg | 18px | 1.56 | — | `--text-body-lg` |
| subheading | 24px | 1.33 | — | `--text-subheading` |
| heading-sm | 32px | 1.25 | -0.2px | `--text-heading-sm` |
| heading | 48px | 1.17 | -0.3px | `--text-heading` |
| heading-lg | 56px | 1.14 | -0.4px | `--text-heading-lg` |
| display | 72px | 1.11 | -0.5px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px | **Density:** comfortable

### Border Radius

| Element | Value |
|---------|-------|
| buttons / inputs | 5px |
| cards | 16px |
| badges | 32px |
| nav pill | 999px |
| feature blocks | 24px |

### Shadows (inset rim-light — no drop shadows)

| Name | Value | Token |
|------|-------|-------|
| lg | `rgba(255,255,255,0.04) 0px 0px 24px 0px inset` | `--shadow-lg` |
| lg-2 | `rgba(255,255,255,0.06) 0px 0px 24px 0px inset` | `--shadow-lg-2` |
| md | `rgba(164,143,255,0.12) 0px -7px 11px 0px inset` | `--shadow-md` |
| subtle-4 | `rgba(255,255,255,0.03) 0px 0px 0px 8px inset` | `--shadow-subtle-4` |

## Do's and Don'ts

### Do
- AeonikPro weight 500 for headings — **never bold (600+)**
- Inset white glow instead of drop shadows for elevation
- `#9382ff` only for links, active states, focus rings — sparse
- Cosmic gradient only on text/thin strokes — never large fills
- Page background: `#030014` — violet undertone is essential

### Don't
- No bold/extra-bold weights anywhere
- No drop shadows — use inset rim-light only
- No large accent-colored fills or hero backgrounds
- No border-radius outside the defined set (5 / 16 / 24 / 32 / 999px)
- No pure `#ffffff` for body text — use `#f4f0ff`
- No second accent color — `#9382ff` is the only chromatic voice

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Void Canvas | `#030014` | Page background |
| 1 | Midnight Surface | `#060317` | Cards, nav pill |
| 2 | Deep Indigo | `#10093a` | Highest elevation, button fills |

## Quick Start — CSS Variables

```css
:root {
  /* Colors */
  --color-void-canvas: #030014;
  --color-midnight-surface: #060317;
  --color-deep-indigo: #10093a;
  --color-lilac-white: #f4f0ff;
  --color-pearl: #ffffff;
  --color-ash: #a8a6b7;
  --color-fog: #918ea0;
  --color-steel: #54525f;
  --color-mercury: #cdccd0;
  --color-dusk: #72707b;
  --color-lavender-accent: #9382ff;
  --color-iris: #5046e4;
  --gradient-cosmic: linear-gradient(90.01deg, #e59cff 0.01%, #ba9cff 50.01%, #9cb2ff 100%);
  --gradient-aurora: linear-gradient(180deg, rgba(183,164,251,0) 0%, #b7a4fb 50%, #8562ff 100%, rgba(133,98,255,0) 100%);

  /* Typography */
  --font-aeonikpro: 'AeonikPro', 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-inter-v: 'Inter V', 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Border Radius */
  --radius-btn: 5px;
  --radius-card: 16px;
  --radius-badge: 32px;
  --radius-feature: 24px;
  --radius-pill: 999px;

  /* Shadows — inset rim-light only */
  --shadow-lg:       rgba(255,255,255,0.04) 0px 0px 24px 0px inset;
  --shadow-lg-2:     rgba(255,255,255,0.06) 0px 0px 24px 0px inset;
  --shadow-md:       rgba(164,143,255,0.12) 0px -7px 11px 0px inset;
  --shadow-subtle-4: rgba(255,255,255,0.03) 0px 0px 0px 8px inset;
}
```

## Tailwind v4

```css
@theme {
  --color-void-canvas: #030014;
  --color-midnight-surface: #060317;
  --color-deep-indigo: #10093a;
  --color-lilac-white: #f4f0ff;
  --color-ash: #a8a6b7;
  --color-fog: #918ea0;
  --color-steel: #54525f;
  --color-mercury: #cdccd0;
  --color-dusk: #72707b;
  --color-lavender-accent: #9382ff;
  --color-iris: #5046e4;
}
```
