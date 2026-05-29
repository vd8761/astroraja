---
name: astro-life-report
description: "Generate deeply personalized life transformation reports using a three-layer framework — Raasi (inner world), Lagnam (outer approach), and Nakshatra + Padam (search engine + D9 soul direction). Trigger when user provides Name + Raasi + Lagnam + Nakshatra + Padam and asks for any life report, transformation guide, karmic pattern analysis, soul purpose report, or situation handling guide. Also trigger for: 'generate a life report', 'create a transformation report', 'analyze my raasi and lagnam', 'what is my soul purpose', 'how do I break my karmic loop', relationship dynamics, parenting guides, or health+wealth systems. Auto-derives D9 Navamsa from Nakshatra + Padam. Opens with a fixed philosophical preamble. Produces a deeply personalized 14-section Word document (.docx)."
---

# Astro Life Transformation Report — Skill Guide

## What This Skill Does

Takes astro details + real-life context and generates brutally honest, deeply personalized life transformation documents. NOT a generic horoscope — this is behavioral psychology dressed in astrological language.

Every report tells ONE complete story across three acts:
- **ACT 1** — The Karmic Loop: "Here is the cycle you are trapped in — and why you keep returning to it." (Sections 1–7)
- **ACT 2** — Root Patterns & What To Release: "Here is exactly what is keeping you stuck — and what must be let go." (Sections 7–8)
- **ACT 3** — The Build: "Here is who you actually are, what to do, and how to start today." (Sections 9–14)

---

## STEP 1: COLLECT INPUTS

### Round 1: Astro Details
Ask for:
- **Name**
- **Raasi** (Moon Sign) — Tamil or English
- **Lagnam** (Ascendant) — Tamil or English
- **Nakshatra** (Birth Star) + **Padam** number (1–4)

D9 Navamsa is auto-derived from Nakshatra + Padam using the derivation table below.

### Tamil-English Sign Mapping
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
| Magaram (மகரம்) | Capricorn | Earth | Saturn / Sani |
| Kumbam (கும்பம்) | Aquarius | Air | Saturn / Sani |
| Meenam (மீனம்) | Pisces | Water | Jupiter / Guru |

### Round 2: Life Context (use ask_user_input_v0 tool)

**Question 1: "What are [Name]'s biggest current struggles?"** (multi_select)
Options: "Money / Debt / Income instability", "Health anxiety / Fear", "Relationship / Marriage stress", "Family pressure / Guilt", "Career confusion / No direction", "Overthinking / Analysis paralysis", "Anger / Frustration / Impatience", "Lack of confidence / Self-doubt", "Loneliness / Feeling misunderstood", "Emotional overwhelm / Sensitivity", "Commitment issues", "Work-life imbalance"

**Question 2: "What does [his/her] daily life look like?"** (single_select)
Options: "Heavy travel — rarely home", "Office job — mostly one place", "Work from home", "Entrepreneur / Own business", "Homemaker", "Hectic — no fixed pattern", "Student"

**Question 3: "What is [his/her] biggest life goal right now?"** (single_select)
Options: "Financial stability / Clear debt", "Better family relationships", "Find life purpose / Career clarity", "Inner peace / Stop overthinking", "Build a business / Grow income", "Recognition / Be valued", "Independence / Freedom", "Health improvement", "Build confidence / Self-worth"

If user selects "all" for any question, treat ALL options as active and address every one in the report.

---

## STEP 2: DERIVE D9 NAVAMSA

