import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Building2, 
  User, 
  MapPin, 
  Video, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const AdminInterviewsView: React.FC = () => {
  const { interviews, scheduleInterview, studentProfiles, jobs, companies } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [studentId, setStudentId] = useState(studentProfiles[0]?.id || '');
  const [jobId, setJobId] = useState(jobs[0]?.id || '');
  const [round, setRound] = useState<'Aptitude' | 'Coding' | 'Technical' | 'HR' | 'Final'>('Technical');
  const [date, setDate] = useState('2026-09-01');
  const [time, setTime] = useState('11:00 AM');
  const [venue, setVenue] = useState('Virtual Room A');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [interviewer, setInterviewer] = useState('Senior Tech Panel');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const std = studentProfiles.find(s => s.id === studentId);
    const jb = jobs.find(j => j.id === jobId);

    if (!std || !jb) return;

    scheduleInterview({
      jobId: jb.id,
      jobTitle: jb.title,
      companyId: jb.companyId,
      companyName: jb.companyName,
      studentId: std.id,
      studentName: std.fullName,
      round,
      date,
      time,
      venue,
      meetingLink,
      interviewer,
      status: 'Scheduled',
      notes: 'Please bring original identity documents and portfolio links.'
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Campus Interview Schedule Ledger</h2>
          <p className="text-xs text-slate-500">Coordinate technical and HR evaluation rounds across participating recruiters</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Schedule Interview Session
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {interviews.map((int) => (
          <div key={int.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold">
                  {int.round} Round
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{int.studentName}</h3>
                <p className="text-xs text-indigo-600 font-medium">{int.jobTitle} ({int.companyName})</p>
              </div>

              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded">
                {int.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{int.date} at {int.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{int.venue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Interviewer: {int.interviewer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Evaluation Round"
        subtitle="Set date, time slot, and interviewer details for candidate evaluation"
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Candidate *</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              {studentProfiles.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.registrationNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Placement Job Drive *</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} - {j.companyName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Evaluation Round</label>
              <select value={round} onChange={(e) => setRound(e.target.value as any)} className="w-full px-2 py-1.5 border rounded-lg bg-white">
                <option value="Aptitude">Aptitude Test</option>
                <option value="Coding">Coding Round</option>
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
                <option value="Final">Final Round</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Time Slot</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="11:00 AM" className="w-full px-2 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Venue / Room</label>
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Virtual Room A / Lab 3" className="w-full px-2 py-1.5 border rounded-lg" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm mt-2"
          >
            Confirm Interview Slot
          </button>
        </form>
      </Modal>
    </div>
  );
};
