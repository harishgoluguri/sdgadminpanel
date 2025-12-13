import React, { useState } from 'react';
import { 
  Users, Package, 
  Menu, LayoutDashboard, Search,
  ChevronRight
} from 'lucide-react';
import { ViewState } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentView,
  onViewChange,
  children
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.USERS, label: 'Users', icon: Users },
    { id: ViewState.PRODUCTS, label: 'Products', icon: Package },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 selection:bg-primary-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - macOS Style */}
      <motion.aside
        className={`fixed md:relative z-50 w-[280px] h-full flex flex-col transition-all duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-[#F5F5F7]/90 backdrop-blur-xl border-r border-gray-200`}
        initial={false}
      >
        {/* Window Controls Area / Branding */}
        <div className="h-14 flex items-center px-6 pt-2">
           <div className="flex space-x-2 mr-4 group opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-black/10"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black/10"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 border border-black/10"></div>
           </div>
           <span className="text-sm font-semibold text-gray-500">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scroll">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-black/5 active:scale-[0.98]'
                }`}
              >
                <item.icon 
                  size={18} 
                  strokeWidth={2}
                  className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} 
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile - Bottom Sidebar */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm shadow-sm border border-white/20">
              AD
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white md:rounded-l-[20px] shadow-2xl md:shadow-none md:my-0 md:mr-0 z-0 relative">
        
        {/* Glass Header */}
        <header className="h-14 min-h-[56px] sticky top-0 z-30 flex items-center justify-between px-6 
            bg-white/80 backdrop-blur-md border-b border-gray-100">
          
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb-ish title for mobile */}
            <span className="md:hidden ml-2 font-semibold text-gray-900">
                {navItems.find(n => n.id === currentView)?.label}
            </span>
          </div>

          <div className="flex items-center space-x-4">
             {/* Search Bar - Apple Style */}
            <div className="hidden sm:flex relative group">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500/50 focus:bg-white transition-all w-48 placeholder-gray-500"
                />
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto custom-scroll p-6 sm:px-10">
           <div className="max-w-7xl mx-auto pb-10">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
};