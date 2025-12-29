from flask import Blueprint, jsonify
from models import db, Article
from config import Config
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
        search_links = None

        # PRIMARY METHOD: Use Google Search to find reference articles
        # This searches for the article title and finds top-ranking articles from other websites
        print(f"Searching Google for reference articles using title: {article.title}")
        try:
            search_links = google_search(article.title)
            print(f"Google Search successful. Found {len(search_links)} links.")
        except ValueError as e:
            # Handle API key or configuration errors
            # Fallback to database articles if Google Search fails
            print(f"Google Search failed: {str(e)}. Falling back to database articles.")
            search_links = None
        except Exception as e:
            # Other errors - try database fallback
            print(f"Google Search error: {str(e)}. Falling back to database articles.")
            search_links = None
        
        # If Google Search failed, try database fallback
        if not search_links:
            other_articles = Article.query.filter(
                Article.id != article_id,
                Article.type == "original"
            ).limit(2).all()
            
            if len(other_articles) >= 2:
                print(f"Using {len(other_articles)} articles from database as fallback")
                ref1 = other_articles[0].content
                ref2 = other_articles[1].content
                links = [
                    other_articles[0].source_url or f"Article: {other_articles[0].title}",
                    other_articles[1].source_url or f"Article: {other_articles[1].title}"
                ]
            else:
                error_msg = "Google Search is required but failed. "
                if not Config.SERPER_API_KEY:
                    error_msg += "SERPER_API_KEY is not set. Please set it in environment variables."
                else:
                    error_msg += "Please check your Google Search API configuration or ensure you have at least 2 articles in the database."
                return jsonify({
                    "error": error_msg
                }), 400
        
        # If we got links from Google Search, fetch their content
        if search_links and not ref1 and not ref2:
            # Validate we have at least 2 links
            if len(search_links) < 2:
                # Fallback to database if not enough search results
                print(f"Only {len(search_links)} links found from Google Search. Falling back to database.")
                other_articles = Article.query.filter(
                    Article.id != article_id,
                    Article.type == "original"
                ).limit(2).all()
                
                if len(other_articles) >= 2:
                    print(f"Using {len(other_articles)} articles from database as fallback")
                    ref1 = other_articles[0].content
                    ref2 = other_articles[1].content
                    links = [
                        other_articles[0].source_url or f"Article: {other_articles[0].title}",
                        other_articles[1].source_url or f"Article: {other_articles[1].title}"
                    ]
                else:
                    return jsonify({
                        "error": f"Insufficient reference articles found from Google Search. Found {len(search_links)} links, need at least 2. Please check your Google Search API configuration.",
                        "links_found": len(search_links)
                    }), 400
            else:
                # Fetch content from external reference articles found via Google Search
                print(f"Fetching content from {len(search_links)} reference articles found via Google Search")
                try:
                    ref1 = fetch_article_content(search_links[0])
                    print(f"Successfully fetched content from: {search_links[0]}")
                except Exception as e:
                    print(f"Error fetching content from {search_links[0]}: {str(e)}")
                    return jsonify({
                        "error": f"Failed to fetch content from reference article 1: {str(e)}"
                    }), 500
                
                try:
                    ref2 = fetch_article_content(search_links[1])
                    print(f"Successfully fetched content from: {search_links[1]}")
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
        # Ensure references is a comma-separated string
        if isinstance(links, list):
            references_str = ",".join(links)
        else:
            references_str = str(links) if links else ""
        
        updated = Article(
            title=article.title + " (Updated)",
            content=rewritten_content,
            type="updated",
            references=references_str
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
