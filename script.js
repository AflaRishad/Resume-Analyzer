// PDF.js worker initialization
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// DOM Elements
const dom = {
  resumeUpload: document.getElementById('resumeUpload'),
  fileName: document.getElementById('fileName'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('errorMessage'),
  results: document.getElementById('results'),
  skills: document.getElementById('skills'),
  jobs: document.getElementById('jobs'),
  gapAnalysis: document.getElementById('gapAnalysis'),
  matchQuality: document.getElementById('matchQuality'),
  qualityLevel: document.querySelector('.quality-level'),
};

let currentMatchedRoles = [];
let baseMatchScore = 0;
let currentMissingSkills = [];
let improvementState = {}; // Track completed advice per missing skill

// Event Listeners
dom.resumeUpload.addEventListener('change', handleFileSelect);
dom.analyzeBtn.addEventListener('click', analyzeResume);

// File Selection Handler
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    // Validate file type and size
    if (!file.type.includes('pdf')) {
      showError('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showError('File size exceeds 5MB limit');
      return;
    }

    dom.fileName.textContent = file.name;
    dom.analyzeBtn.disabled = false;
    hideError();
  } else {
    dom.fileName.textContent = 'Choose PDF Resume';
    dom.analyzeBtn.disabled = true;
  }
}

// PDF Text Extraction
async function extractTextFromPDF(file) {
  try {
    console.log('Starting PDF extraction...');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    if (pdf.numPages < 1) {
      throw new Error('The PDF appears to be empty');
    }

    let text = '';
    const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + ' ';
    }

    if (text.trim().length < 50) {
      throw new Error('Could not extract sufficient text (scanned/image PDF?)');
    }

    console.log('PDF extraction successful');
    return text;
  } catch (err) {
    console.error('PDF Extraction Error:', err);
    throw new Error(`Failed to read PDF: ${err.message}`);
  }
}

// Resume Analysis
async function analyzeResumeText(text) {
  try {
    console.log('Starting resume analysis...');

    const response = await fetch('jobs.json');
    if (!response.ok) throw new Error('Failed to load job data');

    const jobsData = await response.json();
    if (!Array.isArray(jobsData)) throw new Error('Invalid job data format');

    const lowerText = text.toLowerCase();

    // Collect all keywords once
    const allKeywords = [...new Set(jobsData.flatMap((job) => job.keywords))];

    // Find skills found in resume
    const foundSkills = allKeywords.filter((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );

    // Match jobs & calculate scores
    const matchedRoles = jobsData
      .map((job) => {
        const matchedKeywords = job.keywords.filter((keyword) =>
          lowerText.includes(keyword.toLowerCase())
        );

        return {
          ...job,
          matchScore: Math.min(
            100,
            Math.round((matchedKeywords.length / job.keywords.length) * 100)
          ),
          matchedKeywords,
        };
      })
      .filter((job) => job.matchScore > 20) // Minimum 20% match to show
      .sort((a, b) => b.matchScore - a.matchScore);

    // Skills gap for top job
    let missingKeywords = [];
    if (matchedRoles.length > 0) {
      const topJob = matchedRoles[0];
      missingKeywords = topJob.keywords.filter(
        (keyword) => !lowerText.includes(keyword.toLowerCase())
      );
    }

    console.log('Analysis completed successfully');
    return {
      skills: foundSkills,
      matchedRoles,
      missingKeywords: missingKeywords.slice(0, 5), // Limit top 5 missing skills
    };
  } catch (err) {
    console.error('Analysis Error:', err);
    throw new Error(`Analysis failed: ${err.message}`);
  }
}

// Main Analysis Function
async function analyzeResume() {
  const file = dom.resumeUpload.files[0];
  if (!file) {
    showError('Please select a PDF file first');
    return;
  }

  // Reset UI
  dom.analyzeBtn.disabled = true;
  dom.loading.classList.remove('hidden');
  hideError();
  dom.results.classList.add('hidden');

  try {
    const text = await extractTextFromPDF(file);
    console.log('Extracted Text Sample:', text.substring(0, 200) + '...');

    const { skills, matchedRoles, missingKeywords } = await analyzeResumeText(text);

    // Save to global for improvement tracking
    currentMatchedRoles = matchedRoles;
    baseMatchScore = matchedRoles[0]?.matchScore || 0;
    currentMissingSkills = missingKeywords;
    improvementState = {}; // reset progress

    displayResults(skills, matchedRoles, missingKeywords);
  } catch (err) {
    showError(err.message);
    console.error('Full Analysis Error:', err);
  } finally {
    dom.loading.classList.add('hidden');
    dom.analyzeBtn.disabled = false;
  }
}

// Display Results
function displayResults(skills, matchedRoles, missingKeywords) {
  // Skills
  dom.skills.innerHTML =
    skills.length > 0
      ? skills.map((skill) => `<div class="skill-item">${skill}</div>`).join('')
      : '<p class="no-skills">No significant skills detected</p>';

  // Jobs
  if (matchedRoles.length > 0) {
    dom.jobs.innerHTML = matchedRoles
      .slice(0, 3)
      .map(
        (job) => `
      <div class="job-card">
        <h4>${job.role} <span class="match-score">${job.matchScore}% match</span></h4>
        <p>${job.description}</p>
        ${
          job.matchedKeywords.length > 0
            ? `<div class="matched-keywords">
              <strong>Matched Skills:</strong>
              ${job.matchedKeywords
                .map((k) => `<span class="matched-keyword">${k}</span>`)
                .join('')}
            </div>`
            : ''
        }
      </div>`
      )
      .join('');

    updateMatchQuality(baseMatchScore);
  } else {
    dom.jobs.innerHTML =
      '<
