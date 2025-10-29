import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hearthora</h3>
            <p className="text-sm text-muted-foreground">
              Connect with trusted local service providers for all your needs.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/providers" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-providers">
                  All Providers
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-categories">
                  Categories
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">For Providers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-become-provider">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-provider-login">
                  Provider Login
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-resources">
                  Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Hearthora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
