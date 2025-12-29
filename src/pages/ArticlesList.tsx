import { useState, useMemo } from "react";
import { fetchArticles, scrapeArticles, type Article } from "@/api/axios";
import ArticleCard from "@/components/ArticleCard";
import FilterToggle, { type FilterOption } from "@/components/FilterToggle";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";

const ArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [hasStarted, setHasStarted] = useState(false);

  const loadArticles = async (autoScrapeIfEmpty = false) => {
    try {
      setLoading(true);
      setError(null);
      setHasStarted(true);
      
      // First, try to fetch articles
      let data = await fetchArticles();
      
      // If no articles found and autoScrapeIfEmpty is true, scrape first
      if (data.length === 0 && autoScrapeIfEmpty) {
        setScraping(true);
        try {
          const result = await scrapeArticles();
          console.log(`Auto-scraped ${result.scraped} articles, added ${result.added}, skipped ${result.skipped}`);
          // Fetch again after scraping
          data = await fetchArticles();
        } catch (scrapeErr) {
          console.error("Failed to auto-scrape articles:", scrapeErr);
          // Continue even if scraping fails, just show what's in DB
        } finally {
          setScraping(false);
        }
      }
      
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Unable to load articles. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      setError(null);
      const result = await scrapeArticles();
      console.log(`Scraped ${result.scraped} articles, added ${result.added}, skipped ${result.skipped}`);
      // After scraping, reload articles
      await loadArticles();
    } catch (err) {
      console.error("Failed to scrape articles:", err);
      setError("Unable to scrape articles. Please check your connection and try again.");
    } finally {
      setScraping(false);
    }
  };

  // Filter articles based on selected option
  const filteredArticles = useMemo(() => {
    if (filter === "all") return articles;
    return articles.filter((article) => article.type === filter);
  }, [articles, filter]);

  // Count for filter badges
  const counts = useMemo(() => ({
    all: articles.length,
    original: articles.filter((a) => a.type === "original").length,
    updated: articles.filter((a) => a.type === "updated").length,
  }), [articles]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        {/* Header Section */}
        <header className="mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 opacity-0 animate-fade-up">
            Articles
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Explore our collection of articles, including AI-enhanced rewrites with verified references.
          </p>
        </header>

        {/* Initial State - Start Button */}
        {!hasStarted && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Ready to explore?
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Click the button below to fetch articles. If the database is empty, it will automatically scrape 5 articles first.
            </p>
            <button
              onClick={() => loadArticles(true)}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-base",
                "bg-primary text-primary-foreground",
                "transition-all duration-base",
                "hover:opacity-90 hover:shadow-lg hover:scale-[1.02]",
                "active:scale-[0.98] active:shadow-md",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Fetch Articles
            </button>
          </div>
        )}

        {/* Loading State */}
        {(loading || scraping) && (
          <div className="flex items-center justify-center py-24">
            <Loader 
              message={
                scraping 
                  ? "Scraping 5 articles from website..." 
                  : "Fetching articles..."
              } 
              size="lg" 
            />
          </div>
        )}

        {/* Error State */}
        {error && !loading && !scraping && hasStarted && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
            <button
              onClick={loadArticles}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all duration-base hover:opacity-90 active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !scraping && !error && hasStarted && (
          <>
            {/* Filter Toggle + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
              {articles.length > 0 ? (
                <FilterToggle value={filter} onChange={setFilter} counts={counts} />
              ) : (
                <div></div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleScrape}
                  disabled={scraping}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                    "bg-primary text-primary-foreground",
                    "transition-all duration-base",
                    "hover:opacity-90 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Scrape Articles
                </button>
                {articles.length > 0 && (
                  <button
                    onClick={loadArticles}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                      "text-muted-foreground hover:text-foreground",
                      "bg-secondary hover:bg-secondary/80",
                      "transition-all duration-base",
                      "active:scale-[0.98]"
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {filter === "all" ? "No articles found" : `No ${filter} articles`}
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  {filter === "all"
                    ? articles.length === 0
                      ? "No articles in the database. Click 'Scrape Articles' to fetch 5 articles from the website."
                      : "No articles match the current filter."
                    : `There are no ${filter} articles to display.`}
                </p>
                {filter === "all" && articles.length === 0 && (
                  <button
                    onClick={handleScrape}
                    disabled={scraping}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm",
                      "bg-primary text-primary-foreground",
                      "transition-all duration-base",
                      "hover:opacity-90 active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Scrape 5 Articles
                  </button>
                )}
              </div>
            )}

            {/* Articles Grid */}
            {filteredArticles.length > 0 && (
              <div className="grid gap-6 lg:gap-8">
                {filteredArticles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ArticlesList;
