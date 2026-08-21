import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Briefcase,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkEligibility } from '../../utils/eligibility';
import { JobDetailModal } from './JobDetailModal';
import { Job } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';

export const StudentJobsView: React.FC = () => {
  const { jobs, currentStudent, applications, companies } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [selectedJobModal, setSelectedJobModal] = useState<Job | null>(null);

  if (!currentStudent) return null;

  // Companies list for dropdown filter
  const companyNames = ['All', ...Array.from(new Set(jobs.map(j => j.companyName)))];
  const departmentsList = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    // Exclude off-campus jobs
    if (job.isOffCampus) return false;

    // Admin approval check: hide jobs from non-verified companies
    const companyObj = companies.find(c => c.id === job.companyId || c.name === job.companyName);
    if (companyObj && companyObj.status !== 'Verified') {
      return false;
    }

    // Search match
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    // Company match
    const matchesCompany = selectedCompany === 'All' || job.companyName === selectedCompany;

    // Dept match
    const matchesDept = selectedDepartment === 'All' || 
      !job.eligibility ||
      !job.eligibility.eligibleDepartments ||
      job.eligibility.eligibleDepartments.length === 0 || 
      job.eligibility.eligibleDepartments.includes(selectedDepartment);

    // Eligibility check
    const eligibility = checkEligibility(currentStudent, job.eligibility);
    const matchesEligibleToggle = !onlyEligible || eligibility.isEligible;

    return matchesSearch && matchesCompany && matchesDept && matchesEligibleToggle;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company name, skills (e.g., React, Python)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
            />
          </div>

          {/* Toggle for Only Eligible Opportunities */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shrink-0 select-none transition-colors">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded text-[#10B981] focus:ring-[#10B981] accent-[#10B981] h-4 w-4"
            />
            <span>Show Only Eligible Drives</span>
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-150">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter by Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981]"
            >
              {companyNames.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter by Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981]"
            >
              {departmentsList.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex items-end justify-end py-1">
            <span className="text-xs font-bold text-slate-400">
              Showing <strong className="text-slate-800 font-extrabold">{filteredJobs.length}</strong> placement drive(s)
            </span>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-350 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Placement Drives Found</h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed text-slate-450">
            Try adjusting your search keywords, clearing company filters, or unchecking "Show Only Eligible Drives".
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const eligibility = checkEligibility(currentStudent, job.eligibility);
            const isApplied = applications.some(a => a.jobId === job.id && a.studentId === currentStudent.id);

            return (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs hover:shadow-xs hover:border-emerald-500/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        src={job.companyLogo}
                        name={job.companyName}
                        className="w-11 h-11 rounded-xl border border-slate-150 shrink-0"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                        <p className="text-[10px] text-slate-450 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" /> {job.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Eligibility Pill */}
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

                  <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-550 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Salary Package</span>
                      <strong className="text-slate-800 font-extrabold">{job.salaryPackage}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Location</span>
                      <span className="text-slate-800 font-medium">{job.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Vacancies</span>
                      <span className="text-slate-800 font-medium">{job.vacancies} Openings</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Deadline</span>
                      <span className="text-red-500 font-extrabold">{job.applicationDeadline}</span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedJobModal(job)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Audit Details & Eligibility
                    </button>

                    {isApplied ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedJobModal(job)}
                        className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detail */}
      <JobDetailModal
        job={selectedJobModal}
        isOpen={!!selectedJobModal}
        onClose={() => setSelectedJobModal(null)}
        student={currentStudent}
      />
    </div>
  );
};
