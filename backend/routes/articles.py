from flask import Blueprint, request, jsonify
from models import db, Article
from services.scraper import scrape_oldest_articles

articles_bp = Blueprint("articles", __name__)

@articles_bp.route("/", methods=["GET"])
def get_articles():
    articles = Article.query.all()
    return jsonify([a.to_dict() for a in articles])

@articles_bp.route("/<int:article_id>", methods=["GET"])
def get_article(article_id):
    article = Article.query.get_or_404(article_id)
    return jsonify(article.to_dict())

@articles_bp.route("/", methods=["POST"])
def create_article():
    data = request.json
    article = Article(**data)
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict()), 201

@articles_bp.route("/<int:article_id>", methods=["DELETE"])
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({"message": "Deleted"})

@articles_bp.route("/scrape", methods=["POST"])
def scrape_articles():
    scraped = scrape_oldest_articles()
    for art in scraped:
        exists = Article.query.filter_by(source_url=art["source_url"]).first()
        if not exists:
            db.session.add(Article(**art))
    db.session.commit()
    return jsonify({"message": "Scraping completed"})
