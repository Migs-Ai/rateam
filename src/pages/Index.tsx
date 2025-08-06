
import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import VendorGrid from "@/components/VendorGrid";
import Footer from "@/components/Footer";
import PageTransition from "@/components/transitions/PageTransition";

const Index = () => {
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const handleHeroSearch = (query: string) => {
    setHeroSearchQuery(query);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <HeroSection onSearch={handleHeroSearch} />
          <VendorGrid heroSearchQuery={heroSearchQuery} />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
