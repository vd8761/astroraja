---
name: astro-life-report
description: "Generate deeply personalized life transformation reports using a three-act framework — Karmic Loop (Raasi + Lagnam), Soul Purpose (D9 Navamsa derived from Nakshatra + Padam), and Breaking the Karma (D9-driven situation guidance). Trigger when user provides Name + Raasi + Lagnam + Nakshatra + Padam and asks for any life report, transformation guide, karmic pattern analysis, soul purpose report, or situation handling guide. Also trigger for: 'generate a life report', 'create a transformation report', 'analyze my raasi and lagnam', 'what is my soul purpose', 'how do I break my karmic loop', relationship dynamics, parenting guides, or health+wealth systems. Auto-derives D9 Navamsa from Nakshatra + Padam. Opens with a fixed philosophical preamble in every report. Produces a deeply personalized 14-section Word document (.docx)."
---

# Astro Life Transformation Report — Complete Skill Guide

## What This Skill Does

Takes astro details + real-life context and generates brutally honest, deeply personalized life transformation documents. This is NOT a generic horoscope. It is behavioral psychology dressed in astrological language.

## Report Types This Skill Can Generate

| Type | Inputs Needed | Output |
|------|--------------|--------|
| **Life Transformation Report** | Name, Raasi, Lagnam, Nakshatra + Padam (D9 auto-derived), Struggles, Goals | Full 18-section .docx — Preamble + 4 Framework Blocks: Cosmic Blueprint, Karmic Loop, 4-Step Action Plan, Summary Table + D9 Situation Handling |
| **Relationship Dynamics Report** | Two people's Name, Raasi, Lagnam + relationship type | 8-section comparison + practical fixes |
| **Child Parenting Guide** | Child's Name, Raasi, Lagnam + parent's combination + age range | Age-specific parenting strategies |
| **Health + Wealth System** | Person's combination + current health/money situation | Integrated daily system document |
| **Daily Reminder** | Extracted from full report | Condensed 3-4 page daily reference |

---

## STEP 1: COLLECT INPUTS

