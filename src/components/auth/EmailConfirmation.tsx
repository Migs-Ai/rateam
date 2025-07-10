
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";

interface EmailConfirmationProps {
  email: string;
  onBackToSignIn: () => void;
}

export const EmailConfirmation = ({ email, onBackToSignIn }: EmailConfirmationProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Click the link in your email to complete your registration</span>
          </div>
          <Button 
            variant="outline" 
            onClick={onBackToSignIn}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
