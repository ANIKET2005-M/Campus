import React from 'react';
import { 
  FileText, 
  Download, 
  Users, 
  Building2, 
  GraduationCap, 
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadCSV } from '../../utils/export';

export const AdminReportsView: React.FC = () => {
  const { studentProfiles, companies, jobs, placementRecords, showToast } = useApp();

  const handleExportStudentReport = () => {
    const headers = ['Registration No', 'Full Name', 'Email', 'Course', 'Department', 'CGPA', 'Backlogs', 'Placement Status'];
    const rows = studentProfiles.map(s => [
      s.registrationNumber,
      s.fullName,
      s.email,
      s.course,
      s.department,
      s.cgpa,
      s.backlogs,
      s.placementStatus
    ]);
    downloadCSV('Student_Placement_Report_2026.csv', headers, rows);
    showToast('Exported Student Placement Report to CSV', 'success');
  };

  const handleExportCompanyReport = () => {
    const headers = ['Company Name', 'Industry', 'Status', 'Recruiter Name', 'Email', 'Location'];
    const rows = companies.map(c => [
      c.name,
      c.industry,
      c.status,
      c.recruiterName,
      c.recruiterEmail,
      c.location
    ]);
    downloadCSV('Company_Recruiter_Report_2026.csv', headers, rows);
    showToast('Exported Company Recruiter Report to CSV', 'success');
  };

  const handleExportDriveReport = () => {
    const headers = ['Job Title', 'Company', 'Salary Package', 'Vacancies', 'Deadline', 'Status', 'Min CGPA'];
    const rows = jobs.map(j => [
      j.title,
      j.companyName,
      j.salaryPackage,
      j.vacancies,
      j.applicationDeadline,
      j.status,
      j.eligibility.minCgpa
    ]);
    downloadCSV('Placement_Drive_Report_2026.csv', headers, rows);
    showToast('Exported Placement Drive Report to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">Placement Report Generation Hub</h2>
        <p className="text-xs text-slate-500">Generate, view, and export institutional recruitment statistics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Card 1: Student Placement Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Comprehensive Student Master Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export complete academic profiles, CGPA records, backlog statuses, and individual placement outcomes for all registered final year candidates.
            </p>
          </div>

          <button
            onClick={handleExportStudentReport}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Student Report (CSV)
          </button>
        </div>

        {/* Card 2: Company Participation Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Enterprise Recruiter Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate detailed logs of participating companies, verification statuses, recruiter contact points, and hiring volumes.
            </p>
          </div>

          <button
            onClick={handleExportCompanyReport}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Company Report (CSV)
          </button>
        </div>

        {/* Card 3: Placement Drive Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Placement Drive Performance Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export all active and completed campus recruitment drives along with eligibility cutoffs, vacancies, and application deadlines.
            </p>
          </div>

          <button
            onClick={handleExportDriveReport}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Drive Report (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
