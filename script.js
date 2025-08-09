// PDF.js worker config
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// DOM references
const dom = {
  resumeUpload: document.getElementById('resumeUpload'),
  fileName: document.getElementById('fileName'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('errorMessage'),
  results: document.getElementById('results'),
  adviceList: document.getElementById('adviceList'),
  matchQuality: document.getElementById('matchQuality'),
  qualityLevel: document.querySelector('.quality-level'),
};

// Skill advice database for all skills (used for detection)
const adviceData = [
  { skill: 'sap cpi', message: 'Watch SAP CPI tutorials on SAP Learning Hub', link: 'https://learning.sap.com/' },
  { skill: 'sap pi', message: 'Practice SAP PI integration scenarios on openSAP', link: 'https://open.sap.com/courses' },
  { skill: 'python', message: 'Practice Python on HackerRank (Python domain)', link: 'https://www.hackerrank.com/domains/tutorials/10-days-of-python' },
  { skill: 'javascript', message: 'Practice JavaScript on freeCodeCamp', link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
  { skill: 'react', message: 'Complete React course on Codecademy', link: 'https://www.codecademy.com/learn/react-101' },
  { skill: 'node.js', message: 'Learn Node.js on NodeSchool', link: 'https://nodeschool.io/' },
  { skill: 'mongodb', message: 'Practice MongoDB basics on MongoDB University', link: 'https://university.mongodb.com/' },
  { skill: 'express', message: 'Explore Express tutorials on MDN', link: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs' },
  { skill: 'typescript', message: 'Learn TypeScript on official site', link: 'https://www.typescriptlang.org/docs/' },
  { skill: 'rest api', message: 'Build REST APIs with Postman tutorials', link: 'https://learning.postman.com/docs/getting-started/introduction/' },
  { skill: 'graphql', message: 'Explore GraphQL basics on HowToGraphQL', link: 'https://www.howtographql.com/' },
  { skill: 'django', message: 'Learn Django through Django Girls tutorial', link: 'https://tutorial.djangogirls.org/' },
  { skill: 'flask', message: 'Try Flask tutorials on Real Python', link: 'https://realpython.com/tutorials/flask/' },
  { skill: 'sql', message: 'Practice SQL queries on LeetCode', link: 'https://leetcode.com/problemset/database/' },
  { skill: 'aws', message: 'Explore AWS Fundamentals on AWS Training', link: 'https://aws.amazon.com/training/' },
  { skill: 'machine learning', message: 'Learn ML basics on Coursera', link: 'https://www.coursera.org/learn/machine-learning' },
  { skill: 'etl', message: 'Practice ETL concepts on DataCamp', link: 'https://www.datacamp.com/courses/introduction-to-etl' },
  { skill: 'pyspark', message: 'Learn PySpark on Databricks', link: 'https://databricks.com/spark/about' },
  { skill: 'hadoop', message: 'Practice Hadoop fundamentals on Udemy', link: 'https://www.udemy.com/topic/hadoop/' },
  { skill: 'airflow', message: 'Explore Apache Airflow tutorials', link: 'https://airflow.apache.org/docs/' },
  { skill: 'aws glue', message: 'Learn AWS Glue with AWS documentation', link: 'https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html' },
  { skill: 'docker', message: 'Learn Docker basics on Docker official', link: 'https://docs.docker.com/get-started/' },
  { skill: 'kubernetes', message: 'Practice Kubernetes on Katacoda', link: 'https://www.katacoda.com/courses/kubernetes' },
  { skill: 'jenkins', message: 'Explore Jenkins tutorials on Jenkins.io', link: 'https://www.jenkins.io/doc/tutorials/' },
  { skill: 'terraform', message: 'Learn Terraform on HashiCorp Learn', link: 'https://learn.hashicorp.com/terraform' },
  { skill: 'ci/cd', message: 'Understand CI/CD concepts on Atlassian', link: 'https://www.atlassian.com/continuous-delivery/ci-vs-cd' },
  { skill: 'azure', message: 'Practice Azure fundamentals on Microsoft Learn', link: 'https://docs.microsoft.com/en-us/learn/azure/' },
  { skill: 'gcp', message: 'Learn Google Cloud basics on Qwiklabs', link: 'https://www.qwiklabs.com/' },
];

// Jobs database with their keywords and advice
const jobData = [
  {
    role: "SAP CPI/PI Integration Consultant",
    keywords: ["sap cpi", "sap pi", "cloud integration", "ariba", "s4hana", "idoc", "soap", "odata", "sap cloud platform"],
    description: "Design and implement integration solutions between SAP and non-SAP systems using SAP Cloud Platform Integration (CPI) and Process Integration (PI).",
    advices: [
      { skill: "sap cpi", message: "Watch SAP CPI tutorials on SAP Learning Hub", link: "https://learning.sap.com/" },
      { skill: "sap pi", message: "Practice SAP PI integration scenarios on openSAP", link: "https://open.sap.com/courses" }
    ]
  },
  {
    role: "Full Stack Developer (MERN)",
    keywords: ["react", "node.js", "mongodb", "express", "javascript", "typescript", "rest api", "graphql"],
    description: "Build modern web applications using MongoDB, Express, React, and Node.js stack.",
    advices: [
      { skill: "react", message: "Complete React course on Codecademy", link: "https://www.codecademy.com/learn/react-101" },
      { skill: "node.js", message: "Learn Node.js on NodeSchool", link: "https://nodeschool.io/" },
      { skill: "mongodb", message: "Practice MongoDB basics on MongoDB University", link: "https://university.mongodb.com/" },
      { skill: "express", message: "Explore Express tutorials on MDN", link: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs" }
    ]
  },
  {
    role: "Python Developer",
    keywords: ["python", "django", "flask", "rest api", "sql", "aws", "machine learning"],
    description: "Develop backend services and data processing applications using Python.",
    advices: [
      { skill: "python", message: "Practice Python on HackerRank", link: "https://www.hackerrank.com/domains/tutorials/10-days-of-python" },
      { skill: "django", message: "Learn Django through Django Girls tutorial", link: "https://tutorial.djangogirls.org/" },
      { skill: "flask", message: "Try Flask tutorials on Real Python", link: "https://realpython.com/tutorials/flask/" }
    ]
  },
  {
    role: "DevOps Engineer",
    keywords: ["aws", "docker", "kubernetes", "jenkins", "terraform", "ci/cd", "azure", "gcp"],
    description: "Implement and manage continuous integration and deployment pipelines.",
    advices: [
      { skill: "docker", message: "Learn Docker basics on Docker official", link: "https://docs.docker.com/get-started/" },
      { skill: "kubernetes", message: "Practice Kubernetes on Katacoda", link: "https://www.katacoda.com/courses/kubernetes" },
      { skill: "jenkins", message: "Explore Jenkins tutorials on Jenkins.io", link: "https://www.jenkins.io/doc/tutorials/" },
      { skill: "terraform", message: "Learn Terraform on HashiCorp Learn", link: "https://learn.hashicorp.com/terraform" }
    ]
  },
  {
    role: "Data Engineer",
    keywords: ["etl", "pyspark", "hadoop", "airflow", "aws glue", "sql"],
    description: "Design and maintain data pipelines and workflows.",
    advices: [
      { skill: "etl", message: "Practice ETL concepts on DataCamp", link: "https://www.datacamp.com/courses/introduction-to-etl" },
      { skill: "pyspark", message: "Learn PySpark on Databricks", link: "https://databricks.com/spark/about" },
      { skill: "hadoop", message: "Practice Hadoop fundamentals on Udemy", link: "https://www.udemy.com/topic/hadoop/" }
    ]
  },
];

// --- Utility Functions ---

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const maxPages = Math.min(pdfDoc.numPages, 10); // limit to first 10 pages

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + ' ';
  }

  return fullText.toLowerCase();
}

function showError(msg) {
  dom.errorMessage.textContent = msg;
  dom.error.classList.remove('hidden');
}

function hideError() {
  dom.error.classList.add('hidden');
  dom.errorMessage.textContent = '';
}

function clearJobMatches() {
  const existing = dom.results.querySelector('.job-matches');
  if (existing) existing.remove();
  dom.adviceList.innerHTML = '';
}

function updateMatchPercent(percent) {
  dom.matchQuality.textContent = `Match %: ${percent}%`;
  dom.qualityLevel.style.width = `${percent}%`;

  // Color coding match bar
  if (percent >= 80) {
    dom.qualityLevel.style.backgroundColor = 'var(--success)';
  } else if (percent >= 50) {
    dom.qualityLevel.style.backgroundColor = 'var(--warning)';
  } else {
    dom.qualityLevel.style.backgroundColor = 'var(--danger)';
  }
}

function renderJobMatches(jobs) {
  clearJobMatches();

  const container = document.createElement('div');
  container.className = 'job-matches';

  jobs.forEach(job => {
    const jobDiv = document.createElement('div');
    jobDiv.className = 'job-item';
    jobDiv.innerHTML = `
      <h3>${job.role} (${job.matchPercent}%)</h3>
      <p>${job.description}</p>
    `;
    container.appendChild(jobDiv);
  });

  dom.results.insertBefore(container, dom.adviceList);
}

function renderAdviceList(missingAdvices, matchedSkills) {
  dom.adviceList.innerHTML = '<h3>Missing Skills Checklist (Top Job)</h3>';

  missingAdvices.forEach(advice => {
    const id = 'chk_' + advice.skill.replace(/\s+/g, '_');
    const div = document.createElement('div');
    div.className = 'advice-item';

    div.innerHTML = `
      <input type="checkbox" id="${id}" data-skill="${advice.skill}">
      <label for="${id}">${advice.skill} - ${advice.message} <a href="${advice.link}" target="_blank">Learn More</a></label>
    `;

    dom.adviceList.appendChild(div);
  });

  // Add checkbox listener to update match percentage live
  dom.adviceList.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const totalSkills = matchedSkills.length + missingAdvices.length;
      const checkedCount = matchedSkills.length + dom.adviceList.querySelectorAll('input[type="checkbox"]:checked').length;
      const newPercent = Math.round((checkedCount / totalSkills) * 100);
      updateMatchPercent(newPercent);
    });
  });
}

