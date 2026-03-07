# 🎨 SnapMacros — Design System
**Version:** 3.0 | "Midnight Athlete" aesthetic | Chip the hatching egg.

---

## 1. The Four Design Laws

Every pixel, every timing, every word runs through these four laws. When in doubt, run the decision through all four.

**Law 1 — DELIGHT BEFORE DATA**
The emotional experience comes before informational value. Chip is always what you register first. The rings are beautiful before they are informative. Users feel something before they read anything.

**Law 2 — EARN THE NEXT TAP**
Every screen gives value before asking for anything. Onboarding shows Chip and your calculated targets before asking you to create an account. The snap result shows macros before asking you to log them. Zero friction before value.

**Law 3 — EVERY PIXEL IS A DECISION**
Nothing is default. The ring animation is 800ms with cubic-bezier(0.22, 1, 0.36, 1) because that curve feels satisfying. The card shadow is `0 2px 12px rgba(0,0,0,0.30)` not `0 1px 3px` because depth matters. Bricolage Grotesque not Inter because Inter is on ten thousand apps.

**Law 4 — PERSONALITY OVER POLISH**
Chip IS the product. The roast IS the retention hook. These aren't features — they're the soul. When there's a tradeoff between adding more information and adding more personality, personality wins.

---

## 2. Aesthetic Direction: "Midnight Athlete"

The intersection of gym culture and premium design. Dark. Bold. Energetic. Not aggressive — purposeful.

**Inspired by:** Nike Training Club (dark + energetic), Apple Fitness (ring progress), Duolingo (mascot gamification), Spotify (confident typography).

**What it is NOT:** Calm/Headspace (pastel wellness). Gaming/crypto (neon cyberpunk). Corporate (Cronometer). Generic health (MyFitnessPal).

---

## 3. Color System

```
── BRAND ──────────────────────────────────────────────────────
Primary Orange      #FF6B35      All CTAs, active ring, selections
Primary 10%         rgba(255,107,53,0.10)   Tinted card backgrounds
Primary 20%         rgba(255,107,53,0.20)   Hover states
Primary Glow        0 0 24px rgba(255,107,53,0.35)

Secondary Purple    #6C63FF      Protein ring, secondary accents
Secondary 10%       rgba(108,99,255,0.10)
Secondary Glow      0 0 24px rgba(108,99,255,0.35)

Success Teal        #2DD4BF      Carbs ring, goal-hit, tips
Warning Amber       #FBBF24      Fat ring, caution states
Danger Coral        #F87171      Over-target ring ONLY

── SURFACES ───────────────────────────────────────────────────
Background          #0F0F14      The canvas. Warm dark, not pure black.
Card                #1A1A24      Raised surfaces.
Elevated            #22222F      Modals, sheets, popovers.
Border              #2A2A3A      Separators. Use sparingly.
Overlay             rgba(0,0,0,0.75)

── TEXT ───────────────────────────────────────────────────────
Primary             #FFFFFF
Secondary           #A0A0B8
Muted               #60607A
Inverse             #0F0F14      Text on colored backgrounds.

── MACRO RINGS ────────────────────────────────────────────────
Calories            #FF6B35      Outermost — most important
Protein             #6C63FF      Second
Carbs               #2DD4BF      Third
Fat                 #FBBF24      Innermost
```

