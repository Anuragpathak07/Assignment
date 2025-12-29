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
        
        # Check for 403 Forbidden - usually means invalid API key or quota exceeded
        if response.status_code == 403:
            error_detail = "Forbidden"
            try:
                error_data = response.json()
                error_detail = error_data.get("message", error_data.get("error", "Forbidden"))
            except:
                error_detail = response.text[:200] if response.text else "Forbidden"
            
            raise ValueError(
                f"Google Search API returned 403 Forbidden: {error_detail}. "
                "This usually means: 1) API key is invalid/expired, 2) API quota exceeded, "
                "or 3) API key doesn't have search permissions. Please check your SERPER_API_KEY."
            )
        
        # Check for other HTTP errors
        if response.status_code == 401:
            raise ValueError(
                "Google Search API returned 401 Unauthorized. Your SERPER_API_KEY is invalid or expired. "
                "Please check your API key at https://serper.dev"
            )
        
        response.raise_for_status()
        data = response.json()
        
    except ValueError:
        # Re-raise ValueError (our custom error messages)
        raise
    except requests.exceptions.HTTPError as e:
        # Handle other HTTP errors
        error_msg = f"Google Search API HTTP error {response.status_code}: {str(e)}"
        try:
            error_data = response.json()
            if "message" in error_data:
                error_msg += f" - {error_data['message']}"
        except:
            pass
        raise ValueError(error_msg)
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Failed to connect to Google Search API: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error processing Google Search response: {str(e)}")

    # Extract links from search results
    links = []
    organic_results = data.get("organic", [])
    
    if not organic_results:
        raise ValueError("No search results found. The query may be too specific or the API returned no results.")
    
    for item in organic_results:
        link = item.get("link", "")
        # Exclude BeyondChats links and ensure it's a valid URL
        if link and "beyondchats.com" not in link.lower() and link.startswith("http"):
            links.append(link)
        if len(links) == 2:
            break
    
    if len(links) < 2:
        raise ValueError(
            f"Found only {len(links)} valid reference article(s) from Google Search. "
            "Need at least 2 articles from other websites. Try a different search query or check API results."
        )
    
    return links
