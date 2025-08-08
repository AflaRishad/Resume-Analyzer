const express = require('express');
const fileUpload = require('express-fileupload');
const pdf = require('pdf-parse');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));

// API endpoint for resume analysis
app.post('/api/analyze', async (req, res) => {
  if (!req.files?.resume) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = await pdf(req.files.resume.data);
    const text = data.text;
    
    // Simple keyword matching (replace with your logic)
    const isSAP = text.toLowerCase().includes('sap cpi') || 
                  text.toLowerCase().includes('sap pi');
    const isDeveloper = text.toLowerCase().includes('python') || 
                       text.toLowerCase().includes('javascript');
    
    res.json({
      skills: isSAP ? ['SAP CPI/PI'] : isDeveloper ? ['Python/JS'] : ['General IT'],
      jobs: isSAP ? 
        ['SAP Integration Consultant'] : 
        isDeveloper ? ['Software Engineer'] : ['IT Specialist']
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
