// D9 Navamsa sign derivation table based on Nakshatra and Padam
const NAKSHATRAS_ORDER = [
  "Ashwini", "Bharani", "Karthikai", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swathi", "Vishakha", "Anuradha", "Jyeshta",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revathi"
];

const NAVAMSA_CYCLE = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Derives the D9 Navamsa sign mathematically from Nakshatra and Padam.
 */
export function deriveNavamsa(nakshatra: string, padamStr: string | null): string {
  if (!nakshatra) return "Unknown";
  
  // Clean Nakshatra name for lookup
  const cleanNak = nakshatra.split('(')[0].split('/')[0].trim().toLowerCase();
  
  let nakIndex = NAKSHATRAS_ORDER.findIndex(n => {
    const cleanN = n.toLowerCase();
    return cleanN.includes(cleanNak) || cleanNak.includes(cleanN) ||
           (cleanN === "karthikai" && cleanNak.includes("krittika")) ||
           (cleanN === "mrigashira" && cleanNak.includes("mrigasira")) ||
           (cleanN === "jyeshta" && cleanNak.includes("jyeshtha")) ||
           (cleanN === "dhanishta" && cleanNak.includes("dhanishtha")) ||
           (cleanN === "shravana" && cleanNak.includes("thiruvonam"));
  });

  if (nakIndex === -1) {
    // Try matching by first 4 characters
    nakIndex = NAKSHATRAS_ORDER.findIndex(n => n.toLowerCase().substring(0, 4) === cleanNak.substring(0, 4));
  }

  if (nakIndex === -1) return "Unknown";

  // Parse padam number (default to 1 if unknown or not found)
  let padam = 1;
  if (padamStr) {
    const match = padamStr.match(/\d/);
    if (match) {
      padam = parseInt(match[0], 10);
    }
  }

  // 108 Padams sequentially cycle through the 12 signs
  const absPadamIndex = nakIndex * 4 + (padam - 1);
  const signIndex = absPadamIndex % 12;
  
  return NAVAMSA_CYCLE[signIndex];
}

/**
 * Parses the raw markdown report to extract the current dasha and age range for a target age.
 */
export function parseReportDasha(reportText: string, targetAge: number = 30): { currentDasha: string, dashaAgeRange: string } {
  const result = { currentDasha: "Unknown", dashaAgeRange: "Unknown" };
  if (!reportText) return result;

  // Split into lines
  const lines = reportText.split('\n');
  const dashaRows: { dasha: string; start: number; end: number; rangeStr: string }[] = [];

  // Look for markdown table rows containing ages or dashas
  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) {
        const dashaNameClean = cols[0].replace(/\*/g, '').trim();
        const ageRangeClean = cols[1].replace(/\*/g, '').trim();
        
        // Check if first column looks like a Dasha planet
        const isPlanet = /^(ketu|venus|sun|moon|mars|rahu|jupiter|saturn|mercury)$/i.test(dashaNameClean);
        // Check if second column looks like an age range (e.g. 0-17, 24-44)
        const rangeMatch = ageRangeClean.match(/(\d+)\s*[-–—]\s*(\d+)/);
        
        if (isPlanet && rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = parseInt(rangeMatch[2], 10);
          dashaRows.push({
            dasha: dashaNameClean,
            start,
            end,
            rangeStr: ageRangeClean
          });
        }
      }
    }
  }

  // If we found rows, try to match our target age
  if (dashaRows.length > 0) {
    const match = dashaRows.find(r => targetAge >= r.start && targetAge < r.end);
    if (match) {
      result.currentDasha = match.dasha;
      result.dashaAgeRange = match.rangeStr;
      return result;
    }
    // Fallback to the last dasha or the first if age out of bounds
    const last = dashaRows[dashaRows.length - 1];
    result.currentDasha = last.dasha;
    result.dashaAgeRange = last.rangeStr;
    return result;
  }

  // Fallback regex scan for text mentions: e.g. "Venus Dasha (Age 24-44)" or "Ketu Dasha (Age 17-24)"
  const regex = /([A-Za-z]+)\s+Dasha\s+\(Age\s+(\d+)\s*[-–—]\s*(\d+)\)/gi;
  let match;
  while ((match = regex.exec(reportText)) !== null) {
    const dasha = match[1];
    const start = parseInt(match[2], 10);
    const end = parseInt(match[3], 10);
    if (targetAge >= start && targetAge < end) {
      result.currentDasha = dasha;
      result.dashaAgeRange = `${start}-${end}`;
      return result;
    }
  }

  return result;
}

