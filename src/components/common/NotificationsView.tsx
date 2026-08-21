import React from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Calendar, 
  Briefcase, 
  Award, 
  ShieldAlert, 
  Info 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationsViewProps {
  setActiveTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ setActiveTab }) => {
  const { notifications, markNotificationRead, clearAllNotifications, currentUser } = useApp();

  const userNotifs = notifications.filter(n => 
    n.userId === 'all' || 
    n.userId === currentUser?.id || 
    n.userId === currentUser?.studentId
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drive': return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'shortlist': return <Award className="w-4 h-4 text-indigo-600" />;
      case 'interview': return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'selection': return <Award className="w-4 h-4 text-purple-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500">Stay informed about application updates, interview schedules, and new drive postings</p>
        </div>

        {userNotifs.some(n => !n.read) && (
          <button
            onClick={clearAllNotifications}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {userNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notifications found.
          </div>
        ) : (
          userNotifs.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.linkTab) setActiveTab(notif.linkTab);
              }}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-slate-50/50' : 'bg-indigo-50/30 hover:bg-indigo-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 mt-0.5">
                  {getTypeIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold ${notif.read ? 'text-slate-900' : 'text-indigo-900'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{notif.date}</span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(notif.id);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
