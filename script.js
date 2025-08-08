// Add or replace this function in script.js to send file to serverless API
async function analyzeResume() {
  const fileInput = document.getElementById('resumeUpload');
  const file = fileInput.files[0];

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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze resume');
    }

    const result = await response.json();

    currentMatchedRoles = result.jobs;
    baseMatchScore = result.jobs[0]?.matchScore || 0;
    currentMissingSkills = result.missingKeywords;
    improvementState = {};

    displayResults(result.skills, result.jobs, result.missingKeywords);
  } catch (err) {
    showError(err.message);
    console.error('Full Analysis Error:', err);
  } finally {
    dom.loading.classList.add('hidden');
    dom.analyzeBtn.disabled = false;
  }
}
