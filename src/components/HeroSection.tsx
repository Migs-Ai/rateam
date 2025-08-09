import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    // Scroll to vendors section after search
    const vendorsSection = document.getElementById("vendors");
    if (vendorsSection) {
      vendorsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartReviewing = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Scroll to vendors section to start reviewing
    const vendorsSection = document.getElementById("vendors");
    if (vendorsSection) {
      vendorsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleListBusiness = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/vendor-onboarding");
  };

  const stats = [
    { icon: Users, label: "Active Users", value: "2,500+" },
    { icon: Star, label: "Reviews Posted", value: "12,000+" },
    { icon: MapPin, label: "Local Vendors", value: "850+" },
  ];

  return (
    <section className="relative bg-card py-16 overflow-hidden border-b">
      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main Hero Content */}
        <div className="max-w-5xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Where to?
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing local businesses and share your experiences with the community.
          </p>

          {/* Search Bar - TripAdvisor style */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative bg-card border-2 border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200">
              <Input
                type="text"
                placeholder="Things to do, restaurants, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-24 text-base border-0 bg-transparent rounded-full focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center items-center mb-12">
            <Button 
              variant="outline"
              className="h-10 px-6 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleStartReviewing}
            >
              Browse Reviews
            </Button>
            <Button 
              variant="outline" 
              className="h-10 px-6 rounded-full"
              onClick={handleListBusiness}
            >
              List Your Business
            </Button>
          </div>
        </div>

        {/* Clean Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-semibold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