### Complete 27 Nakshatra → Gana Mapping
| # | Nakshatra (Tamil) | Nakshatra (English) | Ruling Planet | Gana |
|---|-------------------|---------------------|---------------|------|
| 1 | அஸ்வினி (Aswini) | Aswini | Ketu | Deva |
| 2 | பரணி (Bharani) | Bharani | Venus | Manushya |
| 3 | கார்த்திகை (Krithikai) | Krittika | Sun | Rakshasa |
| 4 | ரோகிணி (Rohini) | Rohini | Moon | Manushya |
| 5 | மிருகசீரிஷம் (Mirugasirisam) | Mrigashira | Mars | Deva |
| 6 | திருவாதிரை (Thiruvathirai) | Ardra | Rahu | Manushya |
| 7 | புனர்பூசம் (Punarvasu) | Punarvasu | Jupiter | Deva |
| 8 | பூசம் (Poosam) | Pushya | Saturn | Deva |
| 9 | ஆயில்யம் (Aayilyam) | Ashlesha | Mercury | Rakshasa |
| 10 | மகம் (Magam) | Magha | Ketu | Rakshasa |
| 11 | பூரம் (Puram) | Purva Phalguni | Venus | Manushya |
| 12 | உத்திரம் (Uthiram) | Uttara Phalguni | Sun | Manushya |
| 13 | அஸ்தம் (Hastam) | Hasta | Moon | Deva |
| 14 | சித்திரை (Chithirai) | Chitra | Mars | Rakshasa |
| 15 | சுவாதி (Swathi) | Swati | Rahu | Deva |
| 16 | விசாகம் (Visakam) | Vishakha | Jupiter | Rakshasa |
| 17 | அனுஷம் (Anusham) | Anuradha | Saturn | Deva |
| 18 | கேட்டை (Kettai) | Jyeshtha | Mercury | Rakshasa |
| 19 | மூலம் (Moolam) | Mula | Ketu | Rakshasa |
| 20 | பூராடம் (Pooradam) | Purva Ashadha | Venus | Manushya |
| 21 | உத்திராடம் (Uthiradam) | Uttara Ashadha | Sun | Manushya |
| 22 | திருவோணம் (Thiruvonam) | Shravana | Moon | Deva |
| 23 | அவிட்டம் (Avittam) | Dhanishtha | Mars | Rakshasa |
| 24 | சதயம் (Sathayam) | Shatabhisha | Rahu | Rakshasa |
| 25 | பூரட்டாதி (Poorattathi) | Purva Bhadrapada | Jupiter | Manushya |
| 26 | உத்திரட்டாதி (Uttirattathi) | Uttara Bhadrapada | Saturn | Manushya |
| 27 | ரேவதி (Revathi) | Revati | Mercury | Deva |

### Padam → D9 Navamsa Derivation
Each Nakshatra group of 9 cycles through a fixed D9 sign sequence:
- **Group 1** (Nakshatras 1–9, then 10–18, then 19–27): Each triplet of 3 nakshatras cycles Padams → Aries, Taurus, Gemini, Cancer / Leo, Virgo, Libra, Scorpio / Sagittarius, Capricorn, Aquarius, Pisces

**Rule:** Padam 1 = group start sign, Padam 2 = +1, Padam 3 = +2, Padam 4 = +3.

From the Gana table above, the 4th column shows each Nakshatra's Padam cycle starting sign group. Derive D9 accordingly. **Always derive D9 before building the report. Never skip this step.**

### Nakshatra Layer Meanings
| Ruler | Nakshatras | Impact Added |
|-------|-----------|--------------|
| Mars | Mirugasirisam, Chithirai, Avittam | Restlessness, search drive, hidden fire |
| Saturn | Poosam, Anusham, Uttirattathi | Karmic weight, delayed rewards, endurance |
| Sun | Krithikai, Uthiram, Uthiradam | Intensity, sharp mind, leadership but criticism |
| Venus | Bharani, Puram, Pooradam | Creativity, luxury desire, beauty sense |
| Jupiter | Punarvasu, Visakam, Poorattathi | Expansion, teaching instinct, spiritual depth |
| Mercury | Aayilyam, Kettai, Revathi | Intelligence, communication, sometimes manipulation |
| Moon | Rohini, Hastam, Thiruvonam | Emotional depth, nurturing, material comfort |
| Ketu | Aswini, Magam, Moolam | Spiritual depth, detachment, past-life wisdom |
| Rahu | Thiruvathirai, Swathi, Sathayam | Unconventional thinking, ambition, restlessness |

### D9 Sign — Soul Direction Reference
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

---

## STEP 3: ANALYSIS BEFORE WRITING

Before writing a single word of the report, perform this analysis:

**1. Inner vs Outer Gap** — What they feel inside (Raasi) vs what they show outside (Lagnam)
**2. Core Conflict** — Where Raasi and Lagnam pull in opposite directions (use Element Interaction table below)
**3. The Unique Loop** — The specific repeating cycle for THIS combination — never generic
**4. The Animal Metaphor** — Use zodiac symbols to build a memorable identity sentence
**5. D9 Exit** — What the D9 Navamsa soul direction requires to break the loop

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

**Same Sign Raasi + Lagnam:** Traits are doubled — both strengths AND weaknesses amplified. No counterbalance. Emphasize: "Your greatest power is also your greatest trap because there's no opposing force to balance it."

---

## STEP 4: BUILD THE REPORT

### FIXED OPENING: PHILOSOPHICAL PREAMBLE (before Section 1, every report)

