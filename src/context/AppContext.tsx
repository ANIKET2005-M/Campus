import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  StudentProfile, 
  Company, 
  Job, 
  Application, 
  Interview, 
  PlacementRecord, 
  Notification, 
  Role,
  ApplicationStage,
  PlacementEvent
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENT_PROFILES, 
  INITIAL_COMPANIES, 
  INITIAL_JOBS, 
  INITIAL_APPLICATIONS, 
  INITIAL_INTERVIEWS, 
  INITIAL_PLACEMENT_RECORDS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_PLACEMENT_EVENTS
} from '../data/mockData';
import { checkEligibility } from '../utils/eligibility';
import { api } from '../services/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  activeRole: Role;
  studentProfiles: StudentProfile[];
  currentStudent: StudentProfile | null;
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  placementRecords: PlacementRecord[];
  notifications: Notification[];
  toasts: Toast[];
  isRealtimeConnected: boolean;

  // Actions
  switchRole: (role: Role) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  addStudentProfile: (profile: Omit<StudentProfile, 'id' | 'placementStatus'>) => void;
  applyForJob: (jobId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  addJob: (jobData: Omit<Job, 'id' | 'createdAt'>) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  addCompany: (companyData: Omit<Company, 'id' | 'joinedDate' | 'totalHired'>) => void;
  updateCompanyStatus: (companyId: string, status: Company['status']) => void;
  updateCompany: (companyId: string, updates: Partial<Company>) => Promise<void>;
  updateApplicationStatus: (applicationId: string, newStatus: ApplicationStage, remarks?: string) => void;
  evaluateApplicationWithAI: (applicationId: string) => Promise<void>;
  scheduleInterview: (interviewData: Omit<Interview, 'id' | 'status'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;

  // Calendar Placement Events
  placementEvents: PlacementEvent[];
  addPlacementEvent: (eventData: Omit<PlacementEvent, 'id' | 'createdAt'>) => Promise<void>;
  updatePlacementEvent: (id: string, updates: Partial<PlacementEvent>) => Promise<void>;
  deletePlacementEvent: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'campushire_current_user',
  ACTIVE_ROLE: 'campushire_active_role',
  STUDENT_PROFILES: 'campushire_student_profiles',
  COMPANIES: 'campushire_companies',
  JOBS: 'campushire_jobs',
  APPLICATIONS: 'campushire_applications',
  INTERVIEWS: 'campushire_interviews',
  PLACEMENT_RECORDS: 'campushire_placement_records',
  NOTIFICATIONS: 'campushire_notifications',
  PLACEMENT_EVENTS: 'campushire_placement_events',
};

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    loadStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0])
  );
  
  const [activeRole, setActiveRole] = useState<Role>(() => 
    loadStored(STORAGE_KEYS.ACTIVE_ROLE, 'student')
  );

  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(() => 
    loadStored(STORAGE_KEYS.STUDENT_PROFILES, INITIAL_STUDENT_PROFILES)
  );

  const [companies, setCompanies] = useState<Company[]>(() => 
    loadStored(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES)
  );

  const [jobs, setJobs] = useState<Job[]>(() => 
    loadStored(STORAGE_KEYS.JOBS, INITIAL_JOBS)
  );

  const [applications, setApplications] = useState<Application[]>(() => 
    loadStored(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
  );

  const [interviews, setInterviews] = useState<Interview[]>(() => 
    loadStored(STORAGE_KEYS.INTERVIEWS, INITIAL_INTERVIEWS)
  );

  const [placementRecords, setPlacementRecords] = useState<PlacementRecord[]>(() => 
    loadStored(STORAGE_KEYS.PLACEMENT_RECORDS, INITIAL_PLACEMENT_RECORDS)
  );

  const [notifications, setNotifications] = useState<Notification[]>(() => 
    loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [placementEvents, setPlacementEvents] = useState<PlacementEvent[]>(() => 
    loadStored(STORAGE_KEYS.PLACEMENT_EVENTS, INITIAL_PLACEMENT_EVENTS)
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Derived current student profile
  const currentStudent = studentProfiles.find(p => p.id === currentUser?.studentId) || studentProfiles[0] || null;

  // Initial load from backend database
  useEffect(() => {
    let isMounted = true;
    api.getInitialData()
      .then(data => {
        if (!isMounted || !data) return;
        if (data.studentProfiles) setStudentProfiles(data.studentProfiles);
        if (data.companies) setCompanies(data.companies);
        if (data.jobs) setJobs(data.jobs);
        if (data.applications) setApplications(data.applications);
        if (data.interviews) setInterviews(data.interviews);
        if (data.placementRecords) setPlacementRecords(data.placementRecords);
        if (data.notifications) setNotifications(data.notifications);
        if ((data as any).placementEvents) setPlacementEvents((data as any).placementEvents);
      })
      .catch(err => {
        console.warn('Backend DB connection failed, using local storage:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // WebSocket real-time synchronization
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setIsRealtimeConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'INIT_STATE' || data.event === 'STATE_UPDATE') {
              const payload = data.payload;
              if (payload.studentProfiles) setStudentProfiles(payload.studentProfiles);
              if (payload.companies) setCompanies(payload.companies);
              if (payload.jobs) setJobs(payload.jobs);
              if (payload.applications) setApplications(payload.applications);
              if (payload.interviews) setInterviews(payload.interviews);
              if (payload.placementRecords) setPlacementRecords(payload.placementRecords);
              if (payload.notifications) setNotifications(payload.notifications);
              if (payload.placementEvents) setPlacementEvents(payload.placementEvents);
            }
          } catch {
            // Ignore parse errors
          }
        };

        socket.onclose = () => {
          setIsRealtimeConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setIsRealtimeConnected(false);
        };
      } catch {
        setIsRealtimeConnected(false);
      }
    };

    connectWs();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Sync state to localStorage as secondary backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, JSON.stringify(activeRole));
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILES, JSON.stringify(studentProfiles));
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
    localStorage.setItem(STORAGE_KEYS.PLACEMENT_RECORDS, JSON.stringify(placementRecords));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.PLACEMENT_EVENTS, JSON.stringify(placementEvents));
  }, [currentUser, activeRole, studentProfiles, companies, jobs, applications, interviews, placementRecords, notifications, placementEvents]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchRole = (role: Role) => {
    setActiveRole(role);
    if (role === 'guest') {
      setCurrentUser(null);
      showToast('Switched to Guest Landing Page view', 'info');
      return;
    }
    
    if (role === 'student') {
      const demoStud = INITIAL_USERS.find(u => u.role === 'student') || INITIAL_USERS[0];
      setCurrentUser(demoStud);
      showToast('Logged in as Student: Rahul Sharma', 'success');
    } else if (role === 'recruiter') {
      const demoRec = INITIAL_USERS.find(u => u.role === 'recruiter') || INITIAL_USERS[1];
      setCurrentUser(demoRec);
      showToast('Logged in as Recruiter: Sarah Jenkins (TechCorp)', 'success');
    } else if (role === 'admin') {
      const demoAdmin = INITIAL_USERS.find(u => u.role === 'admin') || INITIAL_USERS[2];
      setCurrentUser(demoAdmin);
      showToast('Logged in as Placement Officer: Dr. V. K. Mehta', 'success');
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActiveRole('guest');
    showToast('Logged out successfully', 'info');
  };

  // --- ACTIONS WITH REAL-TIME DATABASE SYNC ---

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    if (!currentStudent) return;
    
    // Optimistic UI update
    setStudentProfiles(prev => 
      prev.map(p => p.id === currentStudent.id ? { ...p, ...updates } : p)
    );
    showToast('Profile updated successfully!', 'success');

    // Sync with backend DB
    api.updateStudentProfile(currentStudent.id, updates).catch(err => {
      console.error('Failed to sync student profile update with DB:', err);
    });
  };

  const addStudentProfile = (profileData: Omit<StudentProfile, 'id' | 'placementStatus'>) => {
    api.addStudentProfile(profileData)
      .then(res => {
        if (res.studentProfile) {
          setStudentProfiles(prev => [res.studentProfile, ...prev]);
          showToast(`Added student ${res.studentProfile.fullName}`, 'success');
        }
      })
      .catch(() => {
        const newId = `std_${Date.now()}`;
        const newProfile: StudentProfile = { ...profileData, id: newId, placementStatus: 'In Process' };
        setStudentProfiles(prev => [newProfile, ...prev]);
        showToast(`Added student ${newProfile.fullName}`, 'success');
      });
  };

  const applyForJob = async (jobId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentStudent) {
      return { success: false, message: 'Student profile not found.' };
    }

    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) {
      return { success: false, message: 'Job drive not found.' };
    }

    // 1. Check duplicate
    const existing = applications.find(a => a.jobId === jobId && a.studentId === currentStudent.id);
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this role.' };
    }

    // 2. Check deadline
    const todayStr = new Date().toISOString().split('T')[0];
    if (targetJob.applicationDeadline < todayStr) {
      return { success: false, message: 'The application deadline for this drive has passed.' };
    }

    // 3. Check Eligibility
    const eligibilityResult = checkEligibility(currentStudent, targetJob.eligibility);
    if (!eligibilityResult.isEligible) {
      return { 
        success: false, 
        message: `Ineligible: ${eligibilityResult.failedCriteriaCount} requirement(s) failed. Check job details.` 
      };
    }

    try {
      const res = await api.applyForJob(jobId, currentStudent.id);
      if (res.success) {
        showToast(`Successfully applied to ${targetJob.title}!`, 'success');
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message };
      }
    } catch {
      // Local fallback
      const newAppId = `app_${Date.now()}`;
      const newApp: Application = {
        id: newAppId,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        companyId: targetJob.companyId,
        companyName: targetJob.companyName,
        companyLogo: targetJob.companyLogo,
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        studentRegNo: currentStudent.registrationNumber,
        studentCourse: currentStudent.course,
        studentDepartment: currentStudent.department,
        studentCgpa: currentStudent.cgpa,
        studentSkills: currentStudent.skills,
        appliedDate: todayStr,
        status: 'Applied',
        timeline: [
          { stage: 'Applied', date: todayStr, status: 'completed', remarks: 'Application submitted successfully.' },
          { stage: 'Shortlisted', date: '-', status: 'upcoming' },
          { stage: 'Assessment', date: '-', status: 'upcoming' },
          { stage: 'Technical Interview', date: '-', status: 'upcoming' },
          { stage: 'HR Interview', date: '-', status: 'upcoming' },
          { stage: 'Selected', date: '-', status: 'upcoming' }
        ]
      };
      setApplications(prev => [newApp, ...prev]);
      showToast(`Successfully applied to ${targetJob.title}!`, 'success');
      return { success: true, message: 'Application submitted successfully!' };
    }
  };

  const addJob = (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    api.addJob(jobData)
      .then(res => {
        if (res.job) {
          showToast(`Placement Drive for "${res.job.title}" created successfully!`, 'success');
        }
      })
      .catch(() => {
        const newJob: Job = {
          ...jobData,
          id: `job_${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setJobs(prev => [newJob, ...prev]);
        showToast(`Placement Drive for "${newJob.title}" created successfully!`, 'success');
      });
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));
    showToast('Job details updated', 'success');
    api.updateJob(jobId, updates).catch(err => console.error(err));
  };

  const saveJob = async (jobId: string) => {
    if (!currentStudent) return;
    
    // Optimistic local update
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const savedIds = j.savedByStudentIds || [];
        if (!savedIds.includes(currentStudent.id)) {
          return { ...j, savedByStudentIds: [...savedIds, currentStudent.id] };
        }
      }
      return j;
    }));
    showToast('Opportunity bookmarked!', 'success');

    try {
      await api.saveJob(jobId, currentStudent.id);
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const unsaveJob = async (jobId: string) => {
    if (!currentStudent) return;
    
    // Optimistic local update
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const savedIds = j.savedByStudentIds || [];
        return { ...j, savedByStudentIds: savedIds.filter(id => id !== currentStudent.id) };
      }
      return j;
    }));
    showToast('Bookmark removed', 'info');

    try {
      await api.unsaveJob(jobId, currentStudent.id);
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'joinedDate' | 'totalHired'>) => {
    api.addCompany(companyData)
      .then(res => {
        if (res.company) {
          showToast(`Added company "${res.company.name}"`, 'success');
        }
      })
      .catch(() => {
        const newComp: Company = {
          ...companyData,
          id: `comp_${Date.now()}`,
          joinedDate: new Date().toISOString().split('T')[0],
          totalHired: 0
        };
        setCompanies(prev => [newComp, ...prev]);
        showToast(`Added company "${newComp.name}"`, 'success');
      });
  };

  const updateCompanyStatus = (companyId: string, status: Company['status']) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status } : c));
    showToast(`Company status updated to ${status}`, 'success');
    api.updateCompanyStatus(companyId, status).catch(err => console.error(err));
  };

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    const updateLocalState = (comp: Company) => {
      setCompanies(prev => prev.map(c => c.id === companyId ? comp : c));
      
      if (updates.name || updates.logo) {
        setJobs(prev => prev.map(j => {
          if (j.companyId === companyId) {
            return {
              ...j,
              companyName: updates.name || j.companyName,
              companyLogo: updates.logo || j.companyLogo
            };
          }
          return j;
        }));

        setApplications(prev => prev.map(a => {
          if (a.companyId === companyId) {
            return {
              ...a,
              companyName: updates.name || a.companyName,
              companyLogo: updates.logo || a.companyLogo
            };
          }
          return a;
        }));
      }
    };

    try {
      const res = await api.updateCompany(companyId, updates);
      if (res.success && res.company) {
        updateLocalState(res.company);
        showToast('Company profile details updated successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      const existing = companies.find(c => c.id === companyId);
      if (existing) {
        const fallbackComp = { ...existing, ...updates };
        updateLocalState(fallbackComp);
        showToast('Profile updated locally', 'info');
      }
    }
  };

  const updateApplicationStatus = (applicationId: string, newStatus: ApplicationStage, remarks?: string) => {
    api.updateApplicationStatus(applicationId, newStatus, remarks)
      .then(() => {
        showToast(`Status updated to ${newStatus}`, 'success');
      })
      .catch(() => {
        // Fallback local update
        setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
        showToast(`Status updated to ${newStatus}`, 'success');
      });
  };

  const evaluateApplicationWithAI = async (applicationId: string) => {
    try {
      const res = await api.evaluateApplicationWithAI(applicationId);
      if (res.success && res.application) {
        setApplications(prev => 
          prev.map(app => app.id === applicationId ? res.application : app)
        );
        showToast('Gemini AI Fit Analysis complete!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'AI evaluation failed', 'error');
    }
  };

  const scheduleInterview = (interviewData: Omit<Interview, 'id' | 'status'>) => {
    api.scheduleInterview(interviewData)
      .then(res => {
        if (res.interview) {
          showToast(`Interview scheduled for ${res.interview.studentName}`, 'success');
        }
      })
      .catch(() => {
        const newInt: Interview = { ...interviewData, id: `int_${Date.now()}`, status: 'Scheduled' };
        setInterviews(prev => [newInt, ...prev]);
        showToast(`Interview scheduled for ${newInt.studentName}`, 'success');
      });
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    api.markNotificationRead(notificationId).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Marked all notifications as read', 'info');
    api.clearAllNotifications().catch(() => {});
  };

  const resetToDefaultData = () => {
    api.resetDatabase()
      .then(res => {
        if (res.state) {
          setStudentProfiles(res.state.studentProfiles);
          setCompanies(res.state.companies);
          setJobs(res.state.jobs);
          setApplications(res.state.applications);
          setInterviews(res.state.interviews);
          setPlacementRecords(res.state.placementRecords);
          setNotifications(res.state.notifications);
          if ((res.state as any).placementEvents) setPlacementEvents((res.state as any).placementEvents);
        }
        showToast('Reset system to default sample data', 'info');
      })
      .catch(() => {
        setStudentProfiles(INITIAL_STUDENT_PROFILES);
        setCompanies(INITIAL_COMPANIES);
        setJobs(INITIAL_JOBS);
        setApplications(INITIAL_APPLICATIONS);
        setInterviews(INITIAL_INTERVIEWS);
        setPlacementRecords(INITIAL_PLACEMENT_RECORDS);
        setNotifications(INITIAL_NOTIFICATIONS);
        setPlacementEvents(INITIAL_PLACEMENT_EVENTS);
        showToast('Reset system to default sample data', 'info');
      });
  };

  const addPlacementEvent = async (eventData: Omit<PlacementEvent, 'id' | 'createdAt'>) => {
    try {
      const res = await api.addPlacementEvent(eventData);
      if (res.success && res.event) {
        setPlacementEvents(prev => [res.event, ...prev]);
        showToast('Event scheduled successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule event', 'error');
    }
  };

  const updatePlacementEvent = async (id: string, updates: Partial<PlacementEvent>) => {
    try {
      const res = await api.updatePlacementEvent(id, updates);
      if (res.success && res.event) {
        setPlacementEvents(prev => prev.map(e => e.id === id ? res.event : e));
        showToast('Event updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update event', 'error');
    }
  };

  const deletePlacementEvent = async (id: string) => {
    try {
      const res = await api.deletePlacementEvent(id);
      if (res.success) {
        setPlacementEvents(prev => prev.filter(e => e.id !== id));
        showToast('Event deleted/removed successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        studentProfiles,
        currentStudent,
        companies,
        jobs,
        applications,
        interviews,
        placementRecords,
        notifications,
        toasts,
        isRealtimeConnected,
        switchRole,
        loginUser,
        logoutUser,
        updateStudentProfile,
        addStudentProfile,
        applyForJob,
        addJob,
        updateJob,
        saveJob,
        unsaveJob,
        addCompany,
        updateCompanyStatus,
        updateCompany,
        updateApplicationStatus,
        evaluateApplicationWithAI,
        scheduleInterview,
        markNotificationRead,
        clearAllNotifications,
        showToast,
        removeToast,
        resetToDefaultData,
        placementEvents,
        addPlacementEvent,
        updatePlacementEvent,
        deletePlacementEvent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