/**
 * Truncates the raw report to keep token consumption under control.
 * Keeps the most useful sections (Dasha timeline, Karma, Career, Relationship)
 * and trims verbose narrative sections.
 * Target: ~3000 chars per report (roughly 750 tokens).
 */
function truncateReport(reportText: string, maxChars: number = 4000): string {
  if (!reportText || reportText.length <= maxChars) return reportText;

  // Split report into sections by markdown headings
  const sections = reportText.split(/(?=^#{1,3}\s)/m);
  
  // Priority keywords for sections we want to keep
  const highPriority = ['dasha', 'karma', 'timeline', 'career', 'relationship', 'marriage', 'nakshatra', 'overview', 'summary', 'health'];
  const lowPriority = ['disclaimer', 'note:', 'about this', 'generated', 'reference'];
  
  const kept: string[] = [];
  const secondary: string[] = [];
  let currentLength = 0;
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase().substring(0, 100);
    
    // Skip low-priority/boilerplate sections
    if (lowPriority.some(kw => lowerSection.includes(kw))) continue;
    
    if (highPriority.some(kw => lowerSection.includes(kw))) {
      kept.push(section);
      currentLength += section.length;
    } else {
      secondary.push(section);
    }
  }
  
  // Add secondary sections if we have room
  for (const section of secondary) {
    if (currentLength + section.length <= maxChars) {
      kept.push(section);
      currentLength += section.length;
    }
  }
  
  let result = kept.join('');
  
  // Hard truncate if still too long
  if (result.length > maxChars) {
    result = result.substring(0, maxChars) + '\n\n[Report truncated for brevity]';
  }
  
  return result;
}

// ============================================================================
// PRODUCTION SYSTEM PROMPT — MNC-GRADE GUARDRAILS
// ============================================================================
// This prompt is engineered for:
// 1. Strict persona adherence (no role-breaking)
// 2. Token efficiency (concise output instructions)
// 3. Safety and content moderation
// 4. Bilingual support (English + Tamil)
// 5. Astrological accuracy from report data only
// ============================================================================

export const BASE_SYSTEM_PROMPT = `You are "Raja AI" — a warm, wise, and direct Vedic astrology life guide for the AstroRaja app.

═══ CORE IDENTITY ═══
• You are an astrology-focused life guide. You ONLY discuss topics through the lens of Vedic astrology.
• You have access to the user's complete astrological life reports (injected below). Speak from that knowledge — never from generic astrology.
• You are NOT a general-purpose AI. You do NOT answer questions about coding, math, science, politics, or any non-astrological topic.

═══ LANGUAGE ═══
• Detect the user's language and respond in the SAME language.
• Tamil → Tamil. English → English. Mixed → match their mix.
• Never switch language unless the user switches first.

═══ INJECTED REPORTS ═══
{{INJECT_REPORTS_HERE}}

═══ RESPONSE RULES ═══
1. MAX 3-4 points per response. Short sentences. One idea at a time.
2. Every response MUST end with ONE specific actionable suggestion.
3. Every claim MUST reference the user's actual Nakshatra, Dasha, or report data. If you cannot cite a specific data point from the report, do not make the claim.
4. Never say "it depends on many factors" — you have the report, be specific.
5. Never give generic horoscope-style predictions.
6. Keep responses under 200 words unless the user explicitly asks for detail.

═══ PRIORITY TOPICS (in order) ═══
1. KARMA CLEARANCE — Identify active karmic pattern from report. Name it. Give one clearing action today. Connect to Nakshatra + Dasha.
2. CURRENT DASHA — What phase they're in. What it delivers/blocks. What to do/avoid. When it shifts.
3. LIFE TIMELINE — Why past was hard (birth Dasha + house). When turning point arrives (exact age). What next phase delivers.
4. RELATIONSHIPS (when asked about another person) — How karmic patterns interact. Where they support/block each other. One action to improve.
5. PARENTING (when asked about child) — Child's current Dasha needs. What to never do. How to prepare for difficult phase.
6. BUSINESS/TEAM (when asked about partners) — Role fit by karmic pattern + D9. Strengths/blocks. Nakshatra leverage.
7. HEALTH — Health patterns for this combination. What to watch in current Dasha.
8. CAREER/PURPOSE — Direction that clears karma. D9 soul purpose. Right timing.
9. SPIRITUAL — Dharmic calling. Saint potential. Soul alignment.

═══ SAFETY & BOUNDARIES ═══
• NEVER diagnose medical conditions or prescribe treatments. For health concerns, always advise consulting a medical professional alongside astrological guidance.
• NEVER provide legal or financial advice. Frame career/money topics purely through karmic and Dasha lens.
• NEVER make death predictions, exact date predictions for marriage/children, or fear-inducing statements.
• NEVER break character. If asked "are you an AI" or "what model are you", respond: "I am Raja, your Vedic astrology guide."
• NEVER discuss other AI products, competitors, or your underlying technology.
• NEVER generate harmful, discriminatory, or politically divisive content.
• If a user asks something completely unrelated to astrology, politely redirect: "I can guide you on that through your astrological lens — would you like me to look at what your chart says about this area of life?"
• If a user appears to be in emotional distress or mentions self-harm, respond with empathy and recommend professional help resources alongside gentle astrological perspective.

═══ TONE ═══
• Warm but direct. Never cold. Never preachy. Never condescending.
• Speak as someone who genuinely knows them — because you have their full report.
• Use certainty: "Your chart shows..." not "It might suggest..."`;


/**
 * Builds the complete system prompt by injecting formatted report context.
 * Each report contains: { name, relationship, nakshatra, padam, raasi, lagnam, reportText, form_data }
 * 
 * Token optimization strategy:
 * - Truncate verbose reports to ~4000 chars each
 * - Extract only key structured fields from form_data
 * - Skip empty/null fields to save tokens
 */
export function buildChatSystemPrompt(reports: any[]): string {
  if (!reports || reports.length === 0) {
    return BASE_SYSTEM_PROMPT.replace('{{INJECT_REPORTS_HERE}}', '[No reports available. Ask user to generate a reading first.]');
  }

  const reportContext = reports.map(report => {
    const padamVal = report.padam || "1";
    const derivedD9 = deriveNavamsa(report.nakshatra, padamVal);
    const dashaInfo = parseReportDasha(report.reportText, 30); // Default target age 30

    // Build structured context lines — skip empty values to save tokens
    const lines: string[] = [
      `[${(report.relationship || 'SELF').toUpperCase()} — ${report.name || 'Unknown'}]`,
    ];

    if (report.nakshatra) lines.push(`Nakshatra: ${report.nakshatra} Pada ${padamVal}`);
    if (report.raasi) lines.push(`Rasi: ${report.raasi}`);
    if (report.lagnam) lines.push(`Lagnam: ${report.lagnam}`);
    if (derivedD9 !== "Unknown") lines.push(`D9 Navamsa: ${derivedD9}`);
    if (dashaInfo.currentDasha !== "Unknown") {
      lines.push(`Current Dasha: ${dashaInfo.currentDasha} (Age ${dashaInfo.dashaAgeRange})`);
    }

    // Extract form_data fields (from 6-step reading form)
    if (report.form_data) {
      const fd = report.form_data;
      const struggles = Array.isArray(fd.struggles) ? fd.struggles.join(", ") : (fd.struggles || "");
      const goals = Array.isArray(fd.goals) ? fd.goals.join(", ") : (fd.goals || "");
      const dailyLife = fd.dailyLife || "";
      const spiritual = fd.spiritual || "";
      
      if (struggles) lines.push(`Life Struggles: ${struggles}`);
      if (goals) lines.push(`Goals: ${goals}`);
      if (dailyLife) lines.push(`Daily Life: ${dailyLife}`);
      if (spiritual) lines.push(`Spiritual Orientation: ${spiritual}`);
    }

    // Truncate the raw report to control token consumption
    const truncatedReport = truncateReport(report.reportText || '', 4000);
    if (truncatedReport) {
      lines.push('');
      lines.push('FULL REPORT:');
      lines.push(truncatedReport);
    }

    lines.push('---');
    return lines.join('\n');
  }).join('\n\n');

  return BASE_SYSTEM_PROMPT.replace('{{INJECT_REPORTS_HERE}}', reportContext);
}
