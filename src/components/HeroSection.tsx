
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
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
    <section className="relative bg-gradient-hero py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-brand-green rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-brand-blue rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-brand-teal rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Hero Content */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Discover & Rate
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Local Vendors</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with your community's best businesses. Share experiences, read reviews, 
            and help local vendors thrive through authentic feedback.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for restaurants, services, shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-lg border-2 border-transparent bg-card shadow-hero focus:border-primary rounded-full"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-primary text-white border-0 rounded-full hover:shadow-soft"
              >
                Search
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-white border-0 hover:shadow-soft h-12 px-8 rounded-full"
              onClick={handleStartReviewing}
            >
              Start Reviewing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-12 px-8 rounded-full border-2 hover:bg-accent"
              onClick={handleListBusiness}
            >
              List Your Business
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-soft transition-smooth">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
