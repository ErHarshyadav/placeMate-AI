const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Smart AI Career & Resume Matcher
router.post('/analyze', authMiddleware, async (req, res) => {
  const { skills, jobDescription } = req.body;
  if (!skills || !jobDescription) {
    return res.status(400).json({ message: 'Please provide both your skills and job description!' });
  }

  const userSkills = skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const jdText = jobDescription.toLowerCase();

  const matched = userSkills.filter(skill => jdText.includes(skill));
  const commonTech = ['react', 'node', 'mongodb', 'javascript', 'python', 'java', 'sql', 'express', 'html', 'css', 'git', 'aws'];
  const missing = commonTech.filter(tech => jdText.includes(tech) && !userSkills.includes(tech));

  const score = userSkills.length > 0 ? Math.min(95, Math.round((matched.length / userSkills.length) * 100) + 20) : 50;

  res.json({
    matchScore: `${score}%`,
    matchedSkills: matched.length ? matched : ['General Aptitude'],
    missingSkills: missing.length ? missing : ['None! Your profile looks great.'],
    interviewTips: [
      `Prepare strong real-world examples around ${matched.length ? matched.join(', ') : 'your core projects'}.`,
      `Review system design basics and REST API architecture.`,
      `Be ready to explain your role and problem-solving approach in your projects.`
    ]
  });
});

module.exports = router;