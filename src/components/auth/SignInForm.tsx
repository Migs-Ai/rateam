
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export const SignInForm = ({ email, setEmail, password, setPassword }: SignInFormProps) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check user role after successful login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('User logged in:', user.id, 'Email:', user.email);
        
        // Get user role with better error handling
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        console.log('User role query result:', {
          roleData,
          roleError,
          userId: user.id
        });

        // If no role found, check if we can get any user_roles for debugging
        if (!roleData && roleError) {
          console.log('No role found, checking all user_roles for debugging...');
          const { data: allRoles, error: allRolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
          
          console.log('All roles for user:', allRoles, 'Error:', allRolesError);
        }

        // Redirect based on user role
        if (roleData?.role === 'vendor') {
          console.log('Redirecting to vendor dashboard');
          navigate('/vendor-dashboard');
        } else if (roleData?.role === 'admin' || roleData?.role === 'super_admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to home page - role:', roleData?.role || 'none');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setError('An unexpected error occurred');
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
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
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
