// server.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// load jobs dataset
const jobsPath = path.join(__dirname, 'jobs.json');
let jobs = [];
try {
  jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
} catch (e) {
  console.error('Could not load jobs.json', e);
}

// Extend/modify this skills list as needed
const allSkills = [
  "python","javascript","react","node.js","node","express","django",
  "sql","mysql","postgresql","mongodb","html","css","git","github",
  "aws","azure","gcp","docker","kubernetes","data analysis","machine learning",
  "nlp","communication","excel","vba","java","c++","android","ios","tensorflow",
  "pytorch","rest","api","testing","selenium","linux","bash","typescript","redux",
  "c#", "dotnet", "flutter", "swift", "kotlin"
];

function normalize(text) {
  return (text || '').replace(/\r/g, ' ').replace(/\n/g, ' ').toLowerCase();
}

function extractSkills(text){
  const t = normalize(text);
  const found = new Set();
  for(const skill of allSkills){
    const s = skill.toLowerCase();
    // handle special characters in skill names for regex
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`\\b${escaped}\\b`, 'i');
    if(rx.test(t)) found.add(skill);
  }
  return Array.from(found);
}

function scoreMatch(resumeSkills, jobSkills){
  const resume = resumeSkills.map(x => x.toLowerCase());
  const job = jobSkills.map(x => x.toLowerCase());
  const matched = job.filter(s => resume.includes(s));
  const missing = job.filter(s => !resume.includes(s));
  const score = Math.round((matched.length / Math.max(job.length,1)) * 100);
  return { score, matched, missing };
}

// POST /api/upload  (field name: 'resume')
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = '';

    if(ext === '.pdf'){
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text || '';
    } else if(ext === '.docx'){
      const result = await mammoth.extractRawText({path: req.file.path});
      text = result.value || '';
    } else {
      // treat as plain text (txt or fallback)
      text = fs.readFileSync(req.file.path, 'utf8');
    }

    // remove temp file
    fs.unlinkSync(req.file.path);

    const skills = extractSkills(text);

    const jobResults = jobs.map(job => {
      const r = scoreMatch(skills, job.skills);
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        score: r.score,
        matched: r.matched,
        missing: r.missing,
        description: job.description
      };
    }).sort((a,b) => b.score - a.score);

    return res.json({ skills, results: jobResults });

  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: 'Processing error' });
  }
});

// GET /api/lessons/:skill
app.get('/api/lessons/:skill', (req, res) => {
  const skill = (req.params.skill || '').toLowerCase();

  // static lessons DB — replace/extend later
  const lessonsDB = {
    "python": [
      { id: "py-1", title: "Python: Print & Variables", body: "Use print('hello') and variables like x = 5. Try: print('hi')", time: 1 },
      { id: "py-2", title: "Python: Lists", body: "Lists: mylist = [1,2,3]. Use mylist.append(4).", time: 1 }
    ],
    "javascript": [
      { id: "js-1", title: "JS: console.log & let/const", body: "Use console.log('hi'); and let/const for variables.", time: 1 },
      { id: "js-2", title: "JS: Arrow functions", body: "()=>{} is a compact function. Try: [1,2].map(x=>x*2).", time: 1 }
    ],
    "react": [
      { id: "re-1", title: "React: Components", body: "A component: function App(){ return <div>Hello</div> }", time: 1 }
    ],
    "sql": [
      { id: "sql-1", title: "SQL: SELECT basics", body: "SELECT * FROM table WHERE id = 1;", time: 1 }
    ],
    "default": [
      { id: "d-1", title: "Quick learning tip", body: "Break tasks into small steps and practice every day.", time: 1 }
    ]
  };

  const lessons = lessonsDB[skill] || lessonsDB['default'];
  res.json({ skill, lessons });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SkillMap server running on http://localhost:${PORT}`));
