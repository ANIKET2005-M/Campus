import React, { useState } from 'react';
import { 
  Bookmark, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { JobDetailModal } from './JobDetailModal';
import { JobDetailsPopup } from './JobDetailsPopup';
import { checkEligibility } from '../../utils/eligibility';
import { CompanyLogo } from '../common/CompanyLogo';

interface StudentSavedJobsViewProps {
  setActiveTab: (tab: string) => void;
}

export const StudentSavedJobsView: React.FC<StudentSavedJobsViewProps> = ({ setActiveTab }) => {
  const { jobs, currentStudent, saveJob, unsaveJob } = useApp();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
        Please sign in to view saved jobs.
      </div>
    );
  }

  // Get saved jobs
  const savedJobs = jobs.filter(j => j.savedByStudentIds?.includes(currentStudent.id));

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center">
            <Bookmark className="w-4.5 h-4.5 fill-[#10B981]" />
          </span>
          Saved Opportunities
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep track of positions you are interested in. Review eligibility and apply when ready.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
            Bookmark job postings from the Campus Drives or Off-Campus sections to track them here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-950/10"
            >
              Browse Campus Drives
            </button>
            <button
              onClick={() => setActiveTab('off-campus')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10"
            >
              Explore Off-Campus Jobs
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => {
            const isOffCampus = !!job.isOffCampus;
            const eligibility = checkEligibility(currentStudent, job.eligibility);

            return (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-350 p-5 shadow-xs transition-all relative flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Source / Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isOffCampus 
                        ? 'bg-amber-500/10 text-amber-700 border border-amber-500/10' 
                        : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/10'
                    }`}>
                      {isOffCampus ? `Off-Campus • ${job.source}` : 'On-Campus Drive'}
                    </span>
                    
                    <button
                      onClick={() => unsaveJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/80 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Job Identity */}
                  <div className="flex items-start gap-4 mb-4">
                    <CompanyLogo 
                      src={job.companyLogo} 
                      name={job.companyName} 
                      className="w-12 h-12 rounded-xl border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{job.companyName}</p>
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                      <span className="text-[#10B981] font-bold shrink-0">💰</span>
                      <span className="truncate font-medium text-slate-700">{job.salaryPackage}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom line: Eligibility & Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${eligibility.isEligible ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold text-slate-655 uppercase tracking-wider">
                      {eligibility.isEligible ? 'Eligible' : 'Ineligible'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>

                    {isOffCampus ? (
                      <a
                        href={job.originalJobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                        }}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <JobDetailsPopup
        job={selectedJob}
        student={currentStudent}
        isOpen={!!selectedJob && !!selectedJob.isOffCampus}
        onClose={() => setSelectedJob(null)}
        onSaveToggle={(isSaved) => {
          if (!selectedJob) return;
          if (isSaved) unsaveJob(selectedJob.id);
          else saveJob(selectedJob.id);
        }}
        matchPercentage={(() => {
          if (!selectedJob || !currentStudent) return 0;
          const studentSkills = currentStudent.skills;
          const jobSkills = selectedJob.requiredSkills;
          if (!jobSkills || jobSkills.length === 0) return 100;
          if (!studentSkills || studentSkills.length === 0) return 0;
          const sSkills = studentSkills.map(s => s.toLowerCase());
          const matches = jobSkills.filter(js => 
            sSkills.some(ss => ss.includes(js.toLowerCase()) || js.toLowerCase().includes(ss))
          );
          return Math.round((matches.length / jobSkills.length) * 100);
        })()}
      />

      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob && !selectedJob.isOffCampus}
        onClose={() => setSelectedJob(null)}
        student={currentStudent}
      />
    </div>
  );
};
