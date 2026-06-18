# DESIGN.md — Liquid Glass Design System

> Universal reference for all projects. Read this before touching any UI file.
> Covers: Web (CSS/HTML/React), Mobile (React Native), and hybrid stacks.
> This file defines what the UI IS. The agent must not deviate from it.

---

## 1. What Is Liquid Glass

Liquid Glass is a design language introduced by Apple in iOS 26, subsequently adopted by Samsung (One UI 8.5), Telegram, and most major apps in 2025–2026.

Its three core properties:
1. **Translucency** — surfaces are frosted, not opaque. Content behind them bleeds through with blur.
2. **Depth** — UI layers have spatial separation via shadows and elevation, not flat color blocks.
3. **Fluidity** — interactions feel physical: elements float, respond to touch/hover with subtle physics, and transitions are smooth.

This is NOT glassmorphism from 2021. That was decoration. Liquid Glass is structural — it defines how every surface, panel, and control behaves.

---

## 2. Design Tokens

Define these once per project. Every component pulls from here — never hardcode values.

### 2.1 Color

```
/* Backgrounds — base layer, never glassy */
--color-bg-light:        #F2F2F7   /* iOS system gray 6 equivalent */
--color-bg-dark:         #0F0F12

/* Glass surfaces — floating layers */
--glass-light:           rgba(255, 255, 255, 0.55)
--glass-light-heavy:     rgba(255, 255, 255, 0.75)   /* modals, dialogs */
--glass-dark:            rgba(20, 20, 28, 0.55)
--glass-dark-heavy:      rgba(15, 15, 20, 0.75)

/* Borders on glass */
--glass-border-light:    rgba(255, 255, 255, 0.35)
--glass-border-dark:     rgba(255, 255, 255, 0.10)

/* Text — must pass WCAG AA on glass surfaces */
--text-primary-light:    #0A0A0F
--text-secondary-light:  rgba(10, 10, 15, 0.55)
--text-primary-dark:     #F5F5FA
--text-secondary-dark:   rgba(245, 245, 250, 0.55)

/* Accent — one per project, swap this only */
--color-accent:          #007AFF   /* Default: iOS blue. Override per project. */
--color-accent-glass:    rgba(0, 122, 255, 0.20)

/* Status */
--color-success:         #34C759
--color-warning:         #FF9F0A
--color-error:           #FF3B30
```

**Rules:**
- Never use pure `#000000` or `#FFFFFF` for surfaces. Always the bg tokens above.
- Accent color is the ONLY color that changes per project. Everything else is fixed.
- In dark mode, glass background opacity drops (less white bleed). Keep `rgba` dark values, not light.

---

### 2.2 Glass Effect (the core formula)

**Web (CSS):**
```css
.glass {
  background: var(--glass-light);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}

.dark .glass {
  background: var(--glass-dark);
  border-color: var(--glass-border-dark);
}
```

**React Native (requires `@react-native-community/blur`):**
```tsx
import { BlurView } from '@react-native-community/blur';

<BlurView
  style={styles.glass}
  blurType="light"        // "light" | "dark" | "extraDark" | "chromeMaterial"
  blurAmount={20}
  reducedTransparencyFallbackColor="rgba(255,255,255,0.8)"
>
  {children}
</BlurView>
```

```ts
// styles
glass: {
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  overflow: 'hidden',   // required — clips blur to border radius
}
```

**Critical:** On Android, `backdrop-filter` and `BlurView` are GPU-dependent. Always provide a solid fallback:
```css
/* Web fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgba(242, 242, 247, 0.95);
  }
}
```

---

### 2.3 Elevation & Shadows

```
/* Shadow scale — use these names, not custom values */
--shadow-xs:     0 1px 3px rgba(0,0,0,0.08);
--shadow-sm:     0 2px 8px rgba(0,0,0,0.10);
--shadow-md:     0 4px 16px rgba(0,0,0,0.12);
--shadow-glass:  0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5) inset;
--shadow-lg:     0 16px 48px rgba(0,0,0,0.16);
--shadow-float:  0 24px 64px rgba(0,0,0,0.20);
```

