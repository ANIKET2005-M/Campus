import React from 'react';
import { 
  Send, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatusBadge } from '../common/Badge';
import { CompanyLogo } from '../common/CompanyLogo';

export const StudentApplicationsView: React.FC = () => {
  const { currentStudent, applications } = useApp();

  if (!currentStudent) return null;

  const myApplications = applications.filter(a => a.studentId === currentStudent.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Application Milestone Tracking</h2>
          <p className="text-xs text-slate-500">Track application stages, assessment feedback, and recruitment status</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 rounded-full text-xs font-bold">
          {myApplications.length} Total Applications
        </span>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Send className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Applications Submitted Yet</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-450">
            Browse available campus placement drives and apply to eligible positions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    src={app.companyLogo}
                    name={app.companyName}
                    className="w-12 h-12 rounded-xl border border-slate-200 shadow-3xs shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                    <p className="text-xs font-semibold text-[#10B981] flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" /> {app.companyName} • Applied on {app.appliedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </div>

              {/* Status Timeline Stepper */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recruitment Stage Progress</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {app.timeline.map((event, idx) => {
                    let statusColor = 'bg-slate-50 text-slate-400 border-slate-200';
                    let icon = <Clock className="w-4 h-4 text-slate-400" />;

                    if (event.status === 'completed') {
                      statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                    } else if (event.status === 'current') {
                      statusColor = 'bg-emerald-500/5 text-[#10B981] border-[#10B981]/40 font-bold ring-2 ring-emerald-500/10';
                      icon = <Clock className="w-4 h-4 text-[#10B981] animate-pulse shrink-0" />;
                    } else if (event.status === 'rejected') {
                      statusColor = 'bg-red-50 text-red-800 border-red-300';
                      icon = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${statusColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase opacity-60">Step 0{idx + 1}</span>
                          {icon}
                        </div>

                        <div>
                          <p className="font-bold text-xs">{event.stage}</p>
                          <p className="text-[10px] opacity-75 mt-0.5">{event.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks/Feedback */}
              {app.remarks && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Recruiter Feedback / Note: </span>
                    <span>{app.remarks}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
