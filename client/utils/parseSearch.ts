// Enhanced Natural Language Intent Parser - Phase 3

const TYPOS_MAP: Record<string, string> = {
  pelamadu: 'peelamedu',
  peelamdu: 'peelamedu',
  saravanampati: 'saravanampatti',
  kovai: 'coimbatore',
  madras: 'chennai',
  vada: 'vada valli',
  thudiyalur: 'thudiyalur'
};

const LOCATIONS = ['coimbatore', 'peelamedu', 'saravanampatti', 'rs puram', 'gandhipuram', 'kavundampalayam', 'vada valli', 'singanallur', 'kuniamuthur', 'thudiyalur', 'tiruppur', 'chennai', 'madurai', 'kalapatti', 'peelamedu'];

function resolveTypo(txt: string) {
  let cleaned = txt;
  Object.keys(TYPOS_MAP).forEach(t => {
      if (cleaned.includes(t)) cleaned = cleaned.replace(t, TYPOS_MAP[t]);
  });
  return cleaned;
}

export const parseSearch = (query: string): any => {
  let q = query.toLowerCase();
  q = resolveTypo(q);
  
  const intent: any = {};
  if (!q) return intent;

  // Initialize a tracked shadow string to strip noise from
  let shadowStr = q;
  const stripRegex = (regex: RegExp) => { shadowStr = shadowStr.replace(regex, ' '); };

  // 28. Negation Search
  const exclude: any = {};
  if (q.includes('no pg') || q.includes('not pg')) exclude.propertyType = 'pg';
  if (q.includes('no sharing')) exclude.sharing = true;
  if (q.includes('not for bachelors') || q.includes('no bachelors') || q.includes('family only')) {
     intent.bachelorAllowed = false;
  }
  if (Object.keys(exclude).length > 0) intent.exclude = exclude;

  // 1 & 16. Location + Multi-Location + Near Map
  let foundLocs: string[] = [];
  LOCATIONS.forEach(loc => {
      // Avoid partial overlaps like 'vada' matching 'vada valli' inadvertently natively (handled by array distinctness implicitly)
      if (q.includes(loc)) {
          foundLocs.push(loc);
      }
  });
  if (foundLocs.length > 0) {
      intent.locationText = foundLocs.length === 1 ? foundLocs[0] : foundLocs;
  }
  const isNear = q.match(/\bnear\b|\baround\b|\bnearby\b|\bclose to\b|\bclosest\b|\bnearest\b/i);
  if (isNear || q.includes('within') || q.includes('with in')) {
      intent.useGeo = true;
  }
  if (q.includes('near me')) {
      intent.useGeo = true;
      delete intent.locationText; // Favor raw HW coords over random matches elsewhere
  }

  // 1a. Hidden Intent: Pasting a Google Maps Link Directly
  const gmapMatch = q.match(/q=([\d.-]+),([\d.-]+)/) || q.match(/@([\d.-]+),([\d.-]+)/);
  if (gmapMatch) {
      intent.useGeo = true;
      intent.lat = Number(gmapMatch[1]);
      intent.lng = Number(gmapMatch[2]);
      intent.radius = 1; // 1km clamp strictly for finding the specific pinned properties natively
      delete intent.locationText;
  }

  // 27. Landmark Search
  const landmarkMatch = q.match(/near (\w+ (college|hospital|park|airport))/i);
  if (landmarkMatch && !intent.locationText) {
      intent.nearLandmark = landmarkMatch[1];
      intent.useGeo = true;
  }

  // Radius Extraction
  const radMatch = q.match(/within\s*(\d+)\s*(km|kms)/i) || 
                   q.match(/with\s*in\s*(\d+)\s*(km|kms)/i) ||
                   q.match(/(\d+)\s*(km|kms)/i);
  if (radMatch) intent.radius = parseInt(radMatch[1]);

  // 2 & 19 & 20. Pricing logic
  const approxMatch = q.match(/around (\d+k?)/i) || q.match(/approx (\d+k?)/i);
  if (approxMatch) {
      let val = parseK(approxMatch[1]);
      intent.minPrice = Math.max(0, val - 1000);
      intent.maxPrice = val + 1000;
  } else {
      const minMatch = q.match(/(above|minimum|min)\s*(\d+k?)/i);
      if (minMatch) intent.minPrice = parseK(minMatch[2]);
      
      const maxMatch = q.match(/(under|below|less than|max)\s*(\d+k?)/i);
      if (maxMatch) intent.maxPrice = parseK(maxMatch[2]);
      
      const rangeMatch = q.match(/(\d+k?)\s*to\s*(\d+k?)/i);
      if (rangeMatch) {
          intent.minPrice = parseK(rangeMatch[1]);
          intent.maxPrice = parseK(rangeMatch[2]);
      }
  }
  
  if (q.match(/\bcheap\b|\bbudget\b|\blow budget\b/)) intent.priceCategory = 'low';
  if (q.match(/\bluxury\b|\bpremium\b|\bhigh end\b/)) intent.priceCategory = 'high';

  // 3 & 17. Property Type (Tanglish injected)
  let pTypes = [];
  if (q.includes('pg') || q.includes('hostel')) { pTypes.push('pg'); stripRegex(/\bpg\b|\bhostel\b/g); }
  if (q.includes('apartment') || q.includes('flat') || q.includes('veedu') || q.includes('voodu')) { pTypes.push('apartment'); stripRegex(/\bapartment\b|\bflat\b|\bveedu\b|\bvoodu\b/g); }
  if (q.includes('house') || q.includes('villa')) { pTypes.push('apartment'); stripRegex(/\bhouse\b|\bvilla\b/g); }
  if (q.includes('room') && pTypes.length === 0) { pTypes.push('pg'); stripRegex(/\broom\b/g); } 
  if (pTypes.length > 0) intent.propertyType = pTypes.length === 1 ? pTypes[0] : pTypes;

  const bhkMatch = q.match(/(\d)\s*bhk/i);
  if (bhkMatch) { intent.bhkType = `${bhkMatch[1]}BHK`; stripRegex(/(\d)\s*bhk/i); }

  // 4. Gender (Tanglish injected)
  if (q.match(/\bboys\b|\bmens\b|\bmen\b|\bpasanga\b|\baambala\b|\bgents\b/)) { intent.gender = 'boys'; stripRegex(/\bboys\b|\bmens\b|\bmen\b|\bpasanga\b|\baambala\b|\bgents\b/g); }
  if (q.match(/\bgirls\b|\bladies\b|\bwomens\b|\bwomen\b|\bponnunga\b|\bpengal\b/)) { intent.gender = 'girls'; stripRegex(/\bgirls\b|\bladies\b|\bwomens\b|\bwomen\b|\bponnunga\b|\bpengal\b/g); }

  // 5 & 18. Sharing Options
  const shareMatches = [...q.matchAll(/(\d)\s*(?:or)?\s*(\d)?\s*sharing/gi)];
  if (shareMatches.length > 0) {
      let shares = [];
      for(let m of shareMatches) {
          if (m[1]) shares.push(parseInt(m[1]));
          if (m[2]) shares.push(parseInt(m[2]));
      }
      intent.sharing = shares.length === 1 ? shares[0] : shares;
  }
  if (q.includes('single sharing')) intent.sharing = 1;
  if (q.includes('double sharing')) intent.sharing = 2;
  if (q.includes('triple sharing')) intent.sharing = 3;

  // 6. Bed var
  if (q.includes('beds available') || q.includes('vacancy') || q.includes('available beds')) {
      intent.availableBeds = true;
  }

  // 7. Bachelor / Families
  if (q.includes('bachelor allowed') || q.includes('bachelor')) intent.bachelorAllowed = true;

  // 8. Furnishing
  if (q.includes('fully furnished')) intent.furnishing = 'full';
  else if (q.includes('semi furnished')) intent.furnishing = 'semi';
  else if (q.includes('unfurnished')) intent.furnishing = 'none';

  // 9 & 23. Availability
  if (q.match(/ready to move|available now|immediate(\s|ly)?/i)) intent.available = true;
  if (q.match(/next month|from (june|july|aug|sep|oct|nov|dec|jan|feb|mar|apr|may)/i)) intent.availabilityDate = 'future';

  // 10. Amenities
  let amens = [];
  if (q.includes('wifi')) amens.push('wifi');
  if (q.includes('parking')) amens.push('parking');
  if (q.match(/ac\b|\bac room/)) amens.push('ac');
  if (q.match(/attached bathroom|attached bath/)) amens.push('attached_bathroom');
  if (amens.length > 0) intent.amenities = amens;

  // 12. Sorting
  if (q.match(/cheap first|lowest price|cheap/)) intent.sort = 'price_low';
  if (q.match(/closest|nearest|walking distance/)) {
      intent.sort = 'nearest';
      if (!intent.radius) intent.radius = 2; // Strict proximity assumption
  }
  if (q.includes('latest')) intent.sort = 'latest';

  // 21. Room count
  const rmMatch = q.match(/(\d)\s*(room|bedroom)/i);
  if (rmMatch) intent.roomCount = parseInt(rmMatch[1]);
  if (q.includes('single room')) intent.roomCount = 1;

  // 22. Occupancy
  const occMatch = q.match(/for (\d) (people|members)/i);
  if (occMatch) intent.requiredCapacity = parseInt(occMatch[1]);

  // 24. Owner Match
  if (q.includes('strict owner')) intent.ownerPreference = 'strict';
  if (q.includes('flexible') || q.includes('no restrictions') || q.includes('friendly')) intent.ownerPreference = 'flexible';

  // 25. Trust Search
  if (q.match(/verified|trusted|no fake/)) intent.isVerified = true;

  // 30. Contextual memory (Stub hook)
  if (q.match(/same as before|similar|more like this/)) intent.basedOnPrevious = true;

  // 32. Wishlists
  if (q.match(/show saved|wishlist/)) intent.wishlistOnly = true;

  // 36. Smart Fail-safe Fallback
  // If NO properties matched, fallback to default parameters seamlessly
  if (Object.keys(intent).length === 0) {
      intent.useGeo = true;
      intent.radius = 5;
      intent.sort = 'relevance';
  }

  // Assign stripped noise string back to intent for clean API parsing, even if empty string
  intent.cleanText = shadowStr.replace(/\s+/g, ' ').trim();

  return intent;
};

// Utils
function parseK(str: string): number {
    let raw = parseInt(str);
    if (str.toLowerCase().includes('k')) return raw * 1000;
    // Assume 3k if user just wrote "under 3" but logically means 3000
    if (raw < 100 && raw > 0) return raw * 1000; 
    return raw;
}
