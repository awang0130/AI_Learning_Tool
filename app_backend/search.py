import os
from urllib.parse import urlparse, urlunparse
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

# Initialize Tavily client
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

GOOD_DOMAINS = {
    "khanacademy.org": 5,
    "freecodecamp.org": 4,
    "developer.mozilla.org": 5,
    "docs.python.org": 5,
    "wikipedia.org": 3,
    "youtube.com": 3,
}

def normalize_url(url: str) -> str:
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path, "", "", ""))

def domain_score(url: str) -> int:
    host = urlparse(url).netloc.lower().replace("www.", "")
    return GOOD_DOMAINS.get(host, 1)

def search_resources(topic: str, keywords: list[str], max_results: int = 5):
    """
    Search for learning resources using Tavily.
    Returns a list of {title, url, snippet, quality_score}.
    """
    query = f"{topic} " + " ".join(keywords[:3]) + " tutorial"
    results = tavily.search(
        query=query,
        max_results=max_results,
        include_answer=False,
    )

    seen = set()
    items = []

    for r in results.get("results", []):
        url = r.get("url")
        if not url:
            continue

        clean_url = normalize_url(url)
        if clean_url in seen:
            continue
        seen.add(clean_url)

        items.append({
            "title": r.get("title") or "Untitled",
            "url": url,
            "snippet": (r.get("content") or "")[:300],
            "quality_score": domain_score(url),
        })

    items.sort(key=lambda x: x["quality_score"], reverse=True)
    return items[:max_results]
