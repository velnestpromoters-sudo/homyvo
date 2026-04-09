const http = require('http');

http.get('http://127.0.0.1:5000/api/properties/search?useGeo=true&radius=5&sort=relevance', (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => console.log(res.statusCode, raw.substring(0, 1000)));
}).on('error', e => console.error(e));
