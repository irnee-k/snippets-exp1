import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MasonryGrid } from '@/components/MasonryGrid';
import { AddContentModal } from '@/components/AddContentModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ImagePlus } from 'lucide-react';

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

export default function MyWall() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!user) return;

    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, image_url, content_text, user_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (postsError || !postsData) {
      setLoading(false);
      return;
    }

    // Fetch profile for current user
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();

    const profile = profileData ? { username: profileData.username } : null;

    // Add profile to all posts (they're all from the same user)
    const postsWithProfiles: Post[] = postsData.map(post => ({
      ...post,
      profiles: profile,
    }));

    setPosts(postsWithProfiles);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUsername(data.username);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchProfile();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <section className="py-8 md:py-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {username || 'My Wall'}
                  </h1>
                  <p className="text-muted-foreground">
                    {posts.length} snippet{posts.length !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
            </div>
            
            <AddContentModal onContentAdded={fetchPosts} />
          </div>
        </section>

        {/* Grid Section */}
        <section className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ImagePlus className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your wall is empty
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your collection by adding snippets or saving from the explore page.
              </p>
              <AddContentModal onContentAdded={fetchPosts} />
            </div>
          ) : (
            <MasonryGrid posts={posts} onPostChange={fetchPosts} />
          )}
        </section>
      </main>
    </div>
  );
}
