import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  FileCheck, 
  User, 
  Briefcase 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecruiterResultsView: React.FC = () => {
  const { 
    currentUser, 
    companies, 
    applications, 
    placementRecords, 
    updateApplicationStatus, 
    showToast 
  } = useApp();

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];
  const myApplications = applications.filter(a => a.companyId === myCompany?.id);
  const selectedApps = myApplications.filter(a => a.status === 'Selected');
  const rejectedApps = myApplications.filter(a => a.status === 'Rejected');
  const pendingApps = myApplications.filter(a => a.status !== 'Selected' && a.status !== 'Rejected');

  const [selectedAppId, setSelectedAppId] = useState('');
  const [decision, setDecision] = useState<'Selected' | 'Rejected'>('Selected');
  const [remarks, setRemarks] = useState('Offered role as Software Engineer with CTC 12.5 LPA.');

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      showToast('Please select a candidate.', 'error');
      return;
    }

    updateApplicationStatus(selectedAppId, decision, remarks);
    showToast(`Marked candidate as ${decision}!`, 'success');
    setSelectedAppId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Selection Results & Offer Extension</h1>
          <p className="text-xs text-slate-500">Record final recruitment outcomes, extend job offers, and update official placement logs</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-200">
            {selectedApps.length} Selected Candidates
          </span>
        </div>
      </div>

      {/* Decision Form & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Decision Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" /> Declare Recruitment Outcome
          </h2>

          <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Candidate *</label>
              <select
                value={selectedAppId}
                onChange={e => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Choose Candidate in Pipeline --</option>
                {pendingApps.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.studentName} - {app.jobTitle} [{app.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Final Outcome *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('Selected')}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    decision === 'Selected' 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Selected / Offer
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('Rejected')}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    decision === 'Rejected' 
                      ? 'bg-red-600 text-white border-red-600 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Not Selected
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package Details / Decision Remarks</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Extended offer letter with 12.5 LPA base package. Joining July 2026."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Confirm Outcome & Create Placement Record
            </button>
          </form>
        </div>

        {/* Selected Candidates List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Official Selected Candidates</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Course & Dept</th>
                  <th className="p-3">Job Role</th>
                  <th className="p-3">Package / Remarks</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No candidate offers issued yet. Use the form on the left to confirm selections.
                    </td>
                  </tr>
                ) : (
                  selectedApps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[10px] text-slate-500">{app.studentRegNo}</div>
                      </td>

                      <td className="p-3 text-slate-600">
                        {app.studentCourse} ({app.studentDepartment})
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {app.jobTitle}
                      </td>

                      <td className="p-3 text-slate-600 max-w-xs">
                        {app.remarks || 'Offer extended'}
                      </td>

                      <td className="p-3 text-right">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold rounded-full text-[10px]">
                          Selected
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
