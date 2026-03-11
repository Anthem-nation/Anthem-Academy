# Anthem Academy — Design System Proposal

> **Status: UPDATED — Brand colors extracted from theanthemacademy.org**
>
> Original proposal used Indigo + Amber (generic). This revision uses the
> actual brand palette extracted from the live Anthem Academy website CSS.
> No code has been changed yet — pending team review before applying.

---

## 1. Design Direction

### Platform Identity
Anthem Academy serves youth-focused programs across schools, community organizations,
and workforce development partners. The actual brand communicates:

- **Warm and human** — Terracotta as the action color (not a cold corporate blue)
- **Authoritative and deep** — Navy as the structural/background color
- **Energetic and celebratory** — Gold for achievements, highlights, credentials
- **American spirit** — Red, Blue, Yellow in the logo palette fits "Anthem" perfectly

**Core personality: Warm, Grounded, Aspirational.**

---

## 2. Color Palette — Extracted from theanthemacademy.org

### Primary Brand Colors (from CSS variables)

| Role | Name | Hex | RGB | Source var |
|---|---|---|---|---|
| **Primary / CTA** | Terracotta | `#D0744B` | `208, 116, 75` | `--color_18` (action, buttons) |
| **Dark surface** | Deep Navy | `#15465F` | `21, 70, 95` | `--color_21` |
| **Darkest bg** | Midnight Navy | `#111C30` | `17, 28, 48` | `--color_25` |
| **Accent / Achievement** | Gold | `#F9AC02` | `249, 172, 2` | `--color_19` |
| **Background** | Warm Off-White | `#F3F1F2` | `243, 241, 242` | `--color_11` |
| **Text primary** | Black | `#000000` | `0, 0, 0` | `--color_15` |
| **Text secondary** | Dark Brown-Black | `#26140A` | `38, 20, 10` | `--color_14` |
| **Body text** | Charcoal | `#4F4F4F` | `79, 79, 79` | `--color_47` |

### Logo / Brand Identity Colors

| Name | Hex | RGB | Source var |
|---|---|---|---|
| Brand Red | `#ED1C24` | `237, 28, 36` | `--color_3` |
| Brand Blue | `#0088CB` | `0, 136, 203` | `--color_4` |
| Brand Yellow | `#FFCB05` | `255, 203, 5` | `--color_5` |

> These appear in the logo only — not used for UI components directly.

### Semantic / Status Colors

| Role | Hex | Use |
|---|---|---|
| Success | `#10B981` | Present, completed, passed, approved |
| Warning | `#F9AC02` | Late, pending, expiring (reuses brand Gold) |
| Error | `#ED1C24` | Absent, failed, overdue (reuses brand Red) |
| Info | `#0088CB` | Neutral info, tooltips (reuses brand Blue) |

> Semantic colors deliberately reuse brand colors — consistency with zero extra tokens.

---

## 3. Light & Dark Mode CSS Variables

### Proposed `globals.css`

```css
@layer base {
  :root {
    /* Backgrounds */
    --background: 30 8% 96%;          /* #F3F1F2 warm off-white */
    --foreground: 20 50% 4%;          /* #26140A dark brown-black */

    /* Card / surfaces */
    --card: 0 0% 100%;
    --card-foreground: 20 50% 4%;

    /* Borders & inputs */
    --border: 0 0% 89%;               /* #E3E3E3 */
    --input: 0 0% 89%;
    --ring: 18 57% 55%;               /* #D0744B terracotta focus ring */

    /* Primary — Terracotta */
    --primary: 18 57% 55%;            /* #D0744B */
    --primary-foreground: 0 0% 100%;

    /* Secondary — Light terracotta tint */
    --secondary: 18 40% 94%;
    --secondary-foreground: 18 57% 35%;

    /* Muted */
    --muted: 30 5% 94%;
    --muted-foreground: 0 0% 31%;     /* #4F4F4F charcoal */

    /* Accent — Gold */
    --accent: 40 98% 49%;             /* #F9AC02 */
    --accent-foreground: 20 50% 4%;   /* dark text on gold */

    /* Destructive */
    --destructive: 357 84% 52%;       /* #ED1C24 brand red */
    --destructive-foreground: 0 0% 100%;

    /* Semantic */
    --success: 160 84% 39%;           /* #10B981 */
    --success-foreground: 0 0% 100%;
    --warning: 40 98% 49%;            /* #F9AC02 gold = warning */
    --warning-foreground: 20 50% 4%;
    --info: 201 100% 40%;             /* #0088CB brand blue */
    --info-foreground: 0 0% 100%;

    /* Border radius */
    --radius: 0.5rem;
  }

  .dark {
    /* Backgrounds */
    --background: 218 47% 13%;        /* #111C30 midnight navy */
    --foreground: 30 8% 96%;          /* #F3F1F2 warm off-white */

    /* Card / surfaces */
    --card: 205 63% 23%;              /* #15465F deep navy */
    --card-foreground: 30 8% 96%;

    /* Borders & inputs */
    --border: 205 63% 30%;
    --input: 205 63% 30%;
    --ring: 18 57% 55%;               /* #D0744B terracotta stays */

    /* Primary — Terracotta stays in dark mode */
    --primary: 18 57% 55%;            /* #D0744B */
    --primary-foreground: 0 0% 100%;

    /* Secondary */
    --secondary: 205 63% 18%;
    --secondary-foreground: 30 8% 90%;

    /* Muted */
    --muted: 205 50% 18%;
    --muted-foreground: 0 0% 65%;

    /* Accent — Gold stays */
    --accent: 40 98% 49%;             /* #F9AC02 */
    --accent-foreground: 218 47% 13%; /* navy text on gold */

    /* Destructive */
    --destructive: 357 84% 52%;
    --destructive-foreground: 0 0% 100%;

    /* Semantic */
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --warning: 40 98% 49%;
    --warning-foreground: 218 47% 13%;
    --info: 201 100% 40%;
    --info-foreground: 0 0% 100%;
  }
}
```

