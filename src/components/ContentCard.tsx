import { useState } from 'react';
import { Heart, Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContentCardProps {
  id: string;
  imageUrl: string;
  contentText: string | null;
  userId: string;
  username?: string;
  onSaveToWall?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function ContentCard({ 
  id, 
  imageUrl, 
  contentText, 
  userId,
  username,
  onSaveToWall,
  onDelete,
  showDeleteButton = false
}: ContentCardProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSaveToWall = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save snippets to your wall.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        content_text: contentText,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save to your wall. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved!",
        description: "Snippet added to your wall.",
      });
      onSaveToWall?.();
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Snippet removed successfully.",
      });
      onDelete?.();
    }
  };

  const isOwner = user?.id === userId;

  return (
    <div 
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover mb-4 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {imageError ? (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Image unavailable</span>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={contentText || 'Snippet'}
            className={`w-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {!isOwner && (
              <Button
                variant="card"
                size="icon"
                onClick={handleSaveToWall}
                disabled={isSaving}
                className="rounded-full"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            )}
            
            {(showDeleteButton || isOwner) && (
              <Button
                variant="card"
                size="icon"
                onClick={handleDelete}
                className="rounded-full hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {contentText && (
        <div className="p-4">
          <p className="text-sm text-foreground line-clamp-3">{contentText}</p>
          {username && (
            <p className="text-xs text-muted-foreground mt-2">by {username}</p>
          )}
        </div>
      )}
    </div>
  );
}
