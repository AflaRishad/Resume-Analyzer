import formidable from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,  // Disable built-in body parser
  },
};

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await loadJobsData();

  const form = new formidable.IncomingForm();

  try {
    // Wrap form.parse in a Promise and await it!
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log('File received:', files.resume);

    if (!files.resume) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file buffer
    const fileBuffer = await fs.readFile(files.resume.filepath);

    // Parse PDF text
    const data = await pdf(fileBuffer);
    const text = data.text.toLowerCase();

    // Keyword matching logic
    const allKeywords = [...new Set(jobsData.flatMap(job => job.keywords))];
    const foundSkills = allKeywords.filter(keyword => text.includes(keyword.toLowerCase()));

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
  } catch (err) {
    console.error('Error handling upload or parsing:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
}
