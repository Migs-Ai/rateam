import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Vote } from "lucide-react";

const Polls = () => {
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
                <div className="text-2xl font-bold">--</div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">--</div>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls Grid */}
        {polls && polls.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-soft transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {poll.options && Array.isArray(poll.options) && poll.options.map((option: string, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{option}</span>
                          <span className="text-muted-foreground">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    ))}
                    <Button className="w-full mt-4" variant="outline">
                      Vote Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <Button variant="outline">
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
              <Button>
                Create Poll
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Polls;