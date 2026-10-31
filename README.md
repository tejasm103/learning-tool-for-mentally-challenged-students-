# MindVerse — Inclusive Learning Lab

An accessible, interactive, and multisensory educational platform designed for students with special learning needs, intellectual and developmental differences, autism, ADHD, and dyslexia.

---

## 🌟 Key Features

1. **Station 16 — Our Working Places & Community Helpers**:
   - Interactive exploration of **12 community working places** (Hospital, Fire Station, Police Station, School, Library, Bakery, Farm, Supermarket, Construction Site, Airport, Space Station, Science Lab).
   - Tools, equipment, community helper roles, audio descriptions, and fun facts.
   - Interactive **"Where Is My Working Place?" Quiz** with auditory feedback and automatic educator queue reporting.

2. **Student Working Place & Activity Studio (Desk)**:
   - Creative workspace canvas for drawing, writing notes, and daily reflections.
   - Built-in desk math calculator and focus timer.
   - Direct submission to the Teacher Verification Queue.

3. **Curriculum Stations (15+ Stations)**:
   - English phonics and alphabet, Hindi, Kannada, Mathematics & Multiplication tables, Traffic signs & road safety, Body parts, Emotions recognition, and moral stories.

4. **Curated YouTube Video Learning Library (39 Videos)**:
   - Embedded safe YouTube player with subtitles, interactive comprehension check-ins, and student activity submission.

5. **Teacher & Educator Portal**:
   - Verification queue for evaluating student answers, desk reflections, and quiz results.
   - Community Feedback Queue for review and planned improvements.
   - Individualized report cards and accommodation profiles.

6. **Inclusive Community Feedback**:
   - Direct integration with the **Official Google Feedback Form** as the primary feedback mechanism.
   - Secondary quick in-app modal with optional MongoDB Atlas cloud synchronization.

7. **Multisensory Accessibility Tools**:
   - Text-to-speech with speed and volume controls.
   - Dyslexia-friendly OpenDyslexic font toggle.
   - High-contrast, sensory calm, and focus highlight modes.
   - Auditory reinforcement chimes and gentle retry prompts.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12+ (Flask, SQLAlchemy, Gunicorn, PyMongo)
- **Frontend**: Responsive HTML5, CSS3, JavaScript (ES6+), Web Audio API, Web Speech Synthesis
- **Databases**:
  - SQLite (Default zero-config local development store)
  - MongoDB Atlas ("mango db" cloud document store for feedback and activities)
  - Supabase / PostgreSQL (Production relational database support)
- **Deployment**:
  - Render (`render.yaml`, `Procfile`) for backend API
  - Netlify (`netlify.toml`) for frontend CDN

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/tejasm103/learning-tool-for-mentally-challenged-students-.git
cd learning-tool-for-mentally-challenged-students-
```

### 2. Set up Python virtual environment
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the development server
```bash
python -m backend.app
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🧪 Testing

Run the automated test suite with pytest:
```bash
pytest backend/tests/test_backend.py -v
```

---

## ☁️ Production Deployment

See [README_DEPLOYMENT.md](README_DEPLOYMENT.md) for full deployment instructions on:
- **Netlify** for global CDN frontend hosting
- **Render** for Python web service backend
- **MongoDB Atlas** for cloud database synchronization

---

## 📄 License

This project is licensed under the MIT License.

