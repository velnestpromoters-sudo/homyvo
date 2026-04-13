const TYPOS_MAP = {
  pelamadu: 'peelamedu',
  peelamdu: 'peelamedu',
  saravanampati: 'saravanampatti',
  kovai: 'coimbatore',
  madras: 'chennai',
  vada: 'vada valli',
  thudiyalur: 'thudiyalur'
};

const LOCATIONS = ['coimbatore', 'peelamedu', 'saravanampatti', 'rs puram', 'gandhipuram', 'kavundampalayam', 'vada valli', 'singanallur', 'kuniamuthur', 'thudiyalur', 'tiruppur', 'chennai', 'madurai', 'kalapatti', 'peelamedu'];

function resolveTypo(txt) {
  let cleaned = txt;
  Object.keys(TYPOS_MAP).forEach(t => {
      if (cleaned.includes(t)) cleaned = cleaned.replace(t, TYPOS_MAP[t]);
  });
  return cleaned;
}

const parseSearch = (query) => {
  let q = query.toLowerCase();
  q = resolveTypo(q);
  
  const intent = {};
  if (!q) return intent;

  let shadowStr = q;
  const stripRegex = (regex) => { shadowStr = shadowStr.replace(regex, ' '); };

  const exclude = {};
  if (q.includes('no pg') || q.includes('not pg')) exclude.propertyType = 'pg';
  if (q.includes('no sharing')) exclude.sharing = true;
  if (q.includes('not for bachelors') || q.includes('no bachelors') || q.includes('family only')) {
     intent.bachelorAllowed = false;
  }
  if (Object.keys(exclude).length > 0) intent.exclude = exclude;

  let foundLocs = [];
  LOCATIONS.forEach(loc => {
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
      delete intent.locationText; 
  }

  const gmapMatch = q.match(/q=([\d.-]+),([\d.-]+)/) || q.match(/@([\d.-]+),([\d.-]+)/);
  if (gmapMatch) {
      intent.useGeo = true;
      intent.lat = Number(gmapMatch[1]);
      intent.lng = Number(gmapMatch[2]);
      intent.radius = 1; 
      delete intent.locationText;
  }

  const radMatch = q.match(/within\s*(\d+)\s*(km|kms)/i) || q.match(/(\d+)\s*km/i);
  if (radMatch) intent.radius = parseInt(radMatch[1]);

  const priceMatch = q.match(/(?:below|under|less than|within|cheap|budget|kulla|kammia)\s*(?:rs|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakhs|lakh|l)?/i);
  if (priceMatch) {
      let val = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (priceMatch[2]) {
          if (priceMatch[2].toLowerCase() === 'k') val *= 1000;
          if (priceMatch[2].toLowerCase().startsWith('l')) val *= 100000;
      } else if (val < 100) { val *= 1000; }
      intent.maxPrice = val;
  }

  const rangeMatch = q.match(/(?:between|from)?\s*(?:rs|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakhs|lakh)?\s*(?:to|-)\s*(?:rs|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakhs|lakh)?/i);
  if (rangeMatch && !priceMatch) {
       let min = parseFloat(rangeMatch[1]);
       let max = parseFloat(rangeMatch[3]);
       if (rangeMatch[2] && rangeMatch[2].toLowerCase() === 'k') min*=1000;
       if (rangeMatch[2] && rangeMatch[2].toLowerCase().startsWith('l')) min*=100000;
       else if (min < 100) min*=1000;
       
       if (rangeMatch[4] && rangeMatch[4].toLowerCase() === 'k') max*=1000;
       if (rangeMatch[4] && rangeMatch[4].toLowerCase().startsWith('l')) max*=100000;
       else if (max < 100) max*=1000;

       intent.minPrice = min;
       intent.maxPrice = max;
  }

  let pTypes = [];
  if (q.includes('pg') || q.includes('hostel')) { pTypes.push('pg'); stripRegex(/\bpg\b|\bhostel\b/g); }
  if (q.includes('apartment') || q.includes('flat') || q.includes('veedu') || q.includes('voodu')) { pTypes.push('apartment'); stripRegex(/\bapartment\b|\bflat\b|\bveedu\b|\bvoodu\b/g); }
  if (q.includes('house') || q.includes('villa')) { pTypes.push('apartment'); stripRegex(/\bhouse\b|\bvilla\b/g); }
  if (q.includes('room') && pTypes.length === 0) { pTypes.push('pg'); stripRegex(/\broom\b/g); } 
  if (pTypes.length > 0) intent.propertyType = pTypes.length === 1 ? pTypes[0] : pTypes;

  const bhkMatch = q.match(/(\d)\s*bhk/i);
  if (bhkMatch) { intent.bhkType = `${bhkMatch[1]}BHK`; stripRegex(/(\d)\s*bhk/i); }

  if (q.match(/\bboys\b|\bmens\b|\bmen\b|\bpasanga\b|\baambala\b|\bgents\b/)) { intent.gender = 'boys'; stripRegex(/\bboys\b|\bmens\b|\bmen\b|\bpasanga\b|\baambala\b|\bgents\b/g); }
  if (q.match(/\bgirls\b|\bladies\b|\bwomens\b|\bwomen\b|\bponnunga\b|\bpengal\b/)) { intent.gender = 'girls'; stripRegex(/\bgirls\b|\bladies\b|\bwomens\b|\bwomen\b|\bponnunga\b|\bpengal\b/g); }

  const cleanNoiseStr = shadowStr.replace(/\s+/g, ' ').trim();
  if (cleanNoiseStr) {
      intent.cleanText = cleanNoiseStr;
  }

  return intent;
}

console.log(parseSearch("pasanga pg in kalapatti"));
console.log(parseSearch("veedu in saravanampatti"));
console.log(parseSearch("girls hostel"));
