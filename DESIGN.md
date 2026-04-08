# Design Brief — Lord's International School Group

**Purpose:** Role-based school management system with 5 distinct portals (Principal, Teachers, Students, Driver, Main Controller) unified by a professional navy/white design system.

**Tone:** Professional, accessible, trustworthy. Education-focused, enterprise-grade. No decorative excess — information clarity prioritized.

**Aesthetic:** Corporate modernism. Navy sidebar with white content areas. Portal-specific accent colors for visual differentiation. Accessible contrast. Clean typography.

## Color Palette

| Token | OKLCH | Usage |
|-------|-------|-------|
| Sidebar | `0.17 0.07 265` | Left navigation bar across all portals |
| Background | `0.985 0.004 255` | Main content area, warm white |
| Foreground | `0.18 0.04 265` | Text, dark navy |
| Primary | `0.25 0.1 265` | Buttons, interactive elements |
| Destructive | `0.55 0.22 25` | Delete actions, critical alerts |
| Portal: Principal | `0.35 0.12 260` | Accent color in landing card + sidebar when logged in |
| Portal: Teachers | `0.55 0.16 150` | Teal/cyan accent, Teachers portal theme |
| Portal: Students | `0.58 0.15 130` | Sage green accent, Students portal theme |
| Portal: Driver | `0.62 0.18 55` | Warm orange accent, Driver portal theme |
| Portal: Controller | `0.48 0.14 280` | Purple accent, Main Controller portal theme |

## Typography

| Tier | Font | Weight | Size | Usage |
|------|------|--------|------|-------|
| Display | Plus Jakarta Sans | 700 | 32–48px | Page titles, section headers |
| Body | Plus Jakarta Sans | 400–500 | 14–16px | Content, labels, descriptions |
| Mono | Plus Jakarta Sans | 500 | 12–14px | Code, IDs, technical values |

## Structural Zones

| Zone | Background | Treatment | Depth |
|------|------------|-----------|-------|
| Sidebar | `--sidebar` (0.17) | Solid, no border | Always on left, fixed |
| Header | `--card` (1.0) | Solid white, subtle border-bottom | Above content |
| Content | `--background` (0.985) | Warm white, card-based sections | Main area |
| Cards | `--card` (1.0) | Pure white, subtle shadow | Elevated above background |
| Footer | `--muted` (0.94) | Very light gray, border-top | Below content |

## Landing Page

- 5 portal cards in responsive grid (mobile: stack, tablet: 2×2+1, desktop: row of 5)
- Each card displays: role icon, portal name, brief description, login CTA button
- Portal cards use their designated accent color as border accent or background tint
- Logo/branding at top of page

## Per-Portal Sidebar

- Consistent navy background across all 5 portals
- Portal name + icon in sidebar header
- Menu items match role-specific functions (see user requirements)
- Logout button at top of sidebar in all portals
- Last updated timestamp in footer

## Component Patterns

- **Buttons:** Primary (navy), Secondary (muted), Destructive (red), Portal-accent variants
- **Cards:** Subtle shadow, rounded corners (0.5rem), white background
- **Forms:** Accessible labels, clear validation states
- **Tables:** Row hover states, clear column headers
- **Modals:** Full-screen overlay, centered card
- **Notifications:** Toast-style, color-coded (success/warning/error)

## Motion & Interaction

- Smooth transitions: `all 0.2s ease-out` for state changes
- Sidebar collapse: slides smoothly, preserves portal context
- Card hover: subtle scale or shadow lift
- Loading states: spinner or skeleton content
- No bouncy or playful animations — motion is purposeful

## Spacing & Rhythm

- Base unit: 4px (Tailwind default)
- Spacing scale: 8px, 12px, 16px, 24px, 32px
- Density: normal (not compressed, not loose)
- Card padding: 24px
- Sidebar padding: 16px

## Constraints

- No gradients, no glow effects, no neon shadows
- Text must pass WCAG AA contrast on all backgrounds
- Mobile-first responsive: all portals work on phone, tablet, desktop
- Dark mode: not implemented; light mode only
- Icons: semantic, monochromatic (inherit text color or use portal accent)

## Signature Details

1. **Portal color accent in landing cards** — Each portal card has a left or top border in its accent color, creating visual distinctiveness
2. **Logout button prominence** — Red, always visible at top of sidebar, never hidden
3. **Sidebar consistency** — Navy sidebar is the visual anchor across all role switches
4. **Portal header branding** — Portal name + icon + role description in sidebar header
5. **Role-specific color coding** — Teachers portal teal, Students green, Driver orange, Principal indigo, Controller purple
