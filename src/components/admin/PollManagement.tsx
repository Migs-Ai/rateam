
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Calendar, Users, Vote } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Poll {
  id: string;
  title: string;
  description: string | null;
  options: string[];
  status: string;
  created_at: string;
  ends_at: string | null;
}

export const PollManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: ["", ""],
    ends_at: ""
  });

  const queryClient = useQueryClient();

  const { data: polls, isLoading } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Poll[];
    }
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData: typeof newPoll) => {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          title: pollData.title,
          description: pollData.description || null,
          options: pollData.options.filter(option => option.trim() !== ''),
          ends_at: pollData.ends_at || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast.success('Poll created successfully!');
      setIsCreateDialogOpen(false);
      setNewPoll({ title: "", description: "", options: ["", ""], ends_at: "" });
    },
    onError: (error) => {
      toast.error('Failed to create poll: ' + error.message);
    }
  });

  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast.success('Poll deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete poll: ' + error.message);
    }
  });

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPoll.title.trim() && newPoll.options.filter(opt => opt.trim()).length >= 2) {
      createPollMutation.mutate(newPoll);
    } else {
      toast.error('Please provide a title and at least 2 options');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Poll Management</h2>
            <p className="text-muted-foreground">Create and manage community polls</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Poll Management</h2>
          <p className="text-muted-foreground">Create and manage community polls</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
              <DialogDescription>
                Create a new community poll for users to vote on
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title</Label>
                <Input
                  id="title"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter poll title..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter poll description..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Poll Options</Label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {newPoll.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ends_at">End Date (Optional)</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={newPoll.ends_at}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, ends_at: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createPollMutation.isPending}
                  className="flex-1"
                >
                  {createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {polls?.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 text-base">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {poll.description}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deletePollMutation.mutate(poll.id)}
                  disabled={deletePollMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                    {poll.status}
                  </Badge>
                  {poll.ends_at && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(poll.ends_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{poll.options.length} options</span>
                    <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {polls?.length === 0 && (
        <div className="text-center py-16">
          <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Polls Created Yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your first community poll to engage with users.
          </p>
        </div>
      )}
    </div>
  );
};
