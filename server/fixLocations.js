require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function extractCoordinatesAndStandardize(location) {
  if (!location) return location;

  let lat = null;
  let lng = null;

  if (location.googleMapLink) {
    let finalUrl = location.googleMapLink;

    if (finalUrl.includes('goo.gl')) {
      try {
        const resp = await fetch(finalUrl, { 
          method: 'HEAD', 
          redirect: 'manual',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const locHeader = resp.headers.get('location');
        if (locHeader) finalUrl = locHeader;
      } catch(e) { 
        console.error("URL redirect extraction failed:", e); 
      }
    }

    const regStandard = finalUrl.match(/q=([\d.-]+),([\d.-]+)/);
    const searchMatch = finalUrl.match(/search\/(-?\d+\.\d+)(?:,|%2C)[+ ]*(-?\d+\.\d+)/);
    const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const placeMatch = finalUrl.match(/place\/.*?\/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (regStandard) {
      lat = Number(regStandard[1]);
      lng = Number(regStandard[2]);
    } else if (searchMatch) {
      lat = Number(searchMatch[1]);
      lng = Number(searchMatch[2]);
    } else if (placeMatch) {
      lat = Number(placeMatch[1]);
      lng = Number(placeMatch[2]);
    } else if (atMatch) {
      lat = Number(atMatch[1]);
      lng = Number(atMatch[2]);
    } else {
      // Geocoding Fallback for Text-based redirects
      try {
        const qTextMatch = finalUrl.match(/q=([^&]+)/);
        let searchText = "";
        if (qTextMatch && !qTextMatch[1].match(/^[\d.-]+,[\d.-]+$/)) {
          searchText = decodeURIComponent(qTextMatch[1].replace(/\+/g, ' '));
        } else if (location.area && location.city) {
          searchText = `${location.area}, ${location.city}`;
        }

        let geoData = [];
        if (searchText) {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1&countrycodes=in`;
          const geoRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'bnest-geo-engine' } });
          geoData = await geoRes.json();
        }

        // Fallback 1: Try area + city
        if ((!geoData || geoData.length === 0) && location.area && location.city) {
          const fallbackText = `${location.area}, ${location.city}`;
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackText)}&limit=1&countrycodes=in`;
          const geoRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'bnest-geo-engine' } });
          geoData = await geoRes.json();
        }

        // Fallback 2: Try city only
        if ((!geoData || geoData.length === 0) && location.city) {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.city)}&limit=1&countrycodes=in`;
          const geoRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'bnest-geo-engine' } });
          geoData = await geoRes.json();
        }

        if (geoData && geoData.length > 0) {
          lat = Number(geoData[0].lat);
          lng = Number(geoData[0].lon);
        }
      } catch(e) { 
        console.error("Geocoding fallback failed", e); 
      }
    }
  }

  if (lat && lng) {
    location.googleMapLink = `https://maps.google.com/?q=${lat},${lng}`;
    location.coordinates = {
      type: "Point",
      coordinates: [Number(lng), Number(lat)]
    };
  } else {
    delete location.coordinates;
  }

  delete location.lat;
  delete location.lng;

  return location;
}

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find all properties
    const props = await Property.find();
    let updated = 0;
    
    console.log(`Checking ${props.length} properties...`);
    
    for (let p of props) {
        const coordinates = p.location?.coordinates?.coordinates;
        const hasInvalidCoords = !coordinates || 
                                 coordinates.length < 2 || 
                                 coordinates[0] < 68 || coordinates[0] > 98 || // India Longitude range
                                 coordinates[1] < 8 || coordinates[1] > 38;    // India Latitude range
        
        if (hasInvalidCoords) {
             console.log(`\nFixing coordinates for: "${p.title}" (Current coordinates: ${coordinates || 'undefined'})`);
             console.log(`Address: ${p.location?.address}`);
             console.log(`Map Link: ${p.location?.googleMapLink}`);
             
             // Run geocoding fix
             const originalLoc = p.location ? (p.location.toObject ? p.location.toObject() : p.location) : {};
             
             // Force clean the coordinates first so it doesn't fall back to bad coordinates
             delete originalLoc.coordinates;
             
             const fixedLoc = await extractCoordinatesAndStandardize(originalLoc);
             
             if (fixedLoc.coordinates) {
                 p.location = fixedLoc;
                 p.markModified('location');
                 await p.save();
                 console.log(`-> Corrected Coordinates to:`, fixedLoc.coordinates.coordinates);
                 updated++;
             } else {
                 console.log(`-> Failed to resolve coordinates for: "${p.title}"`);
             }
        }
    }
    console.log("\nFinished. Corrected " + updated + " properties.");
    process.exit(0);
}

fix().catch(console.error);
