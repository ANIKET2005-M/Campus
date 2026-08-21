import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  DollarSign, 
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const AdminResultsView: React.FC = () => {
  const { applications, markFinalSelection, studentProfiles, jobs } = useApp();

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [pkg, setPkg] = useState('12.0 LPA');
  const [joiningDate, setJoiningDate] = useState('2026-07-01');

  const handleConfirmSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    markFinalSelection(selectedAppId, pkg, joiningDate);
    setIsSelectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Final Recruitment Results & Offer Issuance</h2>
          <p className="text-xs text-slate-500">Record final selection decisions and automatically issue verified placement offers</p>
        </div>

        <button
          onClick={() => setIsSelectModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Award className="w-4 h-4" /> Issue Offer & Log Placement
        </button>
      </div>

      {/* Applications list in evaluation or selected */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Company Drive</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Current Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{app.studentName}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">{app.companyName}</td>
                  <td className="px-4 py-3 text-slate-800">{app.jobTitle}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'Selected' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {app.status !== 'Selected' && (
                      <button
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setIsSelectModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                      >
                        Mark Selected
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mark Selection */}
      <Modal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Confirm Candidate Selection"
        subtitle="Generates verified placement record and updates student status to Placed"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmSelection} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Active Application *</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">-- Choose Candidate --</option>
              {applications.filter(a => a.status !== 'Selected').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.studentName} → {a.companyName} ({a.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Offered Salary Package</label>
              <input
                type="text"
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
                placeholder="12.0 LPA"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm mt-3"
          >
            Confirm & Create Placement Record
          </button>
        </form>
      </Modal>
    </div>
  );
};
