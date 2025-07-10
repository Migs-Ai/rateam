
import { useState, useEffect } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegistrationSuccessProps {
  email: string;
  isVendor: boolean;
  onContinue: () => void;
}

export const RegistrationSuccess = ({ email, isVendor, onContinue }: RegistrationSuccessProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="relative mx-auto mb-4">
            <div 
              className={`transform transition-all duration-1000 ${
                showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <div 
              className={`absolute inset-0 transform transition-all duration-1500 delay-500 ${
                showAnimation ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <Sparkles className="h-16 w-16 text-yellow-500 mx-auto animate-pulse" />
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold transition-all duration-1000 delay-300 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Registration Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className={`transition-all duration-1000 delay-500 ${
          showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-muted-foreground mb-4">
            Welcome to Rate Am! {isVendor ? 'Your business account' : 'Your account'} has been created successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to <strong>{email}</strong>
          </p>
          {isVendor && (
            <p className="text-sm text-blue-600 mt-2">
              You'll be redirected to your business dashboard shortly...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
