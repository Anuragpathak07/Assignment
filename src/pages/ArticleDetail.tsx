import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchArticleById, rewriteArticle, type Article } from "@/api/axios";
import Badge from "@/components/Badge";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Unable to load this article. It may not exist or there was a connection issue.");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const handleRewrite = async () => {
    if (!id || !article) return;
    
    try {
      setRewriting(true);
      setRewriteError(null);
      const newArticle = await rewriteArticle(id);
      // Navigate to the newly created article
      navigate(`/article/${newArticle.id}`);
    } catch (err: any) {
      console.error("Failed to rewrite article:", err);
      // Extract error message from API response if available
      const errorMessage = err?.response?.data?.error || err?.message || "Failed to rewrite this article. Please try again.";
      setRewriteError(errorMessage);
      setRewriting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader message="Loading article..." size="lg" />
      </main>
    );
  }

  // Error State (only for article loading errors, not rewrite errors)
  if (error && !article) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mb-6 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all duration-base hover:opacity-90 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>
        </div>
      </main>
    );
  }

  // If article failed to load
  if (!article && !loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mb-6 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">{error || "Unable to load this article."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all duration-base hover:opacity-90 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>
        </div>
      </main>
    );
  }

  // Rewriting State (full screen overlay)
  if (rewriting) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader message="Rewriting article with AI..." size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <article className="container max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-base mb-8 opacity-0 animate-fade-in"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Articles
        </Link>

        {/* Header */}
        <header className="mb-10 lg:mb-12">
          {/* Badge */}
          <div className="mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
            <Badge variant={article.type} />
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors duration-base"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                View Source
              </a>
            )}
          </div>
        </header>

        {/* Rewrite Button (Original articles only) */}
        {article.type === "original" && (
          <div className="mb-10 lg:mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {rewriteError && (
              <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-destructive mb-1">Rewrite Failed</h3>
                    <p className="text-sm text-destructive/80">{rewriteError}</p>
                  </div>
                  <button
                    onClick={() => setRewriteError(null)}
                    className="text-destructive/60 hover:text-destructive transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleRewrite}
              disabled={rewriting}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm",
                "bg-primary text-primary-foreground",
                "transition-all duration-base",
                "hover:opacity-90 hover:shadow-lg",
                "active:scale-[0.98] active:shadow-md",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {rewriting ? "Rewriting..." : "Rewrite with AI"}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none opacity-0 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <div className="text-foreground leading-relaxed text-lg lg:text-xl whitespace-pre-wrap">
            {article.content}
          </div>
        </div>

        {/* References Section (Updated articles only) */}
        {article.type === "updated" && article.references && article.references.length > 0 && (
          <section className="mt-12 lg:mt-16 pt-8 lg:pt-10 border-t border-border opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
              References
            </h2>
            <ul className="space-y-3">
              {article.references.map((ref, index) => (
                <li key={index}>
                  <a
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-primary hover:underline underline-offset-2 transition-colors duration-base break-all"
                  >
                    <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>{ref}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
};

export default ArticleDetail;
