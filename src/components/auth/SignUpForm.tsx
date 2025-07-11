
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
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // If vendor role is selected, update role and create vendor record
      if (selectedRole === "vendor") {
        console.log('Processing vendor registration...');
        
        // Wait for the user to be created and trigger to run
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the current user after signup
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user after signup:', userError);
          toast({
            title: "Warning",
            description: "Account created but vendor setup incomplete. Please contact support.",
            variant: "destructive"
          });
        } else {
          console.log('Processing vendor setup for user:', user.id);
          
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
      
      {selectedRole === "vendor" && (
        <div className="space-y-4 border-t pt-4">
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
