function displayResults(skills, matchedRoles, missingKeywords) {
  // Display skills
  dom.skills.innerHTML = skills.length > 0
    ? skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')
    : '<p class="no-skills">No significant skills detected</p>';

  // Display job matches
  if (matchedRoles.length > 0) {
    dom.jobs.innerHTML = matchedRoles.slice(0, 3).map(job => `
      <div class="job-card">
        <h4>${job.role} <span class="match-score">${job.matchScore}% match</span></h4>
        <p>${job.description}</p>
        ${job.matchedKeywords.length > 0 ? `
          <div class="matched-keywords">
            <strong>Matched Skills:</strong>
            ${job.matchedKeywords.map(k => `<span class="matched-keyword">${k}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    // Update match quality indicator
    const topScore = matchedRoles[0].matchScore;
    dom.qualityLevel.style.width = `${topScore}%`;

    if (topScore >= 80) {
      dom.matchQuality.textContent = 'Excellent Match';
      dom.qualityLevel.style.backgroundColor = 'var(--success)';
      dom.gapAnalysis.innerHTML = missingKeywords.length > 0
        ? `<p>To improve further, consider learning:</p>
           <div class="missing-skills">
             ${missingKeywords.map(skill => `<span class="missing-skill">${skill}</span>`).join('')}
           </div>`
        : '<p>Your skills strongly match the top recommended roles!</p>';
    } else if (topScore >= 50) {
      dom.matchQuality.textContent = 'Good Match';
      dom.qualityLevel.style.backgroundColor = 'var(--primary)';
      dom.gapAnalysis.innerHTML = missingKeywords.length > 0
        ? `<p>To improve further, consider learning:</p>
           <div class="missing-skills">
             ${missingKeywords.map(skill => `<span class="missing-skill">${skill}</span>`).join('')}
           </div>`
        : '<p>Your skills strongly match the top recommended roles!</p>';
    } else {
      // Below 50% match: show the special warning message + missing skills
      dom.matchQuality.textContent = 'Weak Match';
      dom.qualityLevel.style.width = `${topScore}%`;
      dom.qualityLevel.style.backgroundColor = 'var(--danger)';

      dom.gapAnalysis.innerHTML = `
        <div class="warning-message">
          <p>Ninne kond ee pani nadakkunn thonnun illa!!</p>
          <p><strong>Kuzhppm illa nammk, ini ithu koodi padikkanam:</strong></p>
          <div class="missing-skills">
            ${missingKeywords.length > 0
              ? missingKeywords.map(skill => `<span class="missing-skill">${skill}</span>`).join('')
              : '<span>No specific skills detected. Try enhancing your resume content.</span>'}
          </div>
        </div>
      `;
    }
  } else {
    dom.jobs.innerHTML = '<p class="no-jobs">No strong job matches found. Try adding more skills to your resume.</p>';
    dom.matchQuality.textContent = 'Weak Match';
    dom.qualityLevel.style.width = '20%';
    dom.qualityLevel.style.backgroundColor = 'var(--warning)';
    dom.gapAnalysis.innerHTML = '';
  }

  // Show results
  dom.results.classList.remove('hidden');
}
