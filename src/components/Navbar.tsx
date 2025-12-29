import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-navbar">
      <nav className="container max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-semibold tracking-tight text-foreground transition-colors duration-base group-hover:text-primary">
              BeyondChats
            </span>
            <span className="text-xl font-light tracking-tight text-muted-foreground">
              Articles
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={cn(
                "relative py-1 text-sm font-medium transition-colors duration-base",
                isActive("/")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Articles
              {/* Active indicator */}
              <span
                className={cn(
                  "absolute -bottom-[1.125rem] left-0 right-0 h-0.5 bg-primary transition-all duration-base",
                  isActive("/") ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
