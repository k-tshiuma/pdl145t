const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const { authenticate } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth public route
app.use('/api/auth', authRoutes);

// Protected stats routes
app.use('/api/stats', authenticate, statsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Statistics API is running' });
});

app.listen(port, () => {
  console.log(`Statistics API running on port ${port}`);
});
