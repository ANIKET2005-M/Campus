import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User as UserIcon, 
  Building2, 
  CheckCircle2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentInterviewsView: React.FC = () => {
  const { currentStudent, interviews, showToast } = useApp();

  if (!currentStudent) return null;

  const myInterviews = interviews.filter(i => i.studentId === currentStudent.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Scheduled Interview Sessions</h2>
          <p className="text-xs text-slate-500">View upcoming evaluation rounds, meeting links, and interviewer guidance</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
          {myInterviews.length} Scheduled
        </span>
      </div>

      {myInterviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Calendar className="w-12 h-12 text-slate-350 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Interviews Scheduled Right Now</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-450">
            When recruiters shortlist your application for technical or HR rounds, scheduled slots will appear here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {myInterviews.map((int) => (
            <div key={int.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 rounded-full text-[10px] font-bold">
                      {int.round} Round
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2.5">{int.jobTitle}</h3>
                    <p className="text-xs font-semibold text-slate-450 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {int.companyName}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-250 rounded text-[10px] font-bold">
                    {int.status}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Date: <strong className="text-slate-800">{int.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Time Slot: <strong className="text-slate-800">{int.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Venue: <strong className="text-slate-800">{int.venue}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Interviewer: <strong className="text-slate-800">{int.interviewer}</strong></span>
                  </div>
                </div>

                {int.notes && (
                  <div className="p-3 bg-emerald-550/5 border border-emerald-500/10 rounded-xl text-xs text-slate-800">
                    <span className="font-bold text-[#10B981] block mb-0.5">Preparation Notes:</span>
                    <p className="text-slate-550 leading-relaxed">{int.notes}</p>
                  </div>
                )}
              </div>

              {int.meetingLink && (
                <a
                  href={int.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <Video className="w-4 h-4" /> Join Virtual Meeting Room <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
