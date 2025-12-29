import cohere
from config import Config

def rewrite_article(original, ref1, ref2, reference_links):
    if not Config.COHERE_API_KEY:
        raise RuntimeError("COHERE_API_KEY is not set")

    co = cohere.ClientV2(api_key=Config.COHERE_API_KEY)

    system_message = (
        "You are an expert SEO content editor. "
        "Rewrite articles to be well-structured, clear, professional, "
        "and optimized for search engines. Do not plagiarize."
    )

    user_message = f"""
Rewrite the following article using the reference articles only for tone,
structure, and depth. Do not copy content.

ORIGINAL ARTICLE:
{original}

REFERENCE ARTICLE 1:
{ref1}

REFERENCE ARTICLE 2:
{ref2}

At the end, add a section titled "References" and list:
{reference_links}
"""

    # Try different models - command-r-plus is the latest, command-r is a fallback
    models_to_try = ["command-r7b-12-2024","command-r-plus", "command-r", "command-r7b"]
    last_error = None
    
    for model_name in models_to_try:
        try:
            response = co.chat(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.6,
            )
            # Success! Extract and return the content
            return response.message.content[0].text.strip()
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            # If model not found, try next model
            if "not found" in error_str or "removed" in error_str or "404" in error_str:
                print(f"Model {model_name} not available, trying next model...")
                continue
            # For other errors, raise immediately
            raise RuntimeError(f"Cohere API error with model {model_name}: {str(e)}")
    
    # If all models failed
    raise RuntimeError(
        f"Failed to rewrite article. Tried models: {', '.join(models_to_try)}. "
        f"Last error: {str(last_error) if last_error else 'Unknown error'}. "
        "Please check: https://docs.cohere.com/docs/models for available models."
    )
