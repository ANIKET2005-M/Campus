import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle2, 
  X, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Job, EligibilityCriteria } from '../../types';

interface RecruiterJobsViewProps {
  onOpenCreateModal?: () => void;
}

export const RecruiterJobsView: React.FC<RecruiterJobsViewProps> = () => {
  const { currentUser, companies, jobs, addJob, updateJob, applications, showToast } = useApp();

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];
  const myJobs = jobs.filter(j => j.companyId === myCompany?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [salaryPkg, setSalaryPkg] = useState('12 LPA');
  const [numericPkg, setNumericPkg] = useState(12.0);
  const [location, setLocation] = useState('Bangalore, India');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship' | 'Contract'>('Full-time');
  const [vacancies, setVacancies] = useState(10);
  const [deadline, setDeadline] = useState('2026-09-30');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('Participate in software engineering sprints, write clean maintainable code, collaborate with team members.');
  const [requiredSkills, setRequiredSkills] = useState('Java, Python, Data Structures, SQL');

  // Eligibility
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [min10th, setMin10th] = useState(60.0);
  const [min12th, setMin12th] = useState(60.0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['B.Tech', 'BCA', 'MCA']);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Computer Science', 'Information Technology']);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();

    const eligibility: EligibilityCriteria = {
      minCgpa,
      min10thPercent: min10th,
      min12thPercent: min12th,
      maxBacklogs,
      eligibleCourses: selectedCourses,
      eligibleDepartments: selectedDepts,
      graduationYear: 2026,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    };

    addJob({
      companyId: myCompany.id,
      companyName: myCompany.name,
      companyLogo: myCompany.logo,
      title: jobTitle,
      description,
      responsibilities: responsibilities.split('.').map(s => s.trim()).filter(Boolean),
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      salaryPackage: salaryPkg,
      numericPackageLpa: Number(numericPkg),
      location,
      jobType,
      vacancies: Number(vacancies),
      applicationDeadline: deadline,
      eligibility,
      status: 'Open'
    });

    setIsModalOpen(false);
    // Reset Form
    setJobTitle('');
  };

  const filteredJobs = myJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Placement Job Drives</h1>
          <p className="text-xs text-slate-500">Post new job openings, define eligibility criteria, and manage active drives</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Placement Drive
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives by title or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Job Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No job drives found for current filters. Click "Create Placement Drive" to post a new job.
          </div>
        ) : (
          filteredJobs.map((job) => {
            const driveAppsCount = applications.filter(a => a.jobId === job.id).length;
            const shortlistedCount = applications.filter(a => a.jobId === job.id && a.status === 'Shortlisted').length;

            return (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {job.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{job.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                      {job.salaryPackage}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Eligibility Criteria</p>
                    <p className="text-slate-600">
                      • CGPA ≥ <span className="font-bold text-slate-900">{job.eligibility.minCgpa}</span> | Backlogs ≤ <span className="font-bold text-slate-900">{job.eligibility.maxBacklogs}</span>
                    </p>
                    <p className="text-slate-600 truncate">
                      • Courses: {job.eligibility.eligibleCourses.join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span><strong>{driveAppsCount}</strong> Applicants ({shortlistedCount} Shortlisted)</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> {job.applicationDeadline}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
                        updateJob(job.id, { status: newStatus });
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                        job.status === 'Open' 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {job.status === 'Open' ? 'Close Drive' : 'Reopen Drive'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Job Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" /> Create New Placement Drive
                </h2>
                <p className="text-xs text-slate-300">Define role details and mandatory student eligibility filters</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Basic Role Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">1. Job Role Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Software Engineer"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Salary Package (LPA) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 14 LPA"
                      value={salaryPkg}
                      onChange={e => setSalaryPkg(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore / Hyderabad / Hybrid"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={e => setJobType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vacancies Count</label>
                    <input
                      type="number"
                      value={vacancies}
                      onChange={e => setVacancies(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Technical Skills (comma separated)</label>
                  <input
                    type="text"
                    value={requiredSkills}
                    onChange={e => setRequiredSkills(e.target.value)}
                    placeholder="Java, Python, SQL, React"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide overview of the role, team, and key technical expectations..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Eligibility Criteria Engine Config */}
              <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                <h3 className="font-bold text-slate-900 text-sm border-b border-emerald-200 pb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2. Eligibility Criteria Engine Rules
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={minCgpa}
                      onChange={e => setMinCgpa(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min 10th %</label>
                    <input
                      type="number"
                      step="1"
                      value={min10th}
                      onChange={e => setMin10th(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min 12th %</label>
                    <input
                      type="number"
                      step="1"
                      value={min12th}
                      onChange={e => setMin12th(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Backlogs</label>
                    <input
                      type="number"
                      value={maxBacklogs}
                      onChange={e => setMaxBacklogs(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligible Courses</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['B.Tech', 'BCA', 'MCA', 'M.Tech', 'B.Sc CS'].map(course => (
                      <label key={course} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course)}
                          onChange={e => {
                            if (e.target.checked) setSelectedCourses([...selectedCourses, course]);
                            else setSelectedCourses(selectedCourses.filter(c => c !== course));
                          }}
                          className="rounded text-indigo-600"
                        />
                        {course}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  Publish Placement Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
