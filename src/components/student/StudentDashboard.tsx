import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Award, 
  ArrowRight, 
  Building2, 
  MapPin, 
  Clock, 
  FileCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';
import { checkEligibility } from '../../utils/eligibility';
import { CompanyLogo } from '../common/CompanyLogo';
import { JobDetailModal } from './JobDetailModal';
import { Job } from '../../types';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { currentStudent, jobs, applications, interviews, companies, currentUser, placementEvents } = useApp();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (!currentStudent) return null;

  // Filter jobs based on verified company status
  const verifiedCompaniesMap = new Map(companies.map(c => [c.id, c.status]));
  const visibleJobs = jobs.filter(job => {
    const status = verifiedCompaniesMap.get(job.companyId);
    if (status === undefined) {
      const comp = companies.find(c => c.name === job.companyName);
      return !comp || comp.status === 'Verified';
    }
    return status === 'Verified';
  });

  // Student specific stats
  const availableJobsCount = visibleJobs.filter(j => j.status === 'Open').length;
  const myApps = applications.filter(a => a.studentId === currentStudent.id);
  const myAppsCount = myApps.length;
  const shortlistedCount = myApps.filter(a => a.status === 'Shortlisted' || a.status === 'Assessment' || a.status === 'Technical Interview' || a.status === 'HR Interview' || a.status === 'Selected').length;
  const myUpcomingInterviews = interviews.filter(i => i.studentId === currentStudent.id && i.status === 'Scheduled');
  const upcomingInterviewsCount = myUpcomingInterviews.length;

  // Status mapping for chart
  const appliedCount = myApps.filter(a => a.status === 'Applied').length;
  const inProgressCount = myApps.filter(a => ['Assessment', 'Technical Interview', 'HR Interview'].includes(a.status)).length;
  const offersCount = myApps.filter(a => a.status === 'Selected').length;
  const rejectedCount = myApps.filter(a => a.status === 'Rejected').length;

  const chartData = [
    { name: 'Applied', value: appliedCount || 1, color: '#10B981' }, // emerald
    { name: 'In Progress', value: inProgressCount || 0, color: '#F59E0B' }, // amber
    { name: 'Offered', value: offersCount || 0, color: '#3B82F6' }, // blue
    { name: 'Rejected', value: rejectedCount || 0, color: '#EF4444' } // red
  ].filter(item => item.value > 0);

  // Get upcoming calendar events
  const studentUpcomingEvents = useMemo(() => {
  if (!currentStudent) return [];

  return (placementEvents || [])
    .filter(event => {
      // Must be approved (or student's own reminder)
      if (
        event.approvalStatus !== 'Approved' &&
        event.userId !== currentUser?.id
      ) {
        return false;
      }

      // Check eligibility
      if (
        event.eventType !== 'Personal Reminder' &&
        event.eligibleStudentIds &&
        event.eligibleStudentIds.length > 0
      ) {
        if (
          event.eligibleStudentIds[0] !== 'all' &&
          !event.eligibleStudentIds.includes(currentStudent.id)
        ) {
          return false;
        }
      }

      // Exclude past events
      return new Date(event.date) >= new Date('2026-08-16');
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        a.startTime.localeCompare(b.startTime)
    )
    .slice(0, 3);
  }, [placementEvents, currentStudent, currentUser]);

  if (!currentStudent) return null;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner (Navy) */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Student Placement Portal
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Good morning, {currentStudent.fullName}! 👋</h2>
          <p className="text-xs text-slate-400">
            {currentStudent.course} • {currentStudent.department} • CGPA: <strong className="text-white">{currentStudent.cgpa}</strong> • Reg No: {currentStudent.registrationNumber}
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/10 transition-colors flex items-center gap-1.5"
          >
            Explore Drives <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upcoming Interview Alert Box */}
      {myUpcomingInterviews.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-slate-800 shadow-3xs">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600">Upcoming Interview</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {myUpcomingInterviews[0].round} Round with {myUpcomingInterviews[0].companyName}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                📅 {myUpcomingInterviews[0].date} at {myUpcomingInterviews[0].time} • {myUpcomingInterviews[0].venue}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('interviews')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            View Details & Join
          </button>
        </div>
      )}

      {/* Metrics Row (SaaS Style, 16px Rounded) */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {[
          { tab: 'jobs', label: 'Available Jobs', val: availableJobsCount, sub: 'Active Drives', icon: <Briefcase className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/5' },
          { tab: 'applications', label: 'Applications', val: myAppsCount, sub: 'Submitted Logs', icon: <Send className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/5' },
          { tab: 'applications', label: 'Shortlisted', val: shortlistedCount, sub: 'In Further Rounds', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/5' },
          { tab: 'interviews', label: 'Interviews', val: upcomingInterviewsCount, sub: 'Scheduled Sessions', icon: <Calendar className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/5' },
          { tab: 'placement-status', label: 'Placement Status', val: currentStudent.placementStatus, sub: '2026 Batch Record', icon: <Award className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/5', isStatus: true }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            onClick={() => setActiveTab(item.tab)}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
            }}
            whileHover={{ y: -4, scale: 1.02, borderColor: "rgba(16, 185, 129, 0.3)" }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs transition-shadow cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
            </div>
            <div>
              <p className={`font-extrabold text-slate-900 tracking-tight leading-none ${item.isStatus ? 'text-sm' : 'text-2xl mt-2'}`}>
                {item.isStatus ? (
                  item.val
                ) : (
                  <AnimatedCounter to={Number(item.val)} />
                )}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-1.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Recommended drives & Upcoming + Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recommended Placement Drives */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended Placement Drives</h3>
              <p className="text-[11px] text-slate-450">Opportunities matching your course eligibility standards</p>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1"
            >
              View All ({visibleJobs.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            {visibleJobs.slice(0, 4).map((job) => {
              const eligibility = checkEligibility(currentStudent, job.eligibility);
              const isApplied = myApps.some(a => a.jobId === job.id);

              return (
                <motion.div 
                  key={job.id} 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                  }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs hover:shadow-xs hover:border-emerald-500/20 transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        src={job.companyLogo}
                        name={job.companyName}
                        className="w-10 h-10 rounded-xl border border-slate-150 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" /> {job.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    {eligibility.isEligible ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-full text-[10px] font-bold shrink-0">
                        Eligible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-250 rounded-full text-[10px] font-bold shrink-0">
                        Ineligible
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 border-t border-b border-slate-100 py-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {job.location}</span>
                    <span className="font-bold text-slate-900">💰 {job.salaryPackage}</span>
                    <span className="flex items-center gap-1 text-red-500 font-semibold ml-auto">
                      <Clock className="w-3 h-3" /> {job.applicationDeadline}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-150 text-[9px] font-bold">
                        {s}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-150 text-[9px]">
                        +{job.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Audit Details
                    </button>

                    {isApplied ? (
                      <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                        }}
                        className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Upcoming drives & Application Status Donut */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Calendar Events */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upcoming Events</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Your scheduled placement sessions</p>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-[10px] font-bold text-emerald-600 hover:underline"
              >
                View Calendar
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {studentUpcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 italic">No upcoming events scheduled</p>
              ) : (
                studentUpcomingEvents.map((event, idx) => {
                  const typeColors: Record<string, string> = {
                    'Interview': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'Assessment': 'bg-blue-50 text-blue-700 border-blue-100',
                    'Placement Drive': 'bg-purple-50 text-purple-700 border-purple-100',
                    'Deadline': 'bg-orange-50 text-orange-700 border-orange-100',
                    'Personal Reminder': 'bg-slate-50 text-slate-700 border-slate-100'
                  };
                  return (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${typeColors[event.eventType] || 'bg-slate-50 text-slate-750 border-slate-100'}`}>
                            {event.eventType}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{event.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mt-1 truncate">{event.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {event.location}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-105 px-2 py-0.5 rounded-full shrink-0">
                        {event.startTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Application Statuses Donut */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Application Status</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Review funnel of your applications</p>
            </div>

            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">{myAppsCount}</span>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Total Apps</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-150">
              {[
                { label: 'Applied', count: appliedCount, color: 'bg-emerald-500' },
                { label: 'In Progress', count: inProgressCount, color: 'bg-amber-500' },
                { label: 'Offered', count: offersCount, color: 'bg-blue-500' },
                { label: 'Rejected', count: rejectedCount, color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-slate-500">{item.label}: <strong className="text-slate-800">{item.count}</strong></span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal View for Job Details */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        student={currentStudent}
      />
    </div>
  );
};
