import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Plus, 
  ArrowRight, 
  Building2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';

interface RecruiterDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenCreateJob: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ 
  setActiveTab,
  onOpenCreateJob
}) => {
  const { currentUser, companies, jobs, applications, interviews, updateApplicationStatus, placementEvents } = useApp();

  // Find recruiter's company
  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];

  // Jobs for this company
  const myJobs = jobs.filter(j => j.companyId === myCompany?.id);
  const activeJobs = myJobs.filter(j => j.status === 'Open');

  // Applications for this company's jobs
  const myApplications = applications.filter(a => a.companyId === myCompany?.id);
  const shortlistedApps = myApplications.filter(a => a.status === 'Shortlisted' || a.status === 'Assessment' || a.status === 'Technical Interview' || a.status === 'HR Interview');
  const selectedApps = myApplications.filter(a => a.status === 'Selected');

  // Interviews for this company
  const myInterviews = interviews.filter(i => i.companyName === myCompany?.name);

  // Get upcoming calendar events
  const recruiterUpcomingEvents = useMemo(() => {
    return (placementEvents || [])
      .filter(event => {
        // Must belong to recruiter's company
        if (event.companyName !== myCompany?.name) return false;
        // Exclude personal reminders
        if (event.eventType === 'Personal Reminder') return false;
        // Exclude past events (relative to Aug 16, 2026)
        return new Date(event.date) >= new Date('2026-08-16');
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  }, [placementEvents, myCompany]);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Banner (Navy & Emerald) */}
      <div className="bg-[#0F172A] rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative">
          <CompanyLogo 
            src={myCompany?.logo} 
            name={myCompany?.name || 'Recruiter Portal'} 
            className="w-16 h-16 rounded-xl shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{myCompany?.name || 'Recruiter Portal'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                {myCompany?.status || 'Verified'} Partner
              </span>
            </div>
            <p className="text-slate-455 text-xs mt-1">
              {myCompany?.industry} • {myCompany?.location} • Recruiter: <span className="text-white font-semibold">{currentUser?.name || myCompany?.recruiterName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setActiveTab('company-profile')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-slate-400" /> Company Profile
          </button>
          <button
            onClick={onOpenCreateJob}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post New Job Drive
          </button>
        </div>
      </div>

      {/* Metrics Row (SaaS Style, 16px Rounded) */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
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
          { label: 'Active Job Drives', val: activeJobs.length, sub: `${myJobs.length} total drives posted`, bg: 'bg-emerald-500/5' },
          { label: 'Total Applicants', val: myApplications.length, sub: 'Across all drives', bg: 'bg-emerald-500/5' },
          { label: 'Shortlisted', val: shortlistedApps.length, sub: 'In interview pipeline', bg: 'bg-emerald-500/5' },
          { label: 'Interviews Scheduled', val: myInterviews.length, sub: 'Scheduled rounds', bg: 'bg-emerald-500/5' },
          { label: 'Hired / Offered', val: selectedApps.length, sub: 'Offers extended', bg: 'bg-emerald-500/5' }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between h-28 hover:border-emerald-500/20 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                <span className="text-[#10B981] font-bold">✔</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                <AnimatedCounter to={item.val} />
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-1.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid: Active Drives & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Drives & Upcoming Events */}
        <div className="space-y-6">
          {/* Active Drives */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#10B981]" /> Active Job Drives
              </h2>
              <button 
                onClick={() => setActiveTab('job-postings')}
                className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No job drives posted yet.
                </div>
              ) : (
                myJobs.slice(0, 3).map((job) => {
                  const jobAppCount = applications.filter(a => a.jobId === job.id).length;
                  return (
                    <div key={job.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">{job.title}</h3>
                          <p className="text-[10px] text-slate-400">{job.location} • {job.salaryPackage}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          job.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-500 font-bold">{jobAppCount} Applicants</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {job.applicationDeadline}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#10B981]" /> Upcoming Events
              </h2>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5"
              >
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recruiterUpcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 italic">No upcoming events scheduled</p>
              ) : (
                recruiterUpcomingEvents.map((event, idx) => {
                  const typeColors: Record<string, string> = {
                    'Interview': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'Assessment': 'bg-blue-50 text-blue-700 border-blue-100',
                    'Placement Drive': 'bg-purple-50 text-purple-700 border-purple-100',
                    'Deadline': 'bg-orange-50 text-orange-700 border-orange-100'
                  };
                  return (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${typeColors[event.eventType] || 'bg-slate-50 text-slate-750 border-slate-100'}`}>
                            {event.eventType}
                          </span>
                          <span className="text-[9px] text-slate-450 font-semibold">{event.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">{event.title}</h4>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-105 px-2 py-0.5 rounded-full shrink-0">
                        {event.startTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Job Applicants</h2>
              <p className="text-[10px] text-slate-450 mt-0.5">Review candidates and process them through recruitment rounds</p>
            </div>
            <button 
              onClick={() => setActiveTab('applicants')}
              className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150">
                <tr>
                  <th className="py-3 px-2">Candidate</th>
                  <th className="py-3 px-2">Course & Dept</th>
                  <th className="py-3 px-2">CGPA</th>
                  <th className="py-3 px-2">Applied Job</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No candidate applications received yet.
                    </td>
                  </tr>
                ) : (
                  myApplications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-800">{app.studentName}</div>
                        <div className="text-[9px] text-slate-400">{app.studentRegNo}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {app.studentCourse} <span className="text-[9px] opacity-70 block">{app.studentDepartment}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                          {app.studentCgpa}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-medium">
                        {app.jobTitle}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                          app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {app.status === 'Applied' && (
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'Shortlisted', 'Shortlisted by Recruiter')}
                            className="px-2.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== 'Applied' && (
                          <button
                            onClick={() => setActiveTab('applicants')}
                            className="text-[#10B981] hover:underline font-bold"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
