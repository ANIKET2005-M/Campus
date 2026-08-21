import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Job, StudentProfile } from '../../types';
import { checkEligibility } from '../../utils/eligibility';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  student
}) => {
  const { applyForJob, applications } = useApp();
  const [cachedJob, setCachedJob] = React.useState<Job | null>(null);

  React.useEffect(() => {
    if (job) {
      setCachedJob(job);
    }
  }, [job]);

  const activeJob = job || cachedJob;

  if (!activeJob) return null;

  const eligibilityResult = student ? checkEligibility(student, activeJob.eligibility) : null;
  const eligibility = activeJob.eligibility || {
    graduationYear: student?.graduationYear ?? new Date().getFullYear(),
    eligibleCourses: [],
    eligibleDepartments: []
  };
  const requiredSkills = activeJob.requiredSkills || [];
  const responsibilities = activeJob.responsibilities || [];
  const description = activeJob.description || 'No description provided.';
  const isAlreadyApplied = student ? applications.some(a => a.jobId === activeJob.id && a.studentId === student.id) : false;
  const isExpired = new Date(activeJob.applicationDeadline) < new Date(new Date().toISOString().split('T')[0]);

  const handleApply = () => {
    if (!activeJob) return;
    const res = applyForJob(activeJob.id);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeJob.title}
      subtitle={`Drive by ${activeJob.companyName} • Deadline: ${activeJob.applicationDeadline}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CompanyLogo
              src={activeJob.companyLogo}
              name={activeJob.companyName}
              className="w-14 h-14 rounded-xl border border-slate-200 shadow-2xs"
            />
            <div>
              <h4 className="text-base font-bold text-slate-900">{activeJob.title}</h4>
              <p className="text-xs font-semibold text-[#10B981] flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" /> {activeJob.companyName}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeJob.location}</span>
                <span className="flex items-center gap-1"><span className="text-[#10B981] font-bold">💰</span> <strong className="text-slate-800">{activeJob.salaryPackage}</strong></span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {activeJob.jobType}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {activeJob.vacancies} Openings</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {isAlreadyApplied ? (
              <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Application Submitted
              </span>
            ) : isExpired ? (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-semibold">
                Application Deadline Passed
              </span>
            ) : eligibilityResult && !eligibilityResult.isEligible ? (
              <button
                disabled
                className="px-4 py-2 bg-slate-150 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold cursor-not-allowed"
              >
                Ineligible to Apply
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
              >
                Apply Now →
              </button>
            )}
          </div>
        </div>

        {/* Automatic Eligibility Audit Engine Banner */}
        {student && eligibilityResult && (
          <div className={`p-4 rounded-2xl border ${
            eligibilityResult.isEligible 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-900' 
              : 'bg-amber-500/5 border-amber-500/20 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {eligibilityResult.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {eligibilityResult.isEligible 
                      ? 'You Are Eligible For This Opportunity' 
                      : 'You Are Not Eligible For This Opportunity'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {eligibilityResult.isEligible
                      ? 'Your academic profile satisfies all placement criteria defined by recruiter.'
                      : `Failed ${eligibilityResult.failedCriteriaCount} mandatory requirement(s). See detailed audit below.`}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                eligibilityResult.isEligible ? 'bg-emerald-500/15 text-[#10B981]' : 'bg-amber-500/15 text-amber-800'
              }`}>
                {eligibilityResult.scorePercent}% Match
              </span>
            </div>

            {/* Criteria Detailed Checks Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200/40"
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
              {eligibilityResult.checks.map((check, idx) => (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
                  }}
                  className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-150"
                >
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{check.rule}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Req: {check.requiredValue} | You: {check.studentValue}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-normal ${check.passed ? 'text-slate-500' : 'text-red-500 font-semibold'}`}>
                      {check.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Job Details & Description Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Job Description</h5>
              <p className="text-xs text-slate-655 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
                {description}
              </p>
            </div>

            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Responsibilities</h5>
              <ul className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 text-[#10B981] text-xs font-bold border border-emerald-500/10">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Drive Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                Drive Overview
              </h5>

              <div className="text-xs space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Graduation Batch</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{eligibility.graduationYear} Batch</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Eligible Courses</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{eligibility.eligibleCourses.join(', ') || 'All Courses'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Eligible Departments</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{eligibility.eligibleDepartments.join(', ') || 'All Departments'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Application Deadline</span>
                  <span className="font-bold text-red-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> {activeJob.applicationDeadline}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
