# Backend API Documentation

This directory contains the Flask backend API for the BeyondChats Article Management System.

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   Create a `.env` file with:
   ```env
   SERPER_API_KEY=your_serper_api_key
   COHERE_API_KEY=your_cohere_api_key
   ```

3. **Run the server**:
   ```bash
   python app.py
   ```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### Articles

- `GET /api/articles/` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles/` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/scrape` - Scrape articles from BeyondChats

### Rewrite

- `POST /api/rewrite/:id` - Rewrite article using AI

## Project Structure

```
backend/
├── app.py                 # Flask application entry point
├── config.py              # Configuration and environment variables
├── models.py              # Database models (SQLAlchemy)
├── routes/
│   ├── articles.py        # Article CRUD endpoints
│   └── rewrite.py         # Article rewrite endpoint
└── services/
    ├── scraper.py         # Web scraping service
    ├── google_search.py   # Google Search API integration
    ├── content_fetcher.py # Content extraction from URLs
    └── llm_rewriter.py    # Cohere LLM integration
```

## Database

- **Type**: SQLite
- **File**: `database.db` (auto-created on first run)
- **Model**: `Article` (id, title, content, source_url, type, references)

## Environment Variables

- `SERPER_API_KEY` - Required for Google Search (optional if using database fallback)
- `COHERE_API_KEY` - Required for article rewriting

## Notes

- Database is created automatically on first run
- CORS is configured to allow frontend requests
- See main README.md for complete setup instructions

