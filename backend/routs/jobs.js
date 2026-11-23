const express = require('express');
const Job = require('../models/Job');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all jobs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find().populate('applicants', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new job (Admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply for a job (Student)
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found!' });

    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already applied for this job!' });
    }

    job.applicants.push(req.user.id);
    await job.save();
    res.json({ message: 'Applied successfully!', job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;