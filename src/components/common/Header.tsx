import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAuth,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-45 bg-[#030712] border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-3 text-left group"
        >
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
            {/* Custom chevron/forward icon to match logo */}
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">Next<span className="text-emerald-500">Offer</span></span>
          </div>
        </button>

        {/* Navigation Links (Middle) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-350">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'home' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            Home
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('features');
            }} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'features' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            Features
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('students');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('students');
            }} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'students' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            For Students
            {activeTab === 'students' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('recruiters');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('recruiters');
            }} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'recruiters' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            For Recruiters
            {activeTab === 'recruiters' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('colleges');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('colleges');
            }} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'colleges' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            For Colleges
            {activeTab === 'colleges' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <div className="flex items-center gap-1 cursor-pointer hover:text-white text-slate-300 transition-colors py-2">
            <span>Resources</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('about');
            }} 
            className={`hover:text-white transition-colors py-2 relative ${activeTab === 'about' ? 'text-white font-bold' : 'text-slate-300'}`}
          >
            About Us
          </button>
        </nav>

        {/* Actions (Right) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2.5 text-xs font-bold text-slate-200 hover:text-white border border-slate-800 hover:bg-slate-900 rounded-xl transition-all"
          >
            Login
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};
