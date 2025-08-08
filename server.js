const express = require('express');
const fileUpload = require('express-fileupload');
const pdf = require('pdf-parse');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));

app.post('/api/analyze', async (req, res) => {
  if (!req.files || !req.files.resume) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = await pdf(req.files.resume.data);
    res.json({ text: data.text.substring(0, 500) }); // send first 500 chars
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
