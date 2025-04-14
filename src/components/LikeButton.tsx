'use client';

import React, { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/posts/${postId}`);
      return;
    }

    if (status === 'loading' || isPending) {
      return;
    }

    setError(null);

    const previousLikes = likes;
    const previousIsLiked = isLiked;

    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);

    startTransition(async () => {
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update like');
            }

        } catch (err) {
            // console.error("Like error:", err);
            setError(err instanceof Error ? err.message : 'Could not update like status');
            setLikes(previousLikes);
            setIsLiked(previousIsLiked);
        }
    });
  };

  const buttonText = isLiked ? '❤️ Liked' : '🤍 Like';
  const buttonClasses = `
    px-4 py-2 border rounded-md font-medium transition-colors duration-150 
    ${isLiked 
        ? 'bg-primary-100 border-primary-300 text-primary-700 hover:bg-primary-200'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
    }
    ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
    ${status === 'loading' ? 'opacity-50 cursor-wait' : ''}
  `;

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLike}
        disabled={isPending || status === 'loading'}
        className={buttonClasses}
        aria-pressed={isLiked}
      >
        {buttonText}
      </button>
      <span className="text-sm text-gray-600">
          {likes} {likes === 1 ? 'like' : 'likes'}
      </span>
      {error && <span className="text-red-600 text-sm">Error: {error}</span>}
    </div>
  );
} 