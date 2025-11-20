// Create Server
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const clothRoutes = require('./routes/cloth.routes')





// middelware
const app = express();

// CORS configuration - must be before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3000','http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']

}));

// Body parsers - handle both JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle text/plain as JSON (for Postman misconfiguration)
app.use(express.text({ type: 'text/plain' }));
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain' && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Could not parse as JSON, leave as string
    }
  }
  next();
});

app.use(cookieParser());



// route
app.get('/', (req, res) => {
  res.send('Welcome to the Abaya e-com API');
});


app.use('/api/auth', authRoutes);
app.use('/api/cloth', clothRoutes);


module.exports = app;