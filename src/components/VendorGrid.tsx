
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import VendorCard from "./VendorCard";
import { Search, Filter } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";

interface VendorGridProps {
  heroSearchQuery?: string;
}

const VendorGrid = ({ heroSearchQuery }: VendorGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("rating");

  // Update local search term when hero search query changes
  useEffect(() => {
    if (heroSearchQuery) {
      setSearchTerm(heroSearchQuery);
    }
  }, [heroSearchQuery]);

  const { data: vendors = [], isLoading: vendorsLoading, error: vendorsError } = useVendors(
    searchTerm, 
    selectedCategory === "All Categories" ? undefined : selectedCategory, 
    sortBy
  );
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const categoryOptions = ["All Categories", ...categories.map(cat => cat.name)];

  if (vendorsError) {
    console.error('Error loading vendors:', vendorsError);
  }

  return (
    <section id="vendors" className="py-12 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Local Businesses
          </h2>
          <p className="text-muted-foreground">
            Browse through our curated list of local businesses and discover your next favorite spot.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
              <SelectTrigger className="w-full lg:w-48 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-40 h-9">
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
            {vendorsLoading ? "Loading..." : `Showing ${vendors.length} vendors`}
          </p>
        </div>

        {/* Vendor Grid */}
        {vendorsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading vendors...</p>
          </div>
        ) : vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={{
                  id: vendor.id,
                  name: vendor.business_name,
                  category: vendor.categories?.name || vendor.category || 'Uncategorized',
                  description: vendor.description || '',
                  rating: vendor.rating || 0,
                  reviewCount: vendor.review_count || 0,
                  location: vendor.location || '',
                  phone: vendor.phone || undefined,
                  image: vendor.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
                  isOpen: true, // We can add business hours later
                  featured: false // We can add featured flag later
                }}
              />
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
                {vendorsError 
                  ? "There was an error loading vendors. Please try again later."
                  : "Try adjusting your search criteria or browse all categories."
                }
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
