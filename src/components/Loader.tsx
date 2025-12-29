import { cn } from "@/lib/utils";

interface LoaderProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Loader = ({ message, className, size = "md" }: LoaderProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div
        className={cn(
          "rounded-full border-muted border-t-primary animate-spin",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
