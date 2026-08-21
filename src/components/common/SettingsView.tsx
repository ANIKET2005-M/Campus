import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  User, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Sparkles,
  Database,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { currentUser, activeRole, resetToDefaultData, showToast } = useApp();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [driveAlerts, setDriveAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Notification preferences saved successfully!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System & Account Settings</h1>
        <p className="text-xs text-slate-500">Manage notification preferences, security options, and demo system data</p>
      </div>

      {/* Persona Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" /> Active Session Profile
        </h2>

        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <img 
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
            alt={currentUser?.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <p className="font-bold text-slate-900 text-sm">{currentUser?.name}</p>
            <p className="text-slate-500">{currentUser?.email}</p>
            <span className="inline-block px-2 py-0.5 mt-1 bg-indigo-100 text-indigo-800 font-semibold rounded text-[10px] capitalize">
              Role: {activeRole}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" /> Notification Preferences
        </h2>

        <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900">Email Notifications</span>
              <p className="text-[11px] text-slate-500">Receive email alerts for interview calls & selection results</p>
            </div>
            <input 
              type="checkbox" 
              checked={emailNotifs} 
              onChange={e => setEmailNotifs(e.target.checked)} 
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900">Placement Drive Announcements</span>
              <p className="text-[11px] text-slate-500">Get immediate alerts when new recruiters post job drives</p>
            </div>
            <input 
              type="checkbox" 
              checked={driveAlerts} 
              onChange={e => setDriveAlerts(e.target.checked)} 
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900">Interview Reminders</span>
              <p className="text-[11px] text-slate-500">Receive automated reminders 1 hour before scheduled interviews</p>
            </div>
            <input 
              type="checkbox" 
              checked={interviewReminders} 
              onChange={e => setInterviewReminders(e.target.checked)} 
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Reset System Data */}
      <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600" /> Reset Sample Data
        </h2>
        <p className="text-xs text-slate-600">
          Reset all local modifications (applications, drives, interviews) back to default mock data state.
        </p>

        <button
          onClick={resetToDefaultData}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restore Default Demo Records
        </button>
      </div>
    </div>
  );
};
