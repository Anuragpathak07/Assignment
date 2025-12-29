import os
from dotenv import load_dotenv

load_dotenv()  # 👈 THIS IS CRITICAL

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SERPER_API_KEY = os.getenv("SERPER_API_KEY")
    COHERE_API_KEY = os.getenv("COHERE_API_KEY")
