
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Building2, MessageSquare, UserCheck, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, isVendor } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleListBusiness = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (isVendor) {
      navigate("/vendor-dashboard");
    } else {
      navigate("/vendor-onboarding");
    }
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/polls", label: "Polls" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LocalBiz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleListBusiness}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {isVendor ? "My Business" : "List Business"}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isVendor && (
                      <DropdownMenuItem onClick={() => navigate("/vendor-dashboard")}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Vendor Dashboard
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleListBusiness}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  List Business
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="border-t pt-4">
                  {user ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2"
                        onClick={() => {
                          handleListBusiness();
                          setIsOpen(false);
                        }}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        {isVendor ? "My Business" : "List Business"}
                      </Button>
                      
                      {isVendor && (
                        <Button 
                          variant="outline" 
                          className="w-full mb-2"
                          onClick={() => {
                            navigate("/vendor-dashboard");
                            setIsOpen(false);
                          }}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Vendor Dashboard
                        </Button>
                      )}
                      
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          className="w-full mb-2"
                          onClick={() => {
                            navigate("/admin");
                            setIsOpen(false);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2"
                        onClick={() => {
                          handleListBusiness();
                          setIsOpen(false);
                        }}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        List Business
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          navigate("/auth");
                          setIsOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
