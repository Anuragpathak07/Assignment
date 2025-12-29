#!/usr/bin/env python3
"""
Initialize a fresh database for new users.
This script will delete the existing database and create a new empty one.
"""

import os
from app import app, db

def init_database():
    """Initialize a fresh database"""
    db_path = os.path.join(os.path.dirname(__file__), "database.db")
    
    # Check if database exists
    if os.path.exists(db_path):
        print(f"[INFO] Existing database found at: {db_path}")
        response = input("Do you want to delete it and create a fresh database? (y/n): ")
        if response.lower() != 'y':
            print("[CANCELLED] Database initialization cancelled.")
            return
        
        # Delete existing database
        try:
            os.remove(db_path)
            print(f"[OK] Deleted existing database: {db_path}")
        except Exception as e:
            print(f"[ERROR] Failed to delete database: {e}")
            return
    
    # Create new database
    with app.app_context():
        db.create_all()
        print("[SUCCESS] Fresh database created successfully!")
        print("[INFO] Database is now empty and ready for new articles.")
        print("[INFO] Use the 'Scrape Articles' feature to populate it.")

if __name__ == "__main__":
    init_database()

