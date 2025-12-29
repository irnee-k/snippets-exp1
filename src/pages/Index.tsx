import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MasonryGrid } from '@/components/MasonryGrid';
import { AddContentModal } from '@/components/AddContentModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Discover inspiring visuals
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Curate Your{' '}
            <span className="text-primary">Visual World</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Save, organize, and share the images and ideas that inspire you. 
            Build your personal wall of creativity.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {user ? (
              <AddContentModal onContentAdded={fetchPosts} />
            ) : (
              <>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=signup">
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Grid Section */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Explore Snippets
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No snippets yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share something inspiring!
              </p>
              {user && <AddContentModal onContentAdded={fetchPosts} />}
            </div>
          ) : (
            <MasonryGrid posts={posts} onPostChange={fetchPosts} />
          )}
        </section>
      </main>
    </div>
  );
}
