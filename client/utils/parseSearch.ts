export const extractMaxPrice = (q: string): number | null => {
  const match = q.match(/(under|below|max)\s*(rs|₹)?\s*(\d+)(k|000)?/i) || q.match(/(\d+)(k|000)?\s*(and under|or less)/i);
  if (match) {
    let numStr = match[3] || match[1];
    let multiplier = (match[4] || match[2])?.toLowerCase() === 'k' ? 1000 : 1;
    if (!multiplier && (match[3]?.length <= 2 || match[1]?.length <= 2)) multiplier = 1000;
    return parseInt(numStr) * multiplier;
  }
  return null;
};

export const extractMinPrice = (q: string): number | null => {
  const match = q.match(/(above|min)\s*(rs|₹)?\s*(\d+)(k|000)?/i);
  if (match) {
    let numStr = match[3];
    let multiplier = match[4]?.toLowerCase() === 'k' ? 1000 : 1;
    if (!multiplier && numStr.length <= 2) multiplier = 1000;
    return parseInt(numStr) * multiplier;
  }
  return null;
};

export const extractLocation = (q: string): string | null => {
  // Common areas in TN / Coimbatore
  const areas = ['peelamedu', 'saravanampatti', 'rs puram', 'gandhipuram', 'kavundampalayam', 'vada valli', 'singanallur', 'kuniamuthur', 'thudiyalur'];
  for (let area of areas) {
    if (q.includes(area)) return area;
  }
  
  // Natural language extraction fallback
  const nearMatch = q.match(/near\s+([a-z\s]+)/i) || q.match(/in\s+([a-z\s]+)/i);
  if (nearMatch && nearMatch[1]) {
    // Avoid accidentally grabbing filler words
    const loc = nearMatch[1].split(' ')[0].trim();
    if (!['a','the','college','hospital'].includes(loc)) return loc;
  }
  
  return null;
};

export const extractBHK = (q: string): string | null => {
  const match = q.match(/(\d)\s*bhk/i);
  if (match) return `${match[1]}BHK`;
  if (q.includes('single') || q.includes('1bhk')) return '1BHK';
  if (q.includes('double') || q.includes('2bhk')) return '2BHK';
  return null;
};

export const extractSharing = (q: string): string | null => {
  const match = q.match(/(\d)\s*sharing/i);
  if (match) return match[1];
  return null;
};

export const parseSearch = (query: string) => {
  const q = query.toLowerCase();

  return {
    propertyType: q.includes("pg") || q.includes("hostel") ? "pg" : (q.includes("bhk") || q.includes("house") || q.includes("apartment")) ? "apartment" : null,
    
    gender: q.includes("boys") || q.includes("mens") || q.includes("men") ? "boys" :
            q.includes("girls") || q.includes("womens") || q.includes("women") ? "girls" : null,

    maxPrice: extractMaxPrice(q),
    minPrice: extractMinPrice(q),
    
    near: q.includes("near") || q.includes("around") || q.includes("nearby"),
    location: extractLocation(q),
    
    bhkType: extractBHK(q),
    
    sharing: extractSharing(q),
    
    bachelorAllowed: q.includes("bachelor") || q.includes("students"),
    
    available: q.includes("available") || q.includes("ready"),
  };
};
