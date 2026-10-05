# Karera - Website Design Plan

## 1. Concept & Vibe
**"Karera"** is a high-octane racing game featuring Philippine tricycles (Traysikel) zooming across tarmac, dodging cones, and kicking up smoke, dust, and sparks. 

The website must be **Maximalist** to reflect this chaotic, energetic, and colorful street-racing vibe. It should feel loud, fast, and aggressively stylized.

## 2. Visual Identity & "Maximalist" Approach
* **Color Palette:** Neon striking colors contrasting with gritty street textures. 
    * *Primary:* Neon Yellow/Green (like a street race flag), Electric Blue, and Hot Pink.
    * *Background:* Gritty Asphalt Dark Gray (`#111111`) with overlays of smoke and sparks.
* **Typography:** Big, bold, italicized sans-serifs. Text that looks like it's moving fast. Distorted or overlapping text layers.
* **Layout:** Broken grid system. Overlapping elements, marquee scrolling text (e.g., "RACE NOW - RACE NOW"), massive hero imagery, and floating 3D elements (cones, wheels).
* **Animations:** 
    * Fast, snappy transitions.
    * Screen shakes or glitch effects on hover.
    * Parallax scrolling to give a sense of depth and speed.
    * Spark and smoke particle effects in the background.

## 3. Structure (One-Pager)
1. **Hero Section:**
   * Massive, bold "KARERA" title taking up most of the screen.
   * Background video/gif of gameplay (or a dynamic 3D render of a tricycle kicking up sparks).
   * Call to Action (CTA): "PLAY NOW" or "ENTER THE RACE" with a glitch/neon hover effect.
   * Scrolling marquee tape at the bottom: *WARNING: HIGH SPEED TRAFFIC*

2. **About the Game (The Garage):**
   * Diagonal sections splitting the screen.
   * Features: "Custom Traysikels", "Street Circuits", "Nitro Boosts".
   * Imagery of the Tricycle body, Sidecar, and RouteBoards.

3. **Media / Gallery (The Streets):**
   * Overlapping polaroid-style or skewed screenshots of the game.
   * Dust and smoke visual overlays.

4. **Footer:**
   * Social links, download links.
   * A huge tire-track graphic running over the section.

## 4. Tech Stack & Dependencies
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS (for rapid layout and custom utility classes)
* **Animation:** Framer Motion (for maximalist entrance animations and scroll effects)
* **Additional Libraries:** 
   * `lucide-react` for icons.
   * `clsx` and `tailwind-merge` for class utility.

## 5. Next Steps
1. Set up the React framework with Tailwind CSS.
2. Install Framer Motion and other dependencies.
3. Build the Hero section with the maximalist text and marquee.
4. Build the remaining sections (About, Gallery, Footer).
