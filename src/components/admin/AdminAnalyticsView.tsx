import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, Users, Award, Building2, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsView: React.FC = () => {
  const { studentProfiles, placementRecords, companies, jobs } = useApp();

  // Dept distribution
  const deptMap: Record<string, { total: number; placed: number }> = {};
  studentProfiles.forEach(s => {
    if (!deptMap[s.department]) deptMap[s.department] = { total: 0, placed: 0 };
    deptMap[s.department].total += 1;
    if (s.placementStatus === 'Placed') deptMap[s.department].placed += 1;
  });

  const deptData = Object.keys(deptMap).map(d => ({
    department: d,
    Enrolled: deptMap[d].total,
    Placed: deptMap[d].placed,
    PlacementRate: Math.round((deptMap[d].placed / (deptMap[d].total || 1)) * 100)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">Placement Intelligence & Analytics</h2>
        <p className="text-xs text-slate-500">Comprehensive recruitment metrics, department comparisons, and package analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Dept Placement Rate Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Department-Wise Placement Success Rate (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="PlacementRate" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Candidates vs Placed Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Enrolled Candidates vs Placed Count</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="Enrolled" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
