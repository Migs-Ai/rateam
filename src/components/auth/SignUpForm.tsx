import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [showPassword, setShowPassword] = useState(false);
  
  // Vendor-specific fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [preferredContact, setPreferredContact] = useState("whatsapp");

  // Fetch categories for vendor signup
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate vendor-specific fields if vendor is selected
    if (selectedRole === "vendor") {
      if (!businessName || !category || !location || !phone) {
        setError("Please fill in all required vendor fields");
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log('Starting signup process for:', email, 'as', selectedRole);
      
      // First, sign up the user
      const { error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      console.log('User signed up successfully');

      // If vendor role is selected, wait a bit and then create vendor record
      if (selectedRole === "vendor") {
        console.log('Creating vendor profile...');
        
        // Wait longer for the user to be created and trigger to run
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the current user after signup
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user after signup:', userError);
          toast({
            title: "Warning",
            description: "Account created but vendor profile setup incomplete. You can complete it later.",
            variant: "destructive"
          });
        } else {
          console.log('Updating user role to vendor for user:', user.id);
          
          // Update the existing user role record to vendor
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: 'vendor' })
            .eq('user_id', user.id);

          if (roleError) {
            console.error('Error updating user role:', roleError);
            toast({
              title: "Warning",
              description: "Account created but role assignment failed. Contact support.",
              variant: "destructive"
            });
          } else {
            console.log('User role updated to vendor successfully');
          }

          // Create vendor record
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              user_id: user.id,
              business_name: businessName,
              category: category,
              location: location,
              description: description,
              phone: phone,
              email: vendorEmail || email,
              whatsapp: whatsapp,
              preferred_contact: preferredContact,
              status: 'pending'
            });

          if (vendorError) {
            console.error('Error creating vendor record:', vendorError);
            toast({
              title: "Warning", 
              description: "Account created but vendor profile setup incomplete. You can complete it later.",
              variant: "destructive"
            });
          } else {
            console.log('Vendor record created successfully');
          }
        }
      }

      // Show registration success animation
      onRegistrationSuccess(email, selectedRole === "vendor");
      
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred');
    }
    
    setIsLoading(false);
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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Account Type</Label>
        <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="flex gap-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user">Regular User</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vendor" id="vendor" />
            <Label htmlFor="vendor">Business/Vendor</Label>
          </div>
        </RadioGroup>
      </div>

      {selectedRole === "vendor" && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg">Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Full Location"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendorEmail">Business Email</Label>
              <Input
                id="vendorEmail"
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="Optional - defaults to account email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
            <Select value={preferredContact} onValueChange={setPreferredContact}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your business..."
              rows={3}
            />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};
