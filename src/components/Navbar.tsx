'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FiLogIn, FiLogOut, FiUserPlus, FiPlusCircle } from 'react-icons/fi'; // Icons

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    // Add bottom border, increase vertical padding (py-4)
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Adjust height if needed due to padding change, or remove h-16 and rely on padding */}
          <div className="flex justify-between items-center py-3"> 
            {/* Logo/Brand Name - Use primary color on hover */}
            <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-primary-600 transition-colors">
              Blog App
            </Link>
            
            {/* Navigation Links/Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : session ? (
                <>
                  {/* Use primary color for New Post button */}
                  <Link 
                    href="/create-post" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                      <FiPlusCircle className="-ml-0.5 mr-1.5 h-4 w-4" /> New Post
                  </Link>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                     <FiLogOut className="-ml-0.5 mr-1.5 h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <FiLogIn className="-ml-0.5 mr-1.5 h-4 w-4" /> Login
                  </Link>
                  {/* Use primary color for Register button */}
                  <Link 
                    href="/register" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <FiUserPlus className="-ml-0.5 mr-1.5 h-4 w-4" /> Register
                  </Link>
                </>
              )}
            </div>
          </div>
      </div>
    </nav>
  );
} 