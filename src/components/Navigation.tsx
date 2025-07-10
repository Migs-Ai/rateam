
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isVendor, isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            <button onClick={() => navigate("/")} className="text-foreground hover:text-primary transition-smooth">
              Home
            </button>
            <a href="#vendors" className="text-foreground hover:text-primary transition-smooth">
              Vendors
            </a>
            <button onClick={() => navigate("/polls")} className="text-foreground hover:text-primary transition-smooth">
              Polls
            </button>
            <button onClick={() => navigate("/about")} className="text-foreground hover:text-primary transition-smooth">
              About
            </button>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  {isVendor && (
                    <DropdownMenuItem onClick={() => navigate("/vendor-dashboard")} className="text-blue-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      Vendor Dashboard
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="text-purple-600">
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary text-white border-0 hover:shadow-soft"
                  onClick={() => navigate("/auth")}
                >
                  Join Now
                </Button>
              </>
            )}
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
              <button onClick={() => navigate("/")} className="text-foreground hover:text-primary transition-smooth py-2 text-left">
                Home
              </button>
              <a href="#vendors" className="text-foreground hover:text-primary transition-smooth py-2">
                Vendors
              </a>
              <button onClick={() => navigate("/polls")} className="text-foreground hover:text-primary transition-smooth py-2 text-left">
                Polls
              </button>
              <button onClick={() => navigate("/about")} className="text-foreground hover:text-primary transition-smooth py-2 text-left">
                About
              </button>
              <div className="flex flex-col space-y-2 pt-3 border-t border-border">
                {user ? (
                  <>
                    <p className="text-sm text-muted-foreground px-2">
                      Welcome, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                      Profile
                    </Button>
                    {isVendor && (
                      <Button variant="outline" size="sm" onClick={() => navigate("/vendor-dashboard")} className="text-blue-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        Vendor Dashboard
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="text-purple-600">
                        Admin
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary text-white border-0"
                      onClick={() => navigate("/auth")}
                    >
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
