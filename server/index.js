const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const cookieRoutes = require('./routes/cookieRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Vue Vite frontend
  credentials: true               // CRITICAL: Allows browser to receive and send cookies
}));
app.use(express.json());
app.use(cookieParser());           // Reads cookies from incoming requests

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cookies', cookieRoutes);
app.use('/api/orders', orderRoutes); 

// Root route
app.get('/', (req, res) => {
  res.send('Cookie Shop API is running!');
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Unable to start server:', error);
  }
}

startServer();