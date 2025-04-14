'use client';

import React, { useState } from 'react';
import CommentForm from '@/components/CommentForm';
import { format } from 'date-fns';

interface CommentWithUser {
    id: string;
    text: string;
    createdAt: Date; 
    userId: string;
    postId: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface NewCommentDataFromForm {
    id: string;
    text: string;
    createdAt: string; 
    userId: string;
    postId: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithUser[]; 
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);

  const handleCommentPosted = (newCommentFromForm: NewCommentDataFromForm) => {
    const newCommentForState: CommentWithUser = {
        ...newCommentFromForm,
        createdAt: new Date(newCommentFromForm.createdAt),
    };
    setComments((prevComments) => [newCommentForState, ...prevComments]);
  };

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-semibold mb-4">Comments ({comments.length})</h2>
      
      <CommentForm postId={postId} onCommentPosted={handleCommentPosted} />

      <div className="space-y-6 mt-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <p className="mb-2 whitespace-pre-wrap text-gray-800">{comment.text}</p>
              <p className="text-xs text-gray-500">
                By <span className="font-medium text-gray-700">{comment.user.name || comment.user.email}</span> on {format(comment.createdAt, 'PPp')}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
} 