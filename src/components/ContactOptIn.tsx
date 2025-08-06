import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone, Info, ArrowLeft, ArrowRight } from "lucide-react";

interface ContactOptInProps {
  title: string;
  description: string;
  onComplete: (data: { allowContact: boolean; whatsapp?: string; phone?: string }) => void;
  onSkip?: () => void;
  initialWhatsapp?: string;
  initialPhone?: string;
  showSkipOption?: boolean;
}

export const ContactOptIn = ({
  title,
  description,
  onComplete,
  onSkip,
  initialWhatsapp = "",
  initialPhone = "",
  showSkipOption = true
}: ContactOptInProps) => {
  const [allowContact, setAllowContact] = useState(false);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [phone, setPhone] = useState(initialPhone);
  const [showContactForm, setShowContactForm] = useState(false);

  // Check if user has existing contact info
  const hasExistingContact = initialWhatsapp || initialPhone;

  useEffect(() => {
    if (allowContact && !hasExistingContact) {
      setShowContactForm(true);
    } else {
      setShowContactForm(false);
    }
  }, [allowContact, hasExistingContact]);

  const handleContinue = () => {
    if (allowContact) {
      onComplete({ 
        allowContact: true, 
        whatsapp: whatsapp.trim() || undefined, 
        phone: phone.trim() || undefined 
      });
    } else {
      onComplete({ allowContact: false });
    }
  };

  const handleSkip = () => {
    onComplete({ allowContact: false });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Permission Toggle */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="allow-contact"
            checked={allowContact}
            onCheckedChange={(checked) => setAllowContact(checked === true)}
          />
          <div className="space-y-1">
            <label
              htmlFor="allow-contact"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Allow vendors to contact me later
            </label>
            <p className="text-xs text-muted-foreground">
              Optional - Vendors can reach out to provide better service or follow up on your feedback
            </p>
          </div>
        </div>

        {/* Existing Contact Info Notice */}
        {allowContact && hasExistingContact && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Contact info available
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  We'll use your existing contact information from your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {showContactForm && (
          <div className="space-y-4 border-t pt-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Optional:</strong> Add contact info to let vendors reach out with updates or better service.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g., +1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                You can leave these blank and add them later in your profile settings.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {showSkipOption && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Skip
            </Button>
          )}
          <Button
            onClick={handleContinue}
            className="flex-1"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            <strong>Privacy:</strong> Your contact information is only shared with vendors when you explicitly choose to allow contact. 
            You can update these preferences anytime in your profile settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
