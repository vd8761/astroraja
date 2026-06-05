import type { APIRoute } from 'astro';
import { 
  Observer, 
  getPanchangam, 
  tithiNames, 
  nakshatraNames, 
  yogaNames 
} from '@ishubhamx/panchangam-js';
import { DateTime } from 'luxon';
import { verifyAuthHeader } from '../../lib/auth';

// Standard coordinates for calculation baseline (Chennai, India)
const BASELINE_LAT = 13.0827;
const BASELINE_LON = 80.2707;
const BASELINE_TZ = 'Asia/Kolkata';

const rasis = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const guidelines: Record<string, string> = {
  "Aries": "Your ruling planet Mars triggers rapid thoughts today. In career, a sudden breakthrough is waiting if you communicate clearly. Focus on collaboration over competition. In relationships, practice listening closely to avoid trivial arguments.",
  "Taurus": "Venus grants you a luxurious flow of creative ideas. Financial decisions made today will bear fruit in the coming lunar cycle. Take care of your throat and avoid cold drinks. In love, expressing your vulnerability will build deeper trust.",
  "Gemini": "Mercury is active in your sign, accelerating communications and emails. Career discussions are highly favorable. Do not stretch yourself too thin; pick one priority. A brisk walk under the evening sun will refresh your nervous system.",
  "Cancer": "The Moon highlights your internal sanctuary today. You might feel highly intuitive, making it a great day for meditation or emotional healing. Avoid taking professional comments personally. Speak with absolute kindness to family.",
  "Leo": "Your solar energy shines bright, casting light on career achievements. Superiors are observing your leadership skills. Stay humble but confident. Health looks robust, but balance it with proper hydration. A positive financial update is likely.",
  "Virgo": "Detail-oriented Mercury aligns with your work sector. Outstanding tasks can be closed with high precision today. Do not overthink minor obstacles. Health is stable; include fresh greens in your meal. Be receptive to advice from elders.",
  "Libra": "Venus encourages harmony in your relationships today. Perfect time to reconcile differences or sign joint ventures. Avoid impulse purchases. Focus on physical stretches to relieve back tension. The evening brings peace.",
  "Scorpio": "Your inner power is heightened. Deep research, editing, or accounting tasks are highly favored. Do not let hidden doubts stall your progress. A partner offers comforting support. A warm bath before bed will aid deep sleep.",
  "Sagittarius": "Jupiter expands your horizon of opportunities. A career shift or educational milestone is favored. Stay committed to your goals. In finances, stick to your budget. Health is good; spend some time outdoors in nature.",
  "Capricorn": "Saturn provides discipline and patience. Slow, steady progress will triumph over rushed actions today. Double-check calculations and contract clauses. Your dedication is highly appreciated by peers. Stay active to improve joints.",
  "Aquarius": "Saturn and Rahu urge you to think outside conventional boundaries. Excellent day for technology, research, and planning. Avoid speculative financial trades. Love requires emotional patience. Drink plenty of water.",
  "Pisces": "Jupiter enhances your spiritual awareness and intuition. You find peace in creative pursuits. Career relationships are cordial, but avoid over-committing. Take light meals to keep your digestion smooth. Trust your gut feel."
};

const astroTips = [
  "Wear shades of saffron or yellow today to align with Jupiter's positive vibrations. Offer water to a plant before 10:00 AM.",
  "Anoint your temple with a drop of sandalwood paste today to soothe Mars' thermal currents. Avoid spicy foods.",
  "Wear white or cream colors today to synchronize with Moon's calming energy. Practice deep breathing during sunset.",
  "Incorporate copper tones or red colors in your attire today to invite solar clarity. Express gratitude to your father or mentors.",
  "Wear navy blue or grey tones today to resonate with Saturn's grounding nature. Donate food or support someone in need."
];

const luckyColors = ["Saffron Gold", "Cosmic Navy Blue", "Sandalwood Cream", "Emerald Green", "Ruby Orange"];
const luckyNumbers = ["7", "3", "9", "5", "8", "1"];

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    
    // Use target date or fallback to today
    let date = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(date.getTime())) {
      date = new Date();
    }

    const dt = DateTime.fromJSDate(date).setZone(BASELINE_TZ);
    const dateString = dt.toFormat('cccc, LLLL d, yyyy');

    const observer = new Observer(BASELINE_LAT, BASELINE_LON, 0);
    // calculate offset in minutes (IST = 330)
    const timezoneOffset = 330; 

    // Retrieve live computed Panchangam data from Swiss Ephemeris
    const p = getPanchangam(date, observer, { timezoneOffset });

    const formatTime = (d: Date | null) => d ? DateTime.fromJSDate(d).setZone(BASELINE_TZ).toFormat('hh:mm a') : '--:--';
    const formatWindow = (win: { start: Date; end: Date } | null) => {
      if (!win || !win.start || !win.end) return '--:-- - --:--';
      return `${formatTime(win.start)} - ${formatTime(win.end)}`;
    };

    // Deterministic random generator based on date seed
    const seed = dt.year * 1000 + dt.month * 40 + dt.day;
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    const randIndex = (arr: any[], s: number) => Math.floor(seededRandom(s) * arr.length);

    // Format results to match frontend expectations
    const result = {
      success: true,
      data: {
        dateString,
        sunrise: formatTime(p.sunrise),
        sunset: formatTime(p.sunset),
        tithi: `${tithiNames[p.tithi]} Tithi`,
        nakshatra: `${nakshatraNames[p.nakshatra]} Nakshatra`,
        yoga: `${yogaNames[p.yoga]} Yoga`,
        karana: `${p.karana} Karana`,
        rahuKaal: `${formatTime(p.rahuKalamStart)} - ${formatTime(p.rahuKalamEnd)}`,
        abhijitMuhurat: formatWindow(p.abhijitMuhurta),
        gulikaKaal: formatWindow(p.gulikaKalam),
        yamaGanda: formatWindow(p.yamagandaKalam),
        astroTip: astroTips[randIndex(astroTips, seed)],
        luckyColor: luckyColors[randIndex(luckyColors, seed + 1)],
        luckyNumber: luckyNumbers[randIndex(luckyNumbers, seed + 2)],
        horoscopes: {} as Record<string, any>
      }
    };

    // Calculate score details for each zodiac sign
    for (const rasi of rasis) {
      const rasiSeed = seed + rasi.charCodeAt(0) + rasi.charCodeAt(1);
      const rval1 = seededRandom(rasiSeed);
      const rval2 = seededRandom(rasiSeed + 1);
      const rval3 = seededRandom(rasiSeed + 2);
      const rval4 = seededRandom(rasiSeed + 3);

      result.data.horoscopes[rasi] = {
        career: 0.65 + rval1 * 0.30,
        love: 0.60 + rval2 * 0.35,
        health: 0.55 + rval3 * 0.40,
        finance: 0.60 + rval4 * 0.30,
        generalGuideline: guidelines[rasi] || "Planets are aligning to offer opportunities in your life. Focus on grounding exercises and keep a calm mind."
      };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Daily Insights API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch daily insights' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
