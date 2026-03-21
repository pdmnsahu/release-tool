const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { STEPS, computeStatus } = require('../steps');

// Helper: get full release with steps
async function getReleaseById(id) {
  const releaseRes = await pool.query('SELECT * FROM releases WHERE id = $1', [id]);
  if (releaseRes.rows.length === 0) return null;
  const release = releaseRes.rows[0];

  const stepsRes = await pool.query(
    'SELECT step_key, completed FROM release_steps WHERE release_id = $1',
    [id]
  );

  // Merge fixed STEPS with DB state
  const stepsMap = {};
  stepsRes.rows.forEach((r) => { stepsMap[r.step_key] = r.completed; });

  const steps = STEPS.map((s) => ({
    key: s.key,
    label: s.label,
    completed: stepsMap[s.key] ?? false,
  }));

  return {
    ...release,
    steps,
    status: computeStatus(steps),
  };
}

// GET /api/releases
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases ORDER BY date ASC');
    const releases = await Promise.all(result.rows.map((r) => getReleaseById(r.id)));
    res.json(releases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/releases/:id
router.get('/:id', async (req, res) => {
  try {
    const release = await getReleaseById(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/releases
router.post('/', async (req, res) => {
  const { name, date, additional_info } = req.body;
  if (!name || !date) return res.status(400).json({ error: 'name and date are required' });

  try {
    const result = await pool.query(
      'INSERT INTO releases (name, date, additional_info) VALUES ($1, $2, $3) RETURNING *',
      [name, date, additional_info || null]
    );
    const release = await getReleaseById(result.rows[0].id);
    res.status(201).json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/releases/:id
router.patch('/:id', async (req, res) => {
  const { additional_info } = req.body;
  try {
    const result = await pool.query(
      'UPDATE releases SET additional_info = $1 WHERE id = $2 RETURNING *',
      [additional_info, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    const release = await getReleaseById(req.params.id);
    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/releases/:id/steps/:stepKey
router.patch('/:id/steps/:stepKey', async (req, res) => {
  const { id, stepKey } = req.params;
  const { completed } = req.body;

  const validKey = STEPS.find((s) => s.key === stepKey);
  if (!validKey) return res.status(400).json({ error: 'Invalid step key' });

  try {
    await pool.query(
      `INSERT INTO release_steps (release_id, step_key, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (release_id, step_key) DO UPDATE SET completed = $3`,
      [id, stepKey, completed]
    );
    const release = await getReleaseById(id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/releases/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM releases WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/steps — return the fixed steps list
router.get('/meta/steps', async (req, res) => {
  res.json(STEPS);
});

module.exports = router;
