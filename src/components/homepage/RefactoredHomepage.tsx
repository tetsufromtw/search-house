/**
 * 重構後的首頁組件
 * 使用新的 feature-based 架構
 */

'use client';

import React from 'react';
import { HouseSearchPage } from '@/features/house-search';

interface RefactoredHomepageProps {
  className?: string;
}

export const RefactoredHomepage: React.FC<RefactoredHomepageProps> = ({ className }) => {
  return (
    <HouseSearchPage className={className} />
  );
};

export default RefactoredHomepage;