**Rules:**
1. Never more than 2 accent colors on one screen
2. Orange = primary action only, never decorative
3. Red only for over-target states (user's choice, not an app error)
4. All body text on dark backgrounds must pass 4.5:1 contrast ratio

---

## 4. Typography

**Display: `Bricolage Grotesque`** — Chunky, confident, geometric. Not on ten thousand apps. Has personality without being quirky.
```
Google Fonts: family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800
```

**Body: `DM Sans`** — Slightly informal, extremely readable, pairs perfectly with Bricolage.
```
Google Fonts: family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700
```

**Scale:**
```
Hero       80px  800wt  Bricolage  -3px    Calorie number in ring center
Display    40px  800wt  Bricolage  -1.5px  Onboarding headlines
H1         28px  700wt  DM Sans   -0.5px  Screen titles
H2         22px  600wt  DM Sans    0      Section titles
H3         18px  600wt  DM Sans    0      Card titles
Body       16px  400wt  DM Sans   +0.1px  Main content
Small      14px  400wt  DM Sans   +0.1px  Chip speech, secondary info
Caption    13px  400wt  DM Sans   +0.2px  Timestamps, metadata
Label      11px  600wt  DM Sans   +1px    UPPERCASE. Field labels, macro labels.
Micro      10px  500wt  DM Sans   +0.5px  Pills, badges
```

---

## 5. Spacing (4px base unit)
```
4px    Tight interior (icon gap, pill v-padding)
8px    Small component gap
12px   Card interior spacing
16px   Input padding, list item padding
20px   Screen horizontal padding (ALWAYS 20px from edges)
24px   Section spacing within cards
32px   Between major sections
40px   Large breaks
48px   Page-level top padding
72px   Bottom nav height (+ safe area)
```

**Touch targets:** Minimum 48×48px on ALL interactive elements. No exceptions.

---

## 6. Border Radii
```
8px    Input fields, small chips
14px   Buttons, pills, tags
20px   Standard cards
24px   Bottom sheets, modals
28px   Result screen top panel
999px  Circular pills, full-round elements
```

---

## 7. Shadows
```
Lifted:       0 2px 12px rgba(0,0,0,0.30)     Standard cards
Floating:     0 8px 32px rgba(0,0,0,0.50)     Bottom sheets, modals
Glow Orange:  0 0 24px rgba(255,107,53,0.35)  Active states, streaks
Glow Purple:  0 0 24px rgba(108,99,255,0.35)  Protein achievements
Glow Teal:    0 0 20px rgba(45,212,191,0.30)  Goal completion
Glow Red:     0 0 20px rgba(248,113,113,0.30) Over-target rings
```

---

## 8. Motion System

**Three and only three purposes:**
1. Communicate state change (something happened)
2. Communicate hierarchy (depth, layering)
3. Celebrate achievement (you did something)

Motion that doesn't serve one of these is cut.

**Timing:**
```
Instant     0ms      Toggles, selection highlights
Fast        150ms    Button press feedback
Standard    280ms    Page transitions, modal open
Deliberate  600ms    Chip emotion change
Hero        800ms    Ring fill, count-up numbers
Celebration 900ms    Confetti, milestone moments
```

**Easing curves:**
```
Enter:   cubic-bezier(0.22, 1, 0.36, 1)      Ease-out. Content arriving.
Exit:    cubic-bezier(0.55, 0, 1, 0.45)      Ease-in. Content leaving.
Spring:  type:'spring' stiffness:400 damping:28
```

**Specific animation specs:**
```
Ring fill:          strokeDashoffset 0→target 800ms ease-out staggered 100ms/ring
Chip idle:          y:[0,-6,0] 2.2s ease-in-out infinite
Chip bounce (hype): y:[0,-22,-4,-14,0] scale:[1,1.08,1,1.05,1] 400ms
Chip shake:         x:[0,-12,12,-10,10,0] 480ms
Chip on fire:       rotate:[-8,8,-5,5,0] scale:[1,1.12,1] 600ms
Chip pulse:         scale:[1,1.06,1] 1.5s infinite
Chip droop:         y:[0,8] rotate:[0,-4] 600ms ease-out
Chip laugh:         rotate:[0,-6,6,-4,4,0] y:[0,-4,0] 500ms
Chip sleep:         y:[0,5,0] 3s ease-in-out infinite
Page:               y:12→0 opacity:0→1 280ms ease-out
Cards:              y:16→0 opacity:0→1 300ms staggered 60ms
Button press:       scale 1.0→0.96 120ms → scale 1.0 200ms spring
Count-up:           value animates from old to new 600ms ease-out
Confetti:           20 particles outward random directions 900ms
```

---

## 9. 🥚 Chip — Complete Visual Specification

### Character Design
**Body:** Oval egg, cream/off-white (#FAF7F0), wider at bottom, narrows toward top third. Cracked opening at the top — jagged irregular line. Chip's round head always visible above the crack.

**Head:** Perfect circle, same cream. Eyes occupy ~35% of face width (key to expressiveness). Arms: tiny rounded stubs at the crack edges.

**Color palette:**
```
Shell:       #FAF7F0    Warm off-white (not pure white)
Shadow:      #E8E0D0    Depth on the oval underside
Crack:       #C4B5A0    Natural eggshell crack
Pupils:      #1A1A2E    Very dark (not pure black)
Eye whites:  #FFFFFF
Blush:       #FFB3A7    Soft coral — hype, laughing states
Tear:        #93C5FD    Light blue — sad state
Fire glow:   #FF6B35    Radiates from Chip in on_fire state
Zzz text:    #A0A0B8    Muted — sleepy state
```

### Per-Emotion Visual Spec

**HAPPY (default)**
```
Eyes:       Open ovals, pupils centered, white highlight top-right
Mouth:      Small U-curve, 40% face width
Arms:       Slightly raised, neutral
Animation:  Gentle bob y:[0,-4,0] 2.2s infinite
```

**HYPE**
```
Eyes:       Star-shaped ★ in gold #FFD700
Mouth:      Large open D-grin
Arms:       Both raised above crack
Cheeks:     Coral blush circles appear
Animation:  y:[0,-22,-4,-14,0] scale:[1,1.08,1,1.05,1]
Extras:     4–6 sparkle ✦ particles orbiting Chip
```

**SHOCKED**
```
Eyes:       1.5× normal size ovals, tiny pupils in center
Mouth:      Perfect O shape
Arms:       Hands on cheeks (covering)
Forehead:   Small blue sweat drop
Animation:  x:[0,-12,12,-10,10,0] 480ms
```

**LAUGHING**
```
Eyes:       Curved lines (squeezed shut)
Mouth:      Open irregular laugh shape
Arms:       One holding stomach, one waving
Corners:    Tiny blue tear dots at outer eye corners
Cheeks:     Deep coral blush
Animation:  rotate:[0,-6,6,-4,4,0] y:[0,-4,0] 500ms
```

**SAD**
```
Eyes:       Half-closed, pupils slightly down, inner brows raised
Mouth:      Soft downward curve (not dramatic frown)
Arms:       One hanging, one holding arm
Tear:       Animated blue oval sliding down right cheek
Shell:      Chip slightly retreated (head lower in crack)
Animation:  y:[0,8] rotate:[0,-4] 600ms then slow droop idle
```

**ON FIRE**
```
Eyes:       Normal but pupils glow orange #FF6B35
Mouth:      Confident wide grin
Arms:       Power pose, wide
Emergence:  Chip's body more visible (shell crack wider)
Crown:      3 small flame shapes on top of head
Aura:       Radial orange glow around entire Chip
Animation:  rotate:[-8,8,-5,5,0] scale:[1,1.12,1] 600ms
```

**THINKING**
```
Eyes:       One squinted (half-oval), one normal looking up-right
Mouth:      Slight one-sided hmm
Arms:       One raised, tiny finger pointing up
Bubbles:    3 dots ●●● pulsing above head
Animation:  rotate:[0,-10,10,-10,0] 2s loop
```

**SLEEPY**
```
Eyes:       Both half-closed (heavy lids)
Mouth:      Small oval yawn
Arms:       One propping up head from inside shell
Chip:       Barely peeking, more hidden than usual
Zzz:        Letters z floating upper-right, fading
Animation:  y:[0,5,0] 3s ease-in-out infinite, very slow
```

### Chip's Voice Rules
```
✅ Max 2 sentences per speech line
✅ Casual language: "eat" not "consume", "macros" not "macronutrients"
✅ Specific: "47g protein" not "good protein intake"
✅ Names food: "that Big Mac" not "that high-calorie item"
✅ CAPS for emphasis MAX once per line
✅ Forward-looking in negative situations: "Tomorrow is what matters"

❌ Never mentions body weight, appearance, or scales
❌ Never says "Congratulations!" (too corporate)
❌ Never writes > 2 sentences
❌ Never uses clinical/nutritionist language
```

### Chip Sizes by Context
```
Onboarding Step 1:  size=150   (hero entrance, the star)
Roast screen:       size=130   (star of the roast)
Snap loading:       size=130   (centered, key moment)
Dashboard:          size=100   (present but not dominating)
Result screen:      size=80    (small reaction, not the focus)
Empty/error states: size=80    (comforting but secondary)
Profile header:     size=64    (decorative)
```

---

## 10. Component Patterns

### Standard Card
```css
background: #1A1A24;
border: 1px solid #2A2A3A;
border-radius: 20px;
box-shadow: 0 2px 12px rgba(0,0,0,0.30);
padding: 20px;
```

### Macro-Tinted Card (used in result screen)
```css
background: [macro-color] at 10% opacity;
border: 1px solid [macro-color] at 30% opacity;
border-radius: 16px;
padding: 16px;
```

### Primary Button
```css
background: #FF6B35;
color: #FFFFFF;
height: 56px;
border-radius: 14px;
font: DM Sans 16px 600;
width: 100%;
/* Press: scale(0.96) 120ms → scale(1.0) 200ms spring */
```

### Input Field
```css
background: #22222F;
border: 1px solid #2A2A3A;
border-radius: 12px;
height: 52px;
padding: 0 16px;
font: DM Sans 16px;
color: #FFFFFF;
/* Focus: border: 2px solid #FF6B35; box-shadow: 0 0 0 3px rgba(255,107,53,0.15) */
```

### Speech Bubble (Chip)
```css
background: #22222F;
border: 1px solid #2A2A3A;
border-radius: 14px;
padding: 10px 14px;
max-width: 200px;
font: DM Sans 14px;
/* Tail: 8px rotated square, same bg, positioned toward Chip */
/* Enter: scale(0.7)→scale(1.0) spring animation */
```

---

## 11. Accessibility
```
Touch targets:    48×48px minimum — all interactive elements
Color contrast:   4.5:1 minimum — all body text on dark bg (WCAG AA)
Reduced motion:   @media (prefers-reduced-motion: reduce) → kill all animations
Screen readers:   aria-label on Chip, rings, nav items, buttons
Focus visible:    2px solid #FF6B35 ring on keyboard focus
Images:           alt text on all food photos
Font scaling:     rem units throughout, respects system font size
```

---

*End of DESIGN_SYSTEM.md v3.0*
