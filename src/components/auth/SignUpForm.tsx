
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (fullName: string) => void;
  selectedRole: "user" | "vendor";
  setSelectedRole: (role: "user" | "vendor") => void;
  onEmailConfirmation: () => void;
}

export const SignUpForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  fullName, 
  setFullName, 
  selectedRole, 
  setSelectedRole, 
  onEmailConfirmation 
}: SignUpFormProps) => {
  const { signUp } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Vendor-specific form fields
  const [vendorData, setVendorData] = useState({
    businessName: "",
    description: "",
    category: "",
    location: "",
    phone: "",
    whatsapp: "",
    businessEmail: "",
    preferredContact: "whatsapp"
  });

  const handleVendorDataChange = (field: string, value: string) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (selectedRole === "vendor") {
      if (!vendorData.businessName.trim()) {
        setError("Business name is required for vendors");
        return false;
      }
      if (!vendorData.category) {
        setError("Please select a business category");
        return false;
      }
      if (!vendorData.location.trim()) {
        setError("Business location is required");
        return false;
      }
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        setError(error.message);
      } else {
        // Show email confirmation message
        onEmailConfirmation();
        
        // After successful signup, assign the selected role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: selectedRole
            });
          
          if (roleError) {
            console.error('Error assigning role:', roleError);
          }

          // If vendor role selected, also create vendor profile
          if (selectedRole === 'vendor') {
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert({
                user_id: user.id,
                business_name: vendorData.businessName,
                description: vendorData.description,
                category: vendorData.category,
                location: vendorData.location,
                phone: vendorData.phone,
                whatsapp: vendorData.whatsapp,
                email: vendorData.businessEmail || email,
                preferred_contact: vendorData.preferredContact,
                status: 'pending'
              });
            
            if (vendorError) {
              console.error('Error creating vendor profile:', vendorError);
            }
          }
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <Input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <div className="space-y-3">
        <Label>I want to:</Label>
        <RadioGroup value={selectedRole} onValueChange={(value: "user" | "vendor") => setSelectedRole(value)}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer flex-1">
              <User className="w-4 h-4" />
              <div>
                <div className="font-medium">Browse and review businesses</div>
                <div className="text-sm text-muted-foreground">Find and rate local services</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="vendor" id="vendor" />
            <Label htmlFor="vendor" className="flex items-center gap-2 cursor-pointer flex-1">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="font-medium">List my business</div>
                <div className="text-sm text-muted-foreground">Get discovered by customers and receive reviews</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Vendor-specific fields */}
      {selectedRole === 'vendor' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Business Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              type="text"
              value={vendorData.businessName}
              onChange={(e) => handleVendorDataChange("businessName", e.target.value)}
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCategory">Business Category *</Label>
            <Select value={vendorData.category} onValueChange={(value) => handleVendorDataChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessLocation">Business Location *</Label>
            <Input
              id="businessLocation"
              type="text"
              value={vendorData.location}
              onChange={(e) => handleVendorDataChange("location", e.target.value)}
              placeholder="City, State or Full Address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={vendorData.description}
              onChange={(e) => handleVendorDataChange("description", e.target.value)}
              placeholder="Describe your business, services, and specialties..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Phone Number</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={vendorData.phone}
                onChange={(e) => handleVendorDataChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessWhatsapp">WhatsApp Number</Label>
              <Input
                id="businessWhatsapp"
                type="tel"
                value={vendorData.whatsapp}
                onChange={(e) => handleVendorDataChange("whatsapp", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              value={vendorData.businessEmail}
              onChange={(e) => handleVendorDataChange("businessEmail", e.target.value)}
              placeholder="business@example.com (optional - will use signup email if empty)"
            />
          </div>

          <div className="space-y-3">
            <Label>Preferred Contact Method</Label>
            <RadioGroup 
              value={vendorData.preferredContact} 
              onValueChange={(value) => handleVendorDataChange("preferredContact", value)}
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

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm text-green-800">
              <strong>What happens next:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• You'll receive an email confirmation</li>
                <li>• Your business will be reviewed by our admin team</li>
                <li>• Once approved, customers can find and review your business</li>
                <li>• You'll get access to your vendor dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading || categoriesLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          selectedRole === 'vendor' ? "Create Business Account" : "Create Account"
        )}
      </Button>
    </form>
  );
};
