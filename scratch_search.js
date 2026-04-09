const http = require('http');

const url = 'http://127.0.0.1:5000/api/properties/search?propertyType=pg&gender=boys&sort=relevance';

http.get(url, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    try {
      console.log("JSON:", JSON.parse(raw));
    } catch(e) {
      console.log("RAW body (first 1000 chars):", raw.substring(0, 1000));
    }
  });
}).on('error', e => console.error("Request Error:", e));
