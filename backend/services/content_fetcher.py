import requests
from bs4 import BeautifulSoup

def fetch_article_content(url):
    response = requests.get(url, verify=False)
    soup = BeautifulSoup(response.text, "html.parser")

    paragraphs = soup.find_all("p")
    return "\n\n".join(
        p.get_text().strip()
        for p in paragraphs
        if len(p.get_text().strip()) > 50
    )
