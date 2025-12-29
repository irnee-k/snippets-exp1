import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Image, Type, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

interface AddContentModalProps {
  onContentAdded?: () => void;
  targetUserId?: string;
}

const contentSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).max(2048, { message: "URL is too long" }),
  contentText: z.string().max(1000, { message: "Description must be less than 1000 characters" }).optional(),
});

export function AddContentModal({ onContentAdded, targetUserId }: AddContentModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add content.",
        variant: "destructive",
      });
      return;
    }

    // Validate input
    const result = contentSchema.safeParse({ imageUrl, contentText: contentText || undefined });
    
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
        user_id: targetUserId || user.id,
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
        description: "Your snippet has been added.",
      });
      setImageUrl('');
      setContentText('');
      setPreviewError(false);
      setOpen(false);
      onContentAdded?.();
    }

    setIsSubmitting(false);
  };

  const handleUrlChange = (value: string) => {
    setImageUrl(value);
    setPreviewError(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Snippet
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Snippet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && !previewError && (
            <div className="rounded-xl overflow-hidden bg-muted animate-scale-in">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full max-h-48 object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>
          )}

          {previewError && (
            <div className="rounded-xl bg-muted p-6 text-center text-muted-foreground text-sm">
              Unable to load image preview
            </div>
          )}

          {/* Content Text */}
          <div className="space-y-2">
            <Label htmlFor="contentText" className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              Description (optional)
            </Label>
            <Textarea
              id="contentText"
              placeholder="Add a description for your snippet..."
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={3}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {contentText.length}/1000
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={isSubmitting || !imageUrl}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Wall
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
