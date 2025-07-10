
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

          // If vendor role selected, redirect to onboarding after email confirmation
          if (selectedRole === 'vendor') {
            // Store vendor onboarding flag in localStorage for after email confirmation
            localStorage.setItem('pendingVendorOnboarding', 'true');
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

      {selectedRole === 'vendor' && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>What happens next:</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• You'll receive an email confirmation</li>
              <li>• After confirming, you'll be guided through business setup</li>
              <li>• Add your business details, contact info, and category</li>
              <li>• Your business will be reviewed before going live</li>
            </ul>
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
          selectedRole === 'vendor' ? "Create Business Account" : "Create Account"
        )}
      </Button>
    </form>
  );
};
