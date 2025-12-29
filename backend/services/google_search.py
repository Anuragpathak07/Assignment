import requests
from config import Config

def google_search(query):
    if not Config.SERPER_API_KEY:
        raise ValueError("SERPER_API_KEY is not set. Please set it in environment variables.")
    
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": Config.SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, json={"q": query}, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Failed to connect to Google Search API: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error processing Google Search response: {str(e)}")

    links = []
    for item in data.get("organic", []):
        if "beyondchats.com" not in item.get("link", ""):
            links.append(item["link"])
        if len(links) == 2:
            break

    return links
