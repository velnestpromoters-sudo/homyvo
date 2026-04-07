require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// 3-Minute Render Free Tier Anti-Sleep Keep-Alive Ping
const https = require('https');
setInterval(() => {
  https.get('https://bnest-backend-oz7c.onrender.com').on('error', (err) => {
    console.log('Self-ping error:', err.message);
  });
  console.log('Fired anti-sleep heartbeat ping to Render');
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
