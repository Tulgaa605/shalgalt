'use client';

import React, { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the shape of the comment data RETURNED BY THE API
// createdAt will likely be a string here
interface NewCommentData {
    id: string;
    text: string;
    createdAt: string; // API likely returns string
    userId: string;
    postId: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface CommentFormProps {
  postId: string;
  onCommentPosted: (newComment: NewCommentData) => void; // Callback to update parent state
}

export default function CommentForm({ postId, onCommentPosted }: CommentFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/posts/${postId}`);
      return;
    }
    if (status === 'loading' || !commentText.trim()) {
      return;
    }

    setError(null);

    startTransition(async () => {
        try {
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: commentText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post comment');
            }

            const newComment: NewCommentData = await response.json();

            // Clear the form
            setCommentText('');

            // Call the callback to notify the parent component
            onCommentPosted(newComment);

            // Optionally, you might still want a refresh if other parts of the page
            // depend on comment count, etc., though direct state update is faster.
            // router.refresh();

        } catch (err) {
            // console.error("Comment error:", err);
            setError(err instanceof Error ? err.message : 'Could not post comment');
        }
    });
  };

  if (status === 'loading') {
    return <p className="text-sm text-gray-500 animate-pulse">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
        <div className="border border-blue-200 bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-700">
                <Link href={`/login?callbackUrl=/posts/${postId}`} className="font-semibold hover:underline">
                    Login
                </Link> to post a comment.
            </p>
        </div>
    );
  }

  // Improve form styling
  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="commentText" className="sr-only">Your Comment</label>
        <textarea
          id="commentText"
          rows={3}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder={`Write your comment as ${session?.user?.name || session?.user?.email}...`}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
          disabled={isPending}
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm">Error: {error}</p>
      )}
      <div className="flex justify-end">
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isPending || !commentText.trim()}
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
      </div>
    </form>
  );
} 