
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { Progress } from "@/components/ui/progress";
import PageTransition from "@/components/transitions/PageTransition";

const VendorOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    location: "",
    phone: "",
    whatsapp: "",
    email: "",
    preferredContact: "whatsapp"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.businessName.trim() !== "";
      case 2:
        return formData.category !== "";
      case 3:
        return formData.location.trim() !== "";
      case 4:
        return true; // Contact info is optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError("");
    } else {
      setError("Please complete all required fields before continuing.");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: user?.id,
          business_name: formData.businessName,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email || user?.email,
          preferred_contact: formData.preferredContact,
          status: 'pending'
        });

      if (vendorError) throw vendorError;

      setIsComplete(true);
      toast({
        title: "Business Registration Submitted",
        description: "Your business is now pending approval from our admin team.",
      });

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to register your business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Rate Am!</CardTitle>
            <CardDescription>
              Your business registration is complete
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>✓ We'll review your business information</li>
                <li>✓ You'll receive approval notification via email</li>
                <li>✓ Once approved, customers can find and review your business</li>
                <li>✓ Access your dashboard to manage reviews and profile</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate("/vendor-dashboard")} className="w-full">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Browse Businesses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Let's start with your business basics</h2>
              <p className="text-muted-foreground">Tell us about your business name and what you do</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what your business does, your services, specialties..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This helps customers understand your business better
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Choose your business category</h2>
              <p className="text-muted-foreground">This helps customers find you more easily</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Business Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category that best describes your business" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category && (
                <p className="text-sm text-green-600">
                  Great choice! Customers browsing {formData.category} will be able to find you.
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Where are you located?</h2>
              <p className="text-muted-foreground">Help customers find your business</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Business Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State or Full Address"
                required
              />
              <p className="text-xs text-muted-foreground">
                You can enter your city and state, or full address if you want to be more specific
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">How can customers reach you?</h2>
              <p className="text-muted-foreground">Add your contact information (optional but recommended)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="business@example.com"
              />
            </div>
            <div className="space-y-3">
              <Label>Preferred Contact Method</Label>
              <RadioGroup 
                value={formData.preferredContact} 
                onValueChange={(value) => handleInputChange("preferredContact", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp-contact" />
                  <Label htmlFor="whatsapp-contact">WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-contact" />
                  <Label htmlFor="phone-contact">Phone Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-contact" />
                  <Label htmlFor="email-contact">Email</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Business Registration</CardTitle>
            <CardDescription>
              Step {currentStep} of {totalSteps}
            </CardDescription>
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading || categoriesLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageTransition>
  );
};

export default VendorOnboarding;
