import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Badge from "./Badge";
import type { Article } from "@/api/axios";

interface ArticleCardProps {
  article: Article;
  className?: string;
  index?: number;
}

const ArticleCard = ({ article, className, index = 0 }: ArticleCardProps) => {
  // Get preview text (first ~150 characters)
  const preview = article.content.length > 150
    ? article.content.substring(0, 150).trim() + "…"
    : article.content;

  return (
    <Link
      to={`/article/${article.id}`}
      className={cn(
        "group block opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article
        className={cn(
          "relative p-6 lg:p-8 rounded-xl bg-card border border-border/50",
          "transition-all duration-base ease-out",
          "hover:border-border hover:shadow-lg hover:-translate-y-0.5",
          "active:scale-[0.99] active:shadow-md"
        )}
      >
        {/* Badge */}
        <div className="mb-4">
          <Badge variant={article.type} />
        </div>

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight leading-snug mb-3 transition-colors duration-base group-hover:text-primary">
          {article.title}
        </h2>

        {/* Preview */}
        <p className="text-base text-muted-foreground leading-relaxed">
          {preview}
        </p>

        {/* Read more indicator */}
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 translate-x-0 transition-all duration-base group-hover:opacity-100 group-hover:translate-x-1">
          <span>Read article</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
