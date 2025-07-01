'use client';

import React from 'react';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = [
    {
      title: '服務項目',
      links: [
        { label: '租屋搜尋', href: '/' },
        { label: '交集搜尋', href: '/search' },
        { label: '地圖找房', href: '/map' },
        { label: '生活圈分析', href: '/lifestyle' }
      ]
    },
    {
      title: '使用指南',
      links: [
        { label: '如何使用', href: '/guide' },
        { label: '搜尋技巧', href: '/tips' },
        { label: '常見問題', href: '/faq' },
        { label: '聯絡我們', href: '/contact' }
      ]
    },
    {
      title: '關於我們',
      links: [
        { label: '關於 Search House', href: '/about' },
        { label: '隱私政策', href: '/privacy' },
        { label: '服務條款', href: '/terms' },
        { label: '網站地圖', href: '/sitemap' }
      ]
    },
    {
      title: '合作夥伴',
      links: [
        { label: 'SUUMO', href: 'https://suumo.jp', external: true },
        { label: 'Google Maps', href: 'https://maps.google.com', external: true },
        { label: '房仲合作', href: '/partnership' },
        { label: '廣告合作', href: '/advertising' }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* 主要 Footer 內容 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 分隔線 */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* 品牌資訊 */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
                  <span className="text-white text-sm font-bold">SH</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Search House</span>
              </div>
              <p className="text-sm text-gray-600 text-center sm:text-left">
                智能租屋搜尋平台，讓找房變得簡單
              </p>
            </div>

            {/* 版權資訊 */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © {currentYear} Search House. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built with Next.js & Google Maps API
              </p>
            </div>
          </div>
        </div>

        {/* SEO 結構化數據 (對 Google Ads 和 SEO 有幫助) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Search House",
              "url": "https://search-house.com",
              "description": "智能租屋搜尋平台，提供多條件交集地圖搜尋與生活圈資訊整合",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://search-house.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;