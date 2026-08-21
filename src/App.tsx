import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  Bell, 
  Mail, 
  ChevronDown, 
  LogOut, 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck,
  ExternalLink 
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { NotificationsView } from './components/common/NotificationsView';
import { SettingsView } from './components/common/SettingsView';
import { CalendarView } from './components/common/CalendarView';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfileView } from './components/student/StudentProfileView';
import { StudentJobsView } from './components/student/StudentJobsView';
import { StudentApplicationsView } from './components/student/StudentApplicationsView';
import { StudentInterviewsView } from './components/student/StudentInterviewsView';
import { StudentPlacementStatusView } from './components/student/StudentPlacementStatusView';
import { ResumeAnalyzerView } from './components/student/ResumeAnalyzerView';
import { StudentOffCampusView } from './components/student/StudentOffCampusView';
import { StudentSavedJobsView } from './components/student/StudentSavedJobsView';

// Recruiter Views
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { RecruiterCompanyProfileView } from './components/recruiter/RecruiterCompanyProfileView';
import { RecruiterJobsView } from './components/recruiter/RecruiterJobsView';
import { RecruiterApplicantsView } from './components/recruiter/RecruiterApplicantsView';
import { RecruiterShortlistedView } from './components/recruiter/RecruiterShortlistedView';
import { RecruiterInterviewsView } from './components/recruiter/RecruiterInterviewsView';
import { RecruiterResultsView } from './components/recruiter/RecruiterResultsView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagementView } from './components/admin/StudentManagementView';
import { CompanyManagementView } from './components/admin/CompanyManagementView';
import { DriveManagementView } from './components/admin/DriveManagementView';
import { AdminApplicationsView } from './components/admin/AdminApplicationsView';
import { AdminInterviewsView } from './components/admin/AdminInterviewsView';
import { AdminResultsView } from './components/admin/AdminResultsView';
import { AdminPlacementRecordsView } from './components/admin/AdminPlacementRecordsView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminReportsView } from './components/admin/AdminReportsView';

const AppContent: React.FC = () => {
  const { 
    activeRole, 
    toasts, 
    removeToast,
    currentUser,
    notifications,
    logoutUser
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Sync tab defaults when role changes
  useEffect(() => {
    if (activeRole === 'guest') {
      setActiveTab('home');
    } else {
      setActiveTab('dashboard');
    }
  }, [activeRole]);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const renderContent = () => {
    // 1. Guest View
    if (activeRole === 'guest') {
      return (
        <LandingPage 
          onOpenAuth={handleOpenAuth} 
          setActiveTab={setActiveTab} 
          activeTab={activeTab}
        />
      );
    }

    // Common Tabs across all roles
    if (activeTab === 'notifications') {
      return <NotificationsView setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'settings') {
      return <SettingsView />;
    }
    if (activeTab === 'calendar') {
      return <CalendarView />;
    }

    // 2. Student Portal Views
    if (activeRole === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard setActiveTab={setActiveTab} />;
        case 'profile':
        case 'resume':
          return <StudentProfileView defaultTab={activeTab === 'resume' ? 'resume' : 'academic'} />;
        case 'resume-analyzer':
          return <ResumeAnalyzerView />;
        case 'jobs':
          return <StudentJobsView setActiveTab={setActiveTab} />;
        case 'applications':
          return <StudentApplicationsView setActiveTab={setActiveTab} />;
        case 'interviews':
          return <StudentInterviewsView />;
        case 'off-campus':
          return <StudentOffCampusView setActiveTab={setActiveTab} />;
        case 'saved-jobs':
          return <StudentSavedJobsView setActiveTab={setActiveTab} />;
        case 'placement-status':
          return <StudentPlacementStatusView setActiveTab={setActiveTab} />;
        default:
          return <StudentDashboard setActiveTab={setActiveTab} />;
      }
    }

    // 3. Recruiter Hub Views
    if (activeRole === 'recruiter') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <RecruiterDashboard 
              setActiveTab={setActiveTab} 
              onOpenCreateJob={() => setActiveTab('job-postings')} 
            />
          );
        case 'company-profile':
          return <RecruiterCompanyProfileView />;
        case 'job-postings':
          return <RecruiterJobsView />;
        case 'applicants':
          return <RecruiterApplicantsView />;
        case 'shortlisted':
          return <RecruiterShortlistedView setActiveTab={setActiveTab} />;
        case 'interviews':
          return <RecruiterInterviewsView />;
        case 'results':
          return <RecruiterResultsView />;
        default:
          return (
            <RecruiterDashboard 
              setActiveTab={setActiveTab} 
              onOpenCreateJob={() => setActiveTab('job-postings')} 
            />
          );
      }
    }

    // 4. Admin Placement Officer Views
    if (activeRole === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'students':
          return <StudentManagementView />;
        case 'companies':
          return <CompanyManagementView />;
        case 'placement-drives':
          return <DriveManagementView />;
        case 'applications':
          return <AdminApplicationsView />;
        case 'interviews':
          return <AdminInterviewsView />;
        case 'results':
          return <AdminResultsView />;
        case 'placement-records':
          return <AdminPlacementRecordsView />;
        case 'analytics':
          return <AdminAnalyticsView />;
        case 'reports':
          return <AdminReportsView />;
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    }

    return null;
  };

  const unreadCount = notifications.filter(n => !n.read && (
    n.userId === 'all' || 
    n.userId === currentUser?.id || 
    n.userId === currentUser?.studentId
  )).length;

  const roleLabels = {
    guest: { label: 'Public View', icon: <ExternalLink className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-700 border-slate-200' },
    student: { label: 'Student Portal', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    recruiter: { label: 'Recruiter Hub', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    admin: { label: 'Placement Officer', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Global Toast Renderer */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authDefaultTab} 
      />

      {/* Main Layout Shell */}
      {activeRole === 'guest' ? (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Bar for Landing/Guest only */}
          <Header 
            onOpenNotifications={() => setActiveTab('notifications')} 
            onOpenAuth={handleOpenAuth} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <main className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + activeRole}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpenMobile={isMobileSidebarOpen} 
            setIsOpenMobile={setIsMobileSidebarOpen} 
          />

          {/* Main Dashboard Panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50">
            {/* Topbar Navigation */}
            <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between flex-shrink-0">
              {/* Left Side: Mobile Toggle and Search Input */}
              <div className="flex items-center gap-4 flex-1 max-w-lg">
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-655 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="relative w-full max-w-md hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search for companies, jobs, or anything..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Right Side: Indicators, Notifications, Avatar */}
              <div className="flex items-center gap-4">
                {/* Role indicator badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${roleLabels[activeRole].color}`}>
                  {roleLabels[activeRole].icon}
                  {roleLabels[activeRole].label}
                </span>

                {/* Mail Icon */}
                <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative hidden sm:block">
                  <Mail className="w-4 h-4" />
                </button>

                {/* Notification bell */}
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-slate-200" />

                {/* User profile avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 origin-top-right"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <div className="px-4 py-2.5 border-b border-slate-150">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser?.name}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
                        </div>

                        <div className="py-1">
                          {activeRole === 'student' && (
                            <button
                              onClick={() => {
                                setActiveTab('profile');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveTab('settings');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400 rotate-90" /> Settings
                          </button>
                        </div>

                        <div className="border-t border-slate-150 pt-1">
                          <button
                            onClick={() => {
                              logoutUser();
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Page View Content Pane */}
            <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + activeRole}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
