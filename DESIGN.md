---
name: Centered Signal
description: A centered Tokyo Night identity system built around editorial type, one truthful portrait, and accessible icon links.
colors:
  storm-ground: "#24283b"
  deep-panel: "#1f2335"
  primary-ink: "#c0caf5"
  secondary-ink: "#a9b1d6"
  signal-blue: "#7aa2f7"
  active-cyan: "#7dcfff"
  particle-line: "#565f89"
typography:
  display:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 540
    lineHeight: 0.94
    letterSpacing: "-0.04em"
    fontVariation: '"opsz" 72'
  body:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(0.95rem, 0.9rem + 0.18vw, 1.05rem)"
  label:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(0.875rem, 0.82rem + 0.18vw, 1rem)"
    fontWeight: 520
spacing:
  icon-gap: "0.6rem"
  identity-gap: "0.75rem"
  page-gutter: "clamp(1.25rem, 4vw, 3rem)"
rounded:
  control: "0.75rem"
  media: "1rem"
components:
  destination-icon:
    backgroundColor: "{colors.deep-panel}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.control}"
    size: "3rem"
    height: "3rem"
    width: "3rem"
  destination-icon-hover:
    backgroundColor: "{colors.deep-panel}"
    textColor: "{colors.active-cyan}"
---

# Design System: Centered Signal

## Overview

**Creative North Star: "The Quiet Signal"**

Centered Signal treats a personal profile as one calm identity instrument rather than a collection of cards or sections.
The name leads a compact centered block, with the bilingual greeting and role sharing one metadata line above one truthful square portrait and four icon-only destinations.
The atmosphere is dark, human, and technical, with shallow physical depth on the portrait and controls rather than glow or ornamental chrome.

**Key Characteristics:**

- A centered vertical composition with broad negative space.
- One photographic subject and no decorative stock imagery.
- A flat Tokyo Night ground with restrained raised portrait and button surfaces.
- Four authored icon destinations with accessible names and generous targets.
- Sparse motion that remains subordinate to identity and navigation.

## Colors

The palette uses cool blue-violet neutrals with one rare blue signal and a cyan interaction state.

### Primary

- **Signal Blue** marks the bilingual separator and carries the particle points.

### Secondary

- **Active Cyan** appears only as an interaction response for links and keyboard focus.

### Neutral

- **Storm Ground** is the uniform page field.
- **Deep Panel** supports hover feedback and the portrait's fallback surface.
- **Primary Ink** carries the strongest identity text.
- **Secondary Ink** carries the greeting, role, and icons.
- **Particle Line** keeps canvas connections visible but recessive.

**The Rare Signal Rule.**
Blue and cyan identify emphasis or interaction; they never become broad decorative fills.

**The Tactile Surface Rule.**
Depth is reserved for the portrait and icon buttons, using directional shadows and inset edge highlights rather than gradients, glow, or glass.

## Typography

**Display Font:** Literata Variable with Literata, Georgia, and serif fallbacks.

**Body Font:** Literata Variable with Literata, Georgia, and serif fallbacks.

**Character:** Literata gives the centered composition an editorial and human voice while variable weight and optical sizing keep it precise.

### Hierarchy

- **Display** uses a responsive 2.5rem to 4.5rem range, weight 540, tight tracking, and a 0.94 line height for the single-line name.
- **Body** uses a responsive 0.95rem to 1.05rem range for the role.
- **Label** uses a responsive 0.875rem to 1rem range for the greeting and quiet footer text.

**The Identity Block Rule.**
The name leads while the greeting and role share one supporting line, keeping all three items in one visual and semantic group without an eyebrow label.

## Layout

The page uses one centered vertical stack inside a full-height shell.
The identity block leads with the name and a shared greeting-role line above the square portrait, and the destinations form a compact horizontal row beneath it.
The composition scales continuously across desktop, tablet, and mobile rather than changing reading order.
The page remains one screen on common viewports and allows safe vertical scrolling on short or zoomed screens.

**The Center Line Rule.**
The identity, portrait, and destinations share the same horizontal center at every supported width.

## Elevation & Depth

The ground and typography remain flat while the portrait and icon buttons rise above the page as tactile objects.
Soft downward shadows establish distance, a pale one-pixel top inset catches light, and a darker lower inset gives each surface thickness.
Icon buttons increase their shadow on hover and collapse into an inset shadow when pressed.

### Shadow Vocabulary

- **Portrait lift** uses a broad 1.25rem downward shadow with a smaller near shadow for a raised photographic tile.
- **Button lift** uses a compact 0.35rem downward shadow that expands on hover.
- **Pressed control** replaces lift with a short inner shadow and a slight downward movement.

**The Material Restraint Rule.**
Only the portrait and icon buttons receive elevation; text and page structure remain flat.

## Shapes

The dominant geometry remains square with restrained rounding at interactive and photographic edges.
The portrait uses a one-rem radius, each icon target uses a 0.75rem radius, and both use subtle edge highlights to reinforce their physical silhouette.

## Components

### Destination Icons

Each destination is an icon-only anchor with a three-rem rounded target, an accessible name, and a native title.
The default state uses a raised Deep Panel surface with a Secondary Ink icon.
Hover increases the lift, changes the icon to Active Cyan, and shifts the control slightly upward over 180ms.
Pressing compresses the surface with an inset shadow and a slight downward movement.
Keyboard focus uses a two-pixel Active Cyan outline with a clear offset.

### Portrait

The portrait is a softly rounded and raised square figure using responsive AVIF, WebP, and JPEG sources.
It keeps a stable one-to-one aspect ratio, a subtle desaturation and contrast treatment, a layered directional shadow, and a short top-to-bottom reveal on arrival.

### Particle Field

The decorative canvas sits behind all content with pointer events disabled.
Document-level pointer listeners provide visual response without blocking links, text, or the portrait.
The field uses 18 particles on desktop, 14 on tablet, and 8 on mobile, and it pauses only while the document is hidden.

## Do's and Don'ts

### Do:

- **Do** lead with the name and keep the greeting and role together on one supporting line.
- **Do** give every icon-only destination an accessible name and at least a 44px target.
- **Do** preserve the uniform Tokyo Night field and broad negative space.

### Don't:

- **Don't** spread elevation to the identity text, footer, particle field, or new decorative containers.
- **Don't** add pills, badges, gradients, glass effects, glow, or undirected shadows.
- **Don't** add visible labels to the destination row unless the product direction changes.
- **Don't** add stock photography, decorative video, professional claims, or metrics without real evidence.
- **Don't** let canvas interaction intercept semantic content or navigation.
