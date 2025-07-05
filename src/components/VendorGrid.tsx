import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import VendorCard from "./VendorCard";
import { Search, Filter } from "lucide-react";

// Mock data for demonstration
const mockVendors = [
  {
    id: "1",
    name: "Mama's Kitchen",
    category: "Restaurant",
    description: "Authentic local cuisine with traditional flavors and fresh ingredients. Family-owned restaurant serving the community for over 15 years.",
    rating: 4.8,
    reviewCount: 127,
    location: "Downtown District, Main Street",
    phone: "+1 (555) 123-4567",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    isOpen: true,
    featured: true
  },
  {
    id: "2",
    name: "TechFix Solutions",
    category: "Electronics Repair",
    description: "Professional electronics repair service for phones, laptops, and tablets. Quick turnaround with quality guarantee.",
    rating: 4.6,
    reviewCount: 89,
    location: "Tech Plaza, Second Floor",
    phone: "+1 (555) 987-6543",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
    isOpen: true
  },
  {
    id: "3",
    name: "Green Garden Supplies",
    category: "Garden Center",
    description: "Complete gardening supplies, plants, tools, and expert advice for your garden projects.",
    rating: 4.4,
    reviewCount: 156,
    location: "Garden District, Oak Avenue",
    phone: "+1 (555) 456-7890",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    isOpen: false
  },
  {
    id: "4",
    name: "Artisan Coffee Co.",
    category: "Coffee Shop",
    description: "Specialty coffee roasted in-house daily. Comfortable workspace with free WiFi and delicious pastries.",
    rating: 4.9,
    reviewCount: 203,
    location: "Arts Quarter, Pine Street",
    phone: "+1 (555) 321-0987",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
    isOpen: true,
    featured: true
  },
  {
    id: "5",
    name: "QuickWash Laundromat",
    category: "Laundry Service",
    description: "24-hour self-service laundromat with modern machines and drop-off wash & fold service.",
    rating: 4.2,
    reviewCount: 74,
    location: "Residential Area, Elm Street",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop",
    isOpen: true
  },
  {
    id: "6",
    name: "Bella's Beauty Salon",
    category: "Beauty & Wellness",
    description: "Full-service beauty salon offering haircuts, styling, coloring, and spa treatments in a relaxing environment.",
    rating: 4.7,
    reviewCount: 98,
    location: "Beauty District, Rose Avenue",
    phone: "+1 (555) 654-3210",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    isOpen: true
  }
];

const categories = [
  "All Categories",
  "Restaurant",
  "Electronics Repair", 
  "Garden Center",
  "Coffee Shop",
  "Laundry Service",
  "Beauty & Wellness"
];

const VendorGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("rating");

  const filteredVendors = mockVendors
    .filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || vendor.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <section id="vendors" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Local <span className="bg-gradient-primary bg-clip-text text-transparent">Vendors</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our curated list of local businesses and discover your next favorite spot.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="reviews">Reviews</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory !== "All Categories") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "All Categories" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All Categories")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredVendors.length} of {mockVendors.length} vendors
          </p>
        </div>

        {/* Vendor Grid */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No vendors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all categories.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorGrid;