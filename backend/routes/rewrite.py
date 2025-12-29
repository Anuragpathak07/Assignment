from flask import Blueprint, jsonify
from models import db, Article
from services.google_search import google_search
from services.content_fetcher import fetch_article_content
from services.llm_rewriter import rewrite_article

rewrite_bp = Blueprint("rewrite", __name__)

@rewrite_bp.route("/<int:article_id>", methods=["POST"])
def rewrite(article_id):
    try:
        article = Article.query.get_or_404(article_id)

        ref1 = ""
        ref2 = ""
        links = []

        # Try to use articles from our database first (no external API needed!)
        other_articles = Article.query.filter(
            Article.id != article_id,
            Article.type == "original"
        ).limit(2).all()

        # If we have at least 2 other articles in the database, use them
        if len(other_articles) >= 2:
            print(f"Using {len(other_articles)} articles from database as references")
            ref1 = other_articles[0].content
            ref2 = other_articles[1].content
            # Use source URLs if available, otherwise use article titles as references
            links = [
                other_articles[0].source_url or f"Article: {other_articles[0].title}",
                other_articles[1].source_url or f"Article: {other_articles[1].title}"
            ]
        else:
            # Fallback to Google Search if we don't have enough articles in database
            print(f"Only {len(other_articles)} articles in database, using Google Search as fallback")
            try:
                search_links = google_search(article.title)
            except ValueError as e:
                # Handle API key or configuration errors
                return jsonify({
                    "error": f"{str(e)} Note: You can scrape more articles to avoid needing the Google Search API."
                }), 400
            except Exception as e:
                return jsonify({
                    "error": f"Failed to search for reference articles: {str(e)}"
                }), 500
            
            # Validate we have at least 2 links
            if len(search_links) < 2:
                return jsonify({
                    "error": f"Insufficient reference articles found. Found {len(search_links)} links, need at least 2. Try scraping more articles first, or check your Google Search API configuration.",
                    "links_found": len(search_links)
                }), 400

            # Fetch content from external reference articles
            try:
                ref1 = fetch_article_content(search_links[0])
            except Exception as e:
                print(f"Error fetching content from {search_links[0]}: {str(e)}")
                return jsonify({
                    "error": f"Failed to fetch content from reference article 1: {str(e)}"
                }), 500
            
            try:
                ref2 = fetch_article_content(search_links[1])
            except Exception as e:
                print(f"Error fetching content from {search_links[1]}: {str(e)}")
                return jsonify({
                    "error": f"Failed to fetch content from reference article 2: {str(e)}"
                }), 500

            links = search_links

        # Validate we got content from references
        if not ref1 or len(ref1.strip()) < 50:
            return jsonify({
                "error": "Reference article 1 did not provide sufficient content"
            }), 500
        
        if not ref2 or len(ref2.strip()) < 50:
            return jsonify({
                "error": "Reference article 2 did not provide sufficient content"
            }), 500

        # Rewrite the article using AI
        try:
            rewritten_content = rewrite_article(
                article.content,
                ref1,
                ref2,
                links
            )
        except Exception as e:
            return jsonify({
                "error": f"Failed to rewrite article: {str(e)}"
            }), 500

        # Create updated article
        updated = Article(
            title=article.title + " (Updated)",
            content=rewritten_content,
            type="updated",
            references=",".join(links) if isinstance(links, list) else links
        )

        db.session.add(updated)
        db.session.commit()

        return jsonify(updated.to_dict())

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Failed to rewrite article: {str(e)}"
        }), 500
