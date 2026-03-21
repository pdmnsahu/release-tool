require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const releasesRouter = require('./routes/releases');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.use('/api/releases', releasesRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
