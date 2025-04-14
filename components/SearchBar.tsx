'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';

const SearchBar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query !== initialQuery) { 
        if (query) {
          router.push(`/?search=${encodeURIComponent(query)}`);
        } else {
          router.push('/');
        }
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [query, router, initialQuery]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Пост хайх..."
        value={query}
        onChange={handleInputChange}
        className="border border-black text-black p-2 pl-10 rounded w-full focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition duration-150 ease-in-out" // Added border-black and text-black
      />
    </div>
  );
};

export default SearchBar; 