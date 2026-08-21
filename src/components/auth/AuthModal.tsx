import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  ArrowRight,
  Sparkles,
  Phone,
  BookOpen,
  Award,
  Globe
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const { loginUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register student state
  const [regFullName, setRegFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCourse, setRegCourse] = useState('BCA');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [regGradYear, setRegGradYear] = useState('2026');
  const [regCgpa, setRegCgpa] = useState('8.0');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Register recruiter state
  const [recCompanyName, setRecCompanyName] = useState('');
  const [recIndustry, setRecIndustry] = useState('Information Technology');
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }

    try {
      const res = await api.loginUser(email, password);
      if (res.success && res.user) {
        loginUser(res.user);
        onClose();
        return;
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Demo accounts password is password123', 'error');
      return;
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword && regPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match. Please verify your password.', 'error');
      return;
    }

    if (selectedRole === 'student') {
      if (!regFullName || !regNumber || !regEmail) {
        showToast('Please complete all required fields', 'error');
        return;
      }

      try {
        const res = await api.registerUser({
          email: regEmail,
          password: regPassword || 'password123',
          role: 'student',
          name: regFullName,
          studentDetails: {
            registrationNumber: regNumber,
            course: regCourse,
            department: regDepartment,
            graduationYear: parseInt(regGradYear) || 2026,
            cgpa: parseFloat(regCgpa) || 8.0,
            phone: regPhone || '+91 98765 43210'
          }
        });

        if (res.success && res.user) {
          loginUser(res.user);
          showToast('Student account registered successfully!', 'success');
          onClose();
        } else {
          showToast(res.message || 'Registration failed', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Registration failed', 'error');
      }
    } else {
      if (!recCompanyName || !recName || !recEmail) {
        showToast('Please fill in recruiter and company details', 'error');
        return;
      }

      try {
        const res = await api.registerUser({
          email: recEmail,
          password: regPassword || 'password123',
          role: 'recruiter',
          name: recName,
          companyDetails: {
            name: recCompanyName,
            industry: recIndustry
          }
        });

        if (res.success && res.user) {
          loginUser(res.user);
          showToast('Recruiter account registered successfully!', 'success');
          onClose();
        } else {
          showToast(res.message || 'Registration failed', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Registration failed', 'error');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Access Next Offer Platform"
      subtitle="Sign in or register your role to participate in campus drives"
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 -m-6 h-[72vh] min-h-[500px]">
        {/* Left Side: SaaS Brand Graphic Panel (Navy) */}
        <div className="md:col-span-5 bg-[#0F172A] text-white p-8 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-lg font-bold tracking-tight">Next<span className="text-[#10B981]">Offer</span></span>
            </div>
            <h3 className="text-xl font-bold tracking-tight leading-snug">
              Unlock Your <br />
              <span className="text-[#10B981]">Career Potential</span>
            </h3>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              Join the next-generation recruitment ecosystem connecting top talent with industry-leading organizations.
            </p>
          </div>

          {/* Stats Ticker Card */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl backdrop-blur-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-[#10B981]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Powered Screening</p>
                <p className="text-xs text-white mt-0.5">Automated Candidate Suitability</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div>
                <p className="text-sm font-bold text-white">95%</p>
                <p className="text-[9px] text-slate-500 font-semibold">Match Rate</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">150+</p>
                <p className="text-[9px] text-slate-500 font-semibold">Companies</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">2k+</p>
                <p className="text-[9px] text-slate-500 font-semibold">Placed</p>
              </div>
            </div>
          </div>

          {/* Attribution Footer */}
          <div className="text-[10px] text-slate-500">
            &copy; {new Date().getFullYear()} NextOffer. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form Controls (Slate/White) */}
        <div className="md:col-span-7 p-8 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'student'
                      ? 'bg-emerald-500/10 border-[#10B981] text-[#10B981]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('recruiter')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'recruiter'
                      ? 'bg-emerald-500/10 border-[#10B981] text-[#10B981]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Recruiter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-emerald-500/10 border-[#10B981] text-[#10B981]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Tab Switching */}
            <div className="flex border-b border-slate-150">
              <button
                onClick={() => setActiveTab('login')}
                className={`pb-2.5 text-xs font-bold transition-colors border-b-2 mr-6 ${
                  activeTab === 'login'
                    ? 'border-[#10B981] text-[#10B981]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`pb-2.5 text-xs font-bold transition-colors border-b-2 mr-6 ${
                  activeTab === 'register'
                    ? 'border-[#10B981] text-[#10B981]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Login View */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'student' ? 'rahul.sharma@campus.edu' : 
                        selectedRole === 'recruiter' ? 's.jenkins@techcorp.com' : 'placements@campus.edu'
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all placeholder-slate-450 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('forgot')}
                      className="text-[10px] font-bold text-[#10B981] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all placeholder-slate-450 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Sign In as {selectedRole.toUpperCase()} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Register View */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {selectedRole === 'student' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="Rahul Sharma"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registration No. *</label>
                        <div className="relative">
                          <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="2023BCA108"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Campus Email *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="student@campus.edu"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Course</label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={regCourse}
                            onChange={(e) => setRegCourse(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all appearance-none"
                          >
                            <option value="BCA">BCA</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="MCA">MCA</option>
                            <option value="M.Tech">M.Tech</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grad Year</label>
                        <input
                          type="number"
                          value={regGradYear}
                          onChange={(e) => setRegGradYear(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CGPA *</label>
                        <input
                          type="text"
                          required
                          value={regCgpa}
                          onChange={(e) => setRegCgpa(e.target.value)}
                          placeholder="8.5"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name *</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={recCompanyName}
                            onChange={(e) => setRecCompanyName(e.target.value)}
                            placeholder="TechCorp Solutions"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={recIndustry}
                            onChange={(e) => setRecIndustry(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all appearance-none"
                          >
                            <option value="Information Technology">IT & Software</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Consulting">Consulting</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recruiter Name *</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={recName}
                            onChange={(e) => setRecName(e.target.value)}
                            placeholder="Sarah Jenkins"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Email *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={recEmail}
                            onChange={(e) => setRecEmail(e.target.value)}
                            placeholder="s.jenkins@techcorp.com"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Register Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Forgot View */}
            {activeTab === 'forgot' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@campus.edu"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    showToast('Password reset link sent successfully!', 'success');
                    setActiveTab('login');
                  }}
                  className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 transition-all"
                >
                  Send Reset Link
                </button>
              </div>
            )}
          </div>

          {/* Hint/Footer Tip */}
          <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100 mt-4">
            Tip: Demo logins work with any email and password (e.g. <span className="font-semibold text-slate-500">rahul.sharma@campus.edu</span>).
          </div>
        </div>
      </div>
    </Modal>
  );
};
