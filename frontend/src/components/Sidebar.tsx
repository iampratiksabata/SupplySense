import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="7" rx="2"/><rect x="3" y="16" width="7" height="3" rx="2"/></svg>
    ),
  },
  {
    label: 'Orders',
    route: '/orders',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><rect x="3" y="7" width="16" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
    ),
  },
  {
    label: 'Insights',
    route: '/insights',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><path d="M13 17h8m-8-5h8m-8-5h8M3 17h.01M3 12h.01M3 7h.01"/></svg>
    ),
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><rect x="3" y="7" width="16" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
    ),
  },
  {
    label: 'Chat',
    route: '/chat',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
  },
  {
    label: 'Settings',
    route: '/settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit"><circle cx="11" cy="11" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 11 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    ),
  },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <aside className="bg-[#101828] w-64 flex flex-col py-8 px-4 min-h-screen shadow-lg">
      <div className="flex items-center gap-3 mb-10 px-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#2563EB" /><path d="M10 22L22 10" stroke="white" strokeWidth="2" strokeLinecap="round" /><path d="M16 10V22" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        <span className="font-bold text-xl text-white tracking-tight">SupplySense</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, idx) => (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors w-full text-left
              ${location.pathname === item.route ? 'bg-white text-[#2563EB] shadow-sm' : 'text-white hover:bg-[#1D2939]'}
            `}
            style={{ outline: 'none' }}
          >
            <span className="w-6 h-6 flex items-center justify-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar 