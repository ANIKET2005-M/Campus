import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { 
  Users, 
  Building2, 
  Target, 
  Send, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  DollarSign,
  Plus,
  Sparkles,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { useApp } from '../../context/AppContext';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { studentProfiles, companies, jobs, applications, placementRecords, placementEvents } = useApp();

  // Get upcoming calendar events
  const adminUpcomingEvents = useMemo(() => {
    return (placementEvents || [])
      .filter(event => {
        // Exclude personal student reminders
        if (event.eventType === 'Personal Reminder') return false;
        // Exclude past events (relative to Aug 16, 2026)
        return new Date(event.date) >= new Date('2026-08-16');
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime))
      .slice(0, 4);
  }, [placementEvents]);

  // Metrics
  const totalStudents = studentProfiles.length;
  const totalCompanies = companies.length;
  const activeDrives = jobs.filter(j => j.status === 'Open').length;
  const totalApps = applications.length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Assessment' || a.status === 'Technical Interview' || a.status === 'HR Interview' || a.status === 'Selected').length;
  const placedStudentsCount = studentProfiles.filter(s => s.placementStatus === 'Placed').length;
  const placementRatePercent = totalStudents > 0 ? ((placedStudentsCount / totalStudents) * 100).toFixed(1) : '0.0';

  // Calculate Average Package
  const avgPkgLpa = placementRecords.length > 0 
    ? (placementRecords.reduce((acc, r) => acc + r.numericPackageLpa, 0) / placementRecords.length).toFixed(1)
    : '10.5';

  // Chart Data 1: Placement Rate by Department
  const deptDataMap: Record<string, { total: number; placed: number }> = {};
  studentProfiles.forEach(s => {
    if (!deptDataMap[s.department]) {
      deptDataMap[s.department] = { total: 0, placed: 0 };
    }
    deptDataMap[s.department].total += 1;
    if (s.placementStatus === 'Placed') {
      deptDataMap[s.department].placed += 1;
    }
  });

  const departmentChartData = Object.keys(deptDataMap).map(dept => ({
    name: dept,
    Total: deptDataMap[dept].total,
    Placed: deptDataMap[dept].placed,
    Rate: Math.round((deptDataMap[dept].placed / (deptDataMap[dept].total || 1)) * 100)
  }));

  // Chart Data 2: Applications by Company
  const companyAppMap: Record<string, number> = {};
  applications.forEach(a => {
    companyAppMap[a.companyName] = (companyAppMap[a.companyName] || 0) + 1;
  });

  const companyChartData = Object.keys(companyAppMap).map(comp => ({
    name: comp,
    Applications: companyAppMap[comp]
  }));

  // Chart Data 3: Placement Year Trends
  const yearTrendData = [
    { year: '2023', Placed: 320, Rate: 78 },
    { year: '2024', Placed: 380, Rate: 81 },
    { year: '2025', Placed: 410, Rate: 84 },
    { year: '2026 (Live)', Placed: placedStudentsCount * 15 + 350, Rate: parseFloat(placementRatePercent) }
  ];

  // Chart Data 4: Package Distribution Pie Chart
  const packageDistData = [
    { name: '< 8 LPA', value: 12, color: '#94A3B8' },
    { name: '8 - 12 LPA', value: 28, color: '#10B981' },
    { name: '12 - 16 LPA', value: 18, color: '#0F172A' },
    { name: '> 16 LPA', value: 8, color: '#3B82F6' }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Admin Banner (Navy & Emerald) */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> University Placement Console
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Placement Season 2026 Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time analytics, company listings, audit records, and student placement rates.
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setActiveTab('placement-drives')}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Placement Drive
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Generate Reports
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.04
            }
          }
        }}
      >
        {[
          { tab: 'students', label: 'Total Students', val: totalStudents, sub: 'Batch 2026 Enrolled', color: 'text-slate-900', icon: <Users className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'companies', label: 'Companies Joined', val: totalCompanies, sub: 'Verified Recruiters', color: 'text-slate-900', icon: <Building2 className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'placement-drives', label: 'Active Drives', val: activeDrives, sub: 'Open Campus Jobs', color: 'text-slate-900', icon: <Target className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'applications', label: 'Total Applications', val: totalApps, sub: 'Submitted Logs', color: 'text-slate-900', icon: <Send className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'applications', label: 'Shortlisted Status', val: shortlistedApps, sub: 'Candidates in Review', color: 'text-slate-900', icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'placement-records', label: 'Placed Students', val: placedStudentsCount, sub: 'Confirmed Offers', color: 'text-[#10B981] font-black', icon: <Award className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'dashboard', label: 'Placement Rate', val: parseFloat(placementRatePercent), suffix: '%', decimals: 1, color: 'text-[#10B981]', icon: <TrendingUp className="w-4 h-4 text-[#10B981]" /> },
          { tab: 'dashboard', label: 'Average Package', val: parseFloat(avgPkgLpa), suffix: ' LPA', decimals: 1, color: 'text-slate-900', icon: <DollarSign className="w-4 h-4 text-[#10B981]" /> }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            onClick={() => setActiveTab(item.tab)}
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs hover:border-[#10B981]/30 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
            </div>
            <div>
              <p className={`text-2xl mt-2 tracking-tight leading-none ${item.color}`}>
                <AnimatedCounter to={item.val} decimals={item.decimals ?? 0} />
                {item.suffix}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-1.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart 1: Placement Rate by Department */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Placement by Department</h3>
            <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Total Enrolled vs Placed candidates</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="Total" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Placed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Applications by Company */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Applications</h3>
            <p className="text-[10px] text-slate-455 mt-0.5 font-medium">Total applications per recruiter profile</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="Applications" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Year-wise Placement Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Historical Placement Trend</h3>
            <p className="text-[10px] text-slate-455 mt-0.5 font-medium font-medium">Historical placed count (2023 - 2026)</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Line type="monotone" dataKey="Placed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Salary Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Salary Distribution Tiers</h3>
            <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Breakdown of offered packages package ranges</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {packageDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {packageDistData.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Upcoming Events Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Placement Calendar Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upcoming assessments, drives, and student interviews</p>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors"
          >
            Manage Calendar <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {adminUpcomingEvents.length === 0 ? (
            <div className="col-span-4 text-center py-6 text-slate-400 text-xs italic">
              No upcoming events scheduled.
            </div>
          ) : (
            adminUpcomingEvents.map((event) => {
              const typeColors: Record<string, string> = {
                'Interview': 'bg-emerald-50 text-emerald-700 border-emerald-250',
                'Assessment': 'bg-blue-50 text-blue-700 border-blue-200',
                'Placement Drive': 'bg-purple-50 text-purple-700 border-purple-200',
                'Deadline': 'bg-orange-50 text-orange-700 border-orange-200'
              };
              return (
                <div 
                  key={event.id}
                  onClick={() => setActiveTab('calendar')}
                  className="p-4 rounded-xl border border-slate-150 hover:border-emerald-500/20 bg-slate-50/50 hover:bg-white cursor-pointer transition-all flex flex-col justify-between h-32 hover:shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${typeColors[event.eventType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {event.eventType}
                      </span>
                      {event.approvalStatus === 'Pending' && (
                        <span className="bg-amber-400 w-2 h-2 rounded-full" title="Pending Approval" />
                      )}
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{event.title}</h4>
                    {event.companyName && (
                      <p className="text-[10px] text-slate-500 font-bold">{event.companyName}</p>
                    )}
                  </div>

                  <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-550 max-w-[80px] truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {event.location.split(',')[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
