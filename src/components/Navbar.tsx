'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FiLogIn, FiLogOut, FiUserPlus, FiPlusCircle } from 'react-icons/fi';
import SearchBar from '../../components/SearchBar';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <nav className="bg-gray-400 shadow-lg sticky top-0 z-50 border-b border-primary-100/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4"> 
            <Link href="/" className="group text-2xl font-bold relative">
              <span className="text-gray-900 group-hover:text-primary-800 transition-all duration-500">
                Blog App
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
            </Link>
            <div className="flex-grow max-w-xs lg:max-w-sm xl:max-w-md mx-4">
               <SearchBar />
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              {isLoading ? (
                <div className="h-9 w-28 bg-gradient-to-r from-primary-100 via-secondary-100 to-primary-100 rounded-2xl animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
              ) : session ? (
                <>
                  <Link 
                    href="/create-post" 
                    className="group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-2xl text-gray-900 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-primary-500/25 border border-primary-200/50"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 transition-all duration-300 group-hover:opacity-90"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      <FiPlusCircle className="mr-2 h-4 w-4 transform group-hover:rotate-90 transition-all duration-300" />
                      New Post
                    </span>
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Профайл
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Гарах
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="group relative inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-2xl text-gray-900 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg border border-primary-200/50">
                    <span className="relative flex items-center">
                      <FiLogIn className="mr-2 h-4 w-4 transform group-hover:translate-x-1 transition-all duration-300" />
                      Login
                    </span>
                  </Link>
                  <Link 
                    href="/register" 
                    className="group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-2xl text-gray-900 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-primary-500/25 border border-primary-200/50"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 transition-all duration-300 group-hover:opacity-90"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      <FiUserPlus className="mr-2 h-4 w-4 transform group-hover:scale-110 transition-all duration-300" />
                      Register
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
      </div>
    </nav>
  );
} 