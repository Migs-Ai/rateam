import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import VendorGrid from "@/components/VendorGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <VendorGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
