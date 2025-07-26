import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PollRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: ["", ""],
    reason: ""
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: typeof formData) => {
      if (!user) {
        throw new Error('Must be logged in to submit poll requests');
      }

      // For now, we'll store poll requests in the polls table with a "requested" status
      // Later, admins can approve and change status to "active"
      const { error } = await supabase
        .from('polls')
        .insert({
          title: requestData.title,
          description: `${requestData.description}\n\nRequester's reason: ${requestData.reason}`,
          options: requestData.options.filter(option => option.trim() !== ''),
          status: 'requested',
          created_by: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Poll request submitted!",
        description: "Your poll request has been sent to administrators for review.",
      });
      navigate('/polls');
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to submit poll requests.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (formData.title.trim() && formData.options.filter(opt => opt.trim()).length >= 2) {
      submitRequestMutation.mutate(formData);
    } else {
      toast({
        title: "Incomplete form",
        description: "Please provide a title and at least 2 options.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/polls')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Request a <span className="text-primary">Poll</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question for the community? Submit your poll idea and we'll review it for approval.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Poll Request Form
            </CardTitle>
            <CardDescription>
              Fill out the details below to request a new community poll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., What's your favorite local restaurant?"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more context about your poll question..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <Label>Poll Options *</Label>
                <p className="text-sm text-muted-foreground">
                  Provide at least 2 options for people to choose from
                </p>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                
                {formData.options.length < 6 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addOption}
                    className="w-full"
                  >
                    + Add Another Option
                  </Button>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Why should we create this poll? *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this poll would be valuable to the community..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={submitRequestMutation.isPending}
                  className="flex-1 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/polls')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Guidelines for Poll Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Make sure your poll question is clear and easy to understand</p>
            <p>• Provide balanced and fair options for people to choose from</p>
            <p>• Avoid controversial or inappropriate topics</p>
            <p>• Poll requests are reviewed by administrators before being published</p>
            <p>• You'll be notified when your poll is approved or if changes are needed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PollRequest;