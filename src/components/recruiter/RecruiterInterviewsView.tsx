import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Plus, 
  Search, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecruiterInterviewsView: React.FC = () => {
  const { 
    currentUser, 
    companies, 
    jobs, 
    applications, 
    interviews, 
    scheduleInterview, 
    showToast 
  } = useApp();

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];
  const myInterviews = interviews.filter(i => i.companyName === myCompany?.name);
  const myApplications = applications.filter(a => a.companyId === myCompany?.id && a.status !== 'Rejected');
  const myJobs = jobs.filter(j => j.companyId === myCompany?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [round, setRound] = useState<'Aptitude' | 'Coding' | 'Technical' | 'HR' | 'Final'>('Technical');
  const [date, setDate] = useState('2026-09-15');
  const [time, setTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('Placement Cell Block B - Room 302');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [interviewer, setInterviewer] = useState('Dr. S. K. Roy & Senior Tech Lead');
  const [notes, setNotes] = useState('Candidate should bring laptop with Node.js and IDE installed.');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = myApplications.find(a => a.id === selectedAppId) || myApplications[0];
    if (!app) {
      showToast('Please select a candidate to schedule an interview.', 'error');
      return;
    }

    scheduleInterview({
      applicationId: app.id,
      jobId: app.jobId,
      studentId: app.studentId,
      studentName: app.studentName,
      companyName: myCompany.name,
      jobTitle: app.jobTitle,
      round,
      date,
      time,
      venue,
      meetingLink,
      interviewer,
      notes
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Schedule & Manage Interviews</h1>
          <p className="text-xs text-slate-500">Organize technical, coding, and HR interview rounds with candidate calendar notifications</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule New Interview
        </button>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myInterviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No interviews scheduled yet. Click "Schedule New Interview" above to set up candidate interview rounds.
          </div>
        ) : (
          myInterviews.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-indigo-300 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200 uppercase">
                    {item.round} Round
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{item.studentName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{item.jobTitle}</p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Scheduled' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span><strong>{item.date}</strong> at <strong>{item.time}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">{item.venue}</span>
                </div>

                {item.meetingLink && (
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                    <Video className="w-3.5 h-3.5" />
                    <a href={item.meetingLink} target="_blank" rel="noreferrer" className="hover:underline truncate">
                      {item.meetingLink}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interviewer: {item.interviewer}</span>
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                  Note: {item.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Schedule Candidate Interview
                </h2>
                <p className="text-xs text-slate-300">Set date, time, interviewer, and venue details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Candidate *</label>
                <select
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {myApplications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.studentName} ({app.studentRegNo}) - {app.jobTitle} [{app.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={round}
                    onChange={e => setRound(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Aptitude">Aptitude</option>
                    <option value="Coding">Coding</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time *</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    value={interviewer}
                    onChange={e => setInterviewer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Room Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Virtual Meeting Link (optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
