import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Job, StudentProfile } from '../../types';
import { checkEligibility } from '../../utils/eligibility';
import { CompanyLogo } from '../common/CompanyLogo';

interface JobDetailsPopupProps {
  job: Job | null;
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle: (isSaved: boolean) => void;
  matchPercentage: number;
}

export const JobDetailsPopup: React.FC<JobDetailsPopupProps> = ({
  job,
  student,
  isOpen,
  onClose,
  onSaveToggle,
  matchPercentage
}) => {
  const [cachedJob, setCachedJob] = React.useState<Job | null>(null);
  const [cachedStudent, setCachedStudent] = React.useState<StudentProfile | null>(null);

  React.useEffect(() => {
    if (job) {
      setCachedJob(job);
    }
  }, [job]);

  React.useEffect(() => {
    if (student) {
      setCachedStudent(student);
    }
  }, [student]);

  const activeJob = job || cachedJob;
  const activeStudent = student || cachedStudent;

  // Missing skills calculation (Obey React Rules of Hooks: defined before early returns)
  const missingSkills = useMemo(() => {
    if (!activeStudent || !activeJob) return [];
    const reqSkills = activeJob.requiredSkills || [];
    const studentSkillsLower = activeStudent.skills ? activeStudent.skills.map(s => s.toLowerCase()) : [];
    return reqSkills.filter(
      skill => !studentSkillsLower.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))
    );
  }, [activeStudent?.skills, activeJob?.requiredSkills]);

  if (!activeJob || !activeStudent) return null;

  const isSaved = activeJob.savedByStudentIds?.includes(activeStudent.id) || false;
  const eligibilityResult = checkEligibility(activeStudent, activeJob.eligibility);
  const eligibility = activeJob.eligibility || {
    graduationYear: activeStudent.graduationYear,
    minCgpa: 0,
    maxBacklogs: 99,
    eligibleCourses: [],
    eligibleDepartments: []
  };

  const requiredSkills = activeJob.requiredSkills || [];
  const responsibilities = activeJob.responsibilities || [];
  const description = activeJob.description || 'No description provided.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Off-Campus Opportunity Details"
      subtitle={`${activeJob.companyName} • Source: ${activeJob.source}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CompanyLogo 
              src={activeJob.companyLogo} 
              name={activeJob.companyName} 
              className="w-14 h-14 rounded-xl border border-slate-200 shadow-2xs"
            />
            <div>
              <h4 className="text-base font-extrabold text-slate-900">{activeJob.title}</h4>
              <p className="text-xs font-bold text-[#10B981] flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#10B981]" /> {activeJob.companyName}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                <span className="flex items-center gap-1">📍 {activeJob.location}</span>
                <span className="flex items-center gap-1">💰 {activeJob.salaryPackage}</span>
                <span className="flex items-center gap-1">💼 {activeJob.jobType}</span>
                <span className="bg-slate-200/60 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">Source: {activeJob.source}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSaveToggle(isSaved)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark className={`w-4.5 h-4.5 ${isSaved ? 'fill-amber-600' : ''}`} />
            </button>

            <a
              href={activeJob.originalJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
            >
              View & Apply <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Dynamic Match & Resume Score Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Smart Match Card */}
          <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Smart Match Score
                </h5>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  matchPercentage >= 80 ? 'bg-emerald-500/10 text-[#10B981]' : matchPercentage >= 50 ? 'bg-amber-500/10 text-amber-700' : 'bg-red-500/10 text-red-600'
                }`}>
                  {matchPercentage}% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                This score represents the matching density between skills specified in your resume and requirements list.
              </p>
            </div>
            
            {/* Visual match meter bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${matchPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  matchPercentage >= 80 ? 'bg-[#10B981]' : matchPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Academic Eligibility Card */}
          <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Placement Eligibility
                </h5>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  eligibilityResult.isEligible ? 'bg-emerald-500/10 text-[#10B981]' : 'bg-red-500/10 text-red-600'
                }`}>
                  {eligibilityResult.isEligible ? 'Eligible' : 'Ineligible'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {eligibilityResult.isEligible 
                  ? 'Awesome! Your academic profile meets all criteria configured for this position.' 
                  : `Failed ${eligibilityResult.failedCriteriaCount} placement requirement(s). Review detailed checks.`}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Automated Verification
            </div>
          </div>
        </div>

        {/* Detailed Skills Mapping Section */}
        <div>
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Skills Analyzer
          </h5>
          <motion.div 
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
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
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-2">Matching Skills ({requiredSkills.length - missingSkills.length})</span>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.filter(s => !missingSkills.includes(s)).map((skill, idx) => (
                  <motion.span 
                    key={idx} 
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
                    }}
                    className="px-2.5 py-1 bg-emerald-500/5 text-[#10B981] border border-emerald-500/10 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {skill}
                  </motion.span>
                ))}
                {requiredSkills.filter(s => !missingSkills.includes(s)).length === 0 && (
                  <span className="text-xs text-slate-400 italic">No matching skills found in resume profile.</span>
                )}
              </div>
            </div>

            {missingSkills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-2">Suggested / Missing Skills ({missingSkills.length})</span>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, idx) => (
                    <motion.span 
                      key={idx} 
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
                      }}
                      className="px-2.5 py-1 bg-amber-500/5 text-amber-700 border border-amber-500/10 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Job Details & Description */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Description</h5>
              <p className="text-xs text-slate-655 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
                {description}
              </p>
            </div>

            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Responsibilities</h5>
              <ul className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Academic Criteria Audit */}
          <div className="space-y-4">
            <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-slate-200 space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                Eligibility Audit
              </h5>

              <div className="text-[11px] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Graduation Year</span>
                  <span className="font-bold text-slate-800">{eligibility.graduationYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Min CGPA</span>
                  <span className="font-bold text-slate-800">{eligibility.minCgpa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Max Backlogs</span>
                  <span className="font-bold text-slate-800">{eligibility.maxBacklogs}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-2.5">
                  <span className="text-slate-500 block">Eligible Courses</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate" title={eligibility.eligibleCourses.join(', ')}>
                    {eligibility.eligibleCourses.join(', ') || 'All Courses'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">Application Deadline</span>
              <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {activeJob.applicationDeadline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
