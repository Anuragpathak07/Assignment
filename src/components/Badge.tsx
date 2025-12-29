import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "original" | "updated";
  className?: string;
}

const Badge = ({ variant, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full transition-colors duration-base",
        variant === "original" && "bg-badge-original text-badge-original-foreground",
        variant === "updated" && "bg-badge-updated text-badge-updated-foreground",
        className
      )}
    >
      {variant}
    </span>
  );
};

export default Badge;
