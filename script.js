// public/script.js
const uploadBtn = document.getElementById('uploadBtn');
const resumeFile = document.getElementById('resumeFile');
const status = document.getElementById('status');
const skillsSection = document.getElementById('skillsSection');
const skillsList = document.getElementById('skillsList');
const jobsSection = document.getElementById('jobsSection');
const jobsList = document.getElementById('jobsList');
const lessonsSection = document.getElementById('lessonsSection');
const lessonsList = document.getElementById('lessonsList');

uploadBtn.addEventListener('click', async () => {
  if(!resumeFile.files.length){
    alert('Choose a PDF, DOCX or TXT resume file first');
    return;
  }
  status.textContent = 'Uploading and analyzing...';
  const fd = new FormData();
  fd.append('resume', resumeFile.files[0]);

  try {
    const res = await fetch('/api/upload', { method:'POST', body: fd });
    const data = await res.json();
    if(data.error){
      status.textContent = 'Error: ' + data.error;
      return;
    }

    status.textContent = 'Analysis complete';
    showSkills(data.skills);
    showJobs(data.results);

    const topJob = data.results[0];
    const missing = topJob ? topJob.missing : [];
    if(missing.length){
      fetchLessonsForSkills(missing.slice(0,3));
    } else {
      lessonsSection.style.display = 'none';
    }
  } catch(err){
    console.error(err);
    status.textContent = 'Server error';
  }
});

function showSkills(skills){
  skillsSection.style.display = 'block';
  skillsList.innerHTML = '';
  if(skills.length === 0){
    skillsList.textContent = 'No skills detected. Try a different resume or add skills manually.';
    return;
  }
  skills.forEach(s => {
    const el = document.createElement('span');
    el.textContent = s;
    skillsList.appendChild(el);
  });
}

function showJobs(jobs){
  jobsSection.style.display = 'block';
  jobsList.innerHTML = '';
  jobs.forEach(job => {
    const div = document.createElement('div');
    div.className = 'job';
    div.innerHTML = `
      <div>
        <span class="title">${job.title}</span>
        <span class="badge">${job.score}% match</span>
      </div>
      <div>${job.company} — ${job.location}</div>
      <div style="margin-top:6px; color:#555;">Missing: ${job.missing.length ? job.missing.join(', ') : 'None'}</div>
      <div style="margin-top:8px;"><a class="apply" href="${job.url}" target="_blank">View job</a></div>
    `;
    jobsList.appendChild(div);
  });
}

async function fetchLessonsForSkills(skills){
  lessonsSection.style.display = 'block';
  lessonsList.innerHTML = '';
  for(const s of skills){
    const res = await fetch(`/api/lessons/${encodeURIComponent(s)}`);
    const data = await res.json();
    const header = document.createElement('h4');
    header.textContent = `Lessons for: ${s}`;
    lessonsList.appendChild(header);

    data.lessons.forEach(lesson => {
      const div = document.createElement('div');
      div.className = 'lesson';
      div.innerHTML = `
        <div><strong>${lesson.title}</strong> <small>(${lesson.time} min)</small></div>
        <div style="margin-top:8px;">${lesson.body}</div>
        <div style="margin-top:8px;"><button class="small" data-lesson="${lesson.id}">Mark done</button></div>
      `;
      lessonsList.appendChild(div);
    });
  }

  lessonsList.addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON'){
      e.target.textContent = 'Done ✓';
      e.target.disabled = true;
    }
  });
}