### Round 1: Astro Details
Ask for (or extract from user's message):
- **Name**
- **Raasi** (Moon Sign) — Tamil or English
- **Lagnam** (Ascendant) — Tamil or English  
- **Nakshatra** (Birth Star) — with padam if available
- **D9 Lagna / Navamsa Lagna** (Soul Sign) — optional but highly recommended; if not provided, note in the report that the Soul's Engine layer is incomplete and base D9 insights on the Nakshatra's ruling planet as a proxy

### Tamil-English Mapping
| Tamil | English | Element | Ruling Planet |
|-------|---------|---------|---------------|
| Mesham (மேஷம்) | Aries | Fire | Mars / Sevvai |
| Rishabam (ரிஷபம்) | Taurus | Earth | Venus / Sukran |
| Mithunam (மிதுனம்) | Gemini | Air | Mercury / Budhan |
| Kadagam (கடகம்) | Cancer | Water | Moon / Chandran |
| Simmam (சிம்மம்) | Leo | Fire | Sun / Surya |
| Kanni (கன்னி) | Virgo | Earth | Mercury / Budhan |
| Thulam (துலாம்) | Libra | Air | Venus / Sukran |
| Viruchigam (விருச்சிகம்) | Scorpio | Water | Mars / Sevvai |
| Dhanusu (தனுசு) | Sagittarius | Fire | Jupiter / Guru |
| Makaram (மகரம்) | Capricorn | Earth | Saturn / Sani |
| Kumbam (கும்பம்) | Aquarius | Air | Saturn / Sani |
| Meenam (மீனம்) | Pisces | Water | Jupiter / Guru |

### Round 2: Life Context (Use ask_user_input_v0 tool)

**Question 1: "What are [Name]'s biggest current struggles?"** (multi_select)
Options: "Money / Debt / Income instability", "Health anxiety / Fear", "Relationship / Marriage stress", "Family pressure / Guilt", "Career confusion / No direction", "Overthinking / Analysis paralysis", "Anger / Frustration / Impatience", "Lack of confidence / Self-doubt", "Loneliness / Feeling misunderstood", "Emotional overwhelm / Sensitivity", "Commitment issues", "Work-life imbalance"

**Question 2: "What does [his/her] daily life look like?"** (single_select)
Options: "Heavy travel — rarely home", "Office job — mostly one place", "Work from home", "Entrepreneur / Own business", "Homemaker", "Hectic — no fixed pattern", "Student"

**Question 3: "What is [his/her] biggest life goal right now?"** (single_select)
Options: "Financial stability / Clear debt", "Better family relationships", "Find life purpose / Career clarity", "Inner peace / Stop overthinking", "Build a business / Grow income", "Recognition / Be valued", "Independence / Freedom", "Health improvement", "Build confidence / Self-worth"

If user selects "all" for any question, treat ALL options as active and address every single one in the report.

---

## STEP 2: ANALYZE THE COMBINATION

### How Raasi and Lagnam Work Together

**Raasi (Moon Sign)** = Inner operating system
- How they FEEL, process emotions, what they need for safety
- The REAL person nobody sees unless very close
- Runs 24/7 automatically — the default driver

**Lagnam (Ascendant)** = Outer interface
- How they APPEAR, handle problems, approach life
- The version the world sees
- Can be trained to lead (this is the transformation goal)

### The Core Analysis Framework

For EVERY combination, identify:

1. **The inner vs outer gap** — What they feel inside vs what they show outside
2. **The core conflict** — Where Raasi and Lagnam pull in opposite directions
3. **The unique loop** — The specific repeating cycle for THIS combination (never generic)
4. **The karmic lesson** — What this person's combination is trying to teach them
5. **The animal metaphor** — Use the zodiac symbols to create a memorable identity statement

### Element Interaction Guide

| Combination | Dynamic | Core Pattern |
|-------------|---------|-------------|
| Fire + Fire | Pure intensity, no brake | Burnout, scattered energy, needs discipline |
| Earth + Earth | Pure stability, no movement | Stuck, rigid, needs to MOVE |
| Water + Water | Pure emotion, no boundaries | Drowning, absorbing, needs shores |
| Air + Air | Pure thought, no grounding | Scattered, uncommitted, needs depth |
| Fire + Earth | Vision vs caution | Dreams big, moves slow, needs bridge between planning and doing |
| Fire + Water | Passion vs emotion | Explosive or steaming, needs emotional regulation |
| Fire + Air | Ideas + energy | Exciting but scattered, needs focus and commitment |
| Earth + Water | Stability vs emotion | Absorbs and holds, needs release mechanisms |
| Earth + Air | Practical vs intellectual | Overthinks the practical, needs to decide faster |
| Water + Air | Feeling vs thinking | Analyzes feelings endlessly, needs action as cure |

### Same Sign Raasi + Lagnam (Double Signs)
When Raasi and Lagnam are the SAME sign: there is NO internal conflict, which sounds good but means NO counterbalance. The traits are doubled — both strengths AND weaknesses amplified. The report should emphasize: "Your greatest power is also your greatest trap because there's no opposing force to balance it."

### Nakshatra Layer
The nakshatra adds a THIRD dimension. Key nakshatras and their impact:
- **Mars-ruled** (Mirugasirisam, Chithirai, Avittam): Adds restlessness, search drive, hidden fire
- **Saturn-ruled** (Poosam, Anusham, Uttirattathi): Adds karmic weight, delayed rewards, endurance
- **Sun-ruled** (Krithikai, Uttram, Uthiradam): Adds intensity, sharp mind, leadership but criticism
- **Venus-ruled** (Bharani, Puram, Pooradam): Adds creativity, luxury desire, beauty sense
- **Jupiter-ruled** (Punarvasu, Visakam, Poorattathi): Adds expansion, teaching instinct, spiritual depth
- **Mercury-ruled** (Aaslesha, Jyeshta, Revathi): Adds intelligence, communication, sometimes manipulation
- **Moon-ruled** (Rohini, Hastam, Thiruvonam): Adds emotional depth, nurturing, material comfort
- **Ketu-ruled** (Aswini, Makam, Moolam): Adds spiritual depth, detachment, past-life wisdom
- **Rahu-ruled** (Thiruvathirai, Swathi, Sathayam): Adds unconventional thinking, ambition, restlessness

### The Navamsa (D9) Layer — Soul's Engine

The **Navamsa Lagna (D9 Lagna)** is the third and deepest dimension of the chart, beyond Raasi and Lagnam. It reveals:
- The **soul's true evolutionary direction** — what the person is being pushed toward in the second half of life
- The **core virtues** the person must embody (not just perform)
- The **internal blueprint** that overrides Raasi instincts when the person is operating at their highest level

#### D9 Lagna — Sign Meanings

| D9 Lagna | Soul Direction | Core Virtue | Shadow Risk |
|----------|---------------|-------------|-------------|
| Aries | Lead with courage, stop waiting for permission | Bold initiative | Reckless impatience |
| Taurus | Build slowly, create lasting value | Steadfast patience | Stubborn inaction |
| Gemini | Communicate truth, share knowledge | Clarity and expression | Scattered surface-level living |
| Cancer | Nurture with wisdom, not guilt | Compassionate boundaries | Emotional martyrdom |
| Leo | Lead visibly, own your throne | Dignified authority | Ego-driven control |
| Virgo | Serve with precision, master your craft | Disciplined excellence | Critical paralysis |
| Libra | Create harmony through fairness | Principled balance | People-pleasing avoidance |
| Scorpio | Transform through surrender | Deep trust and release | Control and manipulation |
| Sagittarius | Teach what you've lived | Philosophical wisdom | Preaching without practice |
| Capricorn | Build institutions, not just income | Structured integrity | Cold ambition without heart |
| Aquarius | Serve the collective, not just the self | Visionary detachment | Emotional disconnection |
| Pisces | Dissolve ego, trust the flow | Spiritual surrender | Escapism and avoidance |

#### How to Use D9 in the Report
- In **Section 1**: Add D9 Lagna as a third row in the Astro Foundation table
- In **Section 5 (Core Life Loop)**: Explain the loop using all three layers — Raasi drives it emotionally, Lagnam executes it physically, D9 shows the way OUT
- In **Section 6 (Karmic Patterns)**: Frame karmic loops as the gap between Raasi default behavior and D9 soul direction
- In **Section 11 (Karmic Break Method)**: The break method must be rooted in the D9 Lagna's core virtue — NOT generic advice

#### Gana (Nature Type) — Derived from Nakshatra (PRIMARY SOURCE)

**Gana is ALWAYS determined by Nakshatra — not by Raasi sign.** The sign-based mapping is secondary and only used as a fallback when Nakshatra is unknown.

### Complete 27 Nakshatra → Gana Mapping

| # | Nakshatra (Tamil) | Nakshatra (English) | Ruling Planet | Gana | Padam Element Cycle |
|---|-------------------|---------------------|---------------|------|---------------------|
| 1 | அஸ்வினி (Aswini) | Aswini | Ketu | **Deva** | Aries × (Aries, Taurus, Gemini, Cancer) |
| 2 | பரணி (Bharani) | Bharani | Venus | **Manushya** | Aries × (Leo, Virgo, Libra, Scorpio) |
| 3 | கார்த்திகை (Krithikai) | Krittika | Sun | **Rakshasa** | Aries/Taurus × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 4 | ரோகிணி (Rohini) | Rohini | Moon | **Manushya** | Taurus × (Aries, Taurus, Gemini, Cancer) |
| 5 | மிருகசீரிஷம் (Mirugasirisam) | Mrigashira | Mars | **Deva** | Taurus/Gemini × (Leo, Virgo, Libra, Scorpio) |
| 6 | திருவாதிரை (Thiruvathirai) | Ardra | Rahu | **Manushya** | Gemini × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 7 | புனர்பூசம் (Punarvasu) | Punarvasu | Jupiter | **Deva** | Gemini/Cancer × (Aries, Taurus, Gemini, Cancer) |
| 8 | பூசம் (Poosam) | Pushya | Saturn | **Deva** | Cancer × (Leo, Virgo, Libra, Scorpio) |
| 9 | ஆயில்யம் (Aayilyam) | Ashlesha | Mercury | **Rakshasa** | Cancer × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 10 | மகம் (Magam) | Magha | Ketu | **Rakshasa** | Leo × (Aries, Taurus, Gemini, Cancer) |
| 11 | பூரம் (Puram) | Purva Phalguni | Venus | **Manushya** | Leo × (Leo, Virgo, Libra, Scorpio) |
| 12 | உத்திரம் (Uthiram) | Uttara Phalguni | Sun | **Manushya** | Leo/Virgo × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 13 | அஸ்தம் (Hastam) | Hasta | Moon | **Deva** | Virgo × (Aries, Taurus, Gemini, Cancer) |
| 14 | சித்திரை (Chithirai) | Chitra | Mars | **Rakshasa** | Virgo/Libra × (Leo, Virgo, Libra, Scorpio) |
| 15 | சுவாதி (Swathi) | Swati | Rahu | **Deva** | Libra × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 16 | விசாகம் (Visakam) | Vishakha | Jupiter | **Rakshasa** | Libra/Scorpio × (Aries, Taurus, Gemini, Cancer) |
| 17 | அனுஷம் (Anusham) | Anuradha | Saturn | **Deva** | Scorpio × (Leo, Virgo, Libra, Scorpio) |
| 18 | கேட்டை (Kettai) | Jyeshtha | Mercury | **Rakshasa** | Scorpio × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 19 | மூலம் (Moolam) | Mula | Ketu | **Rakshasa** | Sagittarius × (Aries, Taurus, Gemini, Cancer) |
| 20 | பூராடம் (Pooradam) | Purva Ashadha | Venus | **Manushya** | Sagittarius × (Leo, Virgo, Libra, Scorpio) |
| 21 | உத்திராடம் (Uthiradam) | Uttara Ashadha | Sun | **Manushya** | Sagittarius/Capricorn × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 22 | திருவோணம் (Thiruvonam) | Shravana | Moon | **Deva** | Capricorn × (Aries, Taurus, Gemini, Cancer) |
| 23 | அவிட்டம் (Avittam) | Dhanishtha | Mars | **Rakshasa** | Capricorn/Aquarius × (Leo, Virgo, Libra, Scorpio) |
| 24 | சதயம் (Sathayam) | Shatabhisha | Rahu | **Rakshasa** | Aquarius × (Sagittarius, Capricorn, Aquarius, Pisces) |
| 25 | பூரட்டாதி (Poorattathi) | Purva Bhadrapada | Jupiter | **Manushya** | Aquarius/Pisces × (Aries, Taurus, Gemini, Cancer) |
| 26 | உத்திரட்டாதி (Uttirattathi) | Uttara Bhadrapada | Saturn | **Manushya** | Pisces × (Leo, Virgo, Libra, Scorpio) |
| 27 | ரேவதி (Revathi) | Revati | Mercury | **Deva** | Pisces × (Sagittarius, Capricorn, Aquarius, Pisces) |

---

### Padam → D9 Navamsa Derivation (Auto-calculate from Nakshatra + Padam)

Each Nakshatra has 4 Padams. Each Padam maps to one Navamsa (D9) sign in a cycle starting from the Nakshatra's group:
- **Nakshatras 1–3 cycle starts at Aries** (Padams: Aries, Taurus, Gemini, Cancer)
- **Nakshatras 4–6 cycle starts at Leo** (Padams: Leo, Virgo, Libra, Scorpio)
- **Nakshatras 7–9 cycle starts at Sagittarius** (Padams: Sagittarius, Capricorn, Aquarius, Pisces)
- This 3-group cycle repeats across all 27 Nakshatras

**Quick Padam → D9 Rule:**
- Padam 1 → Group start sign
- Padam 2 → Group start + 1 sign
- Padam 3 → Group start + 2 signs
- Padam 4 → Group start + 3 signs

**Example:** Aayilyam (Ashlesha), Padam 3 → Group starts at Sagittarius → Padam 3 = Aquarius → D9 Lagna = Aquarius

**Always derive D9 from Nakshatra + Padam before building the report. Never assume or skip this step.**

---

### The Three Gana Types — Deep Behavioral Profile

| Gana | Core Nature | Stress Instinct | Communication Style | Karma Pattern | Soul Upgrade |
|------|-------------|-----------------|--------------------|--------------| -------------|
| **Deva Gana** (Divine) | Seeks fairness, truth, higher meaning | Idealizes, hopes, waits for things to fix themselves | Diplomatic, indirect, dislikes confrontation | Avoids hard truths → creates loops of unresolved situations | Learn to speak uncomfortable truths directly |
| **Manushya Gana** (Human) | Weighs, calculates, feels deeply | Analyzes the problem endlessly, gets stuck in emotion | Practical, relational, personal | Overthinks → delays action → creates pressure → emotional crash | Learn to decide faster and act before certainty arrives |
| **Rakshasa Gana** (Intense) | All-or-nothing, fierce, uncompromising | Goes completely in OR completely out — no middle | Direct, blunt, sometimes brutal | Burns bridges → isolation → rebuilds alone → burns again | Learn to hold intensity without destroying what it touches |

---

### Gana Conflict Detection (Critical for Section 2)

When the **Nakshatra Gana conflicts with the Raasi's natural Gana tendency**, it creates a specific inner war. Always flag this.

| Conflict Type | What It Creates | Report Language |
|---------------|-----------------|-----------------|
| Deva Nakshatra + Rakshasa-tendency Raasi | Intense soul, gentle surface — the person feels like a storm wrapped in silk | "You carry a fire inside that your instincts keep trying to put out." |
| Rakshasa Nakshatra + Deva-tendency Raasi | Soft soul, fierce reactions — overreacts then feels guilty | "You strike hard and then spend days wondering if you were wrong to." |
| Manushya Nakshatra + Deva-tendency Raasi | Overthinks the ideal — waits for perfect conditions that never come | "You know exactly what's right. You're still waiting for permission to do it." |
| Rakshasa Nakshatra + Manushya-tendency Raasi | Calculates deeply then acts with full intensity — no half measures | "You think like a human and move like a force of nature. The gap between thought and action is where damage happens." |
| Deva Nakshatra + Manushya-tendency Raasi | Feels deeply but presents as composed — unprocessed emotion builds silently | "You absorb everything and show nothing. The weight accumulates invisibly." |
| Manushya Nakshatra + Rakshasa-tendency Raasi | Intense outer, calculating inner — appears fierce but is constantly second-guessing | "You roar on the outside and negotiate on the inside. Nobody sees the doubt." |

---

### How Gana Feeds Into the Three Acts

**ACT 1 (Karmic Loop):**
- Gana determines HOW the loop is run — the emotional style of getting stuck
- Deva loops: waiting, hoping, avoiding
- Manushya loops: analyzing, calculating, delaying
- Rakshasa loops: exploding, withdrawing, rebuilding, exploding again

**ACT 2 (Soul Purpose):**
- Gana reveals the FUEL TYPE the person runs on when aligned with D9
- Deva + aligned D9: becomes a principled guide or truth-teller
- Manushya + aligned D9: becomes a precise, empathetic builder
- Rakshasa + aligned D9: becomes an unstoppable force with a clear mission

**ACT 3 (Breaking the Karma):**
- Gana determines the RESISTANCE STYLE when trying to change
- Deva: will intellectualize the change but resist emotional discomfort
- Manushya: will plan the change endlessly but resist committing
- Rakshasa: will change completely or not at all — no gradual
- The D9 situation guidance must account for the Gana resistance style

---

## STEP 2B: THE COSMIC BLUEPRINT ANALYSIS (New Framework)

When the user provides D9 Lagna details, build a **4-layer analysis** before writing the report:

### Layer 1 — The Three Pillars

| Pillar | Astrological Source | What It Governs |
|--------|--------------------|-----------------| 
| Earthly Anchor | Lagnam | Physical body, environment, daily navigation |
| Internal Mind & Filter | Raasi + Gana | Emotional defaults, stress reactions, instincts |
| Soul's Engine | D9 / Navamsa Lagna | Core virtues, evolutionary direction, second-half-of-life purpose |

For each person: identify where the three pillars **align** (natural ease) and where they **conflict** (the source of their core struggle).

### Layer 2 — The 4-Step Karmic Action Plan

Build this in **Section 11** when D9 data is available:

**Step 1 — The Mindset Pivot**
Identify the specific mental trap the Raasi defaults to → name the D9-directed thought pattern that must replace it.
Example: "Your Raasi (Cancer) defaults to 'I must protect everyone.' Your D9 (Capricorn) says: 'Build the structure — the structure protects everyone.'"

**Step 2 — The Core Karmic Release (Detachment)**
Name the ONE behavioral attachment that is generating the most negative karma for this exact combination.
Be brutal and specific — not "let go of the past" but "stop replaying that one conversation from 3 years ago every morning before you get out of bed."

**Step 3 — The Physical Material Anchor**
Translate the soul direction into a daily non-negotiable — one financial, one career, one time boundary.
Example: "No money decisions after 8pm. One boundary per week that protects your income. No discount offers for people who drain you."

**Step 4 — Daily/Weekly Activation Rituals**
Based on the ruling planets of Raasi, Lagnam, and D9:
- Identify the **dominant planet** (the one that appears most across all three pillars)
- Name its **best day** (Sun=Sunday, Moon=Monday, Mars=Tuesday, Mercury=Wednesday, Jupiter=Thursday, Venus=Friday, Saturn=Saturday)
- Suggest **one charitable act (Dana)** aligned with that planet
- Suggest **one practical remedy** (not religious ritual — behavioral alignment, e.g., "speak your truth to one person every Thursday")

### Layer 3 — The Choice Matrix (Shadow vs Soul Path)

Add this as a **standalone table** in Section 9 (React vs Create), when D9 data is available:

| Astrological Factor | Element | Shadow Trap | Soul Path to Success |
|--------------------|---------|-------------|----------------------|
| Raasi (Moon) | [element] | [specific emotional trap] | [specific emotional upgrade] |
| Lagnam (Body) | [element] | [specific behavioral trap] | [specific behavioral upgrade] |
| D9 (Soul) | [element] | [specific avoidance pattern] | [specific evolutionary action] |
| Nakshatra | [ruling planet] | [specific compulsion] | [specific activation] |

**Rule**: Each row must be so specific that the person reads it and says "how did you know that about me?"

### Layer 4 — Situation Handling via D9 (Crisis Protocol)

Add this to **Section 10D** (Emotional Control):

When facing a crisis (debt, conflict, business failure, relationship breakdown):

1. **Zoom Out, Don't Panic** — Raasi will want to react emotionally. D9 Lagna says: [specific philosophical reframe for this D9 sign]
2. **Dharma First** — Name the one integrity rule this person must NEVER break, specific to their D9 direction
3. **Business/Career Restructure Signal** — When should this person stop what they're doing and pivot? Name the specific trigger for THIS combination (not generic)

---

## STEP 3: BUILD THE REPORT

### THE THREE-ACT SPINE (Core Framework — Everything Must Serve This)

Every report tells ONE complete story across three acts. Every section must serve one of these three acts. Never lose this thread.

**ACT 1 — THE KARMIC LOOP** *(Sections 1–7)*
> "Here is the cycle you are trapped in — and why you keep returning to it."
- Driven by **Raasi + Lagnam** — the emotional default and the physical habit
- Together they create an unconscious repeating loop
- Name it brutally and specifically — not "you overthink" but the exact sequence unique to THIS combination
- The reader must feel: *"This is exactly my life. How does it know?"*

**ACT 2 — THE SOUL PURPOSE** *(Sections 8–10)*
> "Here is who you actually are underneath the loop — and what you were built to become."
- Driven by **D9 Navamsa** — derived from Nakshatra + Padam — the soul's true character
- Not an abstract spiritual goal — a specific personality with specific wisdom and a specific way of seeing the world
- The reader must feel: *"Oh. THAT is who I am when I am at my best."*

**ACT 3 — BREAKING THE KARMA** *(Sections 11–14)*
> "Here is exactly how to use your soul character to step out of the loop — situation by situation."
- When situation X hits → Raasi reacts emotionally → Lagnam defaults to habit → **D9 says: do THIS instead**
- Concrete decision framework for real life situations the user named
- The reader must feel: *"I know exactly what to do now."*

**THE THREE-ACT STORY** (write this mentally before building the report):
> *"[Name] is trapped in a loop their [Raasi] emotions and [Lagnam] habits built together. Underneath that loop lives a completely different person — their [D9] soul character. That character already knows how to break every cycle they are in. This report shows them how."*

---

### FIXED OPENING: PHILOSOPHICAL PREAMBLE (in EVERY report, before Section 1)

Appears immediately after the report title and unique subtitle — on its own page.
Title: **"A Message Before You Begin"**
Format: Centered italic text, blue top and bottom border (#1A3C5E), generous paragraph spacing.

---

The whole idea behind this report is not just to provide astrological guidance or simply reflect your characteristics.

One important assumption is that astrology is a gift deeply rooted in Indian tradition. If we look back from ancient times, a vast amount of knowledge has been embedded within it. In many ways, we can say this is a combination of mathematics and science.

When you observe how numbers have been used and interpreted in astrology, it almost feels magical. Considering the world's massive population, this mathematical system has worked in such a way that every individual can still be understood as unique. Based on these mathematical calculations, various aspects are interpreted through general horoscope analysis.

The purpose of this report goes beyond predicting events. We believe that every person has a soul purpose. When you identify that purpose clearly and begin to align your life with it, your karmic patterns gradually start to clear. And when these karmic blocks are neutralized, there is a greater possibility for positive transformations to happen in your life.

Going to temples and performing remedies may help on one side, but beyond all that, the best way is to consciously neutralize our karmic actions through awareness and right action. The faster we understand ourselves and move towards our true path, the more meaningful our journey becomes.

This report has been designed with that intention — to help you target and understand these deeper aspects of your life. It can definitely serve as a source of guidance for you. Use this guidance, take action, and move forward with clarity.

Our best wishes to you. But remember, without taking action, it is impossible to achieve meaningful change.

— Thank you.

---

**Document formatting for preamble block:**
- Own page (page break after it, before Section 1)
- Title "A Message Before You Begin" — H1 style, centered, color #1A3C5E
- Body: Aptos Italic, size 19, color #2C2C2C, centered
- Top and bottom border: thick blue line (#1A3C5E)
- Space after each paragraph: 160
- Closing "— Thank you." — bold italic, centered

---

### The 18 Sections (STRICTLY FOLLOW — expanded from 14)

Every report MUST contain all 18 sections. Quality over speed — each section must be specific to THIS exact combination, never generic. Every section must clearly serve one of the three acts.

The report is now structured around 4 named framework blocks that span the 18 sections:

| Framework Block | Sections | Act |
|----------------|----------|-----|
| BLOCK 1: The Cosmic Blueprint of Your Life | Sections 1–2 | Act 1 |
| BLOCK 2: The Karmic Loop & Root Patterns | Sections 3–7 + 7B | Act 1 |
| BLOCK 3: The 4-Step Karmic Action Plan | Sections 8–11 | Acts 2 & 3 |
| BLOCK 4: Summary Table + Situation Handling via Soul Purpose | Sections 12–14 | Act 3 |
| Closing Sections | Sections 15–17 | Act 3 |

**REMOVED:** Section 11 (90-Day Commitment), Section 18 (90-Day Roadmap), Section 10D (Emotional Control), Section 10E (Relationship System) — folded into Step 2 of Section 9

---

### BLOCK 1: THE COSMIC BLUEPRINT OF YOUR LIFE
*Purpose: Show the reader exactly how their three astrological pillars work — and why they must work together.*

#### Section 1: THE COSMIC BLUEPRINT — Three Pillars Visual
This is the opening visual of the report. It must feel like a mirror the reader has never seen before.

**Sub-section A — Three-Pillar Visual Table (three columns, styled distinctly)**

| YOUR EARTHLY ANCHOR | YOUR INTERNAL MIND & FILTER | YOUR SOUL'S ENGINE |
| Lagnam / Ascendant | Raasi + Gana + Nakshatra | Navamsa / D9 Lagna |
| The physical body, environment, and the practical vehicle used to navigate daily life | The emotional default setting, mental conditioning, intuition, and how this person instinctively reacts to stress | The true internal blueprint, core virtues, and the evolutionary direction the soul must take — especially in the second half of life |

For each pillar, include:
- Sign name (Tamil + English)
- Symbol
- Element + Ruling Planet
- Core nature in one sentence
- Gana (for Raasi pillar) — with stress reaction
- One-line description of what this pillar controls in this person's life

**Sub-section B — How the Three Pillars Interact**
- Paragraph: Where the three pillars ALIGN — where body, mind, and soul naturally support each other
- Paragraph: Where the three pillars CONFLICT — the specific tension that creates this person's core struggle
- Quote block: The identity sentence that captures the three-pillar dynamic in one line

**Sub-section C — Nakshatra + Gana Integration**
- Nakshatra name, ruling planet, Gana type
- How the Gana shapes the person's stress reaction (Deva = idealises and waits / Manushya = calculates and delays / Rakshasa = goes all-in or walks away)
- Gana Conflict callout if Nakshatra Gana clashes with Raasi tendency — with the specific conflict sentence from the skill

**FORMATTING:**
- Three-column visual with distinct background colours per pillar (physical = warm, mind = cool blue, soul = gold)
- Each pillar labelled with its role title in bold
- Conflict rows highlighted in red; alignment rows in green

---

#### Section 2: CORE COMBINATION TRUTH
- **Table**: Inner World (Raasi) vs Outer Approach (Lagnam) — 6-8 contrasting rows covering: decision-making, pressure response, money, relationships, when wronged, goals, self-image, fear
- **The War or Agreement paragraph**: Name the specific dynamic between Raasi and Lagnam — is it a war (opposing elements) or a dangerous agreement (same element amplifying the same trap)?
- **D9 as the third voice**: One paragraph on what the D9 Navamsa says about both — how it sees the Raasi-Lagnam dynamic and what it requires instead
- **Identity statement as quote block**: One powerful first-person sentence using the zodiac animal metaphors

---

### BLOCK 2: THE KARMIC LOOP & ROOT PATTERNS
*Purpose: Name the trap so clearly the reader cannot unsee it.*

#### Section 3: CHARACTER PROFILE
- **Two-column table**: Strengths (green header) vs Shadow Weaknesses (red header) — 8-10 rows
- Each strength MUST have a corresponding shadow weakness showing how the same trait creates the karmic trap
- Weaknesses must be genuinely uncomfortable — if the reader doesn't wince, it's too soft
- Final row: The core paradox — the single sentence that captures how this combination's greatest strength IS its greatest trap

#### Section 4: LIFE AREA IMPACT
- **Three-column table**: Life Area | How combination shows up | The hidden cost
- Cover ALL of: Career, Money, Marriage/Relationships, Family, Health, Mental State, Confidence, Work-Life Balance
- Every cell must be combination-specific — never generic
- Hidden cost column must name the CONSEQUENCE, not just describe the behaviour

#### Section 5: THE CORE LIFE LOOP
*(Most important section — the reader must feel: "This is exactly my life")*
- **Six-row table**: # | Stage Name | What Is Really Happening
- Last row shaded red — the restart point
- Each stage name in bold, explanation specific to THIS Raasi+Lagnam+Nakshatra
- **Why This Loop Exists paragraph**: Explain the psychology — why Raasi + Lagnam + Gana create THIS specific loop and not a generic one
- **The D9 Exit paragraph**: What the D9 Navamsa sees in this loop — and the ONE shift it requires to break it
- **Quote block** with the core loop insight

CRITICAL: Every combination has a DIFFERENT loop — never reuse. Examples:
- Cancer+Taurus: Effort → slow results → emotional crash → fear → consistency drops → money crisis
- Taurus+Aries: Pressure builds → volcano erupts → damage → guilt → silence → pressure again
- Virgo+Taurus: Preparation → standard rises → stall → others advance → self-criticism → retreat deeper
- Double Sagittarius: Vision → launch → boredom → new thing → abandon → restart

#### Section 6: KARMIC PATTERN ANALYSIS
- 3-4 distinct named karmic loops (give each a title)
- Each loop: Trigger → Behaviour → Consequence → Trigger (cycle format)
- Root cause paragraph: What psychological need is being served by EACH pattern
- NOT mystical — every pattern explained as a learned behavioural habit with a specific emotional function

#### Section 7: ROOT PROBLEMS
- **Two-column table**: Problem | How It Shows Up — 7-9 rows
- Map to ALL of the user's stated struggles
- Every description specific and uncomfortable — not generic

---

### BLOCK 3: THE 4-STEP KARMIC ACTION PLAN
*Purpose: Give the reader a clear, step-by-step system to clear karma and unblock material and financial growth.*
*This is the MOST ACTIONABLE block. Every step must be specific to THIS combination — not generic self-help.*

#### Section 7B: CAREER KARMA & WEALTH ACTIVATION
*(New dedicated section — appears after Root Problems, before What Must Be Let Go)*
*(Half a page to one page maximum — clean, precise, high impact)*

**This section derives entirely from the D9 Navamsa sign.**
Use the D9 Reference Table below to generate all three blocks.
Every sentence must be specific to THIS person's D9 — never generic.

---

**FORMAT — Three blocks, one clean section:**

**BLOCK 1 — YOUR KARMIC BLOCK IN CAREER**
- 3–4 sentences: the specific career pattern this D9 creates
- 3 bullet points: exactly where this block shows up in daily work/income
- Must be recognisable — the reader should wince slightly

**BLOCK 2 — YOUR D9 WEALTH ACTIVATION**
- 3–4 sentences: the exact condition under which wealth opens for this D9
- One bold activation statement: the precise shift required
- Name which planet activates (from D10 if birth time available, from D9 dominant planet if not)

**BLOCK 3 — YOUR IDEAL CAREER DIRECTION**
- Two-column table: Work That Clears Karma | Work That Blocks Karma (4–5 rows each)
- One sentence naming the specific field/type of work
- One closing quote block — the single wealth activation line

---

### D9 CAREER KARMA REFERENCE TABLE
*(Use this to generate Section 7B for every report)*

| D9 Sign | Karmic Block in Career | D9 Wealth Activation | Ideal Career Direction |
|---------|----------------------|---------------------|----------------------|
| **Aries** | Acts impulsively — burns opportunities before they mature. Leads aggressively, people don't follow sustainably. Charges ahead without building the foundation. Income bursts then crashes. | Courageous pioneering — first mover energy used with discipline. Wealth opens when action serves others, not just personal ambition. The courage must have a mission beyond the self. | Entrepreneurship, crisis leadership, surgery, defence, competitive sports, new ventures, innovation |
| **Taurus** | Hoards skills and opportunities — waits for perfect security before building. Refuses to invest in growth. Charges too little, holds too long. Income stagnates in comfort. | Patient value creation — builds slowly, permanently, beautifully. Wealth opens when resources are released into growth, not stored in fear. The patience must serve creation, not avoidance. | Finance, land, luxury goods, agriculture, music, architecture, food, long-term wealth management |
| **Gemini** | Communicates to impress — clever, witty, surface-level. Teaching without depth. Multiple income streams started, none consolidated. Credibility is wide but not deep. | Truth-based communication — teaches with clarity and genuine precision. Wealth opens when communication serves real understanding, not performance. One channel, deep and trusted. | Teaching, writing, media, consulting, technology, sales with integrity, knowledge platforms |
| **Cancer** | Over-nurtures — undercharges, cannot say no, creates dependency in clients. Gives care freely then resents the lack of financial return. Income tied to emotional approval. | Wise nurturing as a premium product — genuine emotional safety and care charged correctly. Wealth opens when boundaries are set inside the care. The nurturing must empower, not enable. | Healthcare, counselling, hospitality, food, real estate, childcare, community building |
| **Leo** | Performs to be seen — builds personal brand over actual substance. Needs recognition before delivering full capacity. Charges for image, not for transformation. | Authentic leadership — inspires through genuine vision, not image management. Wealth opens when the work is done without the audience in mind. The lion must lead from truth, not from throne. | Creative direction, education, performing arts, brand leadership, executive coaching, politics |
| **Virgo** | Perfects endlessly — never launches. Undervalues precision as a commodity. Works harder than anyone, charges less than the quality deserves. Invisible excellence. | Mastery as a premium service — precision and systems thinking sold at full value. Wealth opens when the standard is applied to the output, not the launch condition. | Healthcare, engineering, data analysis, quality consulting, editing, process design, research |
| **Libra** | People-pleases — discounts, over-delivers, avoids difficult money conversations. Partnerships drain more than they build. Cannot hold the price when client pushes back. | Fair value exchange — creates genuine harmony as a product. Wealth opens when the fee reflects the balance created, not the approval sought. Every collaboration must be equal. | Law, design, diplomacy, luxury aesthetics, HR, mediation, partnership-based business |
| **Scorpio** | Controls through depth — uses intensity to create dependency in clients or colleagues. Charges too little because the transformation feels too sacred to price commercially. | Transformative depth as premium work — genuine change delivered with clear boundaries. Wealth opens when the depth is offered without the need to control the outcome. | Psychology, research, investigation, wealth management, surgery, occult sciences, crisis transformation |
| **Sagittarius** | Teaches theory without lived experience — loses credibility at the depth level. Charges less because wisdom feels like it should be free. Stalls at the same income ceiling despite genuine capability. | Wisdom through experience — teaches only what has been personally walked through. Wealth opens when the teaching comes from transformation, not from accumulated knowledge. Saturn demands authenticity before rewarding. | Coaching, philosophy, publishing, spiritual guidance, international business, transformative education |
| **Capricorn** | Builds for personal power — creates structures that serve ambition, not the collective. Works with relentless discipline but without dharmic direction. Income grows then hits a structural ceiling. | Integrity-based institution building — creates systems others genuinely depend on. Wealth opens when the structure serves the collective mission, not the personal legacy. | Government, corporate leadership, infrastructure, law, engineering, long-term institution building |
| **Aquarius** | Serves the idea, not the person — disconnected from what people actually need right now. Innovates without a paying market. Vision is genuine but the human connection is missing. | Collective value creation — innovates for genuine, present human need. Wealth opens when the vision touches real people in real situations, not just concepts and systems. | Technology, social enterprise, research, humanitarian work, community platforms, futurism |
| **Pisces** | Escapes into creativity — produces without monetising. Gives without charging. Confuses spiritual service with financial avoidance. The gift is real but the exchange is broken. | Sacred creative economy — creates from genuine depth and charges for real transformation. Wealth opens when receiving is accepted as part of the spiritual exchange, not a contradiction of it. | Art, music, healing, filmmaking, spiritual services, depth psychology, creative transformation |

---

### WRITING RULES FOR SECTION 7B

1. **Never copy the reference table verbatim.** Use it as the source — write the section fresh for this person's combination.
2. **Add the Nakshatra texture.** The D9 gives the direction. The Nakshatra ruler adds the flavour. Example: D9 Sagittarius + Ayilyam (Mercury-ruled) = the karmic block involves sharp, clever teaching that sounds wise but lacks the Saturn-tested depth of lived experience.
3. **Name the specific income pattern.** Not "undercharges" — but "charges ₹X for work worth ₹3X because the Cancer Moon cannot separate care from commerce."
4. **The wealth activation statement must be one sentence, bold, quotable.** Something the person will remember and repeat to themselves.
5. **Career direction is a type of work, not a job title.** "Work where genuine transformation is the product" is more useful than "become a life coach."
6. **If birth time is available — name the specific D10 planet that activates.** Example: "D10 Jupiter in Cancer activates — the wealth channel for nurturing wisdom at scale opens fully."
7. **If birth time is NOT available — name the D9 dominant planet.** Example: "Jupiter as the D9 Sagittarius ruler activates when the teaching comes from lived truth."
8. **Connect to the karmic loop.** The career block must be shown as the same loop running in the career arena — not a separate problem.


---

#### Section 8: WHAT MUST BE LET GO
*(Pre-work before the action plan — clears the ground)*
- **Four-column table**: Let Go Of | Wrong Belief (in quotes) | The Truth | Daily Practice — 6-7 rows
- Daily practices must be SPECIFIC and doable today — not vague
- Quote block at end

#### Section 9: THE 4-STEP KARMIC ACTION PLAN
*(Standalone named section — must be clearly structured as 4 steps)*

This section is the heart of Act 3. Every step must be SPECIFIC to this person's Raasi + Lagnam + D9 combination.

**STEP 1 — THE MINDSET PIVOT**
- Name the specific mental trap the Raasi defaults to (the emotional loop)
- Name the specific mental pattern the D9 Navamsa requires instead (the soul's alternative)
- Format: "Your [Raasi] defaults to: '[exact thought pattern].' Your D9 [sign] says: '[exact replacement thought].'"
- One paragraph expanding on WHY this pivot is the central transformation for this combination
- Quote block capturing the pivot

**STEP 2 — THE CORE KARMIC RELEASE (DETACHMENT)**
- Name the ONE specific behavioural attachment generating the most karma for this combination
- Be brutal and precise — not "let go of the past" but the exact habit, e.g. "stop solving problems that belong to others so you never have to face your own"
- Explain WHY this attachment exists (what psychological need it serves for this Raasi + Lagnam)
- Name the exact opposite action — what releasing it looks like in practice this week
- Format: Bold statement of the attachment → paragraph explaining it → bold statement of the release action

**STEP 3 — THE PHYSICAL MATERIAL ANCHOR**
- **Three-row table**: Domain | Daily Non-Negotiable
- Domains: Financial | Career | Time Boundary
- Each non-negotiable must be a specific, measurable, daily or weekly rule — not an intention
- Examples: "No financial commitment above [threshold] without 24-hour wait" / "One visible leadership claim per month" / "Return one over-responsibility per week"

**STEP 4 — DAILY/WEEKLY ACTIVATION RITUALS**
- Identify the dominant planet across all three pillars (Raasi + Lagnam + D9)
- Name its best day of the week (Sun=Sunday, Moon=Monday, Mars=Tuesday, Mercury=Wednesday, Jupiter=Thursday, Venus=Friday, Saturn=Saturday)
- Name one Dana (charitable act) aligned with that planet's energy
- Name one practical behavioural remedy — not a religious ritual, a specific action aligned with the soul direction
- Format: Four clearly labelled items

#### Section 10: COMPLETE SOLUTION SYSTEM
*(The practical daily operating system)*

**A. Mind Rules** — Table: Rule # | The Non-Negotiable (5 rules, each one sentence, combination-specific)
**B. Daily System** — Table: Time | Activity | Purpose (12-14 rows, must be travel-friendly, no gym required)
**F. Everyday Task System** — See Block 3B (Section 10F) — Planetary Day Guide + Situation Trigger Cards + Weekly Rhythm + Upgraded Checklist with Karmic Why + Sunday Soul-Purpose Review
**C. Money System** — Table: Area | Current Pattern | The Fix | Target (Income, Investing, Spending, Opportunity rows)
**D. Emotional Control** — Specific technique for THIS combination's primary emotional issue (not generic breathing exercises — the exact psychological intervention for this Raasi + Gana pattern)
**E. Relationship System** — The specific fix for this combination's unique relationship pattern (name the pattern, name the fix, give the exact daily practice)


---

### BLOCK 3B: THE EVERYDAY TASK SYSTEM — SOUL-PURPOSE ALIGNED
*Purpose: Give the reader a practical daily operating system where every task is connected to breaking the karmic loop and activating the D9 soul purpose. NOT a generic productivity routine. Every task must have a karmic "why" attached.*

**Core Principle:** Every everyday task in this system serves ONE of three purposes:
1. **Interrupt** — stops the karmic loop from running on autopilot
2. **Anchor** — grounds the person in their physical reality (Lagnam)
3. **Activate** — moves one step toward the D9 soul purpose

Every task must be labelled with its purpose: [INTERRUPT] / [ANCHOR] / [ACTIVATE]

---

#### Section 10F: THE EVERYDAY TASK SYSTEM

*(This section replaces the generic daily routine. It is NOT a time-management schedule — it is a soul-purpose operating system for ordinary days.)*

---

**PART 1 — THE PLANETARY DAY GUIDE**
*(Seven-day weekly rhythm — each day assigned to a planet, each planet assigned a soul-purpose task)*

Build this as a **seven-row table**: Day | Planet | Soul-Purpose Task | Karmic Why

Rules for building this table:
- Assign each day its ruling planet (Sun=Sunday, Moon=Monday, Mars=Tuesday, Mercury=Wednesday, Jupiter=Thursday, Venus=Friday, Saturn=Saturday)
- Cross-reference each planet against the person's three pillars (Raasi ruler / Lagnam ruler / D9 ruler)
- Days whose planet matches a pillar ruler = **Power Days** — mark them clearly
- Days whose planet opposes a pillar ruler = **Challenge Days** — name the specific challenge
- The Soul-Purpose Task must be a SPECIFIC action aligned with that planet's energy AND the D9 soul direction — not a generic affirmation
- The Karmic Why column must name which karmic pattern this task interrupts or which soul virtue it activates

**Example format (DO NOT copy — generate specific to this combination):**
| Sunday | Sun | Write one uncomfortable truth about yourself — not to share, just to see | [INTERRUPT] Sun clarity breaks the Taurus comfort-avoidance pattern |
| Monday | Moon | Name one emotion you are carrying that hasn't been expressed yet | [INTERRUPT] Moon work clears the Virgo-suppressed feeling before it becomes resentment |
| Tuesday | Mars | Take one action you have been preparing but not starting | [ACTIVATE] Mars momentum directly challenges the Double Earth preparation loop |
| Wednesday | Mercury | Have the one conversation you have been delaying | [INTERRUPT] Mercury communication breaks the silent-accumulation pattern |
| Thursday | Jupiter | Identify one area where you are playing small — and name the bigger version | [ACTIVATE] Jupiter expansion aligns with the D9 Scorpio transformation direction |
| Friday | Venus | Invest in one thing that feeds your soul, not just your obligations | [ANCHOR] Venus self-investment builds the material anchor for the D9 path |
| Saturday | Saturn | Review the week: where did I act from fear? Where from purpose? | [INTERRUPT + ACTIVATE] Saturn accountability closes the weekly karmic loop |

**Power Day rule:** On the days whose planet matches the person's dominant pillar ruler — assign a DEEPER task. This is the day the soul speaks loudest. Missing the Power Day task is the most common reason the karmic loop resets.

---

**PART 2 — THE SITUATION TRIGGER CARDS**
*(What to do when specific daily situations arise — D9 soul purpose as the response guide)*

Build as a **four-column table**: Situation | What [Raasi] Wants to Do | What [Lagnam] Wants to Do | What D9 [Sign] Says to Do Instead

Cover these 7 common daily crisis situations — ALL must be specific to this combination:

1. **Financial stress hits** (unexpected bill, income shortfall, money anxiety)
2. **Relationship friction** (argument, silence, feeling unseen or unappreciated)
3. **Work setback** (criticism, failure, being overlooked, project going wrong)
4. **Self-doubt moment** (feeling not good enough, comparing to others, questioning the path)
5. **Overwhelm** (too much to do, too many responsibilities, no bandwidth left)
6. **Anger or frustration spike** (someone crosses a line, unfairness, things not going to plan)
7. **The pull to go back to the old pattern** (the moment the karmic loop tries to restart — the specific trigger for THIS combination)

For each situation:
- The Raasi response must be the specific emotional default for THIS moon sign (not generic)
- The Lagnam response must be the specific physical/behavioural default for THIS ascendant (not generic)
- The D9 response must be the exact soul-purpose aligned action for THIS D9 sign (not generic)
- End each D9 response with the ONE question this D9 sign asks in this situation

**Example for D9 Aquarius + Virgo crisis (DO NOT copy):**
| Financial stress | Virgo: analyse every number, build worst-case scenarios, calculate all possible failures | Taurus: hold position, restrict everything, go still and wait it out | Aquarius D9: zoom out — is this a system problem or a personal failure? What one structural change removes this stress permanently? Ask: "What am I building that outlasts this moment?" |

---

**PART 3 — THE WEEKLY SOUL-PURPOSE RHYTHM**
*(A weekly focus rhythm tied to all three pillars — not time-of-day, but day-of-week intention)*

Build as a **three-column table**: Day of Week | Pillar Focus | Soul-Purpose Intention

Structure:
- **2 days** focused on Lagnam (Earthly Anchor) — practical, physical, material world actions
- **2 days** focused on Raasi (Inner Mind) — emotional processing, releasing stored feelings, communication
- **2 days** focused on D9 (Soul Purpose) — strategic, visionary, soul-aligned work
- **1 day** — Integration day — review all three, close the week's karmic loop

For each day:
- Name the specific focus for THIS combination
- Give one concrete task that serves that pillar
- Label it [ANCHOR], [INTERRUPT], or [ACTIVATE]
- Connect it explicitly to the soul purpose: "This matters because your D9 [sign] needs [specific quality] to activate"

---

**PART 4 — THE UPGRADED DAILY CHECKLIST WITH KARMIC WHY**
*(Replaces the generic checklist — every item has a purpose label and a karmic reason)*

Build as a **three-column table**: ☐ Task | Purpose | Karmic Why

Morning items (7–8 tasks):
- Each task labelled [INTERRUPT] / [ANCHOR] / [ACTIVATE]
- Karmic Why column explains which loop this breaks or which soul quality it builds
- Tasks must be specific to THIS combination — not applicable to everyone

Evening items (5–6 tasks):
- Include one D9 reflection question: "Did I act from [D9 sign] today or from [Raasi] default?"
- Include one karmic loop check: "Did the [specific loop name for this combination] run today? If yes — at which stage did I notice it?"
- Include one soul-purpose progress check: "What is one thing I did today that moved toward [D9 soul direction]?"

**The Non-Negotiable Rule:** The checklist must end with this statement, specific to the combination:
"The one thing that matters most every day for [Name] is: [ONE specific soul-purpose aligned action derived from D9 sign] — because this is the direct path through the [karmic loop name] and toward [D9 soul direction]."

---

**PART 5 — THE SOUL-PURPOSE ALIGNMENT CHECK (Weekly Sunday Review)**
*(A 5-question weekly review — each question tied to one of the five astrological factors)*

Build as a **two-column table**: Question | What the Answer Reveals

The 5 questions (generate specific to this combination):
1. **Lagnam check** (Earthly Anchor): "Did my physical actions this week serve my actual goals — or just my familiar patterns?"
2. **Raasi check** (Inner Mind): "What emotion did I carry this week without expressing? What did I do with it?"
3. **Gana check** (Stress response): "When pressure hit this week, did I [Deva: wait and hope / Manushya: analyse and delay / Rakshasa: go all-in or walk out]? Was that the right response?"
4. **D9 check** (Soul Purpose): "Did I do anything this week that my [D9 sign] soul would call real work? Name it."
5. **Loop check** (Karmic Pattern): "Did [specific loop name] run this week? At which stage did I catch it — or miss it?"

Each question must name the specific default for THIS combination so the person cannot give a vague answer.

---

**FORMATTING RULES FOR SECTION 10F:**
- Each Part has its own H2 heading
- Power Days in Part 1 highlighted in gold
- Challenge Days in Part 1 highlighted in light red
- [INTERRUPT] labels in red text
- [ANCHOR] labels in blue text
- [ACTIVATE] labels in green text
- D9 response rows in the Situation Trigger Cards highlighted in gold
- The Non-Negotiable statement at end of checklist formatted as a quote block
- Soul-Purpose Alignment Check questions formatted as a numbered list with the combination-specific default embedded in each question

#### Section 11: THE 90-DAY KARMIC BREAK COMMITMENT
- **Three-phase table**: Phase | Focus | What Changes
- Phase 1 (Days 1–30): Awareness + First Moves
- Phase 2 (Days 31–60): Communication + Release
- Phase 3 (Days 61–90): Transformation Work
- Each phase specific to this combination's karmic pattern
- Quote block at end

---

### BLOCK 4: SUMMARY TABLE + SITUATION HANDLING VIA SOUL PURPOSE
*Purpose: Give the reader two tools they can use for the rest of their life — a daily decision reference and a crisis navigation protocol.*

#### Section 12: SUMMARY TABLE — WHICH PATH TO CHOOSE?
*(A scannable, standalone reference matrix — the reader should be able to return to this page every day)*

**This is the most important reference table in the report. It must be designed to be used daily, not read once.**

Format: Five-column table

| Astrological Factor | Element | Acting From Fear (Shadow Trap) | Evolving Into Purpose (Soul Path) | Today's Check |
|--------------------|---------|---------------------------------|------------------------------------|---------------|
| Raasi — [Sign] | [Element] | [Specific fear-based behaviour for this Raasi] | [Specific soul-aligned behaviour] | Ask: which am I doing right now? |
| Lagnam — [Sign] | [Element] | [Specific fear-based behaviour for this Lagnam] | [Specific soul-aligned behaviour] | Ask: which am I doing right now? |
| D9 — [Sign] | [Element] | [Specific avoidance pattern for this D9] | [Specific evolutionary action] | Ask: which am I doing right now? |
| Nakshatra — [Name] | [Ruling Planet] | [Specific compulsion / manipulation pattern] | [Specific activation / alignment] | Ask: which am I doing right now? |
| Gana — [Type] | [Nature] | [Specific Gana shadow: Deva=avoids truth / Manushya=delays / Rakshasa=burns] | [Specific Gana upgrade] | Ask: which am I doing right now? |

**Rules for this table:**
- Every row must be so specific that swapping in a different combination would make it wrong
- "Acting From Fear" column must name a specific behaviour — not an emotion
- "Evolving Into Purpose" column must name a specific action — not a virtue
- "Today's Check" column is always the same question — it is the daily self-audit tool

**After the table:**
- One paragraph titled "How to Use This Table Daily" — explain: read it in the morning, pick the one row most relevant today, check at night which column you lived from

---

#### Section 13: HANDLING SITUATIONS USING SOUL PURPOSE — THE D9 NAVIGATION PROTOCOL
*(The most practically powerful section — how to use the D9 Navamsa to navigate real life crises)*

**Opening statement:** "When life throws a crisis at you — debt, conflict, relationship breakdown, business failure, health scare — you have three voices responding. Two of them will make it worse. One of them knows the way through. Here is how to tell them apart."

**Sub-section A — The Three Voices in a Crisis**

| Voice | Source | What It Says | What It Actually Does |
|-------|--------|--------------|----------------------|
| The Emotional Reactor | Raasi (Moon) | [Specific emotional reaction for this Raasi — e.g., "I need to protect everyone, go quiet, absorb the damage"] | Deepens the crisis by activating the karmic loop |
| The Habitual Responder | Lagnam (Ascendant) | [Specific physical/behavioural default for this Lagnam — e.g., "Hold position, endure, do not show weakness"] | Delays transformation by reinforcing the familiar pattern |
| The Soul Navigator | D9 Navamsa | [Specific D9 guidance for this sign — e.g., "Zoom out. This is a system problem, not a personal failure. Serve the situation, not your fear."] | Opens the path through — if listened to |

**Sub-section B — The Core Strategy: Zoom Out, Don't Panic**
- One paragraph: What "zooming out" means specifically for this D9 sign
- The exact question to ask when in crisis: specific to the D9 sign's nature
- Example: D9 Aquarius → "What is the system-level solution here, not just the immediate fix?"
- Example: D9 Scorpio → "What old structure must I release completely — not partially — for transformation to begin?"
- Example: D9 Sagittarius → "What is the larger truth this situation is teaching me — beyond the immediate pain?"
- Format: Quote block with the crisis question for THIS D9 sign

**Sub-section C — The Rules of Engagement (Dharma)**
- Name the ONE integrity rule this person must never break — specific to their D9 direction
- Explain WHY breaking it collapses the D9 path entirely for this combination
- Name the specific temptation this combination faces when under pressure (the shortcut that costs everything)
- Format: Bold rule → paragraph explaining it → bold "Never do this:" statement

**Sub-section D — The Business / Career Transformation Signal**
- Name the specific signal that tells this person they need to stop refining the current approach and transform it
- The signal is combination-specific — it is NOT generic burnout. It is the exact pattern that means: "The D9 is calling for a different level of work"
- Name the transformation: what does moving from execution to strategy / advisory / leadership look like for THIS D9 sign?
- Three specific moves: what to stop doing, what to start doing, what to build
- Format: Signal description → three-row table: Stop | Start | Build

---

#### Section 14: REACT vs CREATE — DAILY DECISION FRAMEWORK
*(Simplified daily reference — companion to Section 12)*
- **Two-column table**: React Mode (red) — Create Mode (green) — 6-7 rows
- Each row: a specific situation this combination commonly faces → the reactive default → the creative choice
- Not generic — every row must be recognisable to THIS person
- **Why Stuck paragraph**: One paragraph on the specific psychological mechanism keeping this combination in react mode
- **The One Question**: End with the single question this person can ask in any moment to shift from react to create — specific to their D9 sign

---

### CLOSING SECTIONS

#### Section 15: IDENTITY SHIFT
- **Two-column table**: Old Identity (red) vs New Identity (green) — 7-9 rows
- All statements in quotes
- Old identity statements must sound FAMILIAR — like something this person has actually thought
- New identity statements must sound POSSIBLE but not yet fully claimed — the stretch, not the fantasy

#### Section 16: FINAL TRUTHS
- **Numbered table**: # | Truth — 10 lines
- Short, hard-hitting, repeatable daily
- Specific to THIS combination and their pain points — if these could apply to anyone, rewrite them

#### Section 17: DAILY CHECKLIST
- **Two-column table**: Morning & Work | Evening & Mindset
- Checkbox format (☐)
- Must include items from EACH of the 4 framework blocks
- Morning: blueprint awareness + action plan items
- Evening: summary table check + D9 navigation review
- Must include combination-specific mindset items — not generic

#### Section 18: 90-DAY TRANSFORMATION ROADMAP
*(New closing section — gives the reader a tangible timeline)*
- **Three-column table**: Week | Focus Area | Specific Action
- Cover Weeks 1–4, 5–8, 9–12
- Each week has one focus area and one specific, measurable action
- Tied to the karmic patterns identified in the report — not generic self-improvement
- Final row: "The Signal You Are Breaking the Loop" — what will be visibly different in 90 days

#### Final Block (after Section 18)
- Centered closing: "REMEMBER THIS EVERY SINGLE DAY"
- 3 affirmation lines — combination-specific, using zodiac animal metaphors
- The closing mantra using all three zodiac symbols (Raasi + Lagnam + D9)
- "START TODAY" call to action with the one first step

---

### THREE-ACT MAPPING (UPDATED)

| Section | Act | Framework Block |
|---------|-----|----------------|
| 1–2 | Act 1 | Block 1: Cosmic Blueprint |
| 3–7 | Act 1 | Block 2: Karmic Loop & Root Patterns |
| 8–11 | Acts 2 & 3 | Block 3: 4-Step Karmic Action Plan |
| 12–14 | Act 3 | Block 4: Summary Table + Situation Handling |
| 15–18 | Act 3 | Closing: Identity, Truths, Checklist, Roadmap |


---

## PAGE CONSTRAINT — MAXIMUM 25 PAGES

**This is a hard limit. Every report must stay within 25 pages.**

### Section Budget (strict — do not exceed):

| Section | Max Pages | Content Rule |
|---------|-----------|-------------|
| Title Page | 1 | Title + subtitle + chart summary + three acts |
| Preamble | 1 | Fixed philosophical text — never expand |
| Cosmic Blueprint Visual | 1 | Three-pillar table only — no extra paragraphs |
| Section 1: Astro Foundation | 1.5 | Foundation table + nakshatra paragraph + Gana sentence + one quote |
| Section 2: Core Combination | 1.5 | Contrast table (6 rows max) + one paragraph + one quote |
| Section 3: Character Profile | 1.5 | Strength/Shadow table (7 rows max) |
| Section 4: Life Area Impact | 1.5 | Life area table (6 rows max — pick most relevant) |
| Section 5: Core Life Loop | 1.5 | Loop table (6 rows) + one paragraph only |
| Section 6: Karmic Patterns | 1 | 2 patterns only — 3 sentences each |
| Section 7: Root Problems | 1 | Table — 5 rows max |
| Section 7B: Career Karma | 1 | Three blocks — strictly half page each |
| Section 9: 4-Step Action Plan | 2 | All 4 steps — 3-4 sentences each, one table |
| Section 10: Solution System | 2 | Mind Rules (5 rows) + Daily System (8 rows) + Money (4 rows) only — remove D and E |
| Section 10F: Daily Task Planner | 1 | Simple table — 7 rows, one task per day |
| Section 12: Summary Table | 1 | Five-row table + one paragraph |
| Section 13: D9 Navigation | 1.5 | Three Voices table + Dharma rule + Business signal — no sub-paragraphs |
| Section 14: React vs Create | 0.5 | Table only (6 rows) + one question |
| Section 15: Identity Shift | 1 | Table (7 rows max) |
| Section 16: Final Truths | 0.5 | 7 truths max — not 10 |
| Section 17: Daily Checklist | 0.5 | Two columns — 6 rows max |
| Closing | 0.5 | Three sentences + mantra + START TODAY |
| **TOTAL** | **~25 pages** | |

---

### SECTIONS REMOVED FROM REPORT (too long, lower impact):
- ❌ Section 11: 90-Day Karmic Break Commitment — REMOVED
- ❌ Section 18: 90-Day Transformation Roadmap — REMOVED
- ❌ Section 10 sub-sections D (Emotional Control) and E (Relationship System) — REMOVED (folded into Section 9 Step 2)

---

### TRIMMING RULES (apply to every section):

1. **Tables: maximum rows as specified above.** Pick the most combination-specific rows — not all possible rows.
2. **Paragraphs: maximum 4 sentences each.** If it needs more — it is two points, not one.
3. **Quote blocks: one per section maximum.** The most powerful line only.
4. **Karmic Patterns: 2 only — not 4.** The two most central patterns for this combination.
5. **Life Areas: 6 only — not 8.** Pick the areas the user flagged as struggles + the most combination-specific ones.
6. **Gana: one sentence per section.** Name how the Gana shows up in THIS context — no explanations.
7. **No repetition across sections.** If a point was made in Section 2, do not restate it in Section 5.
8. **Daily Task Planner: 7 rows — one per day of week.** One task per day. One sentence. No labels or karmic why column — just the task.
9. **Section 13: Three sub-sections only** — Three Voices table + Dharma Rule (2 sentences) + Business Signal (2 sentences + Stop/Start/Build table). No long paragraphs.
10. **Final Truths: 7 lines maximum.** Short, hard-hitting, combination-specific.

---

### GANA USAGE RULE (applies throughout entire report):

- **Derive Gana from Nakshatra — never ask for it separately**
- **Use only THIS person's Gana — never explain or compare to other Ganas**
- **Write Gana naturally — as a descriptor, not as a concept**
- **Maximum one Gana sentence per section**
- **Never use the words "Deva Gana", "Manushya Gana", or "Rakshasa Gana" in the report body** — just describe the behaviour: "your calculating nature", "your all-or-nothing intensity", "your idealistic waiting"

---

### QUALITY CHECK FOR PAGE COUNT:

Before finalising — mentally count:
- How many tables? Each table row = ~0.15 pages
- How many paragraphs? Each paragraph = ~0.2 pages
- How many quote blocks? Each = ~0.15 pages
- If count exceeds budget — cut the weakest rows/paragraphs first


## TECHNICAL SPECS

### Document Format
- **Library**: docx npm (docx-js)
- **Font**: Aptos throughout
- **Body size**: 19 (SZ constant)
- **H1**: size 26, bold, color #1A3C5E, bottom border
- **H2**: size 21, bold, color #2E6B9E
- **Quote blocks**: Left blue border (#2E6B9E), indent 300, italic+bold, color #1A3C5E, size 20
- **Header row**: background #1A3C5E, white text, size 18
- **Alternating rows**: #F0F5FA
- **Red headers**: #CC3333, row shading #FDE8E8
- **Green headers**: #2E8B57, row shading #E8F5E9
- **Table width**: 10080 DXA
- **Page margins**: 820 top/bottom, 1080 left/right
- **Page breaks**: Before sections 5, 7/8, 9, 10, 12/13

### File Output
- Save to: `/mnt/user-data/outputs/[name]_life_transformation_report.docx`
- Present using `present_files` tool
- Validate using: `python /mnt/skills/public/docx/scripts/office/validate.py [filepath]`

---

## WRITING STYLE RULES

### GANA WRITING RULE (Critical)
Never explain Gana as a concept. Never compare to other Ganas. Never use the labels "Deva Gana", "Manushya Gana", "Rakshasa Gana" in the report body.
Instead — describe the behaviour naturally:
- Deva → "your idealistic nature", "your tendency to wait and hope", "your instinct to seek the higher meaning"
- Manushya → "your calculating nature", "your habit of weighing the emotional cost first", "your tendency to delay until certainty arrives"
- Rakshasa → "your all-or-nothing intensity", "your instinct to go completely in or walk away", "your fierce, uncompromising nature"
One sentence per section. Woven in naturally. Never as a header or label.

1. **Direct, not philosophical.** Write like a personal coach who won't sugarcoat.
2. **Uncomfortable truths required.** If the weakness section doesn't make the reader wince, it's too soft.
3. **No vague astrology.** Never: "planetary influences suggest..." Instead: "You hold on because Cancer records and Taurus refuses to delete."
4. **First person for identity statements.** Third person for analysis.
5. **Conversational but intense.** Trusted friend who tells hard truths.
6. **Combination-specific everything.** If you could swap in a different combination and the text still works, it's too generic. REWRITE.
7. **Animal metaphors throughout.** Use the zodiac symbols as a running metaphor — they make abstract psychology tangible and memorable.
8. **Each report gets a UNIQUE subtitle.** Format: "[Animal metaphor] — [Core tension in one line]"
9. **Soul-purpose alignment in every task.** Every daily task, checklist item, weekly ritual, and situation response must connect explicitly to the D9 Navamsa soul direction — not just to fixing the karmic loop. The karmic loop is the problem. The D9 soul purpose is the destination. Every practical instruction must point toward the destination, not just away from the problem.
10. **[INTERRUPT] / [ANCHOR] / [ACTIVATE] labelling.** Every task in Section 10F must carry one of these three labels — and the label must be accurate. INTERRUPT = breaks the karmic loop. ANCHOR = grounds in physical reality. ACTIVATE = moves toward D9 soul purpose. A task that does none of these three things does not belong in the report.
11. **D9 question embedded in every situation response.** Whenever the report tells the person what to do in a situation, the final line must be the ONE question their D9 sign asks. This is the soul speaking — it must be specific to the D9 sign, not generic.

### Subtitle Examples from Built Reports:
- Cancer+Taurus: "The man who carries everyone's weight while pretending his doesn't exist"
- Taurus+Sagittarius: "The Archer who aims at everything and hits nothing"  
- Taurus+Aries+Krithikai: "The Volcano Under the Mountain"
- Leo+Virgo+Puram: "The King Trapped in the Perfectionist's Prison"
- Pisces+Gemini+Uttirattathi: "The Ocean Trapped in the Butterfly's Wings"
- Gemini+Leo+Mirugasirisam: "The Restless King — A Brilliant Mind on a Throne It Can't Sit Still On"
- Double Capricorn+Taurus: "The Immovable Mountain — Built to Last, Stuck in Place"
- Double Sagittarius: "The Archer Who Aims at Everything and Hits Nothing"

### Closing Mantra Format:
Use the zodiac symbols in a three-part statement. Examples:
- "THE BULL DRIVES. THE CRAB ADVISES." 
- "THE FISH SWIM WITH PURPOSE. THE TWINS SPEAK TRUTH. THE OCEAN HAS SHORES."
- "THE GOAT CLIMBS. THE BULL MOVES. THE MOUNTAIN WALKS."
- "THE DEER STOPS RUNNING. THE LION SITS ON THE THRONE. THE TWINS SPEAK AS ONE."

---

## QUALITY CHECKLIST

Before delivering, verify:

### Structure Checks
- [ ] Philosophical preamble "A Message Before You Begin" present on its own page?
- [ ] All 18 sections present and complete?
- [ ] Three-act spine intact — does the report clearly move through Karmic Loop → Soul Purpose → Breaking the Karma?
- [ ] Four framework blocks clearly structured and labelled in the document?
- [ ] Subtitle is unique and memorable — uses animal metaphor + core tension?
- [ ] Closing mantra uses all three zodiac symbols (Raasi + Lagnam + D9)?
- [ ] Document validates successfully?

### Derivation Checks
- [ ] D9 derived correctly from Nakshatra + Padam — shown step by step?
- [ ] Gana derived from Nakshatra (NOT from Raasi sign)?
- [ ] Gana conflict detected and named if Nakshatra Gana clashes with Raasi tendency?
- [ ] Dominant planet identified across all three pillars?

### Block 1 — Cosmic Blueprint Checks
- [ ] Section 1 three-pillar table has all three labels: Earthly Anchor / Internal Mind & Filter / Soul's Engine?
- [ ] Each pillar describes its DOMAIN (physical / emotional-mental / soul-evolutionary) — not just the sign?
- [ ] Raasi pillar includes Gana type AND stress reaction?
- [ ] D9 pillar describes evolutionary direction — second half of life framing?
- [ ] Alignment paragraph AND Conflict paragraph both present?
- [ ] Section 2 D9 as third voice paragraph present?
- [ ] Identity statement uses animal metaphors and is combination-specific?

### Block 2 — Karmic Loop Checks
- [ ] Section 5 loop is UNIQUE to this combination — not reused from another?
- [ ] Section 5 includes D9 Exit paragraph — what the soul sees in the loop?
- [ ] Karmic patterns are behavioural, not mystical?
- [ ] Weaknesses in Section 3 are genuinely uncomfortable — not vague?
- [ ] User's stated struggles mapped in Sections 4 and 7?

### Block 3 — 4-Step Karmic Action Plan Checks
- [ ] Section 9 is clearly structured as 4 named steps?
- [ ] Step 1 (Mindset Pivot): uses exact format "Your [Raasi] defaults to... Your D9 says..."?
- [ ] Step 2 (Karmic Release): names ONE specific behavioural attachment — not a vague directive?
- [ ] Step 3 (Material Anchor): has three domains (Financial / Career / Time) with specific measurable rules?
- [ ] Step 4 (Activation): dominant planet + best day + Dana + practical remedy all present?
- [ ] Section 10 daily system is realistic — travel-friendly, no gym required?
- [ ] Section 11 has all three 90-day phases — specific to this combination's pattern?

### Block 4 — Summary Table + Situation Handling Checks
- [ ] Section 12 Summary Table has ALL 5 rows (Raasi / Lagnam / D9 / Nakshatra / Gana)?
- [ ] "Acting From Fear" column names a BEHAVIOUR — not an emotion?
- [ ] "Evolving Into Purpose" column names an ACTION — not a virtue?
- [ ] "Today's Check" column present in every row?
- [ ] Section 12 includes "How to Use This Table Daily" paragraph?
- [ ] Section 13 has all four sub-sections (Three Voices / Zoom Out / Dharma / Business-Career Transformation)?
- [ ] Section 13A names all three voices — Raasi reaction + Lagnam habit + D9 navigation?
- [ ] Section 13B crisis question is specific to THIS D9 sign — not generic?
- [ ] Section 13C names the ONE integrity rule AND the specific temptation for this combination?
- [ ] Section 13D Business/Career Transformation has Stop / Start / Build table?
- [ ] Section 14 ends with the one D9-specific question for shifting from react to create?

### Closing Checks
- [ ] Section 16 Final Truths are specific to THIS combination — not applicable to everyone?
- [ ] Section 17 checklist covers items from all 4 framework blocks?
- [ ] Section 18 90-Day Roadmap tied to THIS combination's karmic patterns — not generic?

### Section 7B — Career Karma & Wealth Activation Checks
- [ ] Section 7B present in report — between Root Problems and What Must Be Let Go?
- [ ] D9 Career Karma derived from D9 Reference Table — not invented?
- [ ] Karmic Block written fresh for this person — not copied verbatim from table?
- [ ] Nakshatra ruler added to the D9 block description?
- [ ] Specific income pattern named — not generic "undercharges"?
- [ ] Wealth Activation names the EXACT condition under which wealth opens?
- [ ] Wealth Activation statement is one bold quotable sentence?
- [ ] Career Direction table has both columns — Work That Clears AND Work That Blocks?
- [ ] Closing quote block present — the single wealth activation line?
- [ ] If birth time available — D10 planet named in Wealth Activation?
- [ ] If birth time NOT available — D9 dominant planet named instead?
- [ ] Career block connected to the karmic loop — shown as same pattern in career arena?
- [ ] Section 10F Planetary Day Guide: Power Days identified and marked (planet matches pillar ruler)?
- [ ] Section 10F Planetary Day Guide: every task labelled [INTERRUPT] / [ANCHOR] / [ACTIVATE]?
- [ ] Section 10F Planetary Day Guide: every task connected to D9 soul direction — not generic productivity?
- [ ] Section 10F Situation Trigger Cards: all 7 situations covered?
- [ ] Section 10F Trigger Cards: Raasi / Lagnam / D9 responses all combination-specific — not generic?
- [ ] Section 10F Trigger Cards: each D9 response ends with the ONE soul-purpose question for that situation?
- [ ] Section 10F Weekly Rhythm: 2 Lagnam days + 2 Raasi days + 2 D9 days + 1 Integration day?
- [ ] Section 10F Upgraded Checklist: every item has Purpose label AND Karmic Why column?
- [ ] Section 10F Checklist ends with the Non-Negotiable statement in quote block format?
- [ ] Section 10F Sunday Review: all 5 questions present — each naming the specific combination default?
- [ ] SOUL-PURPOSE ALIGNMENT CHECK: does every everyday task in the report connect to the D9 soul direction — not just to fixing the karmic loop?
- [ ] No generic filler anywhere — every sentence specific enough that swapping names would make it wrong?

### Page Count Checks
- [ ] Report stays within 25 pages maximum?
- [ ] Each section within its page budget (see Page Constraint table)?
- [ ] Tables trimmed to maximum rows specified?
- [ ] Karmic patterns limited to 2 — not 4?
- [ ] Life areas limited to 6 — not 8?
- [ ] Final Truths 7 lines maximum?
- [ ] Section 11, Section 18, Section 10D, Section 10E removed?
- [ ] Gana appears as natural descriptor — never explained or compared?
- [ ] No repetition across sections — each section adds new content only?
- [ ] Daily Task Planner is 7 rows — one task per day, one sentence each?

---

## ADDITIONAL REPORT TYPES

### Relationship Dynamics Report (8 sections)
When user provides TWO people's details:
1. Combination at a Glance (side-by-side table)
2. Where They Connect (shared ground table)
3. Where They Clash (friction points table with both sides)
4. Current Scenario Analysis (based on context given)
5. What They Teach Each Other (two-column table)
6. Future Prediction (age phases or growth trajectory)
7. Practical Fixes (numbered action table)
8. Compatibility Summary (star rating: Emotional Bond, Communication, Growth)

### Child Parenting Guide (8 sections)
When user provides parent + child details:
1. Understand the Child (comparison table: parent vs child)
2. What This Child Is Like (beautiful parts + challenging parts)
3. The Rules (10 rules specific to child's combination)
4. Daily Connection System (when traveling or busy)
5. When You're Home (quality time rules)
6. Handling Difficult Moments (situation → wrong instinct → right response table)
7. What NOT to Do (danger zones table)
8. Milestones to Build (what to establish by target age)

### Health + Wealth System (6 sections)
When user asks for integrated health and money system:
1. Why They're Connected (for this combination)
2. Current Pattern (health table + wealth table showing what's broken)
3. The Integrated System (Part A: Health non-negotiables + Part B: Wealth rules + pipeline)
4. Integrated Daily Schedule (showing health AND wealth impact per time block)
5. Weekly Tracking Scorecard (checkbox grid)
6. 90-Day Roadmap (30-day phases with health + wealth goals)

---

## HOW TO SHARE THIS SKILL

This skill can be shared as:
1. **The SKILL.md file** — upload to Claude custom skills
2. **The intake form (HTML)** — share as a web page for people to fill before generating
3. **The prompt template** — people paste their details and the skill triggers

### Prompt Template for Users:
```
Generate a life transformation report:
Name: [Name]
Raasi: [Moon Sign] 
Lagnam: [Ascendant]
Nakshatra: [Birth Star]
Struggles: [list them]
Daily Life: [describe]
Biggest Goal: [describe]
```
