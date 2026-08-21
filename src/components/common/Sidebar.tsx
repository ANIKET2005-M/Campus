import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  Briefcase, 
  Send, 
  Calendar, 
  Award, 
  Settings, 
  LogOut, 
  Users, 
  Building2, 
  Target, 
  CheckCircle2, 
  BarChart2, 
  Download, 
  Bell,
  Layers,
  Sparkles,
  Bookmark,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
const LogoImage = '/image/ChatGPT Image Aug 15, 2026, 05_15_08 PM.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  subItems?: { id: string; label: string; icon: React.ReactNode }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { activeRole, logoutUser, applications, notifications, currentUser, interviews } = useApp();
  const [isOpportunitiesOpen, setIsOpportunitiesOpen] = useState(true);

  if (activeRole === 'guest') return null;

  // Calculate dynamic badges
  const myAppsCount = applications.filter(a => a.studentId === currentUser?.studentId).length;
  const myShortlistedCount = applications.filter(a => a.studentId === currentUser?.studentId && (a.status === 'Shortlisted' || a.status === 'Selected')).length;
  const unreadNotifCount = notifications.filter(n => !n.read && (n.userId === 'all' || n.userId === currentUser?.id || n.userId === currentUser?.studentId)).length;
  const upcomingInterviewsCount = interviews.filter(i => i.status === 'Scheduled').length;

  const studentNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'resume', label: 'My Resume', icon: <FileText className="w-4 h-4" /> },
    { 
      id: 'opportunities-group', 
      label: 'Opportunities', 
      icon: <Briefcase className="w-4 h-4" />,
      subItems: [
        { id: 'jobs', label: 'Campus Opportunities', icon: <Target className="w-3.5 h-3.5" /> },
        { id: 'off-campus', label: 'Off-Campus Jobs', icon: <Layers className="w-3.5 h-3.5" /> }
      ]
    },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'applications', label: 'My Applications', icon: <Send className="w-4 h-4" />, badge: myAppsCount > 0 ? myAppsCount : undefined },
    { id: 'interviews', label: 'Interviews', icon: <Calendar className="w-4 h-4" />, badge: upcomingInterviewsCount > 0 ? upcomingInterviewsCount : undefined },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: 'placement-status', label: 'Placement Status', icon: <Award className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const recruiterNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'company-profile', label: 'Company Profile', icon: <Building2 className="w-4 h-4" /> },
    { id: 'job-postings', label: 'Job Drives', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'applicants', label: 'Applicants', icon: <Users className="w-4 h-4" /> },
    { id: 'shortlisted', label: 'Shortlisted Candidates', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'interviews', label: 'Schedule Interviews', icon: <Calendar className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'results', label: 'Selection Results', icon: <Award className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Student Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'companies', label: 'Companies', icon: <Building2 className="w-4 h-4" /> },
    { id: 'placement-drives', label: 'Placement Drives', icon: <Target className="w-4 h-4" /> },
    { id: 'applications', label: 'All Applications', icon: <Layers className="w-4 h-4" /> },
    { id: 'interviews', label: 'Interviews Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'results', label: 'Recruitment Results', icon: <Award className="w-4 h-4" /> },
    { id: 'placement-records', label: 'Placement Records', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Placement Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Export', icon: <Download className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const getNavItems = (): NavItem[] => {
    if (activeRole === 'student') return studentNav;
    if (activeRole === 'recruiter') return recruiterNav;
    if (activeRole === 'admin') return adminNav;
    return [];
  };

  const navItems = getNavItems();

  const renderSidebarContent = () => (
    <>
      {/* Brand Header inside Sidebar */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-md shadow-emerald-950/20 overflow-hidden flex-shrink-0">
            <img src={LogoImage} className="w-full h-full object-cover" alt="Next Offer Logo" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">Next<span className="text-[#10B981]">Offer</span></span>
            <p className="text-[9px] text-[#10B981] font-bold tracking-wider uppercase mt-0.5">Your Next Step, Our Mission</p>
          </div>
        </div>
      </div>

      {/* Role tag */}
      <div className="px-6 py-3 border-b border-slate-800 bg-[#0F172A]/40">
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {activeRole === 'student' && 'Student Portal'}
          {activeRole === 'recruiter' && 'Recruiter Hub'}
          {activeRole === 'admin' && 'Placement Admin'}
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const hasSubItems = !!item.subItems;
          const isGroupActive = hasSubItems && item.subItems!.some(sub => activeTab === sub.id);

          if (hasSubItems) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setIsOpportunitiesOpen(!isOpportunitiesOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isGroupActive 
                      ? 'text-[#10B981]' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isGroupActive ? 'text-[#10B981]' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span>
                    {isOpportunitiesOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpportunitiesOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="pl-6 space-y-1 overflow-hidden"
                    >
                      {item.subItems!.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveTab(sub.id);
                              setIsOpenMobile?.(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isSubActive 
                                ? 'bg-emerald-500/10 text-[#10B981]' 
                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                            }`}
                          >
                            <span className={isSubActive ? 'text-[#10B981]' : 'text-slate-500'}>
                              {sub.icon}
                            </span>
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpenMobile?.(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-[#10B981]' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#10B981]' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-[#10B981] text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Backdrop & Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
              onClick={() => setIsOpenMobile?.(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 h-full lg:hidden"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (static, hidden on mobile) */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] text-slate-300 flex-col flex-shrink-0 border-r border-slate-800 h-full">
        {renderSidebarContent()}
      </aside>
    </>
  );
};
