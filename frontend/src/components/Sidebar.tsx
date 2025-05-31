import React from 'react'

const icons = [
  // Home/Menu
  <svg key="menu" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="6" width="18" height="2" rx="1"/><rect x="3" y="12" width="18" height="2" rx="1"/><rect x="3" y="18" width="18" height="2" rx="1"/></svg>,
  // Dashboard
  <svg key="dashboard" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>,
  // Users
  <svg key="users" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="9" cy="7" r="4"/><path d="M17 11a4 4 0 1 0-8 0"/><path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/></svg>,
  // Chat
  <svg key="chat" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
]

const Sidebar = () => (
  <aside className="bg-gray-900 w-16 flex flex-col items-center py-6 rounded-r-3xl shadow-lg min-h-screen">
    <div className="flex flex-col gap-8 mt-4">
      {icons.map((icon, idx) => (
        <div key={idx} className="p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
          {icon}
        </div>
      ))}
    </div>
  </aside>
)

export default Sidebar 