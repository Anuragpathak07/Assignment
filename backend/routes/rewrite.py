from flask import Blueprint, jsonify
from models import db, Article
from services.google_search import google_search
from services.content_fetcher import fetch_article_content
from services.llm_rewriter import rewrite_article

rewrite_bp = Blueprint("rewrite", __name__)

@rewrite_bp.route("/<int:article_id>", methods=["POST"])
def rewrite(article_id):
    article = Article.query.get_or_404(article_id)

    links = google_search(article.title)
    ref1 = fetch_article_content(links[0])
    ref2 = fetch_article_content(links[1])

    rewritten_content = rewrite_article(
        article.content,
        ref1,
        ref2,
        links
    )

    updated = Article(
        title=article.title + " (Updated)",
        content=rewritten_content,
        type="updated",
        references=",".join(links)
    )

    db.session.add(updated)
    db.session.commit()

    return jsonify(updated.to_dict())
