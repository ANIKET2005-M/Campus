import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Users, 
  Building2, 
  Award, 
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Inbox,
  UserCheck,
  FileText,
  Mail,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  LayoutDashboard,
  Send,
  Bell,
  Phone,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
const LogoImage = '/image/ChatGPT Image Aug 15, 2026, 05_15_08 PM.png';
const TcsLogo = '/image/TCS.webp';
const InfosysLogo = '/image/Infosys.webp';
const WiproLogo = '/image/Wipro.webp';
const CapgeminiLogo = '/image/Capgemini.svg';
const CognizantLogo = '/image/Cognizant.png';
const DeloitteLogo = '/image/Deloitte.png';
const AccentureLogo = '/image/Accenture.webp';
const TechMahindraLogo = '/image/Tech_Mahindra.webp';

const companiesLogos = [
  { name: 'TCS', logo: TcsLogo, opportunities: '200+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Infosys', logo: InfosysLogo, opportunities: '150+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Wipro', logo: WiproLogo, opportunities: '120+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Capgemini', logo: CapgeminiLogo, opportunities: '100+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Cognizant', logo: CognizantLogo, opportunities: '90+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Deloitte', logo: DeloitteLogo, opportunities: '80+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Accenture', logo: AccentureLogo, opportunities: '80+ Opportunities', tag: 'Top Recruiter' },
  { name: 'Tech Mahindra', logo: TechMahindraLogo, opportunities: '60+ Opportunities', tag: 'Top Recruiter' },
];

