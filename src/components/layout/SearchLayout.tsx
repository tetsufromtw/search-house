'use client';

import React, { ReactNode } from 'react';

interface SearchLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SearchLayout({
  children,
  className = ""
}: SearchLayoutProps) {
  return (
    <div className={`min-h-screen bg-white relative ${className}`}>
      {children}
    </div>
  );
}