import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MasonryGrid } from '@/components/MasonryGrid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Shield, Users, Image, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

interface Post {
  id: string;
  image_url: string;
  content_text: string | null;
  user_id: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}

interface UserProfile {
  user_id: string;
  username: string | null;
}

const contentSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).max(2048),
  contentText: z.string().max(1000).optional(),
  userId: z.string().uuid({ message: "Please select a user" }),
});

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        image_url,
        content_text,
        user_id,
        created_at,
        profiles (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username')
      .order('username');

    if (!error && data) {
      setUsers(data);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchPosts();
      fetchUsers();
    }
  }, [user, isAdmin]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contentSchema.safeParse({
      imageUrl,
      contentText: contentText || undefined,
      userId: selectedUserId,
    });

    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: selectedUserId,
        image_url: imageUrl.trim(),
        content_text: contentText.trim() || null,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add content. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Content added to user's wall.",
      });
      setImageUrl('');
      setContentText('');
      setSelectedUserId('');
      setModalOpen(false);
      fetchPosts();
    }

    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <section className="py-8 md:py-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-card">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage all content and users
                </p>
              </div>
            </div>

            {/* Add Content to Any Wall */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Image className="w-5 h-5" />
                  Add to User Wall
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Add Content to User Wall</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleAddContent} className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="user" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Select User
                    </Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.username || 'Unnamed User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentText">Description (optional)</Label>
                    <Textarea
                      id="contentText"
                      placeholder="Add a description..."
                      value={contentText}
                      onChange={(e) => setContentText(e.target.value)}
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isSubmitting || !imageUrl || !selectedUserId}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Add to Wall'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-soft">
              <p className="text-2xl font-bold text-foreground">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Total Snippets</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-soft">
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </section>

        {/* All Posts Grid */}
        <section className="py-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            All Content
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No content to display.</p>
            </div>
          ) : (
            <MasonryGrid 
              posts={posts} 
              onPostChange={fetchPosts} 
              showDeleteButton={true}
            />
          )}
        </section>
      </main>
    </div>
  );
}
