const http = require('http');

http.get('http://127.0.0.1:5000/api/properties/search?queryText=kalapatti', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    const parsed = JSON.parse(data);
    console.log("COUNT:", parsed.count);
    if(parsed.data && parsed.data.length > 0) {
      console.log("FIRST:", parsed.data[0].title);
    }
  });
}).on('error', e => console.error("ERR:", e));
