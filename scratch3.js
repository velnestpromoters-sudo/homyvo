const http = require('http');

const url = 'http://localhost:5000/api/properties/search?locationText=kalapatti&useGeo=true&radius=8';

http.get(url, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => console.log(res.statusCode, raw));
}).on('error', e => console.error(e));
