import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  Filter, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatusBadge } from '../common/Badge';

export const AdminApplicationsView: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Master Application Ledger</h2>
          <p className="text-xs text-slate-500">Monitor all student applications across registered enterprise placement drives</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
          {filteredApps.length} Submissions Logged
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, company, or job role..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
          >
            <option value="All">All Application Stages</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Selected">Selected / Placed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Job Designation</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Submitted Date</th>
                <th className="px-4 py-3.5">Current Stage</th>
                <th className="px-4 py-3.5 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{app.studentName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{app.jobTitle}</td>
                  <td className="px-4 py-3 font-medium text-indigo-600">{app.companyName}</td>
                  <td className="px-4 py-3 text-slate-500">{app.appliedDate}</td>
                  <td className="px-4 py-3">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => updateApplicationStatus(app.id, e.target.value as any, 'Updated by Placement Officer')}
                      className="px-2 py-1 rounded border border-slate-300 bg-white text-[11px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlist</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Technical Interview">Tech Interview</option>
                      <option value="HR Interview">HR Interview</option>
                      <option value="Selected">Select Candidate</option>
                      <option value="Rejected">Reject</option>
                    </select>
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
