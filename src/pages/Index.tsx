
import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import VendorGrid from "@/components/VendorGrid";
import Footer from "@/components/Footer";

const Index = () => {
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const handleHeroSearch = (query: string) => {
    setHeroSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection onSearch={handleHeroSearch} />
        <VendorGrid heroSearchQuery={heroSearchQuery} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
