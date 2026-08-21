import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Award, 
  Briefcase, 
  ChevronRight, 
  X,
  Send,
  Calendar,
  Brain,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Application, StudentProfile } from '../../types';
import { checkEligibility } from '../../utils/eligibility';

interface RecruiterApplicantsViewProps {
  onScheduleInterviewForApp?: (app: Application) => void;
}

export const RecruiterApplicantsView: React.FC<RecruiterApplicantsViewProps> = ({
  onScheduleInterviewForApp
}) => {
  const { 
    currentUser, 
    companies, 
    jobs, 
    applications, 
    studentProfiles, 
    updateApplicationStatus,
    evaluateApplicationWithAI,
    showToast 
  } = useApp();

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];
  const myApplications = applications.filter(a => a.companyId === myCompany?.id);
  const myJobs = jobs.filter(j => j.companyId === myCompany?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [activeAppModal, setActiveAppModal] = useState<Application | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredApps = myApplications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.studentRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.studentCourse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJobId === 'all' || app.jobId === selectedJobId;
    const matchesStage = selectedStage === 'all' || app.status === selectedStage;
    return matchesSearch && matchesJob && matchesStage;
  });

  const selectedStudent = activeAppModal ? studentProfiles.find(s => s.id === activeAppModal.studentId) : null;
  const targetJob = activeAppModal ? jobs.find(j => j.id === activeAppModal.jobId) : null;
  const eligibilityEval = (selectedStudent && targetJob) ? checkEligibility(selectedStudent, targetJob.eligibility) : null;
  const currentApp = activeAppModal ? (applications.find(a => a.id === activeAppModal.id) || activeAppModal) : null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Applicants</h1>
          <p className="text-xs text-slate-500">Review student resumes, check automated eligibility scores, and shortlist candidates</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full">
            {myApplications.length} Total Applicants
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or reg no..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
          />
        </div>

        <div>
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981] font-bold text-slate-700"
          >
            <option value="all">All Placement Drives ({myJobs.length})</option>
            {myJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981] font-bold text-slate-700"
          >
            <option value="all">All Status Stages</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Assessment">Assessment</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Academic Details</th>
                <th className="p-4">Drive Applied</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Stage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No student applications matching your filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{app.studentName}</div>
                      <div className="text-[10px] text-slate-450">{app.studentRegNo}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-700 font-medium">{app.studentCourse} • {app.studentDepartment}</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">CGPA: {app.studentCgpa}</div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {app.jobTitle}
                    </td>

                    <td className="p-4 text-slate-450">
                      {app.appliedDate}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                        app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setActiveAppModal(app)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-[10px] border border-slate-200 transition-colors"
                      >
                        View Details
                      </button>

                      {app.status === 'Applied' && (
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'Shortlisted', 'Shortlisted by Recruiter')}
                          className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-[10px] transition-colors shadow-xs"
                        >
                          Shortlist
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

      {/* Candidate Profile Modal */}
      {activeAppModal && selectedStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.fullName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h2 className="text-base font-bold">{selectedStudent.fullName}</h2>
                  <p className="text-xs text-slate-400">{selectedStudent.registrationNumber} • {selectedStudent.course} ({selectedStudent.department})</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveAppModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Automated Eligibility Engine evaluation */}
              {eligibilityEval && (
                <div className={`p-4 rounded-2xl border ${
                  eligibilityEval.isEligible ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {eligibilityEval.isEligible ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated Eligibility Verified</>
                      ) : (
                        <><XCircle className="w-4 h-4 text-amber-600" /> Ineligible Candidate Notice</>
                      )}
                    </span>
                    <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      Score: {eligibilityEval.scorePercent}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/40">
                    {eligibilityEval.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-650">
                        <span className={check.passed ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                          {check.passed ? '✓' : '✕'}
                        </span>
                        <span>{check.rule}:</span>
                        <span className="font-bold text-slate-800">{check.studentValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini AI Candidate Fit Analysis */}
              {currentApp && (
                currentApp.aiEvaluation ? (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-3xs">
                    {/* Header */}
                    <div className="bg-[#0F172A] text-slate-100 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#10B981]" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Gemini AI Candidate Analysis</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        currentApp.aiEvaluation.matchScore >= 80 ? 'bg-emerald-500/10 text-[#10B981] border border-emerald-500/20' :
                        currentApp.aiEvaluation.matchScore >= 60 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {currentApp.aiEvaluation.recommendation}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Score + Fit Summary */}
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Visual Circular Score */}
                        <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle cx="40" cy="40" r="34" className="stroke-slate-200 fill-none" strokeWidth="6" />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className={`fill-none transition-all duration-1000 ${
                                currentApp.aiEvaluation.matchScore >= 80 ? 'stroke-[#10B981]' :
                                currentApp.aiEvaluation.matchScore >= 60 ? 'stroke-amber-550' :
                                'stroke-red-500'
                              }`}
                              strokeWidth="6"
                              strokeDasharray="213.6"
                              strokeDashoffset={213.6 - (213.6 * currentApp.aiEvaluation.matchScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-slate-800">{currentApp.aiEvaluation.matchScore}%</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Match</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">Fit Summary</h4>
                          <p className="text-slate-600 leading-relaxed text-xs italic">
                            "{currentApp.aiEvaluation.fitSummary}"
                          </p>
                        </div>
                      </div>

                      {/* Strengths & Gaps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                        {/* Strengths */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-[#10B981] flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                            <span className="flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                            Key Strengths
                          </h5>
                          <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                            {currentApp.aiEvaluation.strengths.map((str: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#10B981] font-bold">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Gaps */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-amber-700 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                            Identified Gaps / Risks
                          </h5>
                          <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                            {currentApp.aiEvaluation.gaps.map((gap: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Re-analyze button */}
                      <div className="text-right pt-1">
                        <button
                          onClick={async () => {
                            setIsAnalyzing(true);
                            await evaluateApplicationWithAI(currentApp.id);
                            setIsAnalyzing(false);
                          }}
                          disabled={isAnalyzing}
                          className="text-[10px] text-[#10B981] hover:text-[#059669] font-bold flex items-center justify-end gap-1 ml-auto disabled:text-slate-400 hover:underline"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="w-2.5 h-2.5 border border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 animate-pulse" /> Re-run AI Analysis
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setIsAnalyzing(true);
                      await evaluateApplicationWithAI(currentApp.id);
                      setIsAnalyzing(false);
                    }}
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing Profile with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Analyze Profile with Gemini AI Match Scorer
                      </>
                    )}
                  </button>
                )
              )}

              {/* Academic & Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Academic Performance</h4>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p>CGPA: <strong className="text-slate-900">{selectedStudent.cgpa}</strong></p>
                    <p>10th Grade: <strong className="text-slate-900">{selectedStudent.tenthPercent}%</strong></p>
                    <p>12th Grade: <strong className="text-slate-900">{selectedStudent.twelfthPercent}%</strong></p>
                    <p>Active Backlogs: <strong className="text-slate-900">{selectedStudent.backlogs}</strong></p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-500/5 text-[#10B981] border border-emerald-500/10 rounded font-bold text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume Download Box */}
              <div className="p-4 bg-[#0F172A] text-white rounded-2xl flex items-center justify-between border border-slate-800">
                <div>
                  <p className="font-bold text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Student Resume ({selectedStudent.resumeName || 'Rahul_Sharma_Resume.pdf'})
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF Document • Uploaded & Verified</p>
                </div>
                <a
                  href={selectedStudent.resumeUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Opening candidate resume in preview mode...', 'info');
                  }}
                  className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview Resume
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60">
                <button
                  onClick={() => {
                    updateApplicationStatus(activeAppModal.id, 'Rejected', 'Candidate did not meet criteria.');
                    setActiveAppModal(null);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold rounded-xl transition-colors text-xs"
                >
                  Reject Candidate
                </button>

                <button
                  onClick={() => {
                    updateApplicationStatus(activeAppModal.id, 'Shortlisted', 'Shortlisted by Recruiter');
                    setActiveAppModal(null);
                  }}
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" /> Shortlist Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
