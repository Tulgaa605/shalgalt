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
    <div className="border-t border-gray-100 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Сэтгэгдлүүд ({comments.length})</h2>
      
      <CommentForm postId={postId} onCommentPosted={handleCommentPosted} />

      <div className="space-y-6 mt-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {(comment.user.name || comment.user.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-base leading-relaxed mb-3">{comment.text}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{comment.user.name || comment.user.email}</span>
                    <span className="mx-2">·</span>
                    <span>{format(comment.createdAt, 'PPp')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">Одоогоор сэтгэгдэл байхгүй байна. Анхны сэтгэгдэл үлдээгээрэй!</p>
          </div>
        )}
      </div>
    </div>
  );
} 