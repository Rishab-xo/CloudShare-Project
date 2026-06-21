import React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
];

export const SocialProofAvatars = ({
  avatars = DEFAULT_AVATARS,
  limit = 4,
  className,
  avatarClassName
}) => {
  const displayedAvatars = avatars.slice(0, limit);

  return (
    <div className={cn("flex -space-x-2.5 items-center", className)}>
      {displayedAvatars.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`User avatar ${i + 1}`}
          className={cn(
            "w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm",
            avatarClassName
          )}
        />
      ))}
    </div>
  );
};
