import requests
from bs4 import BeautifulSoup

BASE_URL = "https://beyondchats.com/blogs/"

def scrape_oldest_articles(limit=5):
    response = requests.get(BASE_URL, verify=False)
    soup = BeautifulSoup(response.text, "html.parser")

    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http") and "/blogs/" in href:
            links.append(href)

    links = list(dict.fromkeys(links))[-limit:]

    articles = []
    for url in links:
        page = requests.get(url, verify=False)
        psoup = BeautifulSoup(page.text, "html.parser")

        title = psoup.find("h1")
        paragraphs = psoup.find_all("p")

        content = "\n\n".join(
            p.get_text().strip()
            for p in paragraphs
            if len(p.get_text().strip()) > 50
        )

        if title and content:
            articles.append({
                "title": title.get_text().strip(),
                "content": content,
                "source_url": url,
                "type": "original"
            })

    return articles
