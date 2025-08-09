const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(fileUpload());

// POST /api/analyze - receives PDF, extracts text, sends back snippet
app.post('/api/analyze', async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const file = req.files.resume;
    const buffer = file.data;

    const data = await pdfParse(buffer);

    // Return first 10,000 chars to avoid huge data
    const text = data.text.slice(0, 10000);

    res.json({ text });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

app.listen(port, () => {
  console.log(`Resume analyzer server running on port ${port}`);
});
