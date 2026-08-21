import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Download, 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadCSV } from '../../utils/export';

export const AdminPlacementRecordsView: React.FC = () => {
  const { placementRecords, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = placementRecords.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Department', 'Company', 'Designation', 'Package LPA', 'Joining Date', 'Placement Year', 'Offer Status'];
    const rows = filteredRecords.map(r => [
      r.studentName,
      r.department,
      r.companyName,
      r.jobTitle,
      r.packageOffered,
      r.joiningDate,
      r.placementYear,
      r.offerStatus
    ]);

    downloadCSV('Next_Offer_Placement_Records_2026.csv', headers, rows);
    showToast('Exported placement records to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Official Campus Placement Registry</h2>
          <p className="text-xs text-slate-500">Verified database of student job offers, designations, and salary packages</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Registry (CSV)
        </button>
      </div>

      {/* Filter search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, company name, designation..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Placement Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5">Placed Student</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Recruiter Company</th>
                <th className="px-4 py-3.5">Designation Role</th>
                <th className="px-4 py-3.5">Salary Package</th>
                <th className="px-4 py-3.5">Tentative Joining</th>
                <th className="px-4 py-3.5 text-right">Offer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{rec.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">{rec.department}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">{rec.companyName}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{rec.jobTitle}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{rec.packageOffered}</td>
                  <td className="px-4 py-3 text-slate-500">{rec.joiningDate}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {rec.offerStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
