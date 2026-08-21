import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Award, 
  Users, 
  Briefcase, 
  Clock 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStage } from '../../types';

interface RecruiterShortlistedViewProps {
  setActiveTab: (tab: string) => void;
}

export const RecruiterShortlistedView: React.FC<RecruiterShortlistedViewProps> = ({ setActiveTab }) => {
  const { currentUser, companies, applications, updateApplicationStatus } = useApp();

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];
  const shortlistedApps = applications.filter(a => 
    a.companyId === myCompany?.id && 
    (a.status === 'Shortlisted' || a.status === 'Assessment' || a.status === 'Technical Interview' || a.status === 'HR Interview')
  );

  const stages: ApplicationStage[] = ['Shortlisted', 'Assessment', 'Technical Interview', 'HR Interview'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Shortlisted Candidates</h1>
          <p className="text-xs text-slate-500">Track candidates progressing through evaluation, assessment, and interview rounds</p>
        </div>

        <button
          onClick={() => setActiveTab('interviews')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" /> Schedule Interview Round
        </button>
      </div>

      {/* Kanban / Pipeline View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageApps = shortlistedApps.filter(a => a.status === stage);
          return (
            <div key={stage} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 min-h-[400px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs">{stage}</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 font-bold text-[10px] border border-slate-200">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageApps.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-[11px]">
                    No candidates in {stage}
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div key={app.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-all">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{app.studentName}</h4>
                        <p className="text-[10px] text-slate-500">{app.studentCourse} ({app.studentDepartment})</p>
                        <p className="text-[10px] font-semibold text-emerald-700">CGPA: {app.studentCgpa}</p>
                      </div>

                      <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-600 font-medium">
                        Drive: {app.jobTitle}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => {
                            if (stage === 'Shortlisted') updateApplicationStatus(app.id, 'Assessment');
                            else if (stage === 'Assessment') updateApplicationStatus(app.id, 'Technical Interview');
                            else if (stage === 'Technical Interview') updateApplicationStatus(app.id, 'HR Interview');
                            else if (stage === 'HR Interview') updateApplicationStatus(app.id, 'Selected');
                          }}
                          className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          Move Next <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
