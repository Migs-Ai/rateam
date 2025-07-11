
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    category: string;
    description: string;
    rating: number;
    reviewCount: number;
    location: string;
    phone?: string;
    image: string;
    isOpen?: boolean;
    featured?: boolean;
  };
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-warning fill-current"
            : index < rating
            ? "text-warning fill-current opacity-50"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const handleWriteReview = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // For now, we'll navigate to a simple review page - this can be enhanced later
    navigate(`/vendor/${vendor.id}/review`);
  };

  const handleViewDetails = () => {
    navigate(`/vendor/${vendor.id}`);
  };

  return (
    <Card className="group hover:shadow-soft transition-smooth bg-gradient-card border-0 overflow-hidden">
      {/* Vendor Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        {vendor.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-primary text-white border-0">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex items-center space-x-1">
          {vendor.isOpen !== undefined && (
            <Badge 
              variant={vendor.isOpen ? "default" : "secondary"}
              className={vendor.isOpen ? "bg-success text-white" : ""}
            >
              <Clock className="w-3 h-3 mr-1" />
              {vendor.isOpen ? "Open" : "Closed"}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
              {vendor.name}
            </h3>
            <Badge variant="secondary" className="mt-1">
              {vendor.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">
            {renderStars(vendor.rating)}
          </div>
          <span className="text-sm font-medium text-foreground">
            {vendor.rating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({vendor.reviewCount} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {vendor.description}
        </p>

        {/* Location & Contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-brand-green" />
            {vendor.location}
          </div>
          {vendor.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-2 text-brand-blue" />
              {vendor.phone}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-primary text-white border-0 hover:shadow-soft"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 hover:bg-accent"
            onClick={handleWriteReview}
          >
            Write Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
