---
name: astro-life-report
description: "Generate deeply personalized life transformation reports based on Vedic astrology Raasi (moon sign), Lagnam (ascendant), and Nakshatra. Trigger when user provides Name + Raasi + Lagnam and asks for any life report, transformation guide, personality analysis, behavioral analysis, karmic pattern analysis, or daily system. Also trigger for: 'generate a life report', 'create a transformation report', 'analyze my raasi and lagnam', 'build a life reset', 'astro personality report', relationship dynamics between two people, parenting guides based on child's chart, or health+wealth systems. Collects life context via intake questions first, then produces a deeply personalized 14-section Word document (.docx). Can also generate: relationship compatibility reports (father-son, husband-wife, business partners), child parenting guides (age-specific), and integrated health+wealth systems."
---

# Astro Life Transformation Report — Complete Skill Guide

## What This Skill Does

Takes astro details + real-life context and generates brutally honest, deeply personalized life transformation documents. This is NOT a generic horoscope. It is behavioral psychology dressed in astrological language.

## Report Types This Skill Can Generate

| Type | Inputs Needed | Output |
|------|--------------|--------|
| **Life Transformation Report** | Name, Raasi, Lagnam, Nakshatra, Struggles, Goals | Full 14-section .docx report |
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

---

## STEP 3: BUILD THE REPORT

### The 14 Sections (STRICTLY FOLLOW)

Every report MUST contain all 14 sections. Quality over speed — each section must be specific to THIS exact combination, never generic.

#### Section 1: ASTRO FOUNDATION
- **Table** comparing Raasi vs Lagnam: Sign, Symbol, Element, Ruling Planet, Nakshatra, Core Nature, Thinking Style
- Tamil names in blue italic brackets throughout: e.g., Cancer (கடகம்)
- **Symbol connection paragraph**: How the two zodiac animals interact in this person's life (this paragraph is the SOUL of the report — make it vivid and memorable)
- **Nakshatra paragraph**: What the birth star adds to the combination

#### Section 2: CORE COMBINATION TRUTH
- **Table**: Inner World (Raasi) vs Outer Approach (Lagnam) — 6-8 contrasting rows
- **Conflict paragraph**: The specific war (or dangerous agreement) between inside and outside
- **Identity statement as quote block**: One powerful first-person sentence (e.g., "I am a mountain that was built to move but forgot how.")

#### Section 3: CHARACTER PROFILE
- **Two-column table**: Strengths (green) vs Weaknesses (red) — 8-10 rows
- Each strength MUST have a corresponding shadow weakness
- Weaknesses must be genuinely uncomfortable — if the reader doesn't wince, it's too soft

#### Section 4: LIFE AREA IMPACT
- **Three-column table**: Life Area | How combination shows up | Hidden cost
- Cover: Career, Money, Marriage/Relationships, Family, Health, Mental State
- Personalize based on user's stated struggles and daily life

#### Section 5: CORE LIFE LOOP (Most important section)
- **Table**: # | Stage | What's really happening — 6 steps
- Last row highlighted red (restart point)
- Each step must have bold stage name + detailed explanation specific to THIS combination
- **Why paragraph**: Explain WHY this loop happens for this exact Raasi+Lagnam+Nakshatra
- **Quote block** with core loop insight

CRITICAL: Every combination has a DIFFERENT loop. Examples from reports built:
- Cancer+Taurus: Effort → slow results → emotional crash → fear → consistency drops → money crisis (the guilt-driven loop)
- Double Sagittarius: Vision → launch → boredom → shiny object → abandon → restart (the completion problem)
- Taurus+Aries: Pressure builds → volcano erupts → damage → guilt → silence → pressure again (the eruption cycle)
- Leo+Virgo: Vision → analysis → paralysis → others succeed → self-criticism → retreat (the perfectionist prison)
- Pisces+Gemini: Feel everything → overthink → overwhelm → escape → nothing changes → more feelings (the drowning loop)
- Gemini+Leo: Excitement → burst → boredom → new thing → reframe quitting → restart (the restless king)
- Double Earth: Endure → frustration builds → rigidity increases → relationships suffer → self-doubt → retreat deeper (the immovable mountain)

NEVER reuse another combination's loop. Each must be unique.

