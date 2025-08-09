import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Building2, MessageSquare, UserCheck, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    isAdmin,
    isVendor
  } = useUserRole();
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
  const navItems = [{
    href: "/",
    label: "Home"
  }, {
    href: "/about",
    label: "About"
  }, {
    href: "/polls",
    label: "Polls"
  }];
  return <nav className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">RA</span>
            </div>
            <span className="text-lg font-semibold text-foreground">RateAm</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => <Link key={item.href} to={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                {item.label}
              </Link>)}
          </div>

          {/* Desktop Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? <>
                <Button variant="outline" size="sm" onClick={handleListBusiness} className="h-9 text-sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  {isVendor ? "My Business" : "List Business"}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-3">
                      <User className="h-4 w-4 mr-2" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    {isVendor && <DropdownMenuItem onClick={() => navigate("/vendor-dashboard")}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Vendor Dashboard
                      </DropdownMenuItem>}
                    {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <>
                <Button variant="outline" size="sm" onClick={handleListBusiness} className="h-9 text-sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  List Business
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")} className="h-9 text-sm">
                  Sign In
                </Button>
              </>}
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
                {navItems.map(item => <Link key={item.href} to={item.href} className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>)}
                
                <div className="border-t pt-4">
                  {user ? <>
                      <Button variant="outline" className="w-full mb-2" onClick={() => {
                    handleListBusiness();
                    setIsOpen(false);
                  }}>
                        <Building2 className="h-4 w-4 mr-2" />
                        {isVendor ? "My Business" : "List Business"}
                      </Button>
                      
                      <Button variant="outline" className="w-full mb-2" onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}>
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Button>
                      
                      {isVendor && <Button variant="outline" className="w-full mb-2" onClick={() => {
                    navigate("/vendor-dashboard");
                    setIsOpen(false);
                  }}>
                          <Building2 className="h-4 w-4 mr-2" />
                          Vendor Dashboard
                        </Button>}
                      
                      {isAdmin && <Button variant="outline" className="w-full mb-2" onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>}
                      
                      <Button variant="outline" className="w-full" onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </> : <>
                      <Button variant="outline" className="w-full mb-2" onClick={() => {
                    handleListBusiness();
                    setIsOpen(false);
                  }}>
                        <Building2 className="h-4 w-4 mr-2" />
                        List Business
                      </Button>
                      <Button className="w-full" onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}>
                        Sign In
                      </Button>
                    </>}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>;
};
export default Navigation;