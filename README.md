# 🧪 Regression Suite Generator

An LLM-powered tool that reads a GitHub PR diff and automatically generates
functional regression tests using **Gemini 1.5 Flash** (free API).

**Stack**
| Layer | Tech | Hosting (free) |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Vercel |
| Backend | Python + FastAPI | Render |
| LLM | Google Gemini 1.5 Flash | Google AI Studio (free tier) |
| Data source | GitHub REST API | — |

---

## Getting started locally

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/regression-suite-gen.git
cd regression-suite-gen
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste your GEMINI_API_KEY (see step 3)
```

### 3. Get a free Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API key**
3. Copy the key into `backend/.env` as `GEMINI_API_KEY=...`

No billing required. Gemini 1.5 Flash is free with:
- 15 requests per minute
- 1 million tokens per day

### 4. Run the backend

```bash
# From the backend/ directory, with venv activated:
uvicorn main:app --reload --port 8000
```

Health check → http://localhost:8000/api/health

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite auto-proxies `/api` calls to the FastAPI server.

---

## Deploying for free

### Backend → Render

1. Push your project to GitHub.
2. Go to https://render.com → **New → Web Service**
3. Connect your repo, select the `backend/` directory.
4. Set:
   - **Runtime:** Python 3.11
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard:
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (add after step below)
6. Deploy. Copy the Render service URL (e.g. `https://regression-suite-gen.onrender.com`).

> ⚠️ Render free tier sleeps after 15 min of inactivity. First request after sleep
> takes ~30 s to wake up. This is fine for demos.

### Frontend → Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `VITE_API_URL` = your Render URL (e.g. `https://regression-suite-gen.onrender.com`)
5. Deploy.

Go back to Render and update `FRONTEND_URL` to your Vercel URL.

---

## How it works

```
User pastes PR URL
      │
      ▼
React frontend (Vercel)
      │  POST /api/generate-tests
      ▼
FastAPI backend (Render)
      ├── GitHub REST API  → fetch PR metadata + file diffs
      └── Gemini 1.5 Flash → generate tests from diff + prompt
      │
      ▼
Syntax-highlighted test code in the UI
```

---

## Supported test frameworks

| File extension | Framework auto-selected |
|---|---|
| `.java` | Java / JUnit 5 |
| `.py` | Python / pytest |
| `.ts`, `.tsx` | TypeScript / Vitest |
| `.js`, `.jsx` | JavaScript / Jest |
| `.go` | Go / testing package |

Can be overridden manually in the UI.

---

## Project structure

```
regression-suite-gen/
├── backend/
│   ├── main.py            # FastAPI app + Gemini integration
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── PRForm.jsx      # Input form
    │   │   ├── FileList.jsx    # Changed files display
    │   │   └── TestOutput.jsx  # Syntax-highlighted output
    │   ├── App.jsx             # State + API calls
    │   ├── main.jsx
    │   └── index.css           # Tailwind base + custom classes
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Environment variables reference

**Backend (`backend/.env`)**

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | From Google AI Studio |
| `FRONTEND_URL` | ✅ for prod | Your Vercel app URL |

**Frontend (`frontend/.env.local`)**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ for prod | Your Render backend URL |
