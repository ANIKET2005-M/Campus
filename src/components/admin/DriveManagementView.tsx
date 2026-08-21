import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkEligibility } from '../../utils/eligibility';
import { Modal } from '../common/Modal';
import { CompanyLogo } from '../common/CompanyLogo';

export const DriveManagementView: React.FC = () => {
  const { jobs, addJob, companies, studentProfiles } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for Drive Creation
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [salaryPackage, setSalaryPackage] = useState('10.5 LPA');
  const [vacancies, setVacancies] = useState('15');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [skillsStr, setSkillsStr] = useState('Java, Spring Boot, SQL');

  // Eligibility criteria form states
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [minTenth, setMinTenth] = useState('60.0');
  const [minTwelfth, setMinTwelfth] = useState('60.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['BCA', 'B.Tech']);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Computer Science', 'Information Technology']);

  // Calculate live eligible students for preview
  const liveEligibilityCriteria = {
    minCgpa: parseFloat(minCgpa) || 0,
    min10thPercent: parseFloat(minTenth) || 0,
    min12thPercent: parseFloat(minTwelfth) || 0,
    maxBacklogs: parseInt(maxBacklogs) || 0,
    eligibleCourses: selectedCourses,
    eligibleDepartments: selectedDepts,
    graduationYear: 2026,
    requiredSkills: skillsStr.split(',').map(s => s.trim()).filter(Boolean)
  };

  const eligibleCount = studentProfiles.filter(std => 
    checkEligibility(std, liveEligibilityCriteria).isEligible
  ).length;

  const ineligibleCount = studentProfiles.length - eligibleCount;

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyId) return;

    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;

    addJob({
      companyId: comp.id,
      companyName: comp.name,
      companyLogo: comp.logo,
      title,
      description,
      responsibilities: ['Architect scalable services', 'Collaborate with cross-functional teams'],
      location,
      salaryPackage,
      numericPackageLpa: parseFloat(salaryPackage) || 10,
      vacancies: parseInt(vacancies) || 5,
      applicationDeadline: deadline,
      status: 'Open',
      jobType: 'Full-time',
      eligibility: liveEligibilityCriteria,
      requiredSkills: liveEligibilityCriteria.requiredSkills
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const toggleCourse = (course: string) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter(c => c !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Campus Placement Drive Engine</h2>
          <p className="text-xs text-slate-500">Define eligibility criteria, calculate eligible student pools, and publish drives</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Launch New Placement Drive
        </button>
      </div>

      {/* Drives Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {jobs.map((job) => {
          const eligibleStudents = studentProfiles.filter(s => checkEligibility(s, job.eligibility).isEligible);

          return (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    src={job.companyLogo}
                    name={job.companyName}
                    className="w-12 h-12 rounded-xl border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{job.companyName}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {job.status}
                </span>
              </div>

              {/* Rules summary box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>CGPA &gt;= {job.eligibility.minCgpa}</span>
                  <span>Backlogs &lt;= {job.eligibility.maxBacklogs}</span>
                  <span>10th/12th &gt;= {job.eligibility.minCgpa * 8}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.eligibility.eligibleDepartments.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-600 font-medium rounded">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> 
                  <strong className="text-slate-900">{eligibleStudents.length}</strong> Students Eligible
                </span>
                <span className="text-red-600 font-bold">Deadline: {job.applicationDeadline}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Drive Creation */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch Campus Placement Drive"
        subtitle="Configure job specifications and automated eligibility filters"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Recruiter Company *</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Job Designation *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Salary Package</label>
              <input
                type="text"
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                placeholder="10.5 LPA"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Vacancies</label>
              <input
                type="number"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Required Tech Skills (comma separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="Java, React, SQL, AWS"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
            />
          </div>

          {/* Eligibility Rules Engine Box */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Automated Eligibility Filters
              </h4>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  {eligibleCount} Students Eligible
                </span>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                  {ineligibleCount} Ineligible
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Min 10th %</label>
                <input
                  type="number"
                  value={minTenth}
                  onChange={(e) => setMinTenth(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Min 12th %</label>
                <input
                  type="number"
                  value={minTwelfth}
                  onChange={(e) => setMinTwelfth(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Max Backlogs</label>
                <input
                  type="number"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Eligible Departments</label>
              <div className="flex flex-wrap gap-2">
                {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'].map((dept) => (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => toggleDept(dept)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                      selectedDepts.includes(dept)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md"
          >
            Publish Placement Drive
          </button>
        </form>
      </Modal>
    </div>
  );
};
