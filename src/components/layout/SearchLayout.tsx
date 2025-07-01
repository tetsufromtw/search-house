'use client';

import React, { ReactNode } from 'react';
import Footer from './Footer';

interface SearchLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SearchLayout({
  children,
  className = ""
}: SearchLayoutProps) {
  return (
    <div className={`min-h-screen bg-white flex flex-col ${className}`}>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}