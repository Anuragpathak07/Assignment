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

    response = co.chat(
        model="command",   # ✅ universally available model
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.6,
    )

    return response.message.content[0].text.strip()
