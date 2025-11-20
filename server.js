// start server
require('dotenv').config();
const app = require ('./src/app');
const connectDB = require('./src/db/db');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173'|| 'http://localhost:5174',
    credentials: true
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server is running`);
});