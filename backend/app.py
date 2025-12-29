from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.articles import articles_bp
from routes.rewrite import rewrite_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080"]}})

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(articles_bp, url_prefix="/api/articles")
app.register_blueprint(rewrite_bp, url_prefix="/api/rewrite")

if __name__ == "__main__":
    app.run(debug=True)
