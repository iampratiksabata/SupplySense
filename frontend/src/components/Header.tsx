import React from 'react'

const Header = () => (
  <header className="w-full flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl shadow-sm">
    <div className="flex items-center gap-2">
      {/* Logo SVG or text */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#2563EB" />
        <path d="M10 22L22 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 10V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-bold text-xl text-gray-900">SupplySense</span>
    </div>
    {/* Hamburger menu */}
    <button className="p-2 rounded-lg hover:bg-gray-100">
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="20" height="2" rx="1"/><rect x="4" y="14" width="20" height="2" rx="1"/><rect x="4" y="20" width="20" height="2" rx="1"/></svg>
    </button>
  </header>
)

export default Header 