// --- Main Analyze Logic ---

async function analyzeResume() {
  const file = dom.resumeUpload.files[0];
  if (!file) {
    showError('Please select a PDF file first.');
    return;
  }

  dom.analyzeBtn.disabled = true;
  dom.loading.classList.remove('hidden');
  hideError();
  dom.results.classList.add('hidden');
  clearJobMatches();
  updateMatchPercent(0);

  try {
    const text = await extractTextFromPDF(file);

    // Detect skills present in resume
    const detectedSkills = [];
    adviceData.forEach(advice => {
      if (text.includes(advice.skill)) {
        detectedSkills.push(advice.skill);
      }
    });

    // Calculate job matches
    const jobMatches = jobData.map(job => {
      const matchedSkills = job.keywords.filter(k => detectedSkills.includes(k));
      const matchPercent = Math.round((matchedSkills.length / job.keywords.length) * 100);
      return {
        role: job.role,
        description: job.description,
        keywords: job.keywords,
        advices: job.advices,
        matchedSkills,
        matchPercent,
      };
    });

    // Sort jobs by match percent descending
    jobMatches.sort((a, b) => b.matchPercent - a.matchPercent);

    // Show top 3 jobs
    renderJobMatches(jobMatches.slice(0, 3));

    // For top job, show checklist for missing skills
    const topJob = jobMatches[0];

    if (topJob.matchPercent === 100) {
      dom.adviceList.innerHTML = '<p>You have strong skills for this role! No advice needed.</p>';
      updateMatchPercent(100);
    } else {
      const missingSkills = topJob.keywords.filter(k => !topJob.matchedSkills.includes(k));
      const missingAdvices = topJob.advices.filter(a => missingSkills.includes(a.skill));

      if (missingAdvices.length === 0) {
        dom.adviceList.innerHTML = '<p>No specific advice available for missing skills.</p>';
        updateMatchPercent(topJob.matchPercent);
      } else {
        renderAdviceList(missingAdvices, topJob.matchedSkills);
        updateMatchPercent(topJob.matchPercent);
      }
    }

    dom.results.classList.remove('hidden');
  } catch (err) {
    showError('Failed to process PDF: ' + err.message);
  } finally {
    dom.loading.classList.add('hidden');
    dom.analyzeBtn.disabled = false;
  }
}

// --- Event Listeners ---

dom.resumeUpload.addEventListener('change', () => {
  const file = dom.resumeUpload.files[0];
  if (file) {
    dom.fileName.textContent = file.name;
    dom.analyzeBtn.disabled = false;
  } else {
    dom.fileName.textContent = 'Choose PDF Resume';
    dom.analyzeBtn.disabled = true;
  }
});

dom.analyzeBtn.addEventListener('click', analyzeResume);
