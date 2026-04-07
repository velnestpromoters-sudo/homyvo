require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// 3-Minute Render Free Tier Anti-Sleep Keep-Alive Ping (Dual Mode)
const https = require('https');
const http = require('http');
setInterval(() => {
  // 1. Keep Backend awake
  https.get('https://bnest-backend-oz7c.onrender.com').on('error', (err) => {
    console.log('Backend self-ping error:', err.message);
  });
  
  // 2. Keep Frontend awake (dynamically uses env var)
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl && clientUrl !== 'http://localhost:3000') {
    const reqModule = clientUrl.startsWith('https') ? https : http;
    reqModule.get(clientUrl).on('error', (err) => {
      console.log('Frontend ping error:', err.message);
    });
  }
  
  console.log('Fired anti-sleep heartbeat ping to Backend & Frontend');
}, 3 * 60 * 1000);

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
