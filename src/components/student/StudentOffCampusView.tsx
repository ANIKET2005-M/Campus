import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ExternalLink,
  Bookmark,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Building2,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Job, StudentProfile } from '../../types';
import { checkEligibility } from '../../utils/eligibility';
import { Modal } from '../common/Modal';
import { JobDetailsPopup } from './JobDetailsPopup';
import { CompanyLogo } from '../common/CompanyLogo';

interface StudentOffCampusViewProps {
  setActiveTab: (tab: string) => void;
}

export const StudentOffCampusView: React.FC<StudentOffCampusViewProps> = ({ setActiveTab }) => {
  const { jobs, currentStudent, saveJob, unsaveJob } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceTab, setSelectedSourceTab] = useState<'All' | 'LinkedIn' | 'Naukri' | 'Indeed'>('All');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'date'>('match');

  // Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter Off-Campus Jobs
  const offCampusJobs = useMemo(() => {
    return jobs.filter(j => j.isOffCampus === true);
  }, [jobs]);

  // Skills matching helper
  const getMatchPercentage = (studentSkills: string[], jobSkills: string[]): number => {
    if (!jobSkills || jobSkills.length === 0) return 100;
    if (!studentSkills || studentSkills.length === 0) return 0;
    const sSkills = studentSkills.map(s => s.toLowerCase());
    const matches = jobSkills.filter(js => 
      sSkills.some(ss => ss.includes(js.toLowerCase()) || js.toLowerCase().includes(ss))
    );
    return Math.round((matches.length / jobSkills.length) * 100);
  };

  // Process & filter jobs list
  const filteredJobs = useMemo(() => {
    let result = [...offCampusJobs];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        (j.companyName && j.companyName.toLowerCase().includes(q)) || 
        (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Source pill tab
    if (selectedSourceTab !== 'All') {
      result = result.filter(j => j.source === selectedSourceTab);
    }

    // Source sidebar checklist
    if (selectedSources.length > 0) {
      result = result.filter(j => j.source && selectedSources.includes(j.source));
    }

    // Experience sidebar checklist
    if (selectedExperiences.length > 0) {
      result = result.filter(j => j.experienceRequired && selectedExperiences.includes(j.experienceRequired));
    }

    // Job Type sidebar checklist
    if (selectedJobTypes.length > 0) {
      result = result.filter(j => selectedJobTypes.includes(j.jobType));
    }

    // Sorting
    if (sortBy === 'match' && currentStudent) {
      result.sort((a, b) => {
        const matchA = getMatchPercentage(currentStudent.skills, a.requiredSkills);
        const matchB = getMatchPercentage(currentStudent.skills, b.requiredSkills);
        return matchB - matchA;
      });
    } else if (sortBy === 'salary') {
      result.sort((a, b) => (b.numericPackageLpa || 0) - (a.numericPackageLpa || 0));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [offCampusJobs, searchQuery, selectedSourceTab, selectedSources, selectedExperiences, selectedJobTypes, sortBy, currentStudent]);

  // Donut chart stats
  const sourceStats = useMemo(() => {
    const total = offCampusJobs.length || 1;
    const linkedin = offCampusJobs.filter(j => j.source === 'LinkedIn').length;
    const naukri = offCampusJobs.filter(j => j.source === 'Naukri').length;
    const indeed = offCampusJobs.filter(j => j.source === 'Indeed').length;
    const others = offCampusJobs.length - (linkedin + naukri + indeed);

    return {
      total,
      linkedin: { count: linkedin, pct: Math.round((linkedin / total) * 100) },
      naukri: { count: naukri, pct: Math.round((naukri / total) * 100) },
      indeed: { count: indeed, pct: Math.round((indeed / total) * 100) },
      others: { count: others, pct: Math.round((others / total) * 100) }
    };
  }, [offCampusJobs]);

  // High-match recommendations (match > 80% and student is eligible)
  const recommendations = useMemo(() => {
    if (!currentStudent) return [];
    return offCampusJobs
      .map(j => ({
        job: j,
        matchPct: getMatchPercentage(currentStudent.skills, j.requiredSkills),
        eligibility: checkEligibility(currentStudent, j.eligibility)
      }))
      .filter(item => item.matchPct >= 80)
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 3);
  }, [offCampusJobs, currentStudent]);

  // Handle save toggle
  const handleSaveToggle = (jobId: string, isSaved: boolean) => {
    if (isSaved) {
      unsaveJob(jobId);
    } else {
      saveJob(jobId);
    }
  };

  // Donut chart stroke calculations
  const radius = 35;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * radius; // ~219.9

  const lArc = (sourceStats.linkedin.pct / 100) * circ;
  const nArc = (sourceStats.naukri.pct / 100) * circ;
  const iArc = (sourceStats.indeed.pct / 100) * circ;
  const oArc = (sourceStats.others.pct / 100) * circ;

  const lOffset = 0;
  const nOffset = -lArc;
  const iOffset = -(lArc + nArc);
  const oOffset = -(lArc + nArc + iArc);

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#FAFBFD]">
      {/* Search Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Off-Campus Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover and apply to vetted external positions across LinkedIn, Naukri, Indeed, and more.
          </p>
        </div>

        {/* Source Pills Navigation */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {(['All', 'LinkedIn', 'Naukri', 'Indeed'] as const).map(pill => (
            <button
              key={pill}
              onClick={() => setSelectedSourceTab(pill)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSourceTab === pill 
                  ? 'bg-[#0F172A] text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT COLUMN: Filters Panel */}
        <aside className="w-64 border-r border-slate-200 bg-white overflow-y-auto p-6 hidden md:flex flex-col gap-6 shrink-0 custom-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters
            </h2>
            {(selectedSources.length > 0 || selectedExperiences.length > 0 || selectedJobTypes.length > 0) && (
              <button 
                onClick={() => {
                  setSelectedSources([]);
                  setSelectedExperiences([]);
                  setSelectedJobTypes([]);
                }}
                className="text-[10px] font-bold text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sources Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-3">Job Source</h3>
            <div className="space-y-2.5">
              {['LinkedIn', 'Naukri', 'Indeed'].map(src => {
                const checked = selectedSources.includes(src);
                return (
                  <label key={src} className="flex items-center gap-2.5 text-xs text-slate-655 font-medium cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSources([...selectedSources, src]);
                        else setSelectedSources(selectedSources.filter(s => s !== src));
                      }}
                      className="w-4 h-4 rounded-md border-slate-350 text-[#10B981] focus:ring-[#10B981]"
                    />
                    {src}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-3">Experience</h3>
            <div className="space-y-2.5">
              {['Fresher', '0-1 Yrs', '0-2 Yrs', '1-3 Years'].map(exp => {
                const checked = selectedExperiences.includes(exp);
                return (
                  <label key={exp} className="flex items-center gap-2.5 text-xs text-slate-655 font-medium cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedExperiences([...selectedExperiences, exp]);
                        else setSelectedExperiences(selectedExperiences.filter(s => s !== exp));
                      }}
                      className="w-4 h-4 rounded-md border-slate-350 text-[#10B981] focus:ring-[#10B981]"
                    />
                    {exp}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Job Type Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-3">Job Type</h3>
            <div className="space-y-2.5">
              {['Full-time', 'Internship'].map(type => {
                const checked = selectedJobTypes.includes(type);
                return (
                  <label key={type} className="flex items-center gap-2.5 text-xs text-slate-655 font-medium cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedJobTypes([...selectedJobTypes, type]);
                        else setSelectedJobTypes(selectedJobTypes.filter(s => s !== type));
                      }}
                      className="w-4 h-4 rounded-md border-slate-350 text-[#10B981] focus:ring-[#10B981]"
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Job Cards Grid */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">
          {/* Search bar & count */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search job roles, companies, or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#10B981] transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">
                {filteredJobs.length} Positions Available
              </span>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer pr-5"
                >
                  <option value="match">Match Score</option>
                  <option value="salary">Salary (LPA)</option>
                  <option value="date">Date Posted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs list */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No jobs match your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your search terms or clearing filters in the sidebar panel.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredJobs.map((job) => {
                const isSaved = currentStudent ? job.savedByStudentIds?.includes(currentStudent.id) : false;
                const matchPct = currentStudent ? getMatchPercentage(currentStudent.skills, job.requiredSkills) : 0;
                
                return (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-350 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xs group"
                  >
                    {/* Job Branding & Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <CompanyLogo 
                        src={job.companyLogo} 
                        name={job.companyName} 
                        className="w-12 h-12 rounded-xl border border-slate-200 flex-shrink-0 bg-slate-50"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 
                            onClick={() => setSelectedJob(job)}
                            className="text-sm font-bold text-slate-900 hover:text-[#10B981] cursor-pointer line-clamp-1"
                          >
                            {job.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            job.source === 'LinkedIn' ? 'bg-[#10B981]/10 text-[#047857] border-[#10B981]/20' :
                            job.source === 'Naukri' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            'bg-cyan-50 text-cyan-700 border-cyan-100'
                          }`}>
                            {job.source}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.companyName}
                        </p>

                        {/* Badges/Tags Row */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" /> {job.jobType}
                          </span>
                          <span className="flex items-center gap-1 text-[#10B981]">
                            💰 {job.salaryPackage}
                          </span>
                          {job.experienceRequired && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[9px] text-slate-600 border border-slate-200">
                              🎓 {job.experienceRequired}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Match percentage, Save & Apply */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Match percentage meter */}
                      {currentStudent && (
                        <div className="text-left md:text-right shrink-0">
                          <div className="flex items-center gap-1.5 md:justify-end">
                            <span className={`w-2 h-2 rounded-full ${
                              matchPct >= 80 ? 'bg-emerald-500' : matchPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <span className={`text-xs font-black ${
                              matchPct >= 80 ? 'text-[#10B981]' : matchPct >= 50 ? 'text-amber-600' : 'text-red-500'
                            }`}>
                              {matchPct}% Match
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                            Smart Match Profile
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* Bookmark Button */}
                        <button
                          onClick={() => handleSaveToggle(job.id, !!isSaved)}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isSaved 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                          }`}
                          title={isSaved ? "Saved" : "Save Job"}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                        </button>

                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                        >
                          Details
                        </button>

                        <a
                          href={job.originalJobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-slate-900/5 hover:shadow-slate-950/10 group-hover:bg-[#10B981] group-hover:hover:bg-[#059669] group-hover:shadow-emerald-500/10"
                        >
                          Apply <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Sidebar stats & recommendations */}
        <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto p-6 hidden lg:flex flex-col gap-6 shrink-0 custom-scrollbar">
          {/* About widget */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
            <BookOpen className="w-6 h-6 text-[#10B981] mb-3" />
            <h3 className="text-sm font-extrabold text-white">About Off-Campus Opportunities</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
              NextOffer screens external job boards daily to pull verified entry-level roles. Application details are synchronized directly with your Resume Analyzer for immediate eligibility scoring.
            </p>
          </div>

          {/* Sources breakdown Donut Chart */}
          <div className="bg-[#FAFBFD] rounded-2xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-3 border-b border-slate-200/50 pb-2 uppercase tracking-wider text-[10px]">
              Opportunity Sources Split
            </h3>
            
            <div className="flex items-center justify-between gap-4">
              {/* SVG Donut */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth={strokeWidth} />
                  
                  {/* LinkedIn ring segment */}
                  {lArc > 0 && (
                    <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#10B981" strokeWidth={strokeWidth}
                      strokeDasharray={`${lArc} ${circ}`} strokeDashoffset={lOffset} strokeLinecap="round" />
                  )}
                  {/* Naukri ring segment */}
                  {nArc > 0 && (
                    <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#4F46E5" strokeWidth={strokeWidth}
                      strokeDasharray={`${nArc} ${circ}`} strokeDashoffset={nOffset} strokeLinecap="round" />
                  )}
                  {/* Indeed ring segment */}
                  {iArc > 0 && (
                    <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#06B6D4" strokeWidth={strokeWidth}
                      strokeDasharray={`${iArc} ${circ}`} strokeDashoffset={iOffset} strokeLinecap="round" />
                  )}
                  {/* Others ring segment */}
                  {oArc > 0 && (
                    <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#F59E0B" strokeWidth={strokeWidth}
                      strokeDasharray={`${oArc} ${circ}`} strokeDashoffset={oOffset} strokeLinecap="round" />
                  )}
                </svg>
                {/* Center total */}
                <div className="absolute text-center">
                  <span className="text-sm font-black text-slate-900 block">{sourceStats.total}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">Jobs</span>
                </div>
              </div>

              {/* Legend checklist */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-655">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> LinkedIn</span>
                  <span>{sourceStats.linkedin.pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-655">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" /> Naukri</span>
                  <span>{sourceStats.naukri.pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-655">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Indeed</span>
                  <span>{sourceStats.indeed.pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-655">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Others</span>
                  <span>{sourceStats.others.pct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Opportunities widget */}
          {currentStudent && recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0F172A] border-b border-slate-200/50 pb-2 uppercase tracking-wider text-[10px]">
                Recommended For You
              </h3>
              
              <div className="flex flex-col gap-3">
                {recommendations.map(({ job, matchPct }) => (
                  <div 
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-350 cursor-pointer transition-all flex items-start gap-3 shadow-2xs group/rec"
                  >
                    <CompanyLogo 
                      src={job.companyLogo} 
                      name={job.companyName} 
                      className="w-9 h-9 rounded-lg border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover/rec:text-[#10B981] truncate">{job.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{job.companyName}</p>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px] text-slate-600 font-bold">💰 {job.salaryPackage}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-[#10B981] text-[9px] font-black rounded-full">
                          {matchPct}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* JOB DETAILS MODAL */}
      <JobDetailsPopup 
        job={selectedJob}
        student={currentStudent}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onSaveToggle={(isSaved) => selectedJob && handleSaveToggle(selectedJob.id, isSaved)}
        matchPercentage={selectedJob && currentStudent ? getMatchPercentage(currentStudent.skills, selectedJob.requiredSkills) : 0}
      />
    </div>
  );
};
