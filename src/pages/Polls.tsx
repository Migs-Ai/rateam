import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Vote, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/transitions/PageTransition";

const Polls = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: allVotes } = useQuery({
    queryKey: ['poll-votes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Get user's existing votes
  useEffect(() => {
    if (user && allVotes) {
      const userVoteMap: Record<string, number> = {};
      allVotes
        .filter(vote => vote.user_id === user.id)
        .forEach(vote => {
          userVoteMap[vote.poll_id] = vote.option_index;
        });
      setUserVotes(userVoteMap);
    }
  }, [user, allVotes]);

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      if (!user) throw new Error('Must be logged in to vote');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ option_index: optionIndex })
          .eq('id', existingVote.id);
        
        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            option_index: optionIndex
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes'] });
      toast({
        title: "Vote recorded!",
        description: "Thank you for participating in the poll.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleVote = (pollId: string, optionIndex: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to vote in polls.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    voteMutation.mutate({ pollId, optionIndex });
  };

  const getPollStats = (poll: any) => {
    if (!allVotes) return { totalVotes: 0, optionStats: [] };
    
    const pollVotes = allVotes.filter(vote => vote.poll_id === poll.id);
    const totalVotes = pollVotes.length;
    
    const optionStats = poll.options.map((option: string, index: number) => {
      const votes = pollVotes.filter(vote => vote.option_index === index).length;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      return { option, votes, percentage };
    });
    
    return { totalVotes, optionStats };
  };

  // Real-time updates for votes
  useEffect(() => {
    const channel = supabase
      .channel('poll-votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['poll-votes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Community Polls</h1>
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Community <span className="text-primary">Polls</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have your say! Participate in community polls and help shape the direction of our platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Vote className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{polls?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Active Polls</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{allVotes?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {user ? Object.keys(userVotes).length : 0}
                </div>
                <p className="text-sm text-muted-foreground">Your Votes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls Grid */}
        {polls && polls.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => {
              const { totalVotes, optionStats } = getPollStats(poll);
              const userVoted = userVotes[poll.id] !== undefined;
              const userVoteIndex = userVotes[poll.id];

              return (
                <Card key={poll.id} className="hover:shadow-soft transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 overflow-hidden text-ellipsis">{poll.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {poll.description}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Active</Badge>
                      {poll.ends_at && (
                        <Badge variant="secondary">
                          Ends {new Date(poll.ends_at).toLocaleDateString()}
                        </Badge>
                      )}
                      {userVoted && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground mb-3">
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
                      </div>
                      
                      {optionStats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={`flex items-center gap-2 ${
                              userVoted && userVoteIndex === index ? 'font-semibold text-primary' : ''
                            }`}>
                              {userVoted && userVoteIndex === index && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {stat.option}
                            </span>
                            <span className="text-muted-foreground">
                              {stat.percentage.toFixed(1)}% ({stat.votes})
                            </span>
                          </div>
                          <Progress 
                            value={stat.percentage} 
                            className={`h-2 ${
                              userVoted && userVoteIndex === index ? 'bg-primary/20' : ''
                            }`} 
                          />
                          {!userVoted && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleVote(poll.id, index)}
                              disabled={voteMutation.isPending}
                            >
                              Vote for "{stat.option}"
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {userVoted && (
                        <div className="text-center pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            You voted for "{poll.options[userVoteIndex]}"
                          </p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-2"
                            onClick={() => handleVote(poll.id, userVoteIndex)}
                            disabled={voteMutation.isPending}
                          >
                            Change Vote
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Active Polls
            </h3>
            <p className="text-muted-foreground mb-6">
              There are currently no active polls. Check back later or suggest a new poll topic!
            </p>
            <Button variant="outline" onClick={() => navigate('/poll-request')}>
              Suggest a Poll
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Want to Create a Poll?
              </h2>
              <p className="text-muted-foreground mb-6">
                Have a question for the community? Create a poll and get valuable insights from our users.
              </p>
              <Button onClick={() => navigate('/poll-request')}>
                Create Poll
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default Polls;