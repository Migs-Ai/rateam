
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContactOptIn } from "@/components/ContactOptIn";

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
  onRegistrationSuccess: (email: string, isVendor: boolean) => void;
}

type SignUpStep = "basic" | "contact" | "vendor";

interface ContactData {
  allowContact: boolean;
  whatsapp?: string;
  phone?: string;
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
  onEmailConfirmation,
  onRegistrationSuccess
}: SignUpFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>("basic");
  const [contactData, setContactData] = useState<ContactData>({ allowContact: false });
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "user") {
      setCurrentStep("contact");
    } else {
      setCurrentStep("vendor");
    }
  };

  const handleContactOptIn = (data: ContactData) => {
    setContactData(data);
    if (data.whatsapp) setWhatsapp(data.whatsapp);
    if (data.phone) setPhone(data.phone);
    
    if (selectedRole === "vendor") {
      setCurrentStep("vendor");
    } else {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    setError("");
    setIsLoading(true);

    try {
      console.log('Starting signup process for role:', selectedRole);
      
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      console.log('User signed up successfully');

      // Wait for user creation and trigger to run
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the current user after signup
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user after signup:', userError);
        toast({
          title: "Warning",
          description: "Account created but setup incomplete. Please contact support.",
          variant: "destructive"
        });
      } else {
        // Update profile with contact info if provided
        if (contactData.allowContact && (contactData.whatsapp || contactData.phone)) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              whatsapp: contactData.whatsapp || null,
              phone: contactData.phone || null
            })
            .eq('id', user.id);

          if (profileError) {
            console.error('Error updating profile with contact info:', profileError);
          }
        }

        // If vendor role is selected, update role and create vendor record
        if (selectedRole === "vendor") {
          console.log('Processing vendor registration...');
          
          // Update the role to vendor with retry logic
          let roleUpdateSuccess = false;
          for (let i = 0; i < 3; i++) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .update({ role: 'vendor' })
              .eq('user_id', user.id);

            if (!roleError) {
              roleUpdateSuccess = true;
              console.log('User role updated to vendor successfully');
              break;
            }
            
            console.log(`Role update attempt ${i + 1} failed:`, roleError);
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (!roleUpdateSuccess) {
            toast({
              title: "Warning",
              description: "Account created but role assignment failed. Please contact support.",
              variant: "destructive"
            });
          } else {
            // Create vendor record
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert({
                user_id: user.id,
                business_name: businessName || `${fullName}'s Business`,
                category: category || 'Professional Services',
                location: location || 'Not specified',
                description: description || 'Professional business services',
                phone: phone,
                whatsapp: whatsapp,
                email: email,
                status: 'approved',
                preferred_contact: 'email'
              });

            if (vendorError) {
              console.error('Error creating vendor record:', vendorError);
              toast({
                title: "Warning",
                description: "Vendor role assigned but business profile creation failed. You can complete it later.",
              });
            } else {
              console.log('Vendor record created successfully');
            }
          }
        }
      }

      // Call the success callback
      onRegistrationSuccess(email, selectedRole === "vendor");
      
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setError('An unexpected error occurred');
    }
    
    setIsLoading(false);
  };

  // Contact Step
  if (currentStep === "contact") {
    return (
      <ContactOptIn
        title="Stay Connected (Optional)"
        description="Let vendors contact you for better service and follow-ups on your reviews."
        onComplete={handleContactOptIn}
        onSkip={() => handleContactOptIn({ allowContact: false })}
        showSkipOption={true}
      />
    );
  }

  // Vendor Business Info Step
  if (currentStep === "vendor") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
        <div className="space-y-4 border-b pb-4">
          <h3 className="font-medium text-sm text-muted-foreground">Business Information (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Restaurant, Electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your business location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your business"
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep(selectedRole === "user" ? "contact" : "basic")}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Basic Info Step (default)
  return (
    <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I want to join as</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Customer</SelectItem>
            <SelectItem value="vendor">Business Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
};