Appears immediately after the report title and subtitle — on its own page.
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

**Document formatting for preamble:**
- Own page (page break after, before Section 1)
- Title: H1 centered, color #1A3C5E
- Body: Aptos Italic, size 19, color #2C2C2C, centered
- Top and bottom border: thick blue line (#1A3C5E)
- Space after each paragraph: 160
- Closing "— Thank you." — bold italic, centered

---

### THE 14 SECTIONS (generate all 14, in this exact order)

---

#### SECTION 1: ASTRO FOUNDATION
**Purpose:** Open with a mirror the reader has never seen before.

**Table format** — one row per attribute, three columns:
| Attribute | Raasi — [Sign] Moon Sign / Inner World | Lagnam — [Sign] Ascendant / Outer Approach |
| Sign | Tamil + English full name | Tamil + English full name |
| Symbol | Zodiac symbol with description | Zodiac symbol with description |
| Element | Element + qualities | Element + qualities |
| Ruling Planet | Planet + what it governs | Planet + what it governs |
| Nakshatra (Raasi column only) | Full Nakshatra name, padam, ruling planet, star meaning |  — |
| Nakshatra Essence (Raasi column only) | How the Nakshatra + ruling planet + D9 Padam create the specific texture for this person |  — |
| Core Nature | How they feel and operate inside | How they appear and approach life |
| Default Fear | The Raasi's core fear | The Lagnam's core fear |
| Hidden Need | What they actually need vs what they show | What they actually need vs what they show |

After the table — two narrative paragraphs:
1. **The [Raasi animal] and the [Lagnam animal]** — describe the inner-outer collision in vivid character language
2. **The Nakshatra paragraph** — name, ruling planet, Padam's D9 derivation, and exactly what this star adds to the combination

After the two paragraphs — **"Your Three Hidden Layers"** sub-heading, then three bullet-point groups (no long explanations — 2–3 sharp points each):

**Gana — [Deva / Manushya / Rakshasa]**
- What this Gana type craves and what it fears
- How it behaves under stress (Deva = waits and hopes / Manushya = calculates and delays / Rakshasa = goes all-in or walks away)
- The one behavioural trap this Gana creates in [Name]'s specific life

**Padam [1/2/3/4] — [Navamsa Sign] Energy**
- What this specific Padam adds to the Nakshatra's expression
- The D9 sign this Padam falls in — and its one-line soul quality for this person
- How this Padam shapes the way [Name] searches, decides, and pursues goals

**Navamsa (D9) — [Sign]**
- The soul's evolutionary direction in one sentence
- The core virtue this person must embody — not just perform
- The shadow risk when the D9 is ignored or suppressed

---

#### SECTION 2: CORE COMBINATION TRUTH
**Purpose:** Show the exact inner-outer war at every level of life.

**Table format** — one row per dimension, two columns (Inner World — Raasi vs Outer Approach — Lagnam):
Dimensions to cover: Emotional reality, Conflict style, Decision making, Relationship mode, Work mode, Core tension, Nakshatra's role, Greatest blindspot

After the table — three paragraphs:
1. **The Conflict: [Element] and [Element]** — the specific dynamic between the two elements, named vividly
2. **The genius of integration** — what becomes possible when Raasi and Lagnam work together rather than war
3. **Quote block** — first-person identity sentence using the animal metaphors

After the three paragraphs — **"How Your Five Factors Work Together"** compact reference table:

| Factor | What It Is | How It Shows Up in [Name] | When Aligned | When Misaligned |
|--------|-----------|--------------------------|--------------|-----------------|
| Raasi — [Sign] | Inner emotional world | [1-line specific description] | [1-line strength] | [1-line trap] |
| Lagnam — [Sign] | Outer face and approach | [1-line specific description] | [1-line strength] | [1-line trap] |
| Nakshatra — [Name] | Search engine + drive | [1-line specific description] | [1-line strength] | [1-line trap] |
| Padam [#] — [D9 Sign] | Soul lens for this Nakshatra | [1-line specific description] | [1-line strength] | [1-line trap] |
| Gana — [Type] | Stress and change style | [1-line specific description] | [1-line strength] | [1-line trap] |

Rules for this table: every cell must be specific to THIS person — not a definition. One crisp line per cell. The "When Misaligned" column should make the reader wince slightly.

---

#### SECTION 3: CHARACTER PROFILE
**Purpose:** Name the gifts and the traps with equal precision.

**Two-column table** — 8-9 rows:
| ✅ STRENGTHS — The [Raasi animal]'s Gifts | ❌ SHADOW WEAKNESSES — Where the gift becomes the trap |

Rules:
- Every strength has a direct shadow showing how the SAME trait creates the karmic trap
- Weaknesses must be genuinely uncomfortable — if the reader doesn't wince, it's too soft
- Each row is 2-3 sentences in each column — specific to THIS combination

---

#### SECTION 4: LIFE AREA IMPACT
**Purpose:** Show how the combination plays out across every domain.

**Three-column table** — one row per life area:
| Life Area | How [Raasi] + [Lagnam] + [Nakshatra] Shows Up | Hidden Cost |

Life areas to cover: Career, Money, Marriage/Relationships, Family, Health, Mental State

Rules:
- Every cell combination-specific — never generic
- Hidden cost column names the CONSEQUENCE, not just the behaviour
- Each cell 3-5 sentences

---

#### SECTION 5: CORE LIFE LOOP
**Purpose:** Name the repeating cycle so precisely the reader feels seen.

**Six-row table:**
| # | Stage Name | What Is Actually Happening in [Raasi] + [Lagnam] + [Nakshatra] |

Last row shaded — the restart. Each stage name bold. Stages must follow the exact psychological sequence for THIS combination — never reuse another combination's loop.

After the table — two paragraphs:
1. **Why This Loop Is Unique to This Combination** — psychological explanation of why Raasi + Lagnam + Nakshatra produce THIS specific loop
2. **The D9 Exit** — what the Navamsa soul direction sees in the loop and the one shift it requires to break it

End with a **quote block** capturing the loop's key insight.

---

#### SECTION 6: KARMIC PATTERN ANALYSIS
**Purpose:** Name 3-4 distinct behavioural patterns that run as cycles.

For each pattern:
- **Name** (bold title)
- **Trigger** → **Behaviour** → **Consequence** → **Loop restarts** format
- Written in narrative prose — vivid and specific

End with:
**Root Cause paragraph** — the single psychological origin shared by all patterns for this combination. Not mystical — behavioral and specific.

---

#### SECTION 7: ROOT PROBLEMS
**Purpose:** Map the specific life problems caused by the combination.

**Two-column table** — 7-9 rows:
| Root Problem | Specifically How It Shows Up in [Name]'s Life |

Rules:
- Map to ALL of the user's stated struggles
- Every description specific and uncomfortable — not generic
- Second column is 3-5 sentences of precise behavioral description

After the root problems table — **"Your Career Karma"** block (half page maximum, no sub-heading needed — flow directly from the table):

**Brief explanation paragraph** (3–4 sentences only): Connect the root problems above to the career arena. Name the specific way this combination's core loop shows up as a career pattern — not as a separate problem but as the same loop wearing work clothes. End with the exact condition under which this person's career transforms.

Then a compact three-column table:

| | What This Means for [Name] |
|---|---|
| **Karmic Lesson** | [One sentence: the core lesson this combination must learn through work — specific to Raasi + Lagnam + D9] |
| **How to Overcome Your Career Blocks** | [3 bullet points: specific, behavioural, actionable — derived from D9 soul direction] |
| **Your Ideal Career Path** | [One sentence naming the type of work + one sentence on why it fits THIS combination's strengths] |

Rules: nothing generic — every line must be derivable only from this person's specific combination. Career blocks must be behaviours to stop, not mindsets to adopt.

---

#### SECTION 8: WHAT MUST BE LET GO
**Purpose:** Name the specific beliefs and habits blocking transformation.

**Four-column table** — 6-7 rows:
| Let Go Of | Wrong Belief | Truth | Daily Practice |

Rules:
- Wrong Belief in quotes — how the person actually thinks
- Truth is a direct counter — no soft language
- Daily Practice is specific and doable this week — not vague

End with a **quote block** — the single most important truth for this combination.

---

#### SECTION 9: REACT vs CREATE
**Purpose:** Show the exact contrast between the stuck version and the integrated version.

**Two-column table** — 7-8 rows:
| ⚡ REACT MODE — Current [Name] | [Sign Symbol] CREATE MODE — Integrated [Name] |

After the table — one paragraph: **Why [Name] Is Stuck in React Mode** — the psychological explanation specific to Raasi + Nakshatra's reactive nature.

---

#### SECTION 10: COMPLETE SOLUTION SYSTEM
**Purpose:** Give a full, practical operating system for this combination.

Five sub-sections:

**A. The 5 Mind Rules**
Two-column table:
| Rule | Principle — Specific to [Raasi] + [Lagnam] + [Nakshatra] |
5 rules — each named, each a structural intervention for THIS combination specifically. Not generic advice.

**B. Daily System — Full Timetable**
Three-column table:
| Time | Activity | Why It Matters for [Name] Specifically |
Cover: wake, physical movement, morning write, deep work block, morning transition, core work, break, connective work, transition, family/relationship presence, evening replenishment, daily close, screens off/sleep.
Every "Why" column must reference Raasi, Lagnam, or Nakshatra — not generic productivity language.

**C. Money System**
Three paragraphs:
1. Current Pattern — specific to this combination's financial habit
2. The Three-Chamber Allocation — named percentages with specific rules
3. The 90-Day Primary Stream Focus + Income from the Container Direction

**D. Overthinking and Scatter Control**
Three interventions (named):
1. The specific trigger for THIS combination's overthinking pattern
2. The interrupt question or rule
3. The nervous system / body-based reset specific to Raasi element

**E. Relationships and Family**
Two sections:
1. The relationship challenge specific to Raasi + Lagnam — the core tension partners experience
2. Family presence — the specific domestic challenge and a named daily practice

---

#### SECTION 11: KARMIC BREAK METHOD
**Purpose:** The 5-step action sequence to break the core loop.

Five named steps — each is a header followed by 2-3 paragraphs of specific guidance:

**Step 1: NAME THE CONTAINER / DIRECTION / PURPOSE** — whatever the soul purpose anchor is for this D9 combination
**Step 2: THE FIRST VISIBLE ACTION — TODAY, NOT TOMORROW** — the 24-hour action rule applied at the karmic break level
**Step 3: 90-DAY CONTAINER BUILD — WITH DAILY DISCIPLINE** — one action per day, specific to this combination's loop pattern
**Step 4: THE GRAVEYARD / PATTERN AUDIT — ONE SESSION, FULL HONESTY** — map what stopped before; extract the pattern
**Step 5: CLAIM THE D9 VISION AS FOUNDATION** — the D9 soul direction as the container's basis; what it means for this person specifically

Each step is specific to THIS combination — not transferable to another person.

End with a **quote block** — the closing declaration for this combination.

---

#### SECTION 12: IDENTITY SHIFT
**Purpose:** The old story vs the new story — side by side.

**Two-column table** — 8-9 rows:
| 🔴 OLD IDENTITY — [The stuck version] | [Sign Symbol] NEW IDENTITY — [The integrated version] |

Rules:
- Old identity statements are how the person actually talks to themselves — specific and recognisable
- New identity statements in **bold** — declarative, first-person
- Every row must be so specific that it could only belong to this combination

---

#### SECTION 13: FINAL TRUTHS
**Purpose:** The 10 truths this person must read every morning.

**Two-column table** — 10 rows:
| # | Truth — Read Every Morning |

Rules:
- Each truth directly addresses one pattern, one blindspot, or one transformation specific to this combination
- Truths must be specific enough that they would be wrong for a different combination
- No generic wisdom — every sentence earns its place by referencing Raasi, Lagnam, Nakshatra, or D9

After the 10 truths — **"Living a Dharmic Life"** block:

Four bullet points only — no lengthy explanation. Each point is one or two sentences maximum. Derive entirely from this person's D9 Navamsa sign and Gana:

- **Right Action** — the one specific daily action that keeps [Name] aligned with dharma, named precisely for this D9 direction (not generic "do good")
- **Right Livelihood** — the earning principle: how this combination must make money to stay in dharmic alignment — what to avoid and what to pursue
- **Right Relationship** — how this Gana type must show up in relationships to clear karma rather than create it — one concrete behavioural rule
- **Right Surrender** — the one thing this combination must stop controlling and trust to unfold — specific to the D9 shadow risk

End this block with one quote line (not a full quote block — just a single italicised closing sentence that captures the dharmic call for this specific combination).

---

#### SECTION 14: DAILY CHECKLIST
**Purpose:** The operational daily tool — to be printed and used for 90 days.

**Two-column table:**
| ☀️ MORNING & WORK CHECKLIST | 🌙 EVENING & MINDSET CHECKLIST |

Morning items (8-10 checkboxes): container/direction check, physical movement, morning write, deep work block, new ignition assessment, break, visible action, open decision, verbal processing check, 24-hour action rule.

Evening items (8-10 checkboxes): genuine presence with family/partner, evening write, ideas list review, 90-day track check, financial check, graveyard check, tomorrow's action named, one truth about identity, closing phrase, screens off.

After the table — **REMEMBER THIS EVERY SINGLE DAY** closing block:
- 3 lines in the format: "You are not [stuck pattern]. You are [reframe]."
- Final bold line in ALL CAPS — the combination's core declaration
- Three zodiac symbols as closing visual
- One final quote block — two quotes, one from each animal perspective

---

## STEP 5: DOCX FORMATTING

Read `/mnt/skills/public/docx/SKILL.md` before writing any code.

### Page Setup
- US Letter (12240 × 15840 DXA), 1" margins all sides
- Font: Aptos (body), Arial (headings)
- Install: `npm install -g docx`

### Color Palette
| Element | Color |
|---------|-------|
| Primary heading | #1A3C5E (dark navy) |
| Section heading | #2E75B6 (medium blue) |
| Table header | #1A3C5E bg, white text |
| Alternate row | #E8F0F8 |
| Quote block border | #2E75B6 |
| Quote block bg | #F0F4F8 |
| Strength header | #155724 bg, white text |
| Weakness header | #7B1818 bg, white text |
| React column header | #7B1818 bg, white text |
| Create column header | #1A3C5E bg, white text |

### Heading Style
- Report title: Centered, 36pt bold, #1A3C5E
- Subtitle (identity sentence): Centered, 18pt italic, #2E75B6
- Astro detail line: Centered, 12pt, #2C2C2C
- SECTION headers: 18pt bold, #1A3C5E, with thick left border bar
- Sub-section headers: 14pt bold, #2E75B6

### Table Formatting
- All tables: full-width (9360 DXA), `WidthType.DXA`, dual widths (table + each cell)
- Cell padding: `{ top: 80, bottom: 80, left: 120, right: 120 }`
- Use `ShadingType.CLEAR` — never SOLID
- Header rows: shaded per color palette, white bold text
- Alternate body rows: #E8F0F8 and white

### Quote Blocks
```javascript
// Left border bar style for quote blocks
paragraph: {
  border: { left: { style: BorderStyle.THICK, size: 12, color: "2E75B6" } },
  shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
  indent: { left: 360 },
  spacing: { before: 200, after: 200 }
}
```

### Section Structure
- Each section starts on a new page (PageBreak before SECTION header)
- Preamble: own page, centered italic
- Section 14 Daily Checklist: own page, printed-ready formatting

### Validation
```bash
python scripts/office/validate.py output.docx
```
Fix any validation errors before delivering.

---

## QUALITY CHECKLIST (run before finalising)

### Content
- [ ] D9 derived from Nakshatra + Padam — not assumed
- [ ] Preamble present and formatted correctly
- [ ] All 14 sections present in order
- [ ] Identity sentence uses animal metaphors specific to this combination
- [ ] Section 1: Three Hidden Layers bullet points present — 3 points each for Gana, Padam, Navamsa
- [ ] Section 2: Five Factors table present — every cell specific to this person, not a definition
- [ ] Core loop in Section 5 is UNIQUE — not reused from another combination
- [ ] Weaknesses in Section 3 are genuinely uncomfortable — not vague
- [ ] User's stated struggles mapped in Sections 4 and 7
- [ ] Section 7: Career Karma block present — brief explanation paragraph + 3-row table
- [ ] Section 7 Career Karma: Karmic Lesson is one specific sentence; Career Blocks are 3 behaviours to stop; Ideal Path names the type of work + why
- [ ] Section 8 daily practices are specific and doable this week
- [ ] Section 9 React vs Create rows name BEHAVIOURS — not emotions or virtues
- [ ] Section 10 daily timetable "Why" column references Raasi/Lagnam/Nakshatra
- [ ] Section 11 steps are specific to this combination — not transferable
- [ ] Section 12 old identity in the person's own voice; new identity in bold first-person
- [ ] Section 13 truths are combination-specific — would be wrong for a different person
- [ ] Section 13: Dharmic Life block present — 4 bullet points, each 1-2 sentences, derived from D9 + Gana
- [ ] Section 13: Dharmic closing italicised line present
- [ ] Section 14 checklist includes combination-specific closing phrase
- [ ] No generic filler anywhere — every sentence specific enough that swapping names makes it wrong
- [ ] No repetition across sections — each section adds NEW content only

### Format
- [ ] Page breaks before each section header
- [ ] All tables have dual widths (table + cell)
- [ ] Quote blocks have left border + shading
- [ ] Strength/Weakness headers in green/red
- [ ] React/Create headers in red/navy
- [ ] Preamble on its own page with blue borders
- [ ] Validation passes


