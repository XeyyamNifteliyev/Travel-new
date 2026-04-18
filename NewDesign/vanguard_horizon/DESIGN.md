# Design System Specification: The Stellar Horizon

## 1. Overview & Creative North Star: "The Celestial Navigator"
This design system is built to transform the act of travel planning from a logistical chore into an immersive, high-end editorial experience. Our Creative North Star is **"The Celestial Navigator"**—a concept that treats the interface not as a flat tool, but as a sophisticated, glass-like cockpit looking out into the world.

To move beyond the "template" look, this system rejects rigid, boxed layouts. We embrace **intentional asymmetry**, where imagery often breaks the container, and **tonal depth**, where layers float in a digital ether. The experience must feel light despite its dark theme, achieved through expansive whitespace (breathing room) and the physics of light refraction.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in the deep reaches of space, punctuated by the vibrant light of a rising sun. We do not use "flat" colors; we use atmospheric states.

### Core Tones
- **Background (`#0b1326`):** The foundation. A deep, infinite void that allows interactive elements to pop.
- **Primary Action (`primary`: `#89ceff` / `primary_container`: `#0ea5e9`):** The "Azure" glow. Use this for high-priority navigation and primary CTAs.
- **Accent/Tertiary (`tertiary`: `#ffb95f`):** The "Sunset Orange." This is our compass needle—use it sparingly for highlights, status indicators, or "Book Now" urgency.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be defined solely through background color shifts or tonal transitions.
- *Example:* A `surface_container_low` section sitting on a `surface` background provides all the definition needed.

### The "Glass & Gradient" Rule
To achieve a premium, custom feel, floating elements (modals, navigation bars, hover cards) must utilize **Glassmorphism**:
- **Surface:** Use `surface_container` tokens at 60-80% opacity.
- **Backdrop Blur:** Minimum 20px to 40px blur.
- **Signature Gradients:** For primary CTAs, transition from `primary` (#89ceff) to `primary_container` (#0ea5e9) at a 135° angle. This adds "soul" and a sense of liquid light.

---

## 3. Typography: Editorial Adventure
We pair the functional precision of **Inter** with the futuristic, wide-aperture personality of **Space Grotesk**.

- **Display & Headlines (Space Grotesk):** These are our "hooks." Use `display-lg` (3.5rem) for hero destinations. The bold, expressive nature of Space Grotesk should evoke the scale of a mountain range or the horizon line.
- **Body & Labels (Inter):** All functional interface text. Inter provides the legibility required for travel details, flight times, and pricing.
- **Hierarchy as Identity:** Create contrast by pairing a `display-sm` headline in Space Grotesk with a `label-md` in Inter (all caps, tracked out +10%) to create a sophisticated, magazine-style header.

---

## 4. Elevation & Depth: The Layering Principle
Hierarchy is achieved through **Tonal Layering**, mimicking physical sheets of frosted glass stacked in space.

- **Stacking Surfaces:** 
    1. Base: `surface` (The deep background).
    2. Sectioning: `surface_container_low`.
    3. Interactive Cards: `surface_container_high`.
- **Ambient Shadows:** Standard drop shadows are forbidden. Use **Ambient Glows**: Large blur values (40px-60px) at 6% opacity, using a tinted version of the `primary` color instead of black. This creates a "hovering" effect as if the component is backlit.
- **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Primitive Styling

### Cards
- **Radii:** Use `xl` (3rem/48px) for major hero cards and `lg` (2rem/32px) for standard content cards.
- **Content:** Forbid divider lines. Separate content using the Spacing Scale (minimum 24px gaps) or subtle shifts from `surface_container_low` to `surface_container_highest`.

### Buttons
- **Primary:** Gradient fill (Azure Blue), `full` (pill) radius, and a subtle outer glow on hover.
- **Secondary:** Glass-fill (semi-transparent `surface_variant`) with a "Ghost Border."
- **Tertiary:** Text only, using `primary` color with a 2px underline that expands on hover.

### Inputs & Search
- **The "Portal" Search:** The main search bar should be a large, glassmorphic element using `surface_bright` at 10% opacity. Use `Space Grotesk` for input text to make the search feel like an editorial prompt: *"Where to next?"*

### Chips
- **Selection:** Use `primary_container` with `on_primary_container` text.
- **Filter:** Use `surface_container_highest` with no border. When active, transition to a `tertiary` (Sunset Orange) glow.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Vibrant Bleed":** Allow high-quality travel photography to bleed behind glassmorphic headers.
- **Embrace Asymmetry:** Offset your text blocks from imagery to create a modern, non-grid-bound feel.
- **Micro-interactions:** Use soft spring animations (stiffness: 120, damping: 14) for all glass elements to simulate the weight of physical glass.

### Don’t:
- **No Pure Black:** Never use `#000000`. Use `surface_container_lowest` for the deepest shadows.
- **No Hard Edges:** Avoid `none` or `sm` roundedness unless it's for a technical utility like a tiny tag.
- **No Clutter:** If a screen feels busy, increase the whitespace. A premium experience requires the "luxury of space."
- **No High-Contrast Borders:** Never use `outline` at 100% opacity; it breaks the "glass" illusion and flattens the UI.