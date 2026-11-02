const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoints for Render and monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'dataturf-backend' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'dataturf-backend' });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
