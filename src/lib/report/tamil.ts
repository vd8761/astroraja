// Raasi / Lagnam (sign) and Nakshatra → Tamil lookups.
// Keys are lowercase substrings; both transliterations and English names map.

const RAASI: Record<string, string> = {
  mesham: 'மேஷம்', aries: 'மேஷம்',
  rishabam: 'ரிஷபம்', taurus: 'ரிஷபம்',
  mithunam: 'மிதுனம்', midhunam: 'மிதுனம்', gemini: 'மிதுனம்',
  kadagam: 'கடகம்', cancer: 'கடகம்',
  simbham: 'சிம்மம்', simbha: 'சிம்மம்', leo: 'சிம்மம்',
  kanni: 'கன்னி', virgo: 'கன்னி',
  thulam: 'துலாம்', thulaam: 'துலாம்', libra: 'துலாம்',
  vrichigam: 'விருச்சிகம்', viruchigam: 'விருச்சிகம்', scorpio: 'விருச்சிகம்',
  dhanusu: 'தனுசு', sagittarius: 'தனுசு',
  magaram: 'மகரம்', capricorn: 'மகரம்',
  kumbam: 'கும்பம்', aquarius: 'கும்பம்',
  meenam: 'மீனம்', pisces: 'மீனம்',
};

const NAKSHATRA: Record<string, string> = {
  ashwini: 'அஸ்வினி', bharani: 'பரணி', karthikai: 'கார்த்திகை', rohini: 'ரோகிணி',
  mrigashira: 'மிருகசீரிடம்', ardra: 'திருவாதிரை', thiruvadhirai: 'திருவாதிரை',
  punarvasu: 'புனர்பூசம்', punarpoosam: 'புனர்பூசம்', pushya: 'பூசம்', poosam: 'பூசம்',
  ashlesha: 'ஆயில்யம்', ayilyam: 'ஆயில்யம்', magha: 'மகம்', magam: 'மகம்',
  'purva phalguni': 'பூரம்', pooram: 'பூரம்', 'uttara phalguni': 'உத்திரம்', uthiram: 'உத்திரம்',
  hasta: 'அஸ்தம்', astham: 'அஸ்தம்', chitra: 'சித்திரை', chithirai: 'சித்திரை',
  swathi: 'சுவாதி', swati: 'சுவாதி', vishakha: 'விசாகம்', visakam: 'விசாகம்',
  anuradha: 'அனுஷம்', anusham: 'அனுஷம்', jyeshta: 'கேட்டை', kettai: 'கேட்டை',
  mula: 'மூலம்', moolam: 'மூலம்', 'purva ashadha': 'பூராடம்', pooradam: 'பூராடம்',
  'uttara ashadha': 'உத்திராடம்', uthiradam: 'உத்திராடம்', shravana: 'திருவோணம்', thiruvonam: 'திருவோணம்',
  dhanishta: 'அவிட்டம்', avittam: 'அவிட்டம்', shatabhisha: 'சதயம்', sadayam: 'சதயம்',
  'purva bhadrapada': 'பூரட்டாதி', poorattadhi: 'பூரட்டாதி',
  'uttara bhadrapada': 'உத்திரட்டாதி', uthirattadhi: 'உத்திரட்டாதி', revati: 'ரேவதி',
};

export function getTamil(value: string | undefined | null, type: 'raasi' | 'nakshatra'): string {
  if (!value) return '';
  const s = value.toLowerCase();
  const map = type === 'raasi' ? RAASI : NAKSHATRA;
  for (const k in map) if (s.includes(k)) return map[k];
  return '';
}
