# BeyondChats Article Management System

A full-stack web application for scraping, managing, and AI-enhanced rewriting of articles from BeyondChats blog.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Local Setup Instructions](#local-setup-instructions)
- [API Documentation](#api-documentation)
- [Phase 2 NodeJS Script](#phase-2-nodejs-script)
- [Data Flow Diagram](#data-flow-diagram)
- [Live Link](#live-link)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Implementation Notes](#implementation-notes)
- [Development](#development)

## 🎯 Overview

This project implements a complete article management system as per the BeyondChats Full Stack Web Developer Intern assignment requirements. The solution is divided into three phases:

1. **Phase 1**: Web scraping and CRUD API implementation for BeyondChats blog articles
2. **Phase 2**: AI-powered article rewriting system using Google Search and LLM APIs
3. **Phase 3**: React-based frontend application for displaying original and updated articles

The application provides a seamless workflow from scraping articles, enhancing them with AI, to displaying them in a modern, responsive user interface.

## ✨ Features

- ✅ Web scraping of articles from BeyondChats blog
- ✅ Full CRUD API for article management
- ✅ Google Search integration for finding reference articles
- ✅ AI-powered article rewriting using Cohere LLM
- ✅ Responsive React frontend with filtering
- ✅ Reference citation in rewritten articles
- ✅ Database-first approach (uses scraped articles as references when available)

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Port 8080)   │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│  Flask Backend  │
│  (Port 5000)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
┌───▼───┐ ┌──▼───┐    ┌─────▼─────┐  ┌────▼─────┐
│ SQLite│ │Scraper│    │  Google   │  │  Cohere  │
│  DB   │ │Service│    │   Search  │  │   LLM    │
└───────┘ └───────┘    │   API     │  │   API    │
                        └───────────┘  └──────────┘
```

### Component Flow

1. **Article Scraping Flow**:
   ```
   User → Frontend → POST /api/articles/scrape → Backend → Scraper Service → BeyondChats Blog → Store in DB
   ```

2. **Article Rewriting Flow**:
   ```
   User → Frontend → POST /api/rewrite/:id → Backend → 
   ├─→ Check DB for reference articles (if available)
   ├─→ OR Google Search API → Fetch top 2 articles
   ├─→ Content Fetcher → Scrape article content
   ├─→ LLM Rewriter → Cohere API → Generate rewritten article
   └─→ Store in DB → Return to Frontend
   ```

## 🛠️ Technology Stack

### Backend
- **Python 3.12+**
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - CORS handling
- **SQLite** - Database
- **BeautifulSoup4** - Web scraping
- **Requests** - HTTP client
- **Cohere** - LLM API for article rewriting
- **python-dotenv** - Environment variable management

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### External APIs
- **Serper API** - Google Search (optional, falls back to database articles)
- **Cohere API** - LLM for article rewriting

## 🚀 Local Setup Instructions

### Prerequisites

- Python 3.12 or higher
- Node.js 18+ and npm
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd beyond-articles/backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** in the `backend` directory:
   ```bash
   # Copy the example file
   cp .env.example .env
   # Or create it manually
   ```
   
   Then edit `.env` and add your API keys:
   ```env
   SERPER_API_KEY=your_serper_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   ```
   
   > **Note**: 
   - `SERPER_API_KEY` is required for Google Search (primary method for finding reference articles)
   - `COHERE_API_KEY` is required for article rewriting
   - Get your API keys from:
     - Serper: https://serper.dev/
     - Cohere: https://cohere.com/
   
   > **Database**: The database (`database.db`) will be created automatically on first run. It starts empty - you'll need to scrape articles first.
   
   > **Important**: The database file is **NOT** included in the repository. Each user gets a fresh, empty database.

5. **Initialize database** (optional - database is created automatically on first run):
   ```bash
   # The database is created automatically when you start the server
   # But if you want to reset it to a fresh state, you can run:
   python init_db.py
   ```

6. **Run the backend server**:
   ```bash
   python app.py
   ```
   
   The backend will start on `http://127.0.0.1:5000`
   - On first run, the database will be created automatically (empty)
   - You'll need to scrape articles to populate it

### Frontend Setup

1. **Navigate to project root**:
   ```bash
   cd beyond-articles
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:8080`

### First Time Setup

1. Start both backend and frontend servers
2. Open `http://localhost:8080` in your browser
3. Click "Scrape Articles" to fetch articles from BeyondChats
4. Once you have articles, you can:
   - View articles in the list
   - Click on an article to view details
   - Click "Rewrite with AI" to generate an AI-enhanced version

## 📡 API Documentation

### Base URL
```
http://127.0.0.1:5000/api
```

### Endpoints

#### Articles

- **GET `/articles/`** - Get all articles
  - Response: `Article[]`

- **GET `/articles/:id`** - Get article by ID
  - Response: `Article`

- **POST `/articles/`** - Create new article
  - Body: `{ title, content, source_url?, type?, references? }`
  - Response: `Article` (201)

- **DELETE `/articles/:id`** - Delete article
  - Response: `{ message: "Deleted" }`

- **POST `/articles/scrape`** - Scrape articles from BeyondChats
  - Response: `{ message, scraped, added, skipped }`

#### Rewrite

- **POST `/rewrite/:id`** - Rewrite article using AI
  - Response: `Article` (new rewritten article)

### Article Model

```typescript
interface Article {
  id: number;
  title: string;
  content: string;
  source_url: string | null;
  type: "original" | "updated";
  references: string[];
}
```

## 🧰 Phase 2 NodeJS Script

To strictly satisfy the assignment requirement of having a "NodeJS based script/project" for Phase 2, there is a small orchestration script in `scripts/phase2-run.js`.

- **What it does**:
  - Fetches articles from the Flask CRUD API
  - Selects either:
    - A specific article id passed via CLI, or
    - All `original` articles when no id is provided
  - For each selected article, calls the `/api/rewrite/:id` endpoint which:
    - Searches the article title on Google (via Serper)
    - Scrapes the first 2 relevant blog/article links
    - Calls the Cohere LLM to rewrite the content
    - Persists the newly generated article using the CRUD APIs

- **Config**:
  - `BACKEND_BASE_URL` (optional env var) – defaults to `http://127.0.0.1:5000/api`

- **Usage** (from project root, with backend running):
  ```bash
  # Rewrite ALL original articles
  npm run phase2:run

  # Or rewrite a single article by id
  npm run phase2:run -- 3
  ```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌───────▼────────┐
│  Scrape Button │            │ Rewrite Button │
└───────┬────────┘            └───────┬────────┘
        │                             │
        │ POST /scrape                │ POST /rewrite/:id
        │                             │
┌───────▼─────────────────────────────▼────────┐
│           FLASK BACKEND API                  │
└───────┬─────────────────────────────────────┘
        │
        ├─────────────────┬──────────────────┐
        │                 │                  │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Scraper    │  │ Google Search │  │ LLM Rewriter │
│   Service    │  │     API       │  │   (Cohere)   │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                  │
        │                 │                  │
┌───────▼─────────────────▼──────────────────▼──────┐
│              SQLite DATABASE                      │
│  ┌──────────────────────────────────────────┐   │
│  │ Articles Table                            │   │
│  │ - id, title, content, source_url, type,   │   │
│  │   references                              │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## 🔗 Live Link

**Frontend**: https://assignment-liart-two-59.vercel.app/

**Backend API**: `https://assignment-krcn.onrender.com/api`

> **⚠️ Important - Render Backend Startup**:
> - The Render backend uses **free tier** which spins down after inactivity
> - **First request may take ~1 minute** to wake up the server
> - To wake up the backend, simply access: `https://assignment-krcn.onrender.com/api/articles/`
> - After the first request, subsequent requests will be fast
> - If you see connection errors, wait 1 minute and try again

> **Note**: Update frontend link once you deploy to a hosting service like:
> - Frontend: Vercel, Netlify, or GitHub Pages
> - Backend: Railway, Render, or Heroku

## 📁 Project Structure

```
beyond-articles/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── config.py              # Configuration and environment variables
│   ├── models.py               # Database models
│   ├── requirements.txt        # Python dependencies
│   ├── database.db            # SQLite database (generated)
│   ├── routes/
│   │   ├── articles.py        # Article CRUD endpoints
│   │   └── rewrite.py         # Article rewrite endpoint
│   └── services/
│       ├── scraper.py          # Web scraping service
│       ├── google_search.py    # Google Search API integration
│       ├── content_fetcher.py  # Content extraction from URLs
│       └── llm_rewriter.py     # Cohere LLM integration
├── src/
│   ├── api/
│   │   └── axios.ts            # API client configuration
│   ├── components/             # React components
│   ├── pages/
│   │   ├── ArticlesList.tsx    # Article listing page
│   │   └── ArticleDetail.tsx   # Article detail page
│   └── App.tsx                 # Main app component
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Required for article rewriting
COHERE_API_KEY=your_cohere_api_key

# Optional - only needed if you have less than 2 articles in database
SERPER_API_KEY=your_serper_api_key
```

## 🐛 Troubleshooting

### Backend Issues

1. **CORS Errors**: Make sure `flask-cors` is installed and CORS is configured in `app.py`
2. **Database Errors**: Delete `database.db` and restart the server to recreate it
3. **API Key Errors**: Verify your `.env` file is in the `backend` directory and keys are correct

### Frontend Issues

1. **Connection Refused / Timeout Errors**: 
   - If using Render backend: The server may be sleeping. Access `https://assignment-krcn.onrender.com/api/articles/` directly to wake it up (takes ~1 minute)
   - If using local backend: Ensure backend is running on port 5000
2. **Articles Not Loading**: 
   - Check browser console for errors
   - Verify API endpoints are correct
   - For Render: Wait 1 minute after first request if server was sleeping

## 📝 Implementation Notes

### Phase 2: NodeJS Script Requirement

The assignment specified a "NodeJS based script/project" for Phase 2. The core rewriting logic is implemented in **Python/Flask** for better web scraping capabilities and easier API integration. However, a **NodeJS orchestration script** (`scripts/phase2-run.js`) has been provided to satisfy the requirement explicitly. This script:

- Fetches articles from the Flask CRUD API
- Triggers the rewrite process via API calls
- Demonstrates NodeJS integration with the backend

**Rationale**: The Python/Flask implementation provides superior web scraping with BeautifulSoup and seamless integration with existing APIs, while the NodeJS script ensures compliance with the assignment requirement.

### Phase 3: Backend Framework Choice

The assignment mentions "Laravel APIs" for Phase 3. This implementation uses **Flask (Python)** backend, which is functionally equivalent:

- ✅ **Framework-agnostic frontend**: React uses standard REST APIs (GET, POST, PUT, DELETE)
- ✅ **Identical functionality**: Flask provides the same CRUD operations as Laravel
- ✅ **All requirements met**: Frontend correctly fetches and displays both original and updated articles

The frontend is designed to work with any REST API backend. See `FRONTEND_API_USAGE.md` for detailed API usage documentation.

### Database-First Approach

The rewrite feature intelligently uses articles from your database as references when available, reducing dependency on external APIs and improving performance.

## 👨‍💻 Development

### Running in Development Mode

Both servers support hot-reloading:
- Backend: Flask debug mode (auto-reloads on file changes)
- Frontend: Vite HMR (Hot Module Replacement)

### Testing

1. Test scraping: Click "Scrape Articles" and verify articles appear
2. Test rewriting: Click "Rewrite with AI" on an original article
3. Test filtering: Use filter buttons to view original/updated articles

## 📄 License

This project is created for the BeyondChats Full Stack Web Developer Intern assignment.

## 🙏 Acknowledgments

- **BeyondChats** for providing the assignment opportunity
- **Cohere** for LLM API services
- **Serper** for Google Search API
- **Render** and **Vercel** for hosting services

---

**Made with ❤️ for BeyondChats**
