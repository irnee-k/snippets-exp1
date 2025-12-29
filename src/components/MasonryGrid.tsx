import Masonry from 'react-masonry-css';
import { ContentCard } from './ContentCard';

interface Post {
  id: string;
  image_url: string;
  content_text: string | null;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string | null;
  } | null;
}

interface MasonryGridProps {
  posts: Post[];
  onPostChange?: () => void;
  showDeleteButton?: boolean;
}

const breakpointColumns = {
  default: 5,
  1280: 4,
  1024: 3,
  768: 2,
  500: 1,
};

export function MasonryGrid({ posts, onPostChange, showDeleteButton = false }: MasonryGridProps) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {posts.map((post, index) => (
        <div 
          key={post.id} 
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
        >
          <ContentCard
            id={post.id}
            imageUrl={post.image_url}
            contentText={post.content_text}
            userId={post.user_id}
            username={post.profiles?.username || undefined}
            onSaveToWall={onPostChange}
            onDelete={onPostChange}
            showDeleteButton={showDeleteButton}
          />
        </div>
      ))}
    </Masonry>
  );
}
