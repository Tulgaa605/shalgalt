'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner'; // Assuming you have a toast library like sonner installed

interface DeletePostButtonProps {
  postId: string;
  isAuthor: boolean;
}

export default function DeletePostButton({ postId, isAuthor }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!isAuthor) {
      toast.error("You are not authorized to delete this post.");
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete post.' }));
        throw new Error(errorData.message || 'Failed to delete post.');
      }

      toast.success('Post deleted successfully!');
      // Redirect to homepage or another appropriate page after deletion
      router.push('/'); 
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error('Delete error:', error);
      toast.error((error as Error).message || 'An error occurred while deleting the post.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthor) {
    return null; // Don't render the button if the user is not the author
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FiTrash2 className="mr-1.5 h-4 w-4" /> 
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
} 