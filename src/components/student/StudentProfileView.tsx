import React, { useState } from 'react';
import { 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Linkedin,
  Github,
  Award,
  BookOpen,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ParsedResumeData } from '../../../server/resumeParser';

export const StudentProfileView: React.FC = () => {
  const { currentStudent, updateStudentProfile, showToast } = useApp();

  if (!currentStudent) return null;

  // Edit Mode state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);

  // Editable Form states
  const [fullName, setFullName] = useState(currentStudent.fullName);
  const [phone, setPhone] = useState(currentStudent.phone);
  const [dob, setDob] = useState(currentStudent.dateOfBirth);
  const [address, setAddress] = useState(currentStudent.address);

  const [course, setCourse] = useState(currentStudent.course);
  const [department, setDepartment] = useState(currentStudent.department);
  const [gradYear, setGradYear] = useState(currentStudent.graduationYear.toString());
  const [cgpa, setCgpa] = useState(currentStudent.cgpa.toString());
  const [tenth, setTenth] = useState(currentStudent.tenthPercent.toString());
  const [twelfth, setTwelfth] = useState(currentStudent.twelfthPercent.toString());
  const [backlogs, setBacklogs] = useState(currentStudent.backlogs.toString());

  const [linkedin, setLinkedin] = useState(currentStudent.linkedin);
  const [github, setGithub] = useState(currentStudent.github);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(currentStudent.skills);

  // AI Resume Parsing States
  const [isParsing, setIsParsing] = useState(false);
  const [parsedModalData, setParsedModalData] = useState<ParsedResumeData | null>(null);
  const [pendingResumeUrl, setPendingResumeUrl] = useState<string>('');
  const [pendingResumeName, setPendingResumeName] = useState<string>('');

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    let score = 0;
    if (currentStudent.fullName) score += 10;
    if (currentStudent.email) score += 10;
    if (currentStudent.phone) score += 10;
    if (currentStudent.course) score += 10;
    if (currentStudent.department) score += 10;
    if (currentStudent.cgpa > 0) score += 15;
    if (currentStudent.skills.length > 0) score += 15;
    if (currentStudent.resumeName) score += 20;
    return Math.min(100, score);
  };

  const completionPercent = calculateCompletion();

  const handleSavePersonal = () => {
    updateStudentProfile({
      fullName,
      phone,
      dateOfBirth: dob,
      address
    });
    setIsEditingPersonal(false);
  };

  const handleSaveAcademic = () => {
    updateStudentProfile({
      course,
      department,
      graduationYear: parseInt(gradYear) || 2026,
      cgpa: parseFloat(cgpa) || 8.0,
      tenthPercent: parseFloat(tenth) || 85,
      twelfthPercent: parseFloat(twelfth) || 82,
      backlogs: parseInt(backlogs) || 0
    });
    setIsEditingAcademic(false);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      showToast('Skill already exists', 'error');
      return;
    }
    const updated = [...skills, newSkill.trim()];
    setSkills(updated);
    updateStudentProfile({ skills: updated });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    updateStudentProfile({ skills: updated });
  };

  // AI Resume Upload Handler
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    showToast('✨ Uploading & analyzing resume with Gemini AI...', 'info');

    try {
      const res = await api.parseAndUploadResume(file, currentStudent.id);
      setIsParsing(false);

      if (res.parsedData) {
        setParsedModalData(res.parsedData);
        setPendingResumeUrl(res.resumeUrl);
        setPendingResumeName(res.resumeName);
        showToast('✨ Gemini AI extracted candidate details successfully!', 'success');
      }
    } catch (err: any) {
      setIsParsing(false);
      showToast(err.message || 'Failed to analyze resume', 'error');
    }
  };

  const handleApplyAiData = () => {
    if (!parsedModalData) return;

    const updates: any = {
      resumeName: pendingResumeName || currentStudent.resumeName,
      resumeUrl: pendingResumeUrl || currentStudent.resumeUrl,
      resumeUpdatedAt: new Date().toISOString().split('T')[0]
    };

    if (parsedModalData.cgpa) {
      updates.cgpa = parsedModalData.cgpa;
      setCgpa(parsedModalData.cgpa.toString());
    }
    if (parsedModalData.skills && parsedModalData.skills.length > 0) {
      const combined = Array.from(new Set([...skills, ...parsedModalData.skills]));
      updates.skills = combined;
      setSkills(combined);
    }
    if (parsedModalData.certifications && parsedModalData.certifications.length > 0) {
      const combinedCerts = Array.from(new Set([...(currentStudent.certifications || []), ...parsedModalData.certifications]));
      updates.certifications = combinedCerts;
    }
    if (parsedModalData.projects && parsedModalData.projects.length > 0) {
      updates.projects = [...parsedModalData.projects, ...currentStudent.projects];
    }
    if (parsedModalData.internships && parsedModalData.internships.length > 0) {
      updates.internships = [...parsedModalData.internships, ...currentStudent.internships];
    }
    if (parsedModalData.linkedin) {
      updates.linkedin = parsedModalData.linkedin;
      setLinkedin(parsedModalData.linkedin);
    }
    if (parsedModalData.github) {
      updates.github = parsedModalData.github;
      setGithub(parsedModalData.github);
    }
    if (parsedModalData.phone) {
      updates.phone = parsedModalData.phone;
      setPhone(parsedModalData.phone);
    }

    updateStudentProfile(updates);
    setParsedModalData(null);
    showToast('Profile updated with AI-extracted resume details!', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentStudent.fullName}
            className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentStudent.fullName}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Registration No: <strong className="text-slate-800">{currentStudent.registrationNumber}</strong> • {currentStudent.email}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-[#10B981] text-[10px] font-bold rounded-full border border-emerald-500/20">
                {currentStudent.course} - {currentStudent.department}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
                CGPA: {currentStudent.cgpa}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
            <span className="text-slate-500 uppercase tracking-wider">Profile Completion</span>
            <span className="text-[#10B981]">{completionPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-[#10B981] transition-all duration-500" 
              style={{ width: `${completionPercent}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Academic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#10B981]" /> Personal Details
              </h3>
              {!isEditingPersonal ? (
                <button
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-xs font-bold text-[#10B981] hover:underline"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePersonal}
                    className="px-3 py-1.5 bg-[#10B981] text-white rounded-xl text-xs font-bold hover:bg-[#059669]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingPersonal(false)}
                    className="px-3 py-1.5 bg-slate-150 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
                {isEditingPersonal ? (
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.dateOfBirth || 'Not Specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Permanent Address</label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.address || 'Not Specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Records */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#10B981]" /> Academic & Marks Record
              </h3>
              {!isEditingAcademic ? (
                <button
                  onClick={() => setIsEditingAcademic(true)}
                  className="text-xs font-bold text-[#10B981] hover:underline"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAcademic}
                    className="px-3 py-1.5 bg-[#10B981] text-white rounded-xl text-xs font-bold hover:bg-[#059669]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingAcademic(false)}
                    className="px-3 py-1.5 bg-slate-150 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Course</span>
                <span className="font-bold text-slate-800 mt-1 block">{currentStudent.course}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Department</span>
                <span className="font-bold text-slate-800 mt-1 block truncate">{currentStudent.department}</span>
              </div>
              <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <span className="text-[9px] font-extrabold text-[#10B981] uppercase block">Current CGPA</span>
                <span className="font-black text-[#10B981] text-sm mt-1 block">{currentStudent.cgpa} / 10</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Backlogs</span>
                <span className={`font-bold mt-1 block ${currentStudent.backlogs > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {currentStudent.backlogs}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">10th Standard Score (%)</label>
                {isEditingAcademic ? (
                  <input
                    type="number"
                    value={tenth}
                    onChange={(e) => setTenth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.tenthPercent}%</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">12th Standard / Diploma (%)</label>
                {isEditingAcademic ? (
                  <input
                    type="number"
                    value={twelfth}
                    onChange={(e) => setTwelfth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{currentStudent.twelfthPercent}%</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Skills & Projects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-[#10B981]" /> Skills & Technical Projects
            </h3>

            {/* Skills Badges */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Technical Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-500/5 text-[#10B981] text-xs font-bold rounded-lg border border-emerald-500/10 flex items-center gap-1.5"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Docker, Python)"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:bg-white focus:border-[#10B981]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-[#10B981] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#059669] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Projects list */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Academic Projects</label>
              <div className="space-y-3">
                {currentStudent.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <h5 className="font-bold text-slate-900">{proj.title}</h5>
                    <p className="text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.techStack.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-150 rounded text-[9px] text-slate-500 font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Resume Management & Links */}
        <div className="space-y-6">
          {/* AI Resume Upload & Parser Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#10B981]" /> Resume
              </div>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini AI
              </span>
            </div>

            {isParsing ? (
              <div className="p-6 rounded-xl bg-purple-50/60 border border-purple-200 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-purple-900">Gemini Parsing Resume...</p>
                <p className="text-[10px] text-purple-500 leading-normal">Extracting skills, CGPA, projects automatically.</p>
              </div>
            ) : currentStudent.resumeName ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0 border border-emerald-500/15">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentStudent.resumeName}</p>
                    <p className="text-[9px] text-slate-400">Updated: {currentStudent.resumeUpdatedAt || 'Recently'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  {currentStudent.resumeUrl ? (
                    <a
                      href={currentStudent.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-white border border-slate-255 text-slate-700 text-[10px] font-bold rounded-xl hover:bg-slate-50 text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  ) : null}
                  <label className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-xl hover:opacity-90 text-center cursor-pointer flex items-center justify-center gap-1 shadow-xs transition-opacity">
                    <Sparkles className="w-3.5 h-3.5" /> Upload AI
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt" 
                      onChange={handleResumeFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-purple-400 transition-colors bg-purple-50/20">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">AI Resume Parser</p>
                <p className="text-[11px] text-slate-500 mt-1">Upload to auto-fill your academic profile with Gemini AI.</p>
                <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" /> Select Resume File
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt" 
                    onChange={handleResumeFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>

          {/* Social Profiles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Online Portfolios
            </h4>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => {
                    setLinkedin(e.target.value);
                    updateStudentProfile({ linkedin: e.target.value });
                  }}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-900" /> GitHub Portfolio
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => {
                    setGithub(e.target.value);
                    updateStudentProfile({ github: e.target.value });
                  }}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Extraction Preview Modal */}
      {parsedModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gemini AI Extracted Profile Data</h3>
                  <p className="text-xs text-slate-500">Review the auto-detected details from your resume before applying.</p>
                </div>
              </div>
              <button 
                onClick={() => setParsedModalData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* CGPA & Academic */}
              {parsedModalData.cgpa ? (
                <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-emerald-700 font-bold block uppercase">Detected CGPA</span>
                    <span className="text-base font-extrabold text-emerald-900">{parsedModalData.cgpa} / 10</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-605" />
                </div>
              ) : null}

              {/* Skills Extracted */}
              {parsedModalData.skills && parsedModalData.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Identified Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedModalData.skills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/10 text-[#10B981] rounded-lg font-bold">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {parsedModalData.certifications && parsedModalData.certifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Certifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {parsedModalData.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {parsedModalData.projects && parsedModalData.projects.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Extracted Projects</h4>
                  <div className="space-y-2">
                    {parsedModalData.projects.map((p, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{p.title}</p>
                        <p className="text-slate-500 mt-1 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {parsedModalData.internships && parsedModalData.internships.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Work & Internship Experience</h4>
                  <div className="space-y-2">
                    {parsedModalData.internships.map((int, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{int.role} - {int.company}</p>
                        <p className="text-slate-500 mt-1 leading-relaxed">{int.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setParsedModalData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Discard
              </button>
              <button
                onClick={handleApplyAiData}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-4 h-4" /> Apply Auto-Fill to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
