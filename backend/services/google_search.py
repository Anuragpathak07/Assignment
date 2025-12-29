import requests
from config import Config

def google_search(query):
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": Config.SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json={"q": query})
    data = response.json()

    links = []
    for item in data.get("organic", []):
        if "beyondchats.com" not in item["link"]:
            links.append(item["link"])
        if len(links) == 2:
            break

    return links
