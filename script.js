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

let baseMatchScore = 0;

// Handle file input change
dom.resumeUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.type !== 'application/pdf') {
      showError('Please upload a PDF file');
      dom.analyzeBtn.disabled = true;
      dom.fileName.textContent = 'Choose PDF Resume';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File size exceeds 5MB limit');
      dom.analyzeBtn.disabled = true;
      dom.fileName.textContent = 'Choose PDF Resume';
      return;
    }

    hideError();
    dom.fileName.textContent = file.name;
    dom.analyzeBtn.disabled = false;
  } else {
    dom.fileName.textContent = 'Choose PDF Resume';
    dom.analyzeBtn.disabled = true;
  }
});

// Show error message
function showError(message) {
  dom.errorMessage.textContent = message;
  dom.error.classList.remove('hidden');
}

// Hide error message
function hideError() {
  dom.error.classList.add('hidden');
  dom.errorMessage.textContent = '';
}

// Analyze resume by uploading to backend
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
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to analyze resume');
    }

    const data = await response.json();

    baseMatchScore = data.jobs[0]?.matchScore || 0;

    displayResults(data.skills, data.jobs, data.missingKeywords, data.advice);
  } catch (err) {
    showError(err.message);
    console.error('Analysis error:', err);
  } finally {
    dom.loading.classList.add('hidden');
    dom.analyzeBtn.disabled = false;
  }
}

dom.analyzeBtn.addEventListener('click', analyzeResume);

// Display results
function displayResults(skills, jobs, missingKeywords, advice) {
  dom.results.classList.remove('hidden');

  // Skills
  dom.skills.innerHTML = skills.length
    ? skills.map((skill) => `<div class="skill-item">${skill}</div>`).join('')
    : '<p class="no-skills">No significant skills detected</p>';

  // Jobs
  if (jobs.length > 0) {
    dom.jobs.innerHTML = jobs
      .slice(0, 3)
      .map(
        (job) => `
      <div class="job-card">
        <h4>${job.role} <span class="match-score">${job.matchScore}% match</span></h4>
        <p>${job.description}</p>
        ${
          job.matchedKeywords && job.matchedKeywords.length > 0
            ? `<div class="matched-keywords">
                <strong>Matched Skills:</strong> ${job.matchedKeywords
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
    dom.jobs.innerHTML = '<p class="no-jobs">No suitable jobs found</p>';
    updateMatchQuality(0);
  }

  // Improvement Suggestions
  if (missingKeywords && missingKeywords.length > 0) {
    let adviceHTML = missingKeywords
      .map((skill, i) => {
        const advices = advice || [];
        const relevantAdvice = advices.length > 0 ? advices.map(a => `<li><a href="${a.url}" target="_blank">${a.text}</a></li>`).join('') : '<li>No advice available</li>';
        return `
        <div class="missing-skill">
          <strong>${skill}</strong>
          <ul class="advice-list">${relevantAdvice}</ul>
        </div>`;
      })
      .join('');
    dom.gapAnalysis.innerHTML = adviceHTML;
  } else {
    dom.gapAnalysis.innerHTML = '<p>No improvement suggestions needed!</p>';
  }
}

// Update match quality UI
function updateMatchQuality(score) {
  dom.matchQuality.textContent = score >= 70 ? 'Excellent Match' : score >= 40 ? 'Good Match' : 'Poor Match';
  dom.qualityLevel.style.width = `${score}%`;
}
