'use client';

import { useState } from 'react';

export default function NewPage() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentStyle, setCurrentStyle] = useState('default'); // default, minimal, tech, natural
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const changeStyle = (style: string) => {
    // 移除所有主題 class
    document.documentElement.classList.remove('theme-minimal', 'theme-tech', 'theme-natural');
    
    // 添加新主題 class
    if (style !== 'default') {
      document.documentElement.classList.add(`theme-${style}`);
    }
    
    setCurrentStyle(style);
  };

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* 上容器 - 20% (2/10) */}
      <div className="flex-[1] bg-header border-themed border-border rounded-themed-card m-2 flex items-center justify-center relative shadow-themed">
        <div className="text-header-text text-xl font-themed-bold">
          上容器 (20%)
        </div>

        {/* 右側控制區 */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {/* 風格切換按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={() => changeStyle('default')}
              className={`px-3 py-1 text-xs rounded-themed-button border-themed transition-all ${
                currentStyle === 'default' 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-header text-header-text border-border hover:bg-accent hover:text-white'
              }`}
            >
              預設
            </button>
            <button
              onClick={() => changeStyle('minimal')}
              className={`px-3 py-1 text-xs rounded-themed-button border-themed transition-all ${
                currentStyle === 'minimal' 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-header text-header-text border-border hover:bg-accent hover:text-white'
              }`}
            >
              簡約風
            </button>
            <button
              onClick={() => changeStyle('tech')}
              className={`px-3 py-1 text-xs rounded-themed-button border-themed transition-all ${
                currentStyle === 'tech' 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-header text-header-text border-border hover:bg-accent hover:text-white'
              }`}
            >
              科技風
            </button>
            <button
              onClick={() => changeStyle('natural')}
              className={`px-3 py-1 text-xs rounded-themed-button border-themed transition-all ${
                currentStyle === 'natural' 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-header text-header-text border-border hover:bg-accent hover:text-white'
              }`}
            >
              自然風
            </button>
          </div>

          {/* 主題切換按鈕 */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-accent text-white rounded-themed-button hover:opacity-80 transition-opacity font-themed-bold"
          >
            {currentTheme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* 中容器 - 70% (7/10) */}
      <div className="flex-[8] bg-main border-themed border-border rounded-themed-card mx-2 mb-2 relative shadow-themed">
        {/* 中區域 - 滿版背景 */}
        <div className="absolute inset-0 bg-footer rounded-themed-card flex flex-col items-center justify-center p-themed">
          {/* Google Maps 樣式搜尋框 */}
          <div className={`absolute top-4 z-20 transition-all duration-300 ${leftPanelCollapsed
              ? 'left-16'
              : 'left-[calc(20%+1rem)]'
            }`}>
            <div className="bg-white rounded-themed-card shadow-themed border-themed border-border overflow-hidden min-w-[400px] max-w-[500px]">
              {/* 主搜尋框 */}
              <div className="flex items-center p-themed">
                <div className="flex items-center justify-center w-10 h-10 rounded-themed bg-gray-100 mr-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜尋 Google 地圖"
                  className="flex-1 outline-none text-gray-700 text-base bg-transparent rounded-themed-input"
                />
                <button className="ml-3 p-2 hover:bg-gray-100 rounded-themed-button transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* 分隔線 */}
              <div className="border-t border-border"></div>

            </div>
          </div>

          <div className="text-footer-text text-xl font-bold mb-4">
            中區域 (全滿)
          </div>

          {/* 主題色彩展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent rounded-lg mb-2"></div>
              <span className="text-footer-text text-xs">主色調</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-success rounded-lg mb-2"></div>
              <span className="text-footer-text text-xs">成功</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-warning rounded-lg mb-2"></div>
              <span className="text-footer-text text-xs">警告</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-error rounded-lg mb-2"></div>
              <span className="text-footer-text text-xs">錯誤</span>
            </div>
          </div>
        </div>

        {/* 左區域 - 浮在上方 */}
        <div className={`absolute top-0 left-0 h-full bg-header border-themed border-border rounded-themed-card shadow-themed flex items-center justify-center z-10 transition-all duration-300 ${leftPanelCollapsed ? 'w-12' : 'w-[20%]'
          }`}>
          {/* 左區域內容 */}
          <div className={`text-header-text text-sm font-themed-bold transition-opacity duration-300 ${leftPanelCollapsed ? 'opacity-0' : 'opacity-100'
            }`}>
            {!leftPanelCollapsed && '左區域'}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleLeftPanel}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-accent text-white rounded-themed-button flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 text-xs font-themed-bold"
          >
            {leftPanelCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* 右區域 - 浮在上方 */}
        <div className={`absolute top-0 right-0 h-full bg-header border-themed border-border rounded-themed-card shadow-themed flex items-center justify-center z-10 transition-all duration-300 ${rightPanelCollapsed ? 'w-12' : 'w-[20%]'
          }`}>
          {/* 右區域內容 */}
          <div className={`text-header-text text-sm font-themed-bold transition-opacity duration-300 ${rightPanelCollapsed ? 'opacity-0' : 'opacity-100'
            }`}>
            {!rightPanelCollapsed && '右區域'}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleRightPanel}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-accent text-white rounded-themed-button flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 text-xs font-themed-bold"
          >
            {rightPanelCollapsed ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* 下容器 - 10% (1/10) */}
      <div className="flex-[1] bg-footer border-themed border-border rounded-themed-card shadow-themed mx-2 mb-2 flex items-center justify-center">
        <div className="text-footer-text text-lg font-themed-bold">
          下容器 (10%)
        </div>
      </div>
    </div>
  );
}