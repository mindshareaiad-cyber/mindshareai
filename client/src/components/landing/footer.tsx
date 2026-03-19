import { Link } from "wouter";
import { SiLinkedin, SiX } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer mb-4">
                <img src="/logo.png" alt="Mindshare AI" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-lg">Mindshare AI</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Monitor and understand your brand's visibility in AI-powered answers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-features">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-pricing">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/free-check" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-free-check">
                  Free AI Visibility Check
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-compare">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-terms">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mindshare AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/mindshare-ai2/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-linkedin">
              <SiLinkedin className="h-5 w-5" />
            </a>
            <a href="https://x.com/Mindshare_ai2" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" data-testid="link-footer-twitter">
              <SiX className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
