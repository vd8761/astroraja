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
function truncateReport(reportText: string, maxChars: number = 2000): string {
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

export const BASE_SYSTEM_PROMPT = `You are "Raja AI", a warm, direct Vedic astrology life guide. Only discuss topics through Vedic astrology using the user's profile details. Reject coding, math, science, politics, or non-astrological queries.
Detect user language; respond in the SAME (Tamil/English/mixed).

═══ PROFILE DATA (JSON) ═══
{{INJECT_REPORTS_HERE}}

═══ PAST CONVERSATION HISTORY (JSON) ═══
{{INJECT_HISTORY_HERE}}

═══ RULES ═══
1. MAX 2-3 points, short sentences, under 120 words.
2. Every response MUST end with ONE specific actionable suggestion.
3. Every claim MUST cite the user's Nakshatra/Dasha/profile data.
4. No generic predictions or "it depends on many factors".
5. Use standard bold (**word**) and simple bullet lists (* item). No complex HTML/markdown.

═══ PRIORITY TOPICS ═══
1. KARMA CLEARANCE: Active karmic pattern, 1 daily clearing action, Nakshatra/Dasha link.
2. CURRENT DASHA: Phase info, focus/avoid areas, timing of shift.
3. TIMELINE: Past difficulties, turning point (exact age), next phase.
4. RELATIONSHIPS/PARENTING/BUSINESS: Karmic interaction, role fit by D9/Nakshatra, 1 actionable step.
5. HEALTH/CAREER/SPIRITUAL: Astro patterns/purpose, timing, dharmic calling.

═══ SAFETY & BOUNDARIES ═══
• No medical/legal/financial advice. No death, marriage date, or fear-inducing predictions.
• Never break character. If asked about AI/model, reply: "I am Raja, your Vedic astrology guide." No competitor/tech talk.
• Redirect unrelated queries to astrology. Empathize with distress, recommend professional help.
• Tone: Warm, direct, certain ("Your chart shows...").`;


function cleanTableRow(row: string): string {
  return row
    .split('|')
    .map(cell => cell.trim())
    .filter(Boolean)
    .join(' -> ');
}

/**
 * Parses the generated markdown report to extract key takeaways from each section,
 * compressing them into a highly compact JSON structure to save tokens.
 */
function summarizeReportText(reportText: string): any {
  const summary: any = {};
  if (!reportText) return summary;

  // Split report into sections by markdown headings (e.g. ##, ###, ####)
  const sections = reportText.split(/(?=^#{1,4}\s+)/m);

  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const heading = lines[0].toLowerCase();
    
    if (heading.includes('section 3') || heading.includes('character profile')) {
      const points = lines.filter(l => l.startsWith('|') && !l.includes('---') && !l.toLowerCase().includes('strength'));
      summary.strengths_and_shadows = points.slice(0, 5).map(cleanTableRow);
    } 
    else if (heading.includes('section 5') || heading.includes('karmic pattern')) {
      const patterns = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('-') || lines[i].startsWith('*') || lines[i].includes('**')) {
          patterns.push(lines[i].replace(/[*#]/g, '').trim());
        }
      }
      summary.karmic_patterns = patterns.slice(0, 6);
    }
    else if (heading.includes('section 6') || heading.includes('root problems')) {
      const problems = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('-') || lines[i].startsWith('*') || (lines[i].includes('**') && lines[i].length < 150)) {
          problems.push(lines[i].replace(/[*#]/g, '').trim());
        }
      }
      summary.root_problems = problems.slice(0, 6);
    }
    else if (heading.includes('section 11') || heading.includes('karmic origin')) {
      const originPoints = [];
      const careerRows = [];
      let inCareerTable = false;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('-') || line.startsWith('*')) {
          originPoints.push(line.replace(/[*#]/g, '').trim());
        } else if (line.startsWith('|')) {
          if (line.includes('---') || line.toLowerCase().includes('career field')) {
            inCareerTable = true;
            continue;
          }
          if (inCareerTable) {
            careerRows.push(cleanTableRow(line));
          }
        }
      }
      summary.karmic_origin = originPoints.slice(0, 4);
      summary.suggested_careers = careerRows.slice(0, 6);
    }
    else if (heading.includes('section 12') || heading.includes('dharmic life')) {
      const dharmic = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('-') || lines[i].startsWith('*')) {
          dharmic.push(lines[i].replace(/[*#]/g, '').trim());
        }
      }
      summary.dharmic_guidance = dharmic.slice(0, 4);
    }
  }

  return summary;
}

/**
 * Extracts bullet points and actionable steps from assistant answers, or falls back 
 * to the first 2 sentences, to create a highly compressed summary.
 */
function compressAssistantResponse(text: string): string {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const keyPoints: string[] = [];

  for (const line of lines) {
    if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•')) {
      keyPoints.push(line.replace(/^[*•-]\s*/, '').trim());
    } else if (line.toLowerCase().includes('actionable step')) {
      keyPoints.push(line.trim());
    }
  }

  if (keyPoints.length === 0) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, 2).map(s => s.trim()).join(' ');
  }

  return keyPoints.join(' | ');
}

/**
 * Formats user queries and compressed assistant answers into a neat JSON string.
 */
function formatHistoryAsJson(history: any[]): string {
  const turns: { query: string; assistant_takeaways: string }[] = [];
  
  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === 'user') {
      const nextMsg = history[i + 1];
      if (nextMsg && nextMsg.role === 'assistant') {
        turns.push({
          query: msg.content,
          assistant_takeaways: compressAssistantResponse(nextMsg.content)
        });
        i++; // Skip assistant message
      } else {
        turns.push({
          query: msg.content,
          assistant_takeaways: 'No response recorded.'
        });
      }
    }
  }

  return JSON.stringify(turns, null, 2);
}

/**
 * Builds the complete system prompt by injecting formatted report context.
 * Each report contains: { name, relationship, nakshatra, padam, raasi, lagnam, reportText, form_data }
 * 
 * Token optimization strategy:
 * - Format profile details, struggles, goals, and parsed dasha info as a compact JSON structure
 * - Extract and compress key takeaways from the generated report, omitting raw markdown report text
 * - Format conversation history turns in a highly compact JSON array inside the system instructions
 */
export function buildChatSystemPrompt(reports: any[], conversationHistory: any[] = []): string {
  if (!reports || reports.length === 0) {
    const defaultPrompt = BASE_SYSTEM_PROMPT
      .replace('{{INJECT_REPORTS_HERE}}', '[No profiles are currently attached. Answer general or educational Vedic astrology queries using general Vedic principles. Suggest they select or generate an astrology profile for a personalized reading.]')
      .replace('3. Every claim MUST cite the user\'s Nakshatra/Dasha/profile data.', '3. Speak from general Vedic astrology principles. Gently mention that for a personalized prediction, they should select or attach an astrology profile.');
    
    let historyContext = '[This is a new conversation. No previous messages exist.]';
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = formatHistoryAsJson(conversationHistory);
    }
    return defaultPrompt.replace('{{INJECT_HISTORY_HERE}}', historyContext);
  }

  const reportContext = reports.map(report => {
    const padamVal = report.padam || "1";
    const derivedD9 = deriveNavamsa(report.nakshatra, padamVal);
    const dashaInfo = parseReportDasha(report.reportText, 30); // Default target age 30

    // Build a structured, highly compressed JSON object for this profile
    const profileObj: any = {
      profile: {
        name: report.name || 'Unknown',
        relationship: report.relationship || 'SELF',
        nakshatra: report.nakshatra ? `${report.nakshatra} (Pada ${padamVal})` : undefined,
        rasi: report.raasi || undefined,
        lagnam: report.lagnam || undefined,
        d9_navamsa: derivedD9 !== "Unknown" ? derivedD9 : undefined,
        current_dasha: dashaInfo.currentDasha !== "Unknown" ? `${dashaInfo.currentDasha} (Age ${dashaInfo.dashaAgeRange})` : undefined
      }
    };

    if (report.form_data) {
      const fd = report.form_data;
      const struggles = Array.isArray(fd.struggles) ? fd.struggles.filter(Boolean) : (fd.struggles ? [fd.struggles] : []);
      const goals = Array.isArray(fd.goals) ? fd.goals.filter(Boolean) : (fd.goals ? [fd.goals] : []);
      
      profileObj.user_inputs = {
        struggles: struggles.length > 0 ? struggles.join(', ') : undefined,
        goals: goals.length > 0 ? goals.join(', ') : undefined,
        daily_life: fd.dailyLife || undefined,
        spiritual_orientation: fd.spiritual || undefined
      };
    }

    if (report.reportText) {
      profileObj.generated_report_takeaways = summarizeReportText(report.reportText);
    }

    return JSON.stringify(profileObj, null, 2);
  }).join('\n\n');

  let historyContext = '[This is a new conversation. No previous messages exist.]';
  if (conversationHistory && conversationHistory.length > 0) {
    historyContext = formatHistoryAsJson(conversationHistory);
  }

  return BASE_SYSTEM_PROMPT
    .replace('{{INJECT_REPORTS_HERE}}', reportContext)
    .replace('{{INJECT_HISTORY_HERE}}', historyContext);
}
