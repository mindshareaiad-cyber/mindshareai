import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <img src="/logo.png" alt="Mindshare AI" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-lg">Mindshare AI</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-features">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-pricing">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-blog">
              Blog
            </Link>
            <Link href="/free-check" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-free-check">
              Free AI Check
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-contact">
              Contact
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle testId="button-theme-toggle-desktop" />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" data-testid="button-header-dashboard">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" data-testid="button-header-login">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" data-testid="button-header-signup">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle testId="button-theme-toggle-mobile" />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-features">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-pricing">
                Pricing
              </Link>
              <Link href="/free-check" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-free-check">
                Free AI Check
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-contact">
                Contact
              </Link>
              <div className="flex gap-2 pt-4 border-t">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full" data-testid="button-mobile-dashboard">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full" data-testid="button-mobile-login">Log In</Button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <Button className="w-full" data-testid="button-mobile-signup">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