**React Native equivalent (shadow props):**
```ts
const shadows = {
  xs:    { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,  elevation: 2  },
  sm:    { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8,  elevation: 4  },
  glass: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 12 },
  float: { shadowColor: '#000', shadowOffset: { width: 0, height: 24}, shadowOpacity: 0.20, shadowRadius: 64, elevation: 24 },
};
```

**Rules:**
- Shadows go on the glass container, not its children.
- Dark mode: reduce shadow opacity by ~40% (dark backgrounds absorb less light).
- Never stack multiple box-shadows on the same element for "more depth" — it looks dirty.

---

### 2.4 Radius

```
--radius-xs:   6px    /* tags, badges, chips */
--radius-sm:   10px   /* input fields, small buttons */
--radius-md:   14px   /* cards, list items */
--radius-lg:   20px   /* bottom sheets, panels, nav bar */
--radius-xl:   28px   /* modals, large cards */
--radius-full: 9999px /* pills, FABs, avatar rings */
```

React Native — same values as plain numbers:
```ts
const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 9999 };
```

---

### 2.5 Spacing

8pt grid. Every margin, padding, and gap is a multiple of 8.

```
--space-1:  4px    /* micro gaps between inline elements */
--space-2:  8px    /* tight internal padding */
--space-3:  12px   /* list item vertical padding */
--space-4:  16px   /* standard component padding */
--space-5:  20px   /* section internal padding */
--space-6:  24px   /* between related sections */
--space-8:  32px   /* between major sections */
--space-10: 40px   /* page-level top/bottom padding */
--space-12: 48px   /* hero spacing */
```

---

### 2.6 Typography

**Web:**
```css
/* Font stack — system fonts so no loading, matches native feel */
--font-body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono:    'SF Mono', 'Cascadia Code', 'Fira Code', monospace;

/* Scale */
--text-xs:   11px / 1.4
--text-sm:   13px / 1.5
--text-base: 15px / 1.6
--text-md:   17px / 1.5
--text-lg:   20px / 1.4
--text-xl:   24px / 1.3
--text-2xl:  28px / 1.2
--text-3xl:  34px / 1.1

/* Weight */
--weight-regular: 400
--weight-medium:  500
--weight-semibold: 600
--weight-bold:    700
```

**React Native:**
```ts
const typography = {
  xs:    { fontSize: 11, lineHeight: 15 },
  sm:    { fontSize: 13, lineHeight: 18 },
  base:  { fontSize: 15, lineHeight: 22 },
  md:    { fontSize: 17, lineHeight: 24 },  // iOS body default
  lg:    { fontSize: 20, lineHeight: 26 },
  xl:    { fontSize: 24, lineHeight: 30 },
  '2xl': { fontSize: 28, lineHeight: 34 },
  '3xl': { fontSize: 34, lineHeight: 40 },
};
```

**Rules:**
- Body text minimum: `--text-base` (15px). Never smaller for paragraph content.
- On glass surfaces, use `font-weight: 500` minimum — thin text on blurred bg loses contrast.
- Line height should always be set explicitly. Never rely on browser defaults.

---

## 3. Components

### 3.1 Navigation Bar

The single most important Liquid Glass component. It floats, it's frosted, it doesn't touch the screen edges.

**Structure:**
- Sits at the bottom (mobile) or top (web)
- 4 tabs max: no more
- Floats with `margin: 0 16px 16px` — never edge-to-edge
- Active tab: accent color icon + label. Inactive: secondary text color, icon only or muted label.
- Height: 64px (mobile), 56px (web)

**Web:**
```css
.nav-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0;
  padding: 8px 12px;
  width: calc(100% - 32px);
  max-width: 480px;
  background: var(--glass-light);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-float);
}
```

**React Native:**
```tsx
// Use with BlurView as the container
// tabBarStyle:
{
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  borderRadius: 9999,
  height: 64,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  overflow: 'hidden',
  elevation: 24,
}
```

