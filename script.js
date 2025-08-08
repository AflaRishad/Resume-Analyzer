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
  qualityLevel: document.querySelector('.quality-level')
};

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
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      text += content.items.map(item => item.str).join(' ') + ' ';
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
    
    // Get all unique keywords from all jobs
    const allKeywords = [...new Set(jobsData.flatMap(job => job.keywords))];
    
    // Find skills in resume text
    const foundSkills = allKeywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));
    
    // Match jobs with scores and matched keywords
    const matchedJobs = jobsData.map(job => {
      const matchedKeywords = job.keywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));
      const missingKeywords = job.keywords.filter(keyword => !lowerText.includes(keyword.toLowerCase()));
      const matchScore = Math.min(100, Math.round((matchedKeywords.length / job.keywords.length) * 100));
      
      return {
        ...job,
        matchedKeywords,
        missingKeywords,
        matchScore
      };
    }).filter(job => job.matchScore > 10); // Filter out very low matches
    
    // Sort descending by match score
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('Analysis completed');
    return {
      skills: foundSkills,
      matchedJobs
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
  
  dom.analyzeBtn.disabled = true;
  dom.loading.classList.remove('hidden');
  hideError();
  dom.results.classList.add('hidden');
  
  try {
    const text = await extractTextFromPDF(file);
    console.log('Extracted Text Sample:', text.substring(0, 200) + '...');
    
    const { skills, matchedJobs } = await analyzeResumeText(text);
    
    displayResults(skills, matchedJobs);
  } catch (err) {
    showError(err.message);
    console.error('Full Analysis Error:', err);
  } finally {
    dom.loading.classList.add('hidden');
    dom.analyzeBtn.disabled = false;
  }
}

// Display Results
function displayResults(skills, matchedJobs) {
  dom.skills.innerHTML = skills.length > 0
    ? skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')
    : '<p class="no-skills">No significant skills detected</p>';

  if (matchedJobs.length === 0) {
    dom.jobs.innerHTML = '<p class="no-jobs">No suitable jobs found based on your resume.</p>';
    dom.matchQuality.textContent = 'Weak Match';
    dom.qualityLevel.style.width = '20%';
    dom.qualityLevel.style.backgroundColor = 'var(--warning)';
    dom.gapAnalysis.innerHTML = '';
    removeWarningMessage();
    dom.results.classList.remove('hidden');
    return;
  }

  dom.jobs.innerHTML = matchedJobs.slice(0, 5).map(job => `
    <div class="job-card">
      <h4>${job.role} <span class="match-score">${job.matchScore}% match</span></h4>
      <p>${job.description}</p>
      <div>
        <strong>Matched Skills:</strong> ${job.matchedKeywords.map(k => `<span class="matched-keyword">${k}</span>`).join(' ')}
      </div>
      ${job.missingKeywords.length > 0 ? `
        <div style="margin-top:8px;">
          <strong>Skills to Improve:</strong> ${job.missingKeywords.slice(0, 5).map(k => `<span class="missing-skill">${k}</span>`).join(' ')}
        </div>` : ''}
    </div>
  `).join('');

  const topJob = matchedJobs[0];
  dom.qualityLevel.style.width = `${topJob.matchScore}%`;

  if (topJob.matchScore >= 80) {
    dom.matchQuality.textContent = 'Excellent Match';
    dom.qualityLevel.style.backgroundColor = 'var(--success)';
  } else if (topJob.matchScore >= 50) {
    dom.matchQuality.textContent = 'Good Match';
    dom.qualityLevel.style.backgroundColor = 'var(--primary)';
  } else {
    dom.matchQuality.textContent = 'Partial Match';
    dom.qualityLevel.style.backgroundColor = 'var(--warning)';
  }

  if (topJob.missingKeywords.length > 0) {
    dom.gapAnalysis.innerHTML = `
      <p>To improve your match for <strong>${topJob.role}</strong>, consider learning these skills:</p>
      <div class="missing-skills">
        ${topJob.missingKeywords.slice(0, 5).map(skill => `<span class="missing-skill">${skill}</span>`).join('')}
      </div>
    `;
  } else {
    dom.gapAnalysis.innerHTML = '<p>Your skills strongly match the top recommended role!</p>';
  }

  // Show warning message if top match score < 50%
  if (topJob.matchScore < 50) {
    showWarningMessage('Ninne kond ee pani nadakkunn thonnun illa!!');
  } else {
    removeWarningMessage();
  }

  dom.results.classList.remove('hidden');
}

function showWarningMessage(message) {
  let warningElem = document.getElementById('warningMessage');
  if (!warningElem) {
    warningElem = document.createElement('p');
    warningElem.id = 'warningMessage';
    warningElem.className = 'warning-message';
    dom.results.appendChild(warningElem);
  }
  warningElem.textContent = message;
}

function removeWarningMessage() {
  const warningElem = document.getElementById('warningMessage');
  if (warningElem) warningElem.remove();
}

// Error Handling
function showError(message) {
  dom.errorMessage.textContent = message;
  dom.error.classList.remove('hidden');
}

function hideError() {
  dom.error.classList.add('hidden');
}

// Initialize
console.log('Resume Analyzer initialized');
