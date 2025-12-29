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
# Allow all origins for production (Render) to work with Vercel deployments
# This is safe for a public API

# Check multiple ways to detect production environment
is_production = (
    os.getenv("RENDER") is not None or  # Render sets this
    os.getenv("FLASK_ENV") == "production" or
    os.getenv("ENVIRONMENT") == "production" or
    not os.getenv("FLASK_DEBUG", "").lower() == "true"
)

# For now, always allow all origins to ensure it works
# You can restrict this later if needed by uncommenting the production check
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Alternative: Uncomment below to restrict in development
# if is_production:
#     CORS(app, resources={r"/api/*": {"origins": "*"}})
# else:
#     allowed_origins = [
#         "http://localhost:8080",
#         "http://127.0.0.1:8080",
#         "https://assignment-liart-two-59.vercel.app",
#     ]
#     CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(articles_bp, url_prefix="/api/articles")
app.register_blueprint(rewrite_bp, url_prefix="/api/rewrite")

if __name__ == "__main__":
    app.run(debug=True)
