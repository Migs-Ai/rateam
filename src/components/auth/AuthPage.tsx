
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { EmailConfirmation } from "./EmailConfirmation";

const AuthPage = () => {
  const { loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "vendor">("user");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showEmailConfirmation) {
    return (
      <EmailConfirmation 
        email={email}
        onBackToSignIn={() => setShowEmailConfirmation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Rate Am</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                fullName={fullName}
                setFullName={setFullName}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                onEmailConfirmation={() => setShowEmailConfirmation(true)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
