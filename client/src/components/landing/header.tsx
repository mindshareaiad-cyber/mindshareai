import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-foreground" />
              </div>
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
            <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-resources">
              Resources
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-contact">
              Contact
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle testId="button-theme-toggle-desktop" />
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="button-header-login">
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" data-testid="button-header-signup">
                Get Started
              </Button>
            </Link>
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
              <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-resources">
                Resources
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-mobile-contact">
                Contact
              </Link>
              <div className="flex gap-2 pt-4 border-t">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full" data-testid="button-mobile-login">Log In</Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full" data-testid="button-mobile-signup">Get Started</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