#### Section 6: KARMIC PATTERN ANALYSIS
- 3-4 distinct karmic loops, each with a title and narrative
- Each loop as: trigger → behavior → consequence → trigger (cycle format)
- Root cause paragraph connecting all loops to the Raasi+Lagnam psychology
- NOT mystical — behavioral patterns explained as habits

#### Section 7: ROOT PROBLEMS
- **Table**: Problem | How it shows up — 7-9 core issues
- Each description must be specific and uncomfortable
- Include the user's stated struggles mapped to the combination

#### Section 8: WHAT MUST BE LET GO
- **Four-column table**: Let Go Of | Wrong Belief | Truth | Daily Practice — 6-7 items
- Wrong beliefs in quotes
- Daily practices must be SPECIFIC and actionable (not vague)
- Quote block at end

#### Section 9: REACT vs CREATE
- **Two-column table**: React Mode (red) vs Create Mode (green) — 6-7 rows
- **Why stuck paragraph**: Specific to this combination

#### Section 10: COMPLETE SOLUTION SYSTEM (5 sub-sections)
**A. Mind Rules** — Table with 5 rules, each one sentence
**B. Daily System** — Full routine table: Time | Activity | Purpose (12-14 rows, travel-friendly)
**C. Money System** — Current pattern, Fix, Daily target, Debt strategy
**D. Overthinking/Anger/Emotional Control** — Specific technique for THIS combination's primary issue
**E. Relationship/Guilt/Specific Fix** — Address the combination's unique relationship pattern

#### Section 11: KARMIC BREAK METHOD
- 5 numbered steps: Recognize, Opposite action, 90-day commitment, Accept past, Use spirituality/strength as fuel not escape
- Quote block at end

#### Section 12: IDENTITY SHIFT
- **Two-column table**: Old Identity (red) vs New Identity (green) — 7-9 rows
- All statements in quotes

#### Section 13: FINAL TRUTHS
- **Table**: # | Truth — 10 powerful lines
- Short, hard-hitting, repeatable daily
- Specific to THIS person's combination and pain points

#### Section 14: DAILY CHECKLIST
- **Two-column table**: Morning & Work | Evening & Mindset
- Checkbox format (☐)
- Mindset items separated by a divider line
- Must include combination-specific items (not generic)

#### Final Block (after Section 14)
- Centered closing: "REMEMBER THIS EVERY SINGLE DAY"
- 3 affirmation lines (not broken, not failure, etc.)
- Combination-specific identity metaphor
- Key quotes from the report
- Closing mantra using the zodiac symbols
- "START TODAY" call to action

---

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

1. **Direct, not philosophical.** Write like a personal coach who won't sugarcoat.
2. **Uncomfortable truths required.** If the weakness section doesn't make the reader wince, it's too soft.
3. **No vague astrology.** Never: "planetary influences suggest..." Instead: "You hold on because Cancer records and Taurus refuses to delete."
4. **First person for identity statements.** Third person for analysis.
5. **Conversational but intense.** Trusted friend who tells hard truths.
6. **Combination-specific everything.** If you could swap in a different combination and the text still works, it's too generic. REWRITE.
7. **Animal metaphors throughout.** Use the zodiac symbols as a running metaphor — they make abstract psychology tangible and memorable.
8. **Each report gets a UNIQUE subtitle.** Format: "[Animal metaphor] — [Core tension in one line]"

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
- [ ] All 14 sections present and complete?
- [ ] Tamil names in brackets throughout Section 1?
- [ ] Identity statement in Section 2 is unique and uses animal metaphor?
- [ ] Weaknesses are genuinely uncomfortable?
- [ ] Loop in Section 5 is UNIQUE to this combination (not copied from another)?
- [ ] Karmic patterns are behavioral, not mystical?
- [ ] Let Go table has specific daily practices?
- [ ] Daily system is realistic and matches their daily life (travel/office/home)?
- [ ] Final truths are hard-hitting and personal to THIS combination?
- [ ] Checklist includes combination-specific mindset items?
- [ ] No generic filler anywhere?
- [ ] Subtitle is unique and memorable?
- [ ] Closing mantra uses the zodiac symbols?
- [ ] Document validates successfully?
- [ ] User's stated struggles are addressed in Sections 4, 7, 8, 10?
- [ ] Nakshatra influence woven into Sections 1, 5, 6, 11?

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
