import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import Navigation from "@/components/Navigation";
import { Users, Star, Building2, MessageSquare } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <BackButton to="/" />
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              About <span className="text-primary">RateAm</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trusted platform for discovering, rating, and connecting with local vendors and service providers.
            </p>
          </div>

        {/* Mission Section */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To bridge the gap between customers and quality service providers by creating a transparent, 
                reliable platform where authentic reviews and ratings help everyone make informed decisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To become the leading community-driven platform that empowers local businesses to thrive 
                while helping customers discover exceptional services in their area.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            What Makes Us Different
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Verified Vendors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All vendors go through our verification process to ensure quality and authenticity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Authentic Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real reviews from real customers, moderated to maintain quality and prevent spam.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built by the community, for the community. Your feedback shapes our platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Platform Statistics
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <p className="text-muted-foreground">Registered Users</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Verified Vendors</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">2500+</div>
                <p className="text-muted-foreground">Reviews Posted</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Categories</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're looking for quality services or want to showcase your business, 
            Rate Am is the platform that brings us all together.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">Trusted</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">Transparent</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">Community-Focused</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">Quality-Driven</Badge>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default About;