interface LandingPageProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, setActiveTab, activeTab }) => {
  const { switchRole, showToast } = useApp();


  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isProgrammaticScroll = useRef(false);
  const lastSectionInView = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 300;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Smooth scroll target when activeTab updates
  useEffect(() => {
    if (activeTab && activeTab !== lastSectionInView.current) {
      const element = document.getElementById(activeTab);
      if (element) {
        isProgrammaticScroll.current = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        const timer = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 850);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab]);

  // IntersectionObserver to sync scroll to navigation active tabs
  useEffect(() => {
    const sections = ['home', 'features', 'students', 'recruiters', 'colleges', 'about', 'contact'];

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isProgrammaticScroll.current) return;

      let maxRatio = 0;
      let activeSectionId = '';

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeSectionId = entry.target.id;
        }
      });

      if (activeSectionId && activeSectionId !== lastSectionInView.current) {
        lastSectionInView.current = activeSectionId;
        setActiveTab(activeSectionId);
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -55% 0px', // focused in the middle of screen
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [setActiveTab]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill in all form fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);

    showToast('Message sent successfully! We will get in touch with you shortly.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-[#030712] py-20 lg:py-28 scroll-mt-20">
        {/* Background Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120px,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <motion.div 
            className="lg:col-span-6 space-y-8 z-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.05
                }
              }
            }}
          >
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 text-xs font-semibold select-none"
            >
              <Sparkles className="w-3.5 h-3.5" /> SMARTER RECRUITMENT. BETTER FUTURES.
            </motion.div>

            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Where Talent <br />
              Meets <span className="text-emerald-500">Opportunity.</span>
            </motion.h1>

            <motion.p 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg"
            >
              NextOffer simplifies campus placements with smart eligibility checks, personalized job recommendations, and real-time placement analytics.
            </motion.p>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => {
                  switchRole('student');
                  setActiveTab('dashboard');
                }}
                className="px-6 py-3.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <GraduationCap className="w-4 h-4" /> I'm a Student <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  switchRole('recruiter');
                  setActiveTab('dashboard');
                }}
                className="px-6 py-3.5 text-xs font-bold text-slate-200 hover:text-white bg-transparent border border-slate-700 hover:border-slate-500 rounded-xl flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <Briefcase className="w-4 h-4" /> I'm a Recruiter <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Inline Features Row */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-900"
            >
              {[
                { title: 'Smart Eligibility', desc: 'Know where you stand', icon: ShieldCheck },
                { title: 'Job Recommendations', desc: 'Personalized for you', icon: Sparkles },
                { title: 'Placement Analytics', desc: 'Data that drives success', icon: TrendingUp },
                { title: 'Interview Scheduler', desc: 'Never miss an opportunity', icon: Calendar }
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-450 border border-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{f.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-none">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Column: High-Fidelity Mockup with Student photo & floating cards */}
          <motion.div 
            className="lg:col-span-6 select-none flex justify-center z-10"
            initial={{ opacity: 0, scale: 0.96, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          >
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900 group">
              {/* Background image */}
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover brightness-75 contrast-95 select-none pointer-events-none group-hover:scale-[1.03] transition-all duration-700" 
                alt="Students Collaboration" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Card 1: Upcoming Drive */}
              <motion.div 
                className="absolute bottom-4 left-4 bg-white rounded-xl p-3.5 shadow-2xl border border-slate-100 max-w-[240px] z-20 flex gap-3 select-none hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 80 }}
              >
                <div className="flex-1 space-y-1.5 text-left">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Drive</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">TCS Digital</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Software Engineer</p>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[8px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-emerald-500" />
                      <span>20 May 2025</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                      <span>Virtual Drive</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
                <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                  <img src={TcsLogo} alt="TCS Logo" className="w-full h-full object-contain" />
                </div>
              </motion.div>

              {/* Floating Card 2: Profile Strength */}
              <motion.div 
                className="absolute top-4 right-4 bg-[#0B1329]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl w-[145px] z-20 select-none text-left hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75, type: "spring", stiffness: 80 }}
              >
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Profile Strength</span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="text-emerald-500"
                        strokeDasharray="85, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: "85, 100" }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 1 }}
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-white">85%</span>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white leading-none">Excellent</h5>
                    <p className="text-[7px] text-slate-500 mt-1 leading-tight">All set.</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 3: Applications */}
              <motion.div 
                className="absolute bottom-4 right-4 bg-[#0B1329]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl w-[145px] z-20 select-none text-left hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9, type: "spring", stiffness: 80 }}
              >
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Applications</span>
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <div>
                    <span className="text-lg font-extrabold text-emerald-500 leading-none">24</span>
                    <p className="text-[7px] text-slate-400 mt-0.5 leading-none">Applied</p>
                  </div>
                  <div className="border-l border-slate-800 pl-2">
                    <span className="text-lg font-extrabold text-blue-500 leading-none">8</span>
                    <p className="text-[7px] text-slate-400 mt-0.5 leading-none">Shortlisted</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Card Banner */}
      <section className="relative z-20 -mt-10 px-6">
        <motion.div 
          className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-100 select-none"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {[
            { val: '500+', desc: 'Top Companies', icon: Users, bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { val: '10,000+', desc: 'Job Opportunities', icon: Briefcase, bg: 'bg-blue-50', text: 'text-blue-600' },
            { val: '2,00,000+', desc: 'Students Placed', icon: UserCheck, bg: 'bg-purple-50', text: 'text-purple-600' },
            { val: '85%', desc: 'Placement Success', icon: TrendingUp, bg: 'bg-orange-50', text: 'text-orange-600' }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-5 pt-6 sm:pt-0 first:pt-0 lg:pl-8 lg:first:pl-0 hover:scale-[1.02] transition-all duration-300">
                <div className={`p-3.5 ${s.bg} ${s.text} rounded-2xl flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{s.val}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-none">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Top Companies Hire Here Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center relative">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Top Companies Hire Here
            </h2>
            <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto mt-3" />
          </div>

          <div className="relative overflow-hidden w-full max-w-6xl mx-auto py-2 select-none">
            {/* Gradient masks on sides for premium soft fading edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee gap-8 md:gap-12 items-center">
              {[
                { name: 'TCS', logo: TcsLogo },
                { name: 'Infosys', logo: InfosysLogo },
                { name: 'Wipro', logo: WiproLogo },
                { name: 'Deloitte', logo: DeloitteLogo },
                { name: 'Accenture', logo: AccentureLogo },
                { name: 'Capgemini', logo: CapgeminiLogo },
                { name: 'Cognizant', logo: CognizantLogo },
                { name: 'HCL', logo: null, isText: true }
              ].concat([
                { name: 'TCS', logo: TcsLogo },
                { name: 'Infosys', logo: InfosysLogo },
                { name: 'Wipro', logo: WiproLogo },
                { name: 'Deloitte', logo: DeloitteLogo },
                { name: 'Accenture', logo: AccentureLogo },
                { name: 'Capgemini', logo: CapgeminiLogo },
                { name: 'Cognizant', logo: CognizantLogo },
                { name: 'HCL', logo: null, isText: true }
              ]).map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 px-6 py-4 rounded-xl shadow-3xs flex items-center justify-center h-14 w-36 flex-shrink-0 hover:scale-[1.05] hover:shadow-xs transition-all duration-300">
                  {item.isText ? (
                    <span className="text-2xl font-extrabold text-[#005B9F] italic tracking-tight font-sans select-none">HCL</span>
                  ) : (
                    <img src={item.logo} alt={item.name} className="h-7 max-w-full object-contain" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dark Portal Cards Grid Section */}
      <section className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              One Unified Recruitment Ecosystem
            </h2>
            <p className="text-slate-550 text-sm max-w-md mx-auto leading-relaxed">
              Tailored portals for students, recruiters, and placement officers to work in perfect harmony.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {/* Card 1: Students */}
            <motion.div 
              id="students" 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="bg-[#0B1329] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[230px] hover:border-emerald-500/50 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-lg scroll-mt-24"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-455 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">For Students</h4>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  Find the right opportunities, track applications, and prepare for success.
                </p>
              </div>
              <button 
                onClick={() => {
                  switchRole('student');
                  setActiveTab('dashboard');
                }}
                className="text-xs font-semibold text-emerald-450 hover:text-emerald-300 flex items-center gap-1 transition-colors mt-4 text-left"
              >
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Card 2: Recruiters */}
            <motion.div 
              id="recruiters" 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="bg-[#0B1329] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[230px] hover:border-blue-500/50 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-lg scroll-mt-24"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-455 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">For Recruiters</h4>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  Connect with top talent, manage drives, and build your team.
                </p>
              </div>
              <button 
                onClick={() => {
                  switchRole('recruiter');
                  setActiveTab('dashboard');
                }}
                className="text-xs font-semibold text-blue-450 hover:text-blue-300 flex items-center gap-1 transition-colors mt-4 text-left"
              >
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Card 3: Colleges */}
            <motion.div 
              id="colleges" 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="bg-[#0B1329] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[230px] hover:border-purple-500/50 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-lg scroll-mt-24"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-455 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">For Colleges</h4>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  Streamline placements, engage recruiters, and empower students.
                </p>
              </div>
              <button 
                onClick={() => {
                  switchRole('admin');
                  setActiveTab('dashboard');
                }}
                className="text-xs font-semibold text-purple-450 hover:text-purple-300 flex items-center gap-1 transition-colors mt-4 text-left"
              >
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Card 4: Real-time Analytics */}
            <motion.div 
              id="features"
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="bg-[#0B1329] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[230px] hover:border-emerald-500/50 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-455 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Real-time Analytics</h4>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  Make smarter decisions with powerful insights and interactive dashboards.
                </p>
              </div>
              <button 
                onClick={() => {
                  switchRole('student');
                  setActiveTab('dashboard');
                }}
                className="text-xs font-semibold text-emerald-450 hover:text-emerald-300 flex items-center gap-1 transition-colors mt-4 text-left"
              >
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SaaS Styled Footer (styled to fit the dark modern design) */}
      <footer className="bg-[#030712] text-slate-400 py-16 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand block */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 overflow-hidden flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-base font-bold text-white tracking-tight">Next<span className="text-emerald-500">Offer</span></span>
            </div>
            <p className="text-[11px] text-slate-455 leading-relaxed max-w-sm">
              NextOffer bridging talent and opportunities. Our next-generation platform automates eligibility checks, coordinates placement workflows, and yields data-driven results.
            </p>
            <p className="text-[10px] text-slate-500">
              Your Next Step, Our Mission.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">Portal Login</button></li>
              <li><button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">Portal Registration</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-white transition-colors">Resume Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Interview Prep</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Placement Process</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stay Updated</h4>
            <p className="text-[10px] text-slate-455 leading-relaxed">
              Subscribe to get placement notifications.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-3 py-2 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
              />
              <button className="px-3 py-2 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} NextOffer. All rights reserved. Created by <span className="font-semibold text-slate-350">Sania Mondal</span>.
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <button className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Instagram className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Youtube className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
