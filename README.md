# Resume Skill Improver 🎯

## Basic Details  
### Team Name: Nova Squad  
### Team Members  
- Team Lead: Afla Rishad - College of Engineering and Management Punnapra  
- Member 2: Anagha Robert - College of Engineering and Management Punnapra  

### Project Description  
Resume Skill Improver is a web-based tool that scans a user’s resume PDF to detect their existing skills and suggests personalized advice to improve skills relevant to top job roles. It helps users understand which jobs they are best suited for and guides them step-by-step to enhance their profile.

### The Problem (that doesn't exist)  
Most job seekers struggle to understand how well their resume matches the job market requirements and what skills they lack for their desired roles. Manually identifying skill gaps and improvement areas can be tedious and confusing.

### The Solution (that nobody asked for)  
We built Resume Skill Improver to automatically analyze resumes, detect skills, recommend the top 3 job roles fitting the candidate’s skillset, and provide personalized, actionable advice on missing skills — all in one place. Now, job hunting can be fun and focused!

## Live Demo  
Experience the project in action:  
👉 [Resume Skill Improver](https://useless-detction.vercel.app/)

## Technical Details  
### Technologies/Components Used  

For Software:  
- Languages: JavaScript, HTML, CSS  
- Frameworks/Libraries: PDF.js for PDF parsing  
- Tools: Modern web browser (Chrome, Firefox)  

For Hardware:  
- No hardware components involved  

### Implementation  

For Software:  

#### Installation  
Simply open `index.html` in a modern web browser. No additional installation required.  

#### Run  
1. Upload your PDF resume file using the interface.  
2. Click the **Analyze Resume** button.  
3. View your top 3 matching job roles and personalized advice on missing skills.  
4. Use the checklist to track your improvement progress dynamically.  

## Project Documentation
<img width="1920" height="1032" alt="Screenshot 2025-08-09 054328" src="https://github.com/user-attachments/assets/b749c546-fd40-4b4d-9404-4808aafbf228" />
This screenshot shows the initial page where the user uploads their PDF resume file to be analyzed.

<img width="1920" height="1032" alt="Screenshot 2025-08-09 054347" src="https://github.com/user-attachments/assets/a8d909a2-e12f-45d5-9208-e8a621068e8b" />
This screenshot displays the skill match percentages for the top 3 suitable job roles immediately after the resume is processed.

<img width="1920" height="1032" alt="Screenshot 2025-08-09 054759" src="https://github.com/user-attachments/assets/5899adec-a00a-4f9c-96b0-6cb30a895b94" />
This screenshot shows the personalized skill improvement advice checklist for the top job role. As the user checks off skills they improve, the skill match percentage dynamically increases.

### Overview  
The Resume Skill Improver project is a web application that allows users to upload their resume in PDF format. It then extracts the text content from the PDF, analyzes the text to detect various professional skills, and matches these skills against predefined job roles. Based on this, the app recommends the top 3 job roles that best fit the user’s current skill set and suggests personalized advice to improve missing skills for the top job.

### How It Works  

1. **PDF Upload and Text Extraction**  
   - The user uploads their resume as a PDF file via the web interface.  
   - Using [PDF.js](https://mozilla.github.io/pdf.js/), the app reads and extracts text content from the PDF.  
   - To optimize performance, the extraction is limited to the first 10 pages of the resume.

2. **Skill Detection**  
   - The extracted text is normalized (converted to lowercase) for consistent matching.  
   - The app scans the resume text for keywords corresponding to a wide list of skills (e.g., Python, React, SAP CPI, Docker).  
   - Skills found in the resume text are marked as “detected.”

3. **Job Matching**  
   - The app contains predefined job roles with associated required skills (keywords).  
   - For each job, it calculates the percentage of matched skills based on the detected skills from the resume.  
   - The top 3 jobs with the highest skill match percentage are presented to the user as suitable roles.

4. **Personalized Skill Improvement Advice**  
   - For the highest matching job, the app identifies missing skills that are part of the job’s requirements but not found in the resume.  
   - It displays these missing skills as a checklist with advice messages and links to learn resources.  
   - Users can check off skills as they improve them, and the app dynamically updates their match percentage to reflect progress.

### User Interface  

- **Resume Upload Area:** Users can drag and drop or select their resume PDF.  
- **Analyze Button:** Once a PDF is selected, users click to start analysis.  
- **Loading Indicator:** Shows a spinner while the PDF is being processed.  
- **Results Section:** Displays the top 3 matched jobs with percentages and descriptions.  
- **Advice Checklist:** For the top job, shows missing skills with advice and links. Users can check completed skills to track improvement.  
- **Dynamic Progress Bar:** Visually represents the user’s current skill match percentage, updated in real-time as skills are checked off.

### Technical Stack  

- **Frontend:** HTML, CSS, and JavaScript with PDF.js library for PDF parsing.  
- **Backend:** None required; all processing is done client-side for instant feedback.  
- **Libraries/Tools:**  
  - PDF.js for reading and extracting text from PDF files.  
  - Vanilla JavaScript for DOM manipulation and event handling.

### Future Improvements  

- Add backend support for storing user progress and resume history.  
- Support parsing other document formats like DOCX and plain text.  
- Integrate with LinkedIn or job portals for real-time job recommendations.  
- Add natural language processing (NLP) to better understand resume context beyond keyword matching.  
- Provide a downloadable improved resume template based on detected gaps.  

## Team Contributions  
- **Afla Rishad:** Full project development, including frontend design, PDF parsing, skill detection logic, and UI improvements.  
- **Anagha Robert:** Not present for the project development phase.  

---

Made with ❤️ at TinkerHub Useless Projects  
![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)  
![Static Badge](https://img.shields.io/badge/UselessProjects--25-25?link=https%3A%2F%2Fwww.tinkerhub.org%2Fevents%2FQ2Q1TQKX6Q%2FUseless%2520Projects)  

