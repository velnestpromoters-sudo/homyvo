async function testOSM(query, lat, lng) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    if (lat && lng) {
        url += `&viewbox=${lng-0.5},${lat+0.5},${lng+0.5},${lat-0.5}`; // native soft bias
    }
    
    try {
        const res = await fetch(url, { headers: { "User-Agent": "bnest-test-engine" } });
        const data = await res.json();
        if (data && data.length > 0) {
            console.log(`OSM Found: ${data[0].display_name}`);
        } else {
            console.log(`OSM Failed.`);
        }
    } catch(e) {
        console.error(e);
    }
}

async function run() {
    await testOSM("komarapalayam", 11.01, 76.95);
}
run();
