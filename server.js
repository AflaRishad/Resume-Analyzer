const express = require('express');
const fileUpload = require('express-fileupload');
const pdf = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));

// Load jobs from file once at startup
let jobsData = [];
const jobsFilePath = path.join(__dirname, 'jobs.json');

try {
  const rawData = fs.readFileSync(jobsFilePath);
  jobsData = JSON.parse(rawData);
  console.log(`Loaded ${jobsData.length} jobs from jobs.json`);
} catch (err) {
  console.error('Failed to load jobs.json:', err.message);
}

// API endpoint for resume analysis
app.post('/api/analyze', async (req, res) => {
  if (!req.files?.resume) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Extract text from PDF buffer
    const data = await pdf(req.files.resume.data);
    const text = data.text.toLowerCase();

    // Prepare skills found (keywords matched in whole text)
    const allKeywords = [...new Set(jobsData.flatMap(job => job.keywords))];
    const foundSkills = allKeywords.filter(keyword => text.includes(keyword.toLowerCase()));

    // Match each job with found keywords and calculate score
    const matchedJobs = jobsData
      .map(job => {
        const matchedKeywords = job.keywords.filter(keyword => text.includes(keyword.toLowerCase()));
        const matchScore = Math.min(100, Math.round((matchedKeywords.length / job.keywords.length) * 100));

        return {
          ...job,
          matchedKeywords,
          matchScore,
        };
      })
      .filter(job => job.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Find missing keywords for top job
    let missingKeywords = [];
    let topJob = null;
    if (matchedJobs.length > 0) {
      topJob = matchedJobs[0];
      missingKeywords = topJob.keywords.filter(keyword => !text.includes(keyword.toLowerCase()));
    }

    // Return response with skills, matched jobs, and missing keywords + advice
    res.json({
      skills: foundSkills,
      jobs: matchedJobs,
      missingKeywords: missingKeywords.slice(0, 5),
      advice: topJob ? topJob.advice || [] : []
    });
  } catch (err) {
    console.error('Error during resume analysis:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
