import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import { Modal } from '../common/Modal';
import { CompanyLogo } from '../common/CompanyLogo';

export const CompanyManagementView: React.FC = () => {
  const { companies, addCompany, updateCompanyStatus, jobs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New company state
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Software Services');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPhone, setRecPhone] = useState('');

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recruiterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !recEmail) return;

    addCompany({
      name,
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      industry,
      website: website || 'https://company.example.com',
      location: location || 'Bangalore / Remote',
      description: description || 'Participating recruiter on Next Offer.',
      recruiterName: recName || 'Recruiter Contact',
      recruiterEmail: recEmail,
      recruiterPhone: recPhone || '+91 98765 43210',
      status: 'Verified',
      avgPackage: '12.0 LPA'
    });

    setIsAddModalOpen(false);
    setName('');
    setRecEmail('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enterprise Recruiter & Company Registry</h2>
          <p className="text-xs text-slate-500">Verify company profiles, recruiter contacts, and active campus partnerships</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Enterprise Company
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name, industry, recruiter..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981] font-bold text-slate-700"
          >
            <option value="All">All Verification Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Approval</option>
            <option value="Rejected">Rejected Partner</option>
          </select>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((comp) => {
          const compJobs = jobs.filter(j => j.companyId === comp.id);

          return (
            <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs flex flex-col justify-between space-y-4 hover:border-emerald-500/20 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      src={comp.logo}
                      name={comp.name}
                      className="w-12 h-12 rounded-xl shrink-0"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{comp.name}</h3>
                      <p className="text-[10px] text-[#10B981] font-bold mt-0.5">{comp.industry}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    comp.status === 'Verified' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                      : comp.status === 'Pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {comp.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-550 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{comp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{comp.recruiterName} ({comp.recruiterEmail})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Placement Drives</span>
                  <strong className="text-slate-800 font-extrabold">{compJobs.length} Drives Posted</strong>
                </div>

                {comp.status === 'Pending' ? (
                  <button
                    onClick={() => updateCompanyStatus(comp.id, 'Verified')}
                    className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    Joined {comp.joinedDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Enterprise Recruiter Company"
        subtitle="Add a participating company to host placement drives"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Analytics Systems"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Software / FinTech"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangalore / Remote"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Recruiter Name</label>
              <input
                type="text"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={recEmail}
                onChange={(e) => setRecEmail(e.target.value)}
                placeholder="s.jenkins@company.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#10B981] text-white rounded-xl text-xs font-bold hover:bg-[#059669] shadow-md shadow-emerald-500/10 transition-colors mt-4"
          >
            Verify & Save Company
          </button>
        </form>
      </Modal>
    </div>
  );
};
