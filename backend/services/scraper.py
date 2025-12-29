import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://beyondchats.com/blogs/"

def scrape_oldest_articles(limit=5):
    try:
        response = requests.get(BASE_URL, verify=False, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print(f"Error fetching base URL: {e}")
        return []

    links = []
    # Find all links that point to blog articles
    for a in soup.find_all("a", href=True):
        href = a.get("href", "").strip()
        if not href:
            continue
        
        # Convert relative URLs to absolute URLs
        if href.startswith("/"):
            href = urljoin(BASE_URL, href)
        elif not href.startswith("http"):
            continue
        
        # Check if it's a blog article URL
        if "/blogs/" in href and href not in links:
            # Make sure it's not the base blogs page itself
            parsed = urlparse(href)
            if parsed.path != "/blogs/" and parsed.path != "/blogs":
                links.append(href)

    # Remove duplicates and get the last N articles (oldest)
    unique_links = list(dict.fromkeys(links))
    
    # If we have fewer links than requested, use what we have
    # Otherwise, take the last 'limit' articles
    if len(unique_links) < limit:
        selected_links = unique_links
    else:
        selected_links = unique_links[-limit:]
    
    print(f"Found {len(unique_links)} total blog links, selecting {len(selected_links)} articles")

    articles = []
    for url in selected_links:
        try:
            page = requests.get(url, verify=False, timeout=10)
            page.raise_for_status()
            psoup = BeautifulSoup(page.text, "html.parser")

            # Try to find title - check multiple possible selectors
            title = psoup.find("h1")
            if not title:
                title = psoup.find("title")
            
            # Get all paragraphs with substantial content
            paragraphs = psoup.find_all("p")
            content = "\n\n".join(
                p.get_text().strip()
                for p in paragraphs
                if len(p.get_text().strip()) > 50
            )
            
            # If no paragraphs found, try divs with article content
            if not content or len(content) < 100:
                article_divs = psoup.find_all("div", class_=lambda x: x and ("article" in x.lower() or "content" in x.lower() or "post" in x.lower()))
                for div in article_divs:
                    div_text = div.get_text().strip()
                    if len(div_text) > 100:
                        content = div_text
                        break

            if title and content and len(content) > 100:
                articles.append({
                    "title": title.get_text().strip(),
                    "content": content,
                    "source_url": url,
                    "type": "original"
                })
                print(f"Successfully scraped: {title.get_text().strip()[:50]}...")
            else:
                print(f"Skipped {url}: title={bool(title)}, content_length={len(content) if content else 0}")
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

    print(f"Successfully scraped {len(articles)} articles")
    return articles
