async function testOSM(query) {
    console.log(`\nTesting OSM with: "${query}"`);
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, { headers: { "User-Agent": "bnest-test-engine" } });
        const data = await res.json();
        if (data && data.length > 0) {
            console.log(`OSM Found: ${data[0].display_name}`);
            console.log(`Lat: ${data[0].lat}, Lng: ${data[0].lon}`);
        } else {
            console.log(`OSM Failed. No results for "${query}".`);
        }
    } catch(e) {
        console.error(e);
    }
}

async function run() {
    await testOSM("kalapatti");
    await testOSM("kalapatti boys pg");
    await testOSM("saravanampatti");
    await testOSM("saravanampatti house for rent");
}
run();
