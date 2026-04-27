const url = "https://maps.app.goo.gl/qgTogBRTBmEN8yvT9";

async function testFetch() {
   try {
      const resp = await fetch(url, {
         method: 'GET',
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
         }
      });
      const html = await resp.text();
      
      // Let's look for exact lat/long in the HTML string via regex
      const regObj = html.match(/\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/g);
      const regMeta = html.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
      const regInitState = html.match(/@(-?\d+\.\d+),(-?\d+\.\d+),/);

      console.log("HTML length:", html.length);
      console.log("regMeta:", regMeta);
      console.log("regInitState:", regInitState);
      console.log("regObj:", regObj ? regObj.slice(0, 3) : null);
      
   } catch(e) {
      console.error(e);
   }
}

testFetch();
