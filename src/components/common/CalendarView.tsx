import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PlacementEvent, EventType, EventStatus } from '../../types';
import { CompanyLogo } from './CompanyLogo';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  Bell, 
  ExternalLink, 
  Building2, 
  Briefcase, 
  Trash2, 
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { 
    currentUser, 
    activeRole, 
    placementEvents, 
    studentProfiles, 
    jobs,
    addPlacementEvent, 
    updatePlacementEvent, 
    deletePlacementEvent,
    showToast
  } = useApp();

  // Navigation & View State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 16)); // Default to August 2026 for demonstration
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'list'>('month');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(['Placement Drive', 'Assessment', 'Interview', 'Deadline', 'Personal Reminder']);
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'Approved' | 'Pending'>('all');

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<PlacementEvent | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<PlacementEvent | null>(null);

  // Form State
  const [formType, setFormType] = useState<EventType>('Placement Drive');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('10:00');
  const [formEndTime, setFormEndTime] = useState<string>('11:00');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formMeetingLink, setFormMeetingLink] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formInstructions, setFormInstructions] = useState<string>('');
  const [formJobId, setFormJobId] = useState<string>('');
  const [formEligibleIds, setFormEligibleIds] = useState<string[]>([]);
  const [formReminderTime, setFormReminderTime] = useState<string>('1 day before');

  // Helper arrays
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: Event Category Styling Mapping
  const typeStyles: Record<EventType, { bg: string; text: string; border: string; label: string }> = {
    'Interview': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-emerald-500', text: 'text-emerald-600', label: 'Interview' },
    'Assessment': { bg: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-blue-500', text: 'text-blue-600', label: 'Assessment' },
    'Placement Drive': { bg: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-purple-500', text: 'text-purple-600', label: 'Placement Drive' },
    'Deadline': { bg: 'bg-orange-50 text-orange-700 border-orange-200', border: 'border-orange-500', text: 'text-orange-600', label: 'Deadline' },
    'Personal Reminder': { bg: 'bg-slate-50 text-slate-700 border-slate-200', border: 'border-slate-500', text: 'text-slate-600', label: 'Personal Reminder' }
  };

  // Filter placement events based on active role permissions
  const visibleEvents = useMemo(() => {
    return placementEvents.filter(event => {
      // 1. Role boundaries
      if (activeRole === 'student') {
        // Students see all approved events (except personal reminders belonging to others)
        if (event.approvalStatus !== 'Approved' && event.userId !== currentUser?.id) return false;
        if (event.eventType === 'Personal Reminder' && event.userId !== currentUser?.id) return false;
        // Verify eligibility: either 'all' or student is in the list
        if (event.eventType !== 'Personal Reminder' && event.eligibleStudentIds && event.eligibleStudentIds.length > 0) {
          const studentProfileId = currentUser?.studentId || '';
          if (event.eligibleStudentIds[0] !== 'all' && !event.eligibleStudentIds.includes(studentProfileId)) {
            // Keep it if student is applied/shortlisted, but otherwise hide if specific eligibility list exists
          }
        }
      } else if (activeRole === 'recruiter') {
        // Recruiters see all approved events, plus pending/rejected events they created (based on companyName match)
        if (event.eventType === 'Personal Reminder') return false; // Hide student reminders
        const recruiterCompany = currentUser?.companyDetails?.name || '';
        if (event.approvalStatus !== 'Approved' && event.companyName !== recruiterCompany) return false;
      } else if (activeRole === 'admin') {
        // Admins see everything except private student reminders
        if (event.eventType === 'Personal Reminder') return false;
        if (approvalFilter !== 'all' && event.approvalStatus !== approvalFilter) return false;
      }

      // 2. Search query check
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        const matchesCompany = event.companyName?.toLowerCase().includes(query) || false;
        const matchesLocation = event.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCompany && !matchesLocation) return false;
      }

      // 3. Category filters
      if (!selectedTypes.includes(event.eventType)) return false;

      return true;
    });
  }, [placementEvents, activeRole, currentUser, searchQuery, selectedTypes, approvalFilter]);

  // Venue Conflict Check helper
  const venueConflicts = useMemo(() => {
    if (!formLocation || !formDate || !formStartTime || !formEndTime) return [];
    
    return placementEvents.filter(event => {
      // Don't conflict with itself if editing
      if (editingEvent && event.id === editingEvent.id) return false;
      
      // Match venue, date and status
      if (event.location.toLowerCase().trim() === formLocation.toLowerCase().trim() && 
          event.date === formDate && 
          event.status !== 'Cancelled' && 
          event.approvalStatus !== 'Rejected') {
        
        // Check temporal overlap
        const startA = formStartTime;
        const endA = formEndTime;
        const startB = event.startTime;
        const endB = event.endTime;
        
        const overlap = (startA >= startB && startA < endB) || 
                        (endA > startB && endA <= endB) || 
                        (startA <= startB && endA >= endB);
        return overlap;
      }
      return false;
    });
  }, [placementEvents, formLocation, formDate, formStartTime, formEndTime, editingEvent]);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create list of dates for Month Grid
  const calendarCells = useMemo(() => {
    const cells = [];
    // Previous Month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    // Next Month padding to complete grid
    const totalCells = cells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex, prevMonthDays]);

  // Week Grid Dates
  const weekCells = useMemo(() => {
    const cells = [];
    const dayOfWeek = currentDate.getDay();
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      cells.push(nextDay);
    }
    return cells;
  }, [currentDate]);

  // Navigate handlers
  const handlePrev = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (currentView === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (currentView === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 16)); // Anchor around demo date
  };

  // Filter toggle
  const toggleTypeFilter = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Modal actions
  const openAddEvent = (dateStr?: string) => {
    setEditingEvent(null);
    setFormType(activeRole === 'student' ? 'Personal Reminder' : 'Placement Drive');
    setFormTitle('');
    setFormDate(dateStr || new Date().toISOString().split('T')[0]);
    setFormStartTime('10:00');
    setFormEndTime('11:00');
    setFormLocation('');
    setFormMeetingLink('');
    setFormDescription('');
    setFormInstructions('');
    setFormJobId('');
    setFormEligibleIds(['all']);
    setIsAddEditModalOpen(true);
  };

  const openEditEvent = (event: PlacementEvent) => {
    setEditingEvent(event);
    setFormType(event.eventType);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormStartTime(event.startTime);
    setFormEndTime(event.endTime);
    setFormLocation(event.location);
    setFormMeetingLink(event.meetingLink || '');
    setFormDescription(event.description);
    setFormInstructions(event.instructions || '');
    setFormJobId(event.jobId || '');
    setFormEligibleIds(event.eligibleStudentIds || ['all']);
    setFormReminderTime(event.reminderTime || '1 day before');
    setIsAddEditModalOpen(true);
    setSelectedEvent(null); // close details modal
  };

  const handleDeleteEvent = async (event: PlacementEvent) => {
    if (window.confirm(`Are you sure you want to cancel and remove this event: "${event.title}"?`)) {
      await deletePlacementEvent(event.id);
      setSelectedEvent(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDate || !formStartTime || !formEndTime || !formLocation) {
      showToast('Please fill in all mandatory fields', 'error');
      return;
    }

    if (venueConflicts.length > 0) {
      if (!window.confirm(`⚠️ VENUE CONFLICT WARNING:\nAnother event is already scheduled at "${formLocation}" during this time.\nDo you want to ignore this warning and book anyway?`)) {
        return;
      }
    }

    const matchedJob = jobs.find(j => j.id === formJobId);

    const eventPayload: Omit<PlacementEvent, 'id' | 'createdAt'> = {
      title: formTitle,
      eventType: formType,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      location: formLocation,
      meetingLink: formMeetingLink || undefined,
      description: formDescription,
      instructions: formInstructions || undefined,
      status: 'Upcoming',
      approvalStatus: activeRole === 'admin' ? 'Approved' : 'Pending',
      reminderTime: formReminderTime,
      eligibleStudentIds: formEligibleIds,
      // Metadata links
      companyId: matchedJob?.companyId || (activeRole === 'recruiter' ? currentUser?.companyDetails?.id : undefined),
      companyName: matchedJob?.companyName || (activeRole === 'recruiter' ? currentUser?.companyDetails?.name : undefined),
      companyLogo: matchedJob?.companyLogo || (activeRole === 'recruiter' ? currentUser?.companyDetails?.logo : undefined),
      jobId: formJobId || undefined,
      jobTitle: matchedJob?.title || undefined,
      userId: activeRole === 'student' ? currentUser?.id : undefined
    };

    if (editingEvent) {
      await updatePlacementEvent(editingEvent.id, eventPayload);
    } else {
      await addPlacementEvent(eventPayload);
    }

    setIsAddEditModalOpen(false);
  };

  const handleUpdateReminderPreference = async (event: PlacementEvent, newTime: string) => {
    // Optimistic UI updates / updates in Database schema
    await updatePlacementEvent(event.id, { reminderTime: newTime });
    showToast(`Reminder configured for ${newTime}`, 'success');
    setSelectedEvent(prev => prev ? { ...prev, reminderTime: newTime } : null);
  };

  const handleApproveEvent = async (event: PlacementEvent, status: 'Approved' | 'Rejected') => {
    await updatePlacementEvent(event.id, { approvalStatus: status });
    showToast(`Event request marked as ${status}`, status === 'Approved' ? 'success' : 'info');
    setSelectedEvent(prev => prev ? { ...prev, approvalStatus: status } : null);
  };

  // Check if current student is eligible for an event
  const isStudentEligible = (event: PlacementEvent) => {
    if (activeRole !== 'student' || event.eventType === 'Personal Reminder') return true;
    if (!event.eligibleStudentIds || event.eligibleStudentIds.length === 0) return true;
    if (event.eligibleStudentIds.includes('all')) return true;
    return event.eligibleStudentIds.includes(currentUser?.studentId || '');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[750px]">
      
      {/* Header and Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md shadow-slate-900/10">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Placement & Careers Calendar</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track and manage placement drives, interviews, tests, and reminders</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl">
            {(['month', 'week', 'list'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  currentView === view 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Add Event Action */}
          <button
            onClick={() => openAddEvent()}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{activeRole === 'student' ? 'Add Reminder' : 'Schedule Event'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, companies, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 md:col-span-6 items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>
          {(['Placement Drive', 'Assessment', 'Interview', 'Deadline', 'Personal Reminder'] as EventType[]).map((type) => {
            // Hide personal reminder filter if not student
            if (type === 'Personal Reminder' && activeRole !== 'student') return null;
            const isSelected = selectedTypes.includes(type);
            const style = typeStyles[type];
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? `${style.bg} border-slate-300 shadow-sm font-semibold`
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? style.border.replace('border', 'bg') : 'bg-slate-300'}`} />
                {style.label}
              </button>
            );
          })}
        </div>

        {/* Admin Approval Filter */}
        {activeRole === 'admin' && (
          <div className="md:col-span-2 flex items-center justify-end">
            <select
              value={approvalFilter}
              onChange={(e: any) => setApprovalFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="all">All Approval States</option>
              <option value="Approved">Approved Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Calendar Grid Controller */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
            {currentView === 'week' 
              ? `Week of ${weekCells[0].getDate()} ${months[weekCells[0].getMonth()]} ${weekCells[0].getFullYear()}`
              : `${months[month]} ${year}`
            }
          </h2>

          <button
            onClick={handleNext}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-700 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleToday}
          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white rounded-lg text-slate-700 shadow-sm transition-all"
        >
          Today
        </button>
      </div>

      {/* main view grids */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        
        {/* 1. MONTH VIEW */}
        {currentView === 'month' && (
          <div className="grid grid-cols-7 border-collapse h-full min-h-[480px]">
            {/* Weekday headers */}
            {weekdays.map((day) => (
              <div key={day} className="py-2.5 text-center text-xs font-bold text-slate-500 bg-white border-b border-r border-slate-100">
                {day}
              </div>
            ))}
            
            {/* Calendar Cells */}
            {calendarCells.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split('T')[0];
              const cellEvents = visibleEvents.filter(e => e.date === dateStr);
              const isToday = cell.date.getFullYear() === 2026 && cell.date.getMonth() === 7 && cell.date.getDate() === 16;

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    // Prevent trigger on inner click
                    if (e.target === e.currentTarget) {
                      openAddEvent(dateStr);
                    }
                  }}
                  className={`min-h-[90px] p-2 border-b border-r border-slate-100 bg-white transition-all hover:bg-slate-50/50 flex flex-col gap-1 cursor-pointer group ${
                    !cell.isCurrentMonth ? 'text-slate-300 bg-slate-50/20' : 'text-slate-800'
                  } ${isToday ? 'bg-slate-900/5 ring-1 ring-slate-900/10' : ''}`}
                >
                  <span className={`text-xs font-bold self-start w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-slate-900 text-white' : ''
                  }`}>
                    {cell.date.getDate()}
                  </span>

                  {/* Events list */}
                  <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-0.5 max-h-[85px] scrollbar-thin">
                    {cellEvents.slice(0, 3).map((event) => {
                      const style = typeStyles[event.eventType];
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate transition-all hover:shadow-sm ${style.bg}`}
                          title={`${event.companyName ? `${event.companyName} - ` : ''}${event.title}`}
                        >
                          {event.companyName ? `${event.companyName}: ` : ''}{event.title}
                        </div>
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <div className="text-[9px] font-bold text-slate-400 pl-1">
                        + {cellEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {currentView === 'week' && (
          <div className="grid grid-cols-7 h-full min-h-[480px]">
            {weekCells.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const cellEvents = visibleEvents.filter(e => e.date === dateStr);
              const isToday = day.getFullYear() === 2026 && day.getMonth() === 7 && day.getDate() === 16;

              return (
                <div key={idx} className="border-r border-slate-100 bg-white flex flex-col min-w-[120px]">
                  {/* Day header */}
                  <div className={`p-3 text-center border-b border-slate-100 flex flex-col gap-1 ${
                    isToday ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{weekdays[day.getDay()]}</span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                  </div>

                  {/* Events list */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-slate-50/20">
                    {cellEvents.length === 0 ? (
                      <div className="text-[10px] text-slate-400 text-center py-6 italic">No events</div>
                    ) : (
                      cellEvents.map((event) => {
                        const style = typeStyles[event.eventType];
                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`p-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all flex flex-col gap-1 ${style.bg}`}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                              {event.eventType}
                            </span>
                            <h4 className="text-xs font-bold leading-tight truncate">{event.title}</h4>
                            {event.companyName && (
                              <span className="text-[10px] text-slate-600 truncate flex items-center gap-1 font-medium">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {event.companyName}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold mt-1">
                              <Clock className="w-2.5 h-2.5" />
                              {event.startTime} - {event.endTime}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. LIST VIEW */}
        {currentView === 'list' && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {visibleEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-800 font-bold text-base">No events scheduled</h3>
                <p className="text-slate-500 text-xs mt-1">Try modifying your filter settings or search query</p>
              </div>
            ) : (
              visibleEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime))
                .map((event) => {
                  const style = typeStyles[event.eventType];
                  return (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-4 hover:border-slate-200"
                    >
                      {/* Date Badge */}
                      <div className="flex md:flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 min-w-[90px] text-center gap-1">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-slate-800 font-extrabold text-lg leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style.bg} border`}>
                            {event.eventType}
                          </span>
                          {event.approvalStatus === 'Pending' && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" /> Pending Approval
                            </span>
                          )}
                          {!isStudentEligible(event) && (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                              Ineligible
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors leading-tight">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500">
                          {event.companyName && (
                            <span className="flex items-center gap-1 font-semibold text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {event.companyName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {event.location}
                          </span>
                        </div>
                      </div>

                      {/* Chevron indicator / Meta info */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`p-5 border-b border-slate-100 flex items-center justify-between ${typeStyles[selectedEvent.eventType].bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-white rounded-full border shadow-sm">
                  {selectedEvent.eventType}
                </span>
                {selectedEvent.approvalStatus === 'Pending' && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Pending Review
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-black/5 text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Main Title Info */}
              <div className="space-y-2">
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{selectedEvent.title}</h2>
                
                {selectedEvent.companyName && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <CompanyLogo
                      src={selectedEvent.companyLogo}
                      name={selectedEvent.companyName}
                      className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold"
                    />
                    <span>{selectedEvent.companyName}</span>
                    {selectedEvent.jobTitle && (
                      <span className="text-slate-400 font-normal">
                        for position: <span className="text-slate-700 font-semibold">{selectedEvent.jobTitle}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Time & Venue Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                    <span className="block text-xs font-bold text-slate-800 mt-0.5">{selectedEvent.date}</span>
                    <span className="block text-[10px] text-slate-500 font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue / Mode</span>
                    <span className="block text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedEvent.location}</span>
                    {selectedEvent.meetingLink && (
                      <a 
                        href={selectedEvent.meetingLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 font-bold mt-1"
                      >
                        Join online <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About the Event</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {selectedEvent.description || 'No description provided.'}
                </p>
              </div>

              {/* Instructions */}
              {selectedEvent.instructions && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important Instructions</h4>
                  <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-slate-700 space-y-1 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed whitespace-pre-line">{selectedEvent.instructions}</p>
                  </div>
                </div>
              )}

              {/* Reminder Settings (For Student portal) */}
              {activeRole === 'student' && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Set Event Reminder</span>
                      <span className="block text-[10px] text-slate-500">Configure alert notifications</span>
                    </div>
                  </div>

                  <select
                    value={selectedEvent.reminderTime || '1 day before'}
                    onChange={(e) => handleUpdateReminderPreference(selectedEvent, e.target.value)}
                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-slate-900 focus:border-slate-900 outline-none"
                  >
                    <option value="none">No Reminders</option>
                    <option value="30 minutes before">30 minutes before</option>
                    <option value="1 hour before">1 hour before</option>
                    <option value="12 hours before">12 hours before</option>
                    <option value="1 day before">1 day before</option>
                  </select>
                </div>
              )}

              {/* Eligibility check for students */}
              {activeRole === 'student' && !isStudentEligible(selectedEvent) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Note: You are not marked as eligible for this scheduling event. Please contact placement office if incorrect.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
              
              {/* Left Actions (e.g. Admin Approve/Reject) */}
              <div className="flex items-center gap-2">
                {activeRole === 'admin' && selectedEvent.approvalStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApproveEvent(selectedEvent, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleApproveEvent(selectedEvent, 'Rejected')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 hover:text-red-700 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {/* Right Actions: Edit & Delete */}
              <div className="flex items-center gap-2">
                {/* Check permission for delete/edit */}
                {((activeRole === 'admin' && selectedEvent.eventType !== 'Personal Reminder') ||
                  (activeRole === 'recruiter' && selectedEvent.companyName === currentUser?.companyDetails?.name) ||
                  (activeRole === 'student' && selectedEvent.eventType === 'Personal Reminder' && selectedEvent.userId === currentUser?.id)) && (
                  <>
                    <button
                      onClick={() => openEditEvent(selectedEvent)}
                      className="p-2 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-600 transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent)}
                      className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT EVENT MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                {editingEvent ? 'Modify Event Schedule' : 'Create New Event'}
              </h2>
              <button 
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Type Selection (Disabled when editing) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Category</label>
                {activeRole === 'student' ? (
                  <input
                    type="text"
                    disabled
                    value="Personal Reminder"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-500 outline-none"
                  />
                ) : (
                  <select
                    disabled={!!editingEvent}
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none bg-white"
                  >
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Assessment">Assessment / Test</option>
                    <option value="Interview">Interview Session</option>
                    <option value="Deadline">Application Deadline</option>
                  </select>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Technical Interview - Round 1"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              {/* Related Job (For recruiters/admins) */}
              {activeRole !== 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Associated Job Posting</label>
                  <select
                    value={formJobId}
                    onChange={(e) => {
                      setFormJobId(e.target.value);
                      const j = jobs.find(job => job.id === e.target.value);
                      if (j && !formTitle) {
                        setFormTitle(`${j.companyName} - ${j.title} Drive`);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none bg-white"
                  >
                    <option value="">No specific job reference</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.companyName} - {job.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Location/Venue & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Venue / Classroom / Mode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 3, Seminar Hall A, Zoom"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Meeting / Portal Link</label>
                  <input
                    type="url"
                    placeholder="e.g. https://zoom.us/j/..."
                    value={formMeetingLink}
                    onChange={(e) => setFormMeetingLink(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Conflict Alert Banner */}
              {venueConflicts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">⚠️ Overlapping Schedule Warning</span>
                    <span>
                      "{venueConflicts[0].title}" is already scheduled at "{formLocation}" on {formDate} during {venueConflicts[0].startTime} - {venueConflicts[0].endTime}.
                    </span>
                  </div>
                </div>
              )}

              {/* Eligible Candidates Selection (for interviews/assessments) */}
              {activeRole !== 'student' && (formType === 'Interview' || formType === 'Assessment') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Eligible Student(s)</label>
                  <select
                    multiple
                    value={formEligibleIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormEligibleIds(selected);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none bg-white min-h-[90px]"
                  >
                    <option value="all">All Registered Students</option>
                    {studentProfiles.map(student => (
                      <option key={student.id} value={student.id}>{student.fullName} ({student.regNo}) - {student.course}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">Hold Ctrl (Cmd on Mac) to select multiple candidates</span>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief details about the round, syllabus details, pre-requisites..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none resize-y"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring original college ID card, copy of resume, and wear formals."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-slate-900 focus:border-slate-900 outline-none resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Schedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
