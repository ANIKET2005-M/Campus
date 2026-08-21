import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Linkedin, 
  Upload, 
  X, 
  AlertTriangle,
  Calendar,
  Eye,
  Info,
  User,
  Trash2,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';

export const RecruiterCompanyProfileView: React.FC = () => {
  const { currentUser, companies, updateCompany, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myCompany = companies.find(c => c.id === currentUser?.companyId) || companies[0];

  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    name: myCompany?.name || '',
    logo: myCompany?.logo || '',
    industry: myCompany?.industry || '',
    website: myCompany?.website || '',
    location: myCompany?.location || '',
    description: myCompany?.description || '',
    recruiterName: myCompany?.recruiterName || '',
    recruiterEmail: myCompany?.recruiterEmail || '',
    recruiterPhone: myCompany?.recruiterPhone || '',
    companySize: myCompany?.companySize || '10001+ Employees',
    linkedIn: myCompany?.linkedIn || '',
    foundedYear: myCompany?.foundedYear || '1968',
    avgPackage: myCompany?.avgPackage || '12.5 LPA'
  });

  // Sync state if myCompany updates from context
  useEffect(() => {
    if (myCompany) {
      setFormData({
        name: myCompany.name || '',
        logo: myCompany.logo || '',
        industry: myCompany.industry || '',
        website: myCompany.website || '',
        location: myCompany.location || '',
        description: myCompany.description || '',
        recruiterName: myCompany.recruiterName || '',
        recruiterEmail: myCompany.recruiterEmail || '',
        recruiterPhone: myCompany.recruiterPhone || '',
        companySize: myCompany.companySize || '10001+ Employees',
        linkedIn: myCompany.linkedIn || '',
        foundedYear: myCompany.foundedYear || '1968',
        avgPackage: myCompany.avgPackage || '12.5 LPA'
      });
    }
  }, [myCompany]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLogoUpload = (file: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      showToast('Please upload a valid image file (PNG, JPG, SVG)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({ ...prev, logo: e.target.result as string }));
        showToast('Logo uploaded and preview generated!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    showToast('Logo removed', 'info');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCompany) return;
    await updateCompany(myCompany.id, formData);
  };

  const handleCancel = () => {
    if (myCompany) {
      setFormData({
        name: myCompany.name || '',
        logo: myCompany.logo || '',
        industry: myCompany.industry || '',
        website: myCompany.website || '',
        location: myCompany.location || '',
        description: myCompany.description || '',
        recruiterName: myCompany.recruiterName || '',
        recruiterEmail: myCompany.recruiterEmail || '',
        recruiterPhone: myCompany.recruiterPhone || '',
        companySize: myCompany.companySize || '10001+ Employees',
        linkedIn: myCompany.linkedIn || '',
        foundedYear: myCompany.foundedYear || '1968',
        avgPackage: myCompany.avgPackage || '12.5 LPA'
      });
      showToast('Changes discarded', 'info');
    }
  };

  const companyStatus = myCompany?.status || 'Pending';

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-xs text-slate-700">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Company Profile</h1>
          <p className="text-[11px] text-slate-450 mt-0.5">Manage your company information that candidates see on NextOffer.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Approved / Verification Status badge */}
          {companyStatus === 'Verified' ? (
            <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 rounded-lg px-3 py-1.5 text-left">
              <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-emerald-800 leading-none">Approved</p>
                <p className="text-[8px] text-emerald-600 mt-0.5 font-medium">Approved on {myCompany?.joinedDate || '12 May 2026'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-1.5 text-left">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-amber-800 leading-none">Pending Approval</p>
                <p className="text-[8px] text-amber-600 mt-0.5 font-medium">Awaiting Placement Cell review</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              // Smooth scroll to the preview card
              const previewEl = document.getElementById('profile-preview-card');
              previewEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              showToast('Scrolled to live preview panel!', 'info');
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Profile
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Editable Settings Form (60% width / col-span-7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs space-y-5">
            
            {/* Section: Company Information */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-900">Company Information</h2>
              
              {/* Logo Upload + Name/Sector Grid Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                
                {/* Logo Uploader */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Logo</span>
                  <div className="flex gap-3">
                    {/* Circle Preview & Remove Button */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <CompanyLogo 
                        src={formData.logo} 
                        name={formData.name} 
                        className="w-14 h-14 rounded-full"
                      />
                      {formData.logo && (
                        <button 
                          type="button"
                          onClick={removeLogo}
                          className="text-[9px] font-bold text-slate-450 hover:text-red-500 flex items-center gap-0.5 cursor-pointer mt-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove
                        </button>
                      )}
                    </div>

                    {/* Drag & Drop Area */}
                    <div 
                      className={`flex-1 border-2 border-dashed rounded-lg p-2.5 flex flex-col items-center justify-center text-center transition-all ${
                        dragActive 
                          ? 'border-[#10B981] bg-emerald-50/5' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                      <p className="text-[9px] text-slate-600 font-semibold leading-tight">
                        Click to upload
                      </p>
                      <p className="text-[8px] text-slate-400 leading-tight">
                        PNG, JPG or SVG. Max: 2MB
                      </p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
                        className="hidden" 
                        accept=".png,.jpg,.jpeg,.svg"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Name & Sector */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Industry *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IT Services & Consulting"
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Company Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Description *</label>
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 pb-5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all resize-none leading-relaxed"
                    placeholder="Enter a comprehensive overview of your company..."
                  />
                  <div className="absolute right-2.5 bottom-1.5 text-[8px] text-slate-400 font-medium">
                    {formData.description.length}/500
                  </div>
                </div>
              </div>

              {/* 2-Column Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Website</label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.company.com"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Headquarters</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Mumbai, Maharashtra, India"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Size</label>
                  <select
                    value={formData.companySize}
                    onChange={e => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all cursor-pointer"
                  >
                    <option value="1-10 Employees">1-10 Employees</option>
                    <option value="10-50 Employees">10-50 Employees</option>
                    <option value="50-100 Employees">50-100 Employees</option>
                    <option value="100-500 Employees">100-500 Employees</option>
                    <option value="500-1000 Employees">500-1000 Employees</option>
                    <option value="1000-5000 Employees">1000-5000 Employees</option>
                    <option value="5000-10000 Employees">5000-10000 Employees</option>
                    <option value="10001+ Employees">10001+ Employees (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Founded Year</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 1968"
                      value={formData.foundedYear}
                      onChange={e => setFormData({ ...formData, foundedYear: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contact Information */}
            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <h2 className="text-xs font-bold text-slate-900">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">HR Contact Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rohit Sharma"
                      value={formData.recruiterName}
                      onChange={e => setFormData({ ...formData, recruiterName: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Official Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="careers@company.com"
                      value={formData.recruiterEmail}
                      onChange={e => setFormData({ ...formData, recruiterEmail: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.recruiterPhone}
                      onChange={e => setFormData({ ...formData, recruiterPhone: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">LinkedIn / Company Page</label>
                  <div className="relative">
                    <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/company/tcs"
                      value={formData.linkedIn}
                      onChange={e => setFormData({ ...formData, linkedIn: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Cancel Row */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Previews & Notifications (40% width / col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Preview Panel Label */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> Live Render Preview
          </div>

          {/* 1. Public Profile Card */}
          <div id="profile-preview-card" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-[11px] leading-relaxed transition-all duration-300">
            {/* Header Banner Image */}
            <div className="h-28 bg-[#0F172A] relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80" 
                alt="Banner preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            </div>

            {/* Overlapping circular avatar logo */}
            <div className="px-4 relative">
              <CompanyLogo 
                src={formData.logo} 
                name={formData.name} 
                className="w-14 h-14 rounded-full absolute left-4 -top-7 z-10 border-2 border-white shadow-md"
              />
              
              <div className="pt-8 space-y-3 pb-4">
                {/* Title and sector */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1 leading-tight">
                    {formData.name || 'Company Name'}
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white shrink-0" title="Verified placement partner">
                      ✓
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {formData.industry || 'Industry'} • {formData.location || 'Location'}
                  </p>
                </div>

                {/* Subtitle properties */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-slate-400" /> {formData.companySize}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Founded in {formData.foundedYear}</span>
                </div>

                {/* Description snippet */}
                <p className="text-slate-600 line-clamp-3 leading-relaxed text-[10px] bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                  {formData.description || 'Provide a company description to see a preview of how candidates view your profile overview details.'}
                </p>

                {/* Simulated action */}
                <button
                  type="button"
                  className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-3xs cursor-pointer transition-colors"
                >
                  View Company Page <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. What Candidates See Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">What candidates see</span>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CompanyLogo 
                    src={formData.logo} 
                    name={formData.name} 
                    className="w-9 h-9 rounded-lg shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-800 text-[11px] leading-tight">Software Engineer</h5>
                    <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 font-medium">
                      {formData.name || 'Company Name'}
                      <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-emerald-500 text-white text-[7px]" title="Verified">✓</span>
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[8px] font-bold">
                  Full Time
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-150 pt-2 font-medium">
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> ₹7.0 LPA</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {formData.location || 'Mumbai'}</span>
              </div>

              <button 
                type="button" 
                className="w-full py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg text-[10px] text-center shadow-3xs cursor-pointer transition-colors"
              >
                View Job
              </button>
            </div>
          </div>

          {/* 3. Status Alert Box */}
          {companyStatus === 'Verified' ? (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-xl flex items-start gap-2.5 text-emerald-950 shadow-3xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold text-emerald-900 leading-tight">Your profile is visible to students after admin approval.</p>
                <p className="text-[9.5px] text-emerald-700 mt-1 leading-relaxed">
                  You can still edit your information anytime. All edits automatically sync across NextOffer student feeds.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-950 shadow-3xs">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-extrabold text-amber-900 leading-tight">Your profile is pending admin approval.</p>
                <p className="text-[9.5px] text-amber-700 mt-1 leading-relaxed">
                  Jobs will be hidden from students until verified. Once placement cell reviews your details, your postings will go live.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