**DO NOT:**
- Don't use a solid background on the nav bar
- Don't make it edge-to-edge — the float + gap is the whole point
- Don't add more than 4 tabs — use a "More" overflow if needed

---

### 3.2 Cards & List Items

```css
.card {
  background: var(--glass-light);
  backdrop-filter: blur(16px) saturate(1.6);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-md);
}
```

List items inside a card: no individual glass treatment. Glass is the container, not each row.

---

### 3.3 Buttons

**Primary (filled accent):**
```css
.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-full);
  padding: 12px 24px;
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  box-shadow: 0 4px 14px rgba(0, 122, 255, 0.35);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.btn-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}
```

**Secondary (glass):**
```css
.btn-secondary {
  background: var(--glass-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--radius-full);
  padding: 12px 24px;
  color: var(--text-primary-light);
  font-weight: var(--weight-medium);
  box-shadow: var(--shadow-sm);
}
```

**React Native buttons:**
```ts
// Primary
primaryBtn: {
  backgroundColor: '#007AFF',
  borderRadius: 9999,
  paddingVertical: 14,
  paddingHorizontal: 24,
  shadowColor: '#007AFF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 8,
}

// Press state — use Animated or Pressable's onPressIn/Out
// scale to 0.97, reduce shadowRadius by 50%
```

---

### 3.4 Modals & Bottom Sheets

```css
.modal {
  background: var(--glass-light-heavy);
  backdrop-filter: blur(40px) saturate(2.0);
  -webkit-backdrop-filter: blur(40px) saturate(2.0);
  border: 1px solid var(--glass-border-light);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;  /* bottom sheet */
  padding: var(--space-6);
  box-shadow: var(--shadow-float);
}
```

Modal overlay (the dimming layer behind):
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.30);   /* NOT 0.5 — too heavy for glass UI */
  backdrop-filter: blur(4px);
}
```

---

### 3.5 Input Fields

```css
.input {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: var(--text-base);
  color: var(--text-primary-light);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-glass);
  outline: none;
}
```

Dark mode:
```css
.dark .input {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text-primary-dark);
}
```

---

## 4. Motion & Animation

### Rules
- Duration: 200ms for micro (button press, toggle), 300ms for transitions (page, modal), 500ms for large reveals.
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring-like entries. `ease-out` for exits.
- Never animate `width`, `height`, or `top/left` — use `transform` and `opacity` only (GPU-composited).
- Always respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Standard transitions
```css
/* Element entering view */
.enter {
  animation: fadeSlideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}

/* Element leaving */
.exit {
  animation: fadeSlideDown 200ms ease-out forwards;
}
@keyframes fadeSlideDown {
  from { opacity: 1; transform: translateY(0)   scale(1);    }
  to   { opacity: 0; transform: translateY(8px) scale(0.98); }
}
```

**React Native — use `react-native-reanimated` for all animations. Never `Animated` API for glass UI.**

---

## 5. Dark Mode

Every token has a light and dark value. Switch using a CSS class or media query — never detect via JS unless necessary.

```css
/* Web — media query approach */
@media (prefers-color-scheme: dark) {
  :root {
    --glass-bg:          var(--glass-dark);
    --glass-border:      var(--glass-border-dark);
    --text-primary:      var(--text-primary-dark);
    --text-secondary:    var(--text-secondary-dark);
    --color-bg:          var(--color-bg-dark);
  }
}

/* Or class-based (recommended for toggle support) */
.dark {
  --glass-bg:       var(--glass-dark);
  --glass-border:   var(--glass-border-dark);
  /* ... etc */
}
```

**React Native:**
```ts
import { useColorScheme } from 'react-native';

const scheme = useColorScheme(); // 'light' | 'dark'
const glass = scheme === 'dark'
  ? { backgroundColor: 'rgba(20,20,28,0.55)', borderColor: 'rgba(255,255,255,0.10)' }
  : { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.35)' };
