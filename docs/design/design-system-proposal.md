# Anthem Academy — Design System Proposal

> **Status: DRAFT — Pending CTO review and website reference**
>
> This document proposes the visual design language for Anthem Academy. It is based on
> the PRD (v2.0, Feb 2026) and will be updated once the CTO shares the existing Anthem
> Academy website URL for brand reference. No code has been changed yet.

---

## 1. Design Direction

### Platform Identity
Anthem Academy serves youth-focused programs across schools, community organizations, and
workforce development partners. The design must balance:

| Audience | Tone needed |
|---|---|
| Students / Interns | Energetic, motivating, achievement-oriented |
| Instructors / Site Ops | Clear, efficient, data-readable |
| Partner Admins / Staff | Trustworthy, professional, compliance-ready |

**Core personality: Aspirational, Structured, Human.**
Not a cold enterprise tool. Not a childish education app. Something in between —
bold enough to inspire youth, trustworthy enough for institutions.

---

## 2. Color Palette

### Primary Palette: Indigo + Amber

| Role | Name | Hex | HSL | Rationale |
|---|---|---|---|---|
| Primary | Indigo | `#4F46E5` | `243 75% 58%` | Trust, intelligence, depth — ideal for education |
| Primary (dark mode) | Indigo Light | `#6366F1` | `245 80% 67%` | Lighter for dark backgrounds |
| Accent | Amber | `#F59E0B` | `38 92% 50%` | Achievement, energy — badges, credentials, highlights |

**Why Indigo + Amber?**
- Indigo communicates depth and ambition without feeling corporate
- Amber is the natural color of achievement (gold medals, trophies) — maps perfectly to
  the platform's credentialing and Skill Passport features
- High contrast pair that works well in both light and dark mode
- Both colors pass WCAG AA contrast requirements against white/dark backgrounds

### Semantic / Status Colors

| Role | Hex | HSL | Used for |
|---|---|---|---|
| Success | `#10B981` | `160 84% 39%` | Present, completed, passed, approved |
| Warning | `#F59E0B` | `38 92% 50%` | Late, pending, expiring, needs review |
| Error | `#EF4444` | `0 84% 60%` | Absent, failed, overdue, blocked |
| Info | `#3B82F6` | `217 91% 60%` | Neutral info, tooltips, guidance |

### Neutral Scale (Warm Gray — slight indigo undertone)

| Token | Light mode | Dark mode |
|---|---|---|
| Background | `hsl(0 0% 100%)` | `hsl(224 71% 4%)` |
| Card surface | `hsl(0 0% 100%)` | `hsl(224 50% 8%)` |
| Muted bg | `hsl(240 5% 96%)` | `hsl(240 4% 14%)` |
| Muted text | `hsl(240 4% 46%)` | `hsl(240 5% 55%)` |
| Border | `hsl(240 6% 90%)` | `hsl(240 6% 16%)` |

---

## 3. Light & Dark Mode

Both modes are fully defined using CSS custom properties (shadcn/ui variable system).
Switching between modes is handled by adding/removing the `.dark` class on `<html>`.

### Proposed CSS Variables

```css
/* Light Mode */
:root {
  --background: 0 0% 100%;
  --foreground: 224 71% 4%;
  --card: 0 0% 100%;
  --card-foreground: 224 71% 4%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 243 75% 58%;
  --primary: 243 75% 58%;
  --primary-foreground: 0 0% 100%;
  --secondary: 243 30% 96%;
  --secondary-foreground: 243 75% 30%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --accent: 38 92% 50%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 160 84% 39%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --radius: 0.5rem;
}

/* Dark Mode */
.dark {
  --background: 224 71% 4%;
  --foreground: 210 40% 98%;
  --card: 224 50% 8%;
  --card-foreground: 210 40% 98%;
  --border: 240 6% 16%;
  --input: 240 6% 16%;
  --ring: 245 80% 67%;
  --primary: 245 80% 67%;
  --primary-foreground: 0 0% 100%;
  --secondary: 243 30% 14%;
  --secondary-foreground: 243 60% 80%;
  --muted: 240 4% 14%;
  --muted-foreground: 240 5% 55%;
  --accent: 38 92% 50%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 63% 40%;
  --destructive-foreground: 0 0% 98%;
  --success: 160 84% 39%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
}
```

---

## 4. Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Headings | Inter | 700 (Bold) | 2xl – 4xl |
| Body | Inter | 400 (Regular) | base (16px) |
| Dashboard data | Inter | 500 (Medium) | sm (14px) |
| Labels / Captions | Inter | 400 | xs (12px) |
| Monospace (IDs, timestamps) | JetBrains Mono | 400 | sm |

Inter is already loaded in the app. JetBrains Mono to be added when needed.

---

## 5. Component Style Guide

### Spacing & Shape
| Property | Value | Rationale |
|---|---|---|
| Border radius | `0.5rem` | Rounded but not pill — professional feel |
| Card padding | `1.5rem` (p-6) | Comfortable dashboard density |
| Section gap | `2rem` (gap-8) | Clear visual separation |

### Component Patterns

| Component | Style |
|---|---|
| Primary button | Solid indigo, white text, rounded-md |
| Secondary button | Ghost — border only, indigo text |
| Destructive button | Solid red, white text |
| Cards | White bg, border + shadow-sm (no heavy shadows) |
| Tables | Zebra striping — muted bg on alternating rows |
| Badges (status) | Semantic color fill — `success`, `warning`, `error` |
| Badges (achievement) | Amber fill — for credentials, skill levels |
| Sidebar | Always dark indigo (`hsl(224 71% 4%)`) in both modes |
| Nav active state | Indigo background, white text |

### Kiosk Mode (QR Check-in)
- High contrast only — no subtle grays
- Large touch targets (min 48x48px)
- Success state: full-screen green flash on check-in
- Error state: full-screen red with clear message

### Accessibility Targets
- All text must meet **WCAG AA** (4.5:1 contrast ratio)
- Focus rings visible on all interactive elements (indigo ring color)
- Color is never the only indicator of status (always pair with icon or label)

---

## 6. Portal-Specific Notes

| Portal | Dominant feel |
|---|---|
| Student | Warm, motivating — amber accents prominent |
| Instructor | Efficient, data-dense — indigo dominant |
| Site Ops | High contrast, operational — minimal decoration |
| Partner Admin | Professional, report-oriented — neutral with indigo |
| Staff Admin | Dense, system-level — dark sidebar, compact tables |

---

## 7. Open Questions (Pending CTO Input)

- [ ] What is the existing Anthem Academy website URL? (primary brand reference)
- [ ] Are there existing brand guidelines / logo files?
- [ ] Is there a Figma design file already started?
- [ ] Does the platform have an existing primary color we must match?
- [ ] Any specific color accessibility requirements beyond WCAG AA?
- [ ] Should the Anthem Academy logo be included in the sidebar or top nav?

---

## 8. Next Steps (After PR Approval)

1. CTO shares website URL → extract exact brand colors
2. Adjust primary hue in CSS variables if needed (single-file change)
3. Apply to `apps/web/src/styles/globals.css`
4. Install and configure `next-themes` for light/dark mode toggle
5. Set up shadcn/ui component library with this token set
6. Abhinav (UI/UX) reviews in Figma before implementation

---

*Proposal by: @nishanth1104 with Claude Sonnet 4.6*
*Date: March 2026*
*Pending: Website reference URL from CTO*
