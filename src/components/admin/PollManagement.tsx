
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Calendar, Users, Vote, Eye, ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
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

  const { data: pollVotes, isLoading: votesLoading } = useQuery({
    queryKey: ['poll-votes', selectedPoll?.id],
    queryFn: async () => {
      if (!selectedPoll?.id) return [];
      
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('poll_id', selectedPoll.id);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPoll?.id
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

  const approvePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .update({ status: 'active' })
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast.success('Poll approved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to approve poll: ' + error.message);
    }
  });

  const rejectPollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast.success('Poll request rejected and deleted!');
    },
    onError: (error) => {
      toast.error('Failed to reject poll: ' + error.message);
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

  const getPollStats = (poll: Poll) => {
    if (!pollVotes) return { totalVotes: 0, optionStats: [] };
    
    const totalVotes = pollVotes.length;
    const optionStats = poll.options.map((option, index) => {
      const votes = pollVotes.filter(vote => vote.option_index === index).length;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      return { option, votes, percentage };
    });
    
    return { totalVotes, optionStats };
  };

  if (selectedPoll) {
    const { totalVotes, optionStats } = getPollStats(selectedPoll);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPoll(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{selectedPoll.title}</h2>
            <p className="text-muted-foreground">Poll Details & Results</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Poll Information */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-foreground">{selectedPoll.title}</p>
              </div>
              
              {selectedPoll.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-foreground">{selectedPoll.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Badge variant={selectedPoll.status === 'active' ? 'default' : 'secondary'}>
                  {selectedPoll.status}
                </Badge>
                {selectedPoll.ends_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Ends {new Date(selectedPoll.ends_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Created on {new Date(selectedPoll.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-5 h-5" />
                {totalVotes} Total Votes
              </div>
            </CardContent>
          </Card>

          {/* Voting Results */}
          <Card>
            <CardHeader>
              <CardTitle>Voting Results</CardTitle>
            </CardHeader>
            <CardContent>
              {votesLoading ? (
                <div className="space-y-3">
                  {[...Array(selectedPoll.options.length)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-2 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {optionStats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stat.option}</span>
                        <span className="text-sm text-muted-foreground">
                          {stat.votes} votes ({stat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                  
                  {totalVotes === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No votes yet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Voters List */}
        {pollVotes && pollVotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Voters</CardTitle>
              <CardDescription>Users who have voted in this poll</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pollVotes.map((vote) => (
                  <div key={vote.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {vote.profiles?.full_name?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{vote.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{vote.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {selectedPoll.options[vote.option_index]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

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
          <Card key={poll.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => setSelectedPoll(poll)}>
                  <CardTitle className="line-clamp-2 text-base">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {poll.description}
                    </CardDescription>
                  )}
                </div>
                {poll.status === 'requested' ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        approvePollMutation.mutate(poll.id);
                      }}
                      disabled={approvePollMutation.isPending}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectPollMutation.mutate(poll.id);
                      }}
                      disabled={rejectPollMutation.isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePollMutation.mutate(poll.id);
                    }}
                    disabled={deletePollMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent onClick={() => setSelectedPoll(poll)}>
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
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    View Details
                  </Button>
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