```

---

## 6. Accessibility & Contrast

Liquid Glass fails accessibility if misused. These rules are non-negotiable.

- **Text on glass must pass WCAG AA**: 4.5:1 ratio for body text, 3:1 for large text (18px+ bold).
- If your glass bg is too transparent and text contrast fails — increase `rgba` opacity until it passes. Do not reduce font size or change font weight as a workaround.
- Interactive elements (buttons, links, inputs) must have a visible `:focus` state. Use `box-shadow: 0 0 0 3px var(--color-accent-glass)` — never `outline: none` without a replacement.
- Touch targets on mobile: minimum 44×44pt (RN: 44×44 in the `hitSlop` prop if the visual is smaller).
- Never rely on color alone to communicate state (error, success). Always pair with an icon or text label.

**Contrast check tool:** https://webaim.org/resources/contrastchecker/

---

## 7. What NOT to Do

These are the most common mistakes when implementing Liquid Glass. The agent must not do any of these.

| ❌ Wrong | ✅ Right |
|---|---|
| Glass effect on every element | Glass only on floating surfaces (nav, cards, modals, sheets) |
| `backdrop-filter` without a fallback | Always include `@supports not` fallback |
| Blur on text content | Blur is on the container background, never on text |
| Solid opaque nav bar | Nav bar is always frosted glass |
| `border-radius: 8px` on nav bar | Nav bar is pill-shaped: `border-radius: 9999px` |
| Heavy modal overlay (`rgba(0,0,0,0.6)`) | Light overlay: `rgba(0,0,0,0.30)` max |
| Animating layout properties (`height`, `top`) | Only `transform` and `opacity` |
| Custom shadow values per component | Always use the shadow scale tokens |
| Ignoring `prefers-reduced-motion` | Always add the reduce-motion media query |
| Pure black/white surfaces | Use the bg tokens (`#F2F2F7` / `#0F0F12`) |
| Applying glass to content inside cards | Glass on the card shell only, content is normal |
| More than 4 nav tabs | 4 max, use overflow for more |

---

## 8. Platform-Specific Notes

### Web
- `backdrop-filter` not supported in Firefox by default (needs a flag). Always include the `@supports` fallback.
- On Safari, use `-webkit-backdrop-filter` in addition to the standard property.
- Glass effects are expensive on low-end devices. If performance is a concern, add a `@media (prefers-reduced-motion)` path that disables blur.

### React Native (iOS)
- Use `BlurView` from `@react-native-community/blur`. It uses native APIs and performs well.
- `blurType: "light"` for light mode, `"dark"` for dark mode, `"chromeMaterial"` for the most iOS-native feel.
- Always set `overflow: 'hidden'` on the `BlurView` container or blur will bleed outside the border radius.

### React Native (Android)
- `BlurView` on Android is a software implementation — GPU-expensive. Test on a mid-range device.
- If performance is poor, fall back to: `backgroundColor: 'rgba(255,255,255,0.85)'` with a strong shadow. It won't be glass but it won't be broken.
- `elevation` is Android's shadow system. Use it alongside `shadowColor/Offset/Opacity/Radius` for cross-platform coverage.

---

## 9. Quick Reference Cheatsheet

```
GLASS FORMULA:
  bg:              rgba(255,255,255,0.55)  [light]  /  rgba(20,20,28,0.55)  [dark]
  backdrop-filter: blur(20px) saturate(1.8)
  border:          1px solid rgba(255,255,255,0.35)  [light]  /  rgba(255,255,255,0.10)  [dark]
  border-radius:   20px (cards/panels)  /  9999px (nav/pills)
  box-shadow:      0 8px 32px rgba(0,0,0,0.12)

MOTION:
  enter:  300ms  cubic-bezier(0.34, 1.56, 0.64, 1)  fadeSlideUp
  exit:   200ms  ease-out  fadeSlideDown
  press:  100ms  scale(0.97) + shadow shrink

SPACING:  4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48
RADIUS:   6 / 10 / 14 / 20 / 28 / 9999
SHADOWS:  xs / sm / md / glass / lg / float
```
