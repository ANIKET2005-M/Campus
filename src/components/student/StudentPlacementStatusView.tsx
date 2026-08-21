import React from 'react';
import { 
  Award, 
  Building2, 
  CheckCircle2, 
  Download, 
  Calendar, 
  DollarSign, 
  FileText,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentPlacementStatusView: React.FC = () => {
  const { currentStudent, placementRecords, showToast } = useApp();

  if (!currentStudent) return null;

  const myPlacementRecord = placementRecords.find(pr => pr.studentId === currentStudent.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">University Placement Status Record</h2>
        <p className="text-xs text-slate-500">Official verification and job offer letter repository</p>
      </div>

      {currentStudent.placementStatus === 'Placed' && myPlacementRecord ? (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
            <Award className="w-64 h-64" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Official Campus Selection
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight">
              Congratulations, {currentStudent.fullName}! 🎉
            </h2>

            <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
              You have been successfully selected during Campus Recruitment Season 2026. Your placement record is logged in the university central registry.
            </p>

            {/* Offer Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs">
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Recruiter Company</span>
                <strong className="text-white text-sm font-bold">{myPlacementRecord.companyName}</strong>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Designation</span>
                <strong className="text-white text-sm font-bold">{myPlacementRecord.jobTitle}</strong>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Offered Package</span>
                <strong className="text-emerald-300 text-sm font-extrabold">{myPlacementRecord.packageOffered}</strong>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Tentative Joining</span>
                <strong className="text-white text-sm font-bold">{myPlacementRecord.joiningDate}</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => showToast('Downloading Official Offer Letter PDF...', 'success')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" /> Download Official Offer Letter (PDF)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Status: In Recruitment Process</h3>
          <p className="text-xs max-w-md mx-auto">
            You are actively participating in campus placement drives. Once selected by a company, your verified placement certificate and offer letter will generate here.
          </p>
        </div>
      )}
    </div>
  );
};
