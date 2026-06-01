import type { APIRoute } from 'astro';
import { Observer, getKundli } from '@ishubhamx/panchangam-js';

// Mapping from panchangam-js English names to our exact form dropdown values
const RASHI_MAP: Record<string, string> = {
  'Aries': 'Mesham',
  'Taurus': 'Rishabam',
  'Gemini': 'Midhunam',
  'Cancer': 'Kadagam',
  'Leo': 'Simbha',
  'Virgo': 'Kanni',
  'Libra': 'Thulam',
  'Scorpio': 'Vrichigam',
  'Sagittarius': 'Dhanusu',
  'Capricorn': 'Magaram',
  'Aquarius': 'Kumbam',
  'Pisces': 'Meenam'
};

const NAKSHATRA_MAP: Record<string, string> = {
  'Ashwini': 'Ashwini',
  'Bharani': 'Bharani',
  'Krittika': 'Karthikai',
  'Rohini': 'Rohini',
  'Mrigashira': 'Mrigashira',
  'Ardra': 'Ardra',
  'Punarvasu': 'Punarvasu',
  'Pushya': 'Pushya',
  'Ashlesha': 'Ashlesha',
  'Magha': 'Magha',
  'Purva Phalguni': 'Purva Phalguni',
  'Uttara Phalguni': 'Uttara Phalguni',
  'Hasta': 'Hasta',
  'Chitra': 'Chitra',
  'Swati': 'Swathi',
  'Vishakha': 'Vishakha',
  'Anuradha': 'Anuradha',
  'Jyeshtha': 'Jyeshta',
  'Mula': 'Mula',
  'Purva Ashadha': 'Purva Ashadha',
  'Uttara Ashadha': 'Uttara Ashadha',
  'Shravana': 'Shravana',
  'Dhanishta': 'Dhanishta',
  'Shatabhisha': 'Shatabhisha',
  'Purva Bhadrapada': 'Purva Bhadrapada',
  'Uttara Bhadrapada': 'Uttara Bhadrapada',
  'Revati': 'Revathi'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { dateIso, lat, lon } = data;

    if (!dateIso || lat === undefined || lon === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields (dateIso, lat, lon)' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dateObj = new Date(dateIso);
    // Standard timezone offset for calculation (we can use 0 since dateObj is absolute UTC timestamp underneath)
    const observer = new Observer(parseFloat(lat), parseFloat(lon), 0);
    
    // getKundli performs high-accuracy planetary calculations using astronomy-engine
    const kundli = getKundli(dateObj, observer);

    const ascendantRashiName = kundli.ascendant.rashiName;
    const moonRashiName = kundli.planets.Moon.rashiName;
    
    const birthNakshatra = kundli.dasha.birthNakshatra;
    const nakshatraPada = kundli.dasha.nakshatraPada;

    const mappedLagnam = RASHI_MAP[ascendantRashiName] || ascendantRashiName;
    const mappedRaasi = RASHI_MAP[moonRashiName] || moonRashiName;
    const mappedNakshatra = NAKSHATRA_MAP[birthNakshatra] || birthNakshatra;

    return new Response(JSON.stringify({
      success: true,
      data: {
        lagnam: mappedLagnam,
        raasi: mappedRaasi,
        nakshatra: mappedNakshatra,
        padam: nakshatraPada
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Auto-Calc Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to calculate astrology details' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
