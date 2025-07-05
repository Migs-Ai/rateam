import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">Rate Am</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-smooth">
              Home
            </a>
            <a href="#vendors" className="text-foreground hover:text-primary transition-smooth">
              Vendors
            </a>
            <a href="#polls" className="text-foreground hover:text-primary transition-smooth">
              Polls
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-smooth">
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-primary text-white border-0 hover:shadow-soft">
              Join Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-foreground hover:text-primary transition-smooth py-2">
                Home
              </a>
              <a href="#vendors" className="text-foreground hover:text-primary transition-smooth py-2">
                Vendors
              </a>
              <a href="#polls" className="text-foreground hover:text-primary transition-smooth py-2">
                Polls
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-smooth py-2">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button size="sm" className="bg-gradient-primary text-white border-0">
                  Join Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;