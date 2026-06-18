# Design System Inspired by الرئيسية

> Auto-extracted from `https://www.kau.edu.sa/ar` on 2026-06-14

## 1. Visual Theme & Atmosphere

Clean, minimal, and product-focused with deliberate use of whitespace.

The hero section leads with "جامعة الملك عبدالعزيز" followed by "نؤصّل المعرفة… ونُسهم في تحقيق تطلعات الوطن برؤية مستدامة".

**Key Characteristics:**
- IBM Plex Sans Arabic as the heading font (custom web font loaded via @font-face)
- IBM Plex Sans Arabic as the body font for all running text
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#00b4d8` used for CTAs and brand highlights
- 5 shadow level(s) detected — tinted shadows
- Rounded corners (4px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#00b4d8`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#0099c2`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#0a0e1a`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#e8f7fc`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#0a0e1a` | `--palette-2` | section | large | text-light |
| 3 | `#0077a8` | `--palette-3` | section | large | text-light |
| 4 | `#e8f7fc` | `--palette-4` | button | large | text-dark |
| 5 | `#00b4d8` | `--palette-5` | block | medium | text-light |
| 6 | `#0099c2` | `--palette-6` | text-accent | medium | text-light |
| 7 | `#e5e7eb` | `--palette-7` | badge | small | text-dark |
| 8 | `#d2d6db` | `--palette-8` | badge | small | text-dark |
| 9 | `#14573a` | `--palette-9` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `IBM Plex Sans Arabic` (web font)
- **Body Font:** `IBM Plex Sans Arabic` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H2 | IBM Plex Sans Arabic | 60px | 600 | 72px | -1.2px |
| H3 | IBM Plex Sans Arabic | 18px | 700 | 28px | normal |
| Body | IBM Plex Sans Arabic | 16px | 400 | 24px | normal |
| Small | IBM Plex Sans Arabic | 14px | 400 | 20px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `60px` | headings |
| H1 | `48px` | headings |
| H2 | `36px` | headings |
| H3 | `30px` | headings |
| H4 | `24px` | headings |
| Body L | `20px` | body / supporting text |
| Body | `18px` | body / supporting text |
| Small | `16px` | body / supporting text |
| XS | `14px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: #067647;
  color: #000000;
  border-radius: 0px;
  padding: 4px 0px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #000000;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #161616;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #161616;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border: 0.666667px solid rgb(210, 214, 219);
  cursor: pointer;
}
```

### Ghost Button 3

```css
.btn-ghost-3 {
  background: transparent;
  color: #000000;
  border-radius: 4px;
  padding: 16px 16px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #1b8354;
  color: #ffffff;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border: 0.666667px solid rgb(27, 131, 84);
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #ffffff;
  border-radius: 0px;
  padding: 0px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(16, 24, 40, 0.08) 0px 12px 16px -4px, rgba(16, 24, 40, 0.03) 0px 4px 6px -2px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `32px` | card |
| spacing-3 | `16px` | element |
| spacing-4 | `40px` | card |
| spacing-5 | `12px` | element |
| spacing-6 | `64px` | section |
| spacing-7 | `4px` | element |
| spacing-8 | `5px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `4px` | subtle |
| radius-card | `16px` | card |
| radius-button | `8px` | button |
| radius-button | `12px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `IBM Plex Sans Arabic` for all headings and `IBM Plex Sans Arabic` for body text
- Use `#00b4d8` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`4px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute IBM Plex Sans Arabic/IBM Plex Sans Arabic with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #00b4d8
Secondary:   #0099c2
Border:      #e8f7fc
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `IBM Plex Sans Arabic` heading in `#000000`, and a `#00b4d8` CTA button with 0px radius."
2. "Create a pricing card using background `#0a0e1a`, border `#e8f7fc`, `IBM Plex Sans Arabic` for text, and 24px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#00b4d8` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#0a0e1a` background, `#ffffff` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 2 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--swiper-theme-color` | `#007aff` |

### Spacing Variables

| Variable | Value |
|---|---|
| `--swiper-navigation-size` | `44px` |
