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
            setError(err instanceof Error ? err.message : 'Could not update like status');
            setLikes(previousLikes);
            setIsLiked(previousIsLiked);
        }
    });
  };

  const buttonClasses = `
    group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02]
    ${isLiked 
        ? 'text-gray-900 bg-white border-2 border-primary-500 shadow-lg hover:shadow-primary-500/25'
        : 'text-gray-900 bg-white border border-primary-200/50 shadow-md hover:shadow-lg'
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
        <span className="relative flex items-center">
          {isLiked ? (
            <span className="transform transition-all duration-500 animate-bounce-slow group-hover:animate-float scale-110">❤️</span>
          ) : (
            <span className="transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">🤍</span>
          )}
          <span className="ml-2 transform transition-all duration-300 group-hover:translate-x-0.5 text-gray-900 font-semibold">
            {isLiked ? 'Liked' : 'Like'}
          </span>
        </span>
      </button>
      <span className="inline-flex items-center text-sm font-semibold text-gray-900 px-5 py-2.5 rounded-2xl bg-white border border-primary-200/50 shadow-md">
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${likes > 0 ? 'bg-success-500' : 'bg-gray-400'}`}></span>
          <span className="text-gray-900 font-semibold">{likes} {likes === 1 ? 'like' : 'likes'}</span>
      </span>
      {error && (
        <span className="inline-flex items-center text-accent-800 text-sm font-semibold bg-white px-5 py-2.5 rounded-2xl border border-accent-200/30 shadow-md animate-pulse-slow">
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-2"></span>
          <span className="text-accent-800 font-semibold">Error: {error}</span>
        </span>
      )}
    </div>
  );
} 