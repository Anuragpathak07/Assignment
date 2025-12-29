from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.articles import articles_bp
from routes.rewrite import rewrite_bp
import os

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
# Allow localhost for development and Vercel for production
allowed_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://assignment-liart-two-59.vercel.app",
]

# Also check for environment variable for additional origins
if os.getenv("ALLOWED_ORIGINS"):
    additional_origins = os.getenv("ALLOWED_ORIGINS").split(",")
    allowed_origins.extend([origin.strip() for origin in additional_origins])

# In production (Render), allow all origins for flexibility with Vercel preview deployments
# In development, use specific origins
if os.getenv("RENDER"):
    # Production: Allow all origins (needed for Vercel preview deployments)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
else:
    # Development: Use specific origins
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(articles_bp, url_prefix="/api/articles")
app.register_blueprint(rewrite_bp, url_prefix="/api/rewrite")

if __name__ == "__main__":
    app.run(debug=True)