---

## 4. Typography

The Anthem Academy website uses system sans-serif fonts. For the platform we use Inter
(already installed) — clean, readable, excellent for data-dense dashboards.

| Role | Font | Weight | Size |
|---|---|---|---|
| Headings | Inter | 700 | 2xl – 4xl |
| Body | Inter | 400 | base (16px) |
| Dashboard data | Inter | 500 | sm (14px) |
| Labels / Captions | Inter | 400 | xs (12px) |
| Monospace (IDs, timestamps) | JetBrains Mono | 400 | sm |

---

## 5. Component Style Guide

### Shape & Spacing
| Property | Value |
|---|---|
| Border radius | `0.5rem` — rounded, not sharp, not pill |
| Card padding | `1.5rem` (p-6) |
| Section gap | `2rem` (gap-8) |

### Component Patterns

| Component | Light mode | Dark mode |
|---|---|---|
| Primary button | Terracotta `#D0744B` fill, white text | Same |
| Secondary button | Terracotta border, terracotta text | Lighter terracotta border |
| Sidebar | Midnight Navy `#111C30` | Midnight Navy `#111C30` (same) |
| Nav active state | Terracotta bg, white text | Terracotta bg, white text |
| Cards | White bg, subtle border | Deep Navy `#15465F` bg |
| Achievement badges | Gold `#F9AC02` fill, dark text | Gold `#F9AC02` fill |
| Status: success | Emerald `#10B981` | Same |
| Status: warning | Gold `#F9AC02` | Same |
| Status: error | Brand Red `#ED1C24` | Same |
| Status: info | Brand Blue `#0088CB` | Same |
| Tables | Warm off-white `#F3F1F2` alternating rows | Navy alternating rows |

### Sidebar (always dark)
The sidebar should always use Midnight Navy `#111C30` regardless of light/dark mode.
Active items use Terracotta `#D0744B` as the highlight. This matches the website's tone.

### Kiosk Mode (QR Check-in screen)
- High contrast — white text on Midnight Navy background
- Success: full-screen Emerald flash `#10B981`
- Error: full-screen Brand Red `#ED1C24`
- Large touch targets (min 48×48px)

---

## 6. Portal-Specific Color Emphasis

| Portal | Primary feel | Accent emphasis |
|---|---|---|
| Student | Warm, motivating | Gold badges prominent |
| Instructor | Data-dense | Terracotta action items |
| Site Ops | High contrast, operational | Minimal decoration |
| Partner Admin | Professional | Terracotta CTAs, navy headers |
| Staff Admin | System-level, dense | Navy dominant |

---

## 7. Before vs After

| Token | Old proposal (Indigo + Amber) | New proposal (Brand-matched) |
|---|---|---|
| Primary | `#4F46E5` Indigo | `#D0744B` Terracotta |
| Accent | `#F59E0B` Amber | `#F9AC02` Gold |
| Dark bg | `hsl(224 71% 4%)` | `#111C30` Midnight Navy |
| Card (dark) | Dark indigo | `#15465F` Deep Navy |
| Error | Generic red | `#ED1C24` Brand Red |
| Info | Generic blue | `#0088CB` Brand Blue |

---

## 8. Next Steps (After PR Approval)

1. Apply CSS variables to `apps/web/src/styles/globals.css`
2. Install `next-themes` for light/dark mode toggle
3. Set up shadcn/ui component library with this token set
4. Abhinav (UI/UX) reviews components in Figma before implementation
5. Implement sidebar with permanent Midnight Navy background

---

*Updated by: @nishanth1104 with Claude Sonnet 4.6*
*Date: March 2026*
*Source: theanthemacademy.org CSS variable extraction*
