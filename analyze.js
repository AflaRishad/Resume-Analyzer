import pdf from 'pdf-parse';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

// Load jobs data from JSON file once at startup
let jobsData = [];

const jobsFilePath = path.join(process.cwd(), 'jobs.json');

async function loadJobsData() {
  if (jobsData.length === 0) {
    try {
      const rawData = await fs.readFile(jobsFilePath, 'utf8');
      jobsData = JSON.parse(rawData);
      console.log(`Loaded ${jobsData.length} jobs from jobs.json`);
    } catch (err) {
      console.error('Failed to load jobs.json:', err.message);
      jobsData = [];
    }
  }
}

// Tell Vercel to disable default body parsing (to handle file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await loadJobsData();

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Error parsing file upload' });
    }

    const resumeFile = files.resume;
    if (!resumeFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Read file buffer from the temp filepath
      const fileBuffer = await fs.readFile(resumeFile.filepath);

      const data = await pdf(fileBuffer);
      const text = data.text.toLowerCase();

      // Collect all keywords
      const allKeywords = [...new Set(jobsData.flatMap(job => job.keywords))];
      const foundSkills = allKeywords.filter(keyword => text.includes(keyword.toLowerCase()));

      // Match jobs with keywords
      const matchedJobs = jobsData
        .map(job => {
          const matchedKeywords = job.keywords.filter(keyword => text.includes(keyword.toLowerCase()));
          const matchScore = Math.min(100, Math.round((matchedKeywords.length / job.keywords.length) * 100));
          return { ...job, matchedKeywords, matchScore };
        })
        .filter(job => job.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore);

      let missingKeywords = [];
      let topJob = null;
      if (matchedJobs.length > 0) {
        topJob = matchedJobs[0];
        missingKeywords = topJob.keywords.filter(keyword => !text.includes(keyword.toLowerCase()));
      }

      res.status(200).json({
        skills: foundSkills,
        jobs: matchedJobs,
        missingKeywords: missingKeywords.slice(0, 5),
        advice: topJob ? topJob.advice || [] : [],
      });
    } catch (error) {
      console.error('PDF parsing error:', error);
      res.status(500).json({ error: 'Failed to analyze resume' });
    }
  });
}
