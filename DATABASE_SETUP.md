# Database Setup Guide

## Overview

The application uses SQLite for data storage. The database file (`backend/database.db`) is **NOT** included in the repository - each user/clone gets a fresh, empty database automatically.

## How It Works

1. **Automatic Creation**: When you first run the backend server (`python app.py`), the database is automatically created if it doesn't exist.

2. **Empty by Default**: The database starts completely empty - no pre-loaded articles or data.

3. **Populate with Scraping**: Use the "Scrape Articles" feature in the frontend to fetch articles from BeyondChats and populate your database.

## Resetting the Database

If you want to start with a fresh database:

### Option 1: Delete the database file manually
```bash
# Stop the backend server first (Ctrl+C)
# Then delete the database file
rm backend/database.db  # Linux/Mac
del backend\database.db  # Windows
```

### Option 2: Use the initialization script
```bash
cd backend
python init_db.py
```

This will:
- Ask for confirmation
- Delete the existing database
- Create a fresh, empty database

## Database Location

- **Path**: `beyond-articles/backend/database.db`
- **Type**: SQLite database
- **Git Status**: Ignored (not tracked in git)

## First Time Setup Flow

1. Clone the repository
2. Set up environment variables (`.env` file)
3. Start the backend server → Database is created automatically (empty)
4. Start the frontend
5. Click "Scrape Articles" → Database is populated
6. Use the application normally

## Important Notes

- ✅ Database is automatically created on first run
- ✅ Database starts empty (no pre-loaded data)
- ✅ Database is ignored by git (`.gitignore`)
- ✅ Each user/clone gets their own fresh database
- ❌ Database is NOT committed to the repository

## Troubleshooting

**Database not creating?**
- Make sure you have write permissions in the `backend` directory
- Check that SQLite is available (comes with Python)

**Want to reset?**
- Stop the server
- Delete `backend/database.db`
- Restart the server

**Database corrupted?**
- Delete the database file
- Restart the server (it will create a new one)

