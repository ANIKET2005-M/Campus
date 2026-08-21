import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Briefcase, 
  Loader2, 
  ChevronRight,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Job, ResumeAnalysis } from '../../types';

// Client-side fallback analyzer to match backend logic
function getMatchScore(skills: string, keywords: string[]): number {
  let matched = 0;
  keywords.forEach(k => {
    if (skills.includes(k)) matched++;
  });
  const ratio = keywords.length > 0 ? matched / keywords.length : 0;
  return Math.round(40 + ratio * 55); // base score 40, max 95
}

function generateFallbackAnalysis(profile: any): ResumeAnalysis {
  const missingSections: string[] = [];
  const suggestedImprovements: string[] = [];
  let score = 0;

  if (profile.fullName) score += 10; else missingSections.push('Full Name');
  if (profile.email) score += 10; else missingSections.push('Email Address');
  if (profile.phone) score += 10; else missingSections.push('Phone Number');
  if (profile.course || profile.department) score += 15; else missingSections.push('Education / Degree details');
  
  if (profile.skills && profile.skills.length > 0) {
    score += 15;
    if (profile.skills.length < 5) {
      suggestedImprovements.push('Add more technical skills to showcase a broader knowledge base.');
    }
  } else {
    missingSections.push('Technical Skills');
    suggestedImprovements.push('Create a dedicated skills section listing languages, frameworks, and tools.');
  }

  if (profile.projects && profile.projects.length > 0) {
    score += 15;
    const missingLinks = profile.projects.some((p: any) => !p.link);
    if (missingLinks) {
      suggestedImprovements.push('Add GitHub or live demo links to all your projects.');
    }
  } else {
    missingSections.push('Projects');
    suggestedImprovements.push('Add at least 2-3 academic or personal projects showing hands-on experience.');
  }

  if (profile.internships && profile.internships.length > 0) {
    score += 15;
  } else {
    missingSections.push('Work Experience / Internships');
    suggestedImprovements.push('Add any internship, freelance work, or position of responsibility to demonstrate experience.');
  }

  if (profile.linkedin || profile.github) {
    score += 10;
    if (!profile.linkedin) suggestedImprovements.push('Add your LinkedIn profile to help recruiters connect with you.');
    if (!profile.github) suggestedImprovements.push('Add your GitHub profile to showcase your code repositories.');
  } else {
    missingSections.push('Social Links (GitHub/LinkedIn)');
    suggestedImprovements.push('Add professional links like LinkedIn and GitHub to your contact details.');
  }

  // Ensure score is between 30 and 100
  score = Math.max(30, Math.min(100, score));

  // Determine role matches based on skills
  const skillsStr = (profile.skills || []).join(' ').toLowerCase();
  
  const roleMatches = [
    {
      roleName: 'Software Engineer',
      matchScore: getMatchScore(skillsStr, ['java', 'python', 'c++', 'datastructures', 'algorithms', 'git']),
      matchReason: 'Solid foundation in general programming. Work on data structures and algorithms.'
    },
    {
      roleName: 'Frontend Developer',
      matchScore: getMatchScore(skillsStr, ['javascript', 'react', 'html', 'css', 'typescript', 'tailwind']),
      matchReason: 'Has experience with UI design, javascript, and React frameworks.'
    },
    {
      roleName: 'Backend Developer',
      matchScore: getMatchScore(skillsStr, ['node', 'express', 'sql', 'mongodb', 'postgresql', 'apis', 'django']),
      matchReason: 'Backend technologies like node, SQL/NoSQL databases, and API development detected.'
    },
    {
      roleName: 'Data Analyst',
      matchScore: getMatchScore(skillsStr, ['python', 'pandas', 'sql', 'tableau', 'excel', 'data analysis']),
      matchReason: 'Analytical skills with Python, pandas, and databases detected.'
    }
  ];

  return {
    completenessScore: score,
    detectedSkills: profile.skills || [],
    missingSections,
    suggestedImprovements: suggestedImprovements.length > 0 ? suggestedImprovements : ['Your resume looks very good! Keep updating certifications.'],
    roleMatches
  };
}

export const ResumeAnalyzerView: React.FC = () => {
  const { currentStudent, updateStudentProfile, jobs, showToast } = useApp();
  const [isParsing, setIsParsing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  if (!currentStudent) return null;

  // Retrieve active analysis: saved, or client-side generated on the fly if backend is out-of-sync
  const analysis: ResumeAnalysis | undefined = (() => {
    if (currentStudent.resumeAnalysis) {
      return currentStudent.resumeAnalysis;
    }
    if (currentStudent.resumeName) {
      return generateFallbackAnalysis(currentStudent);
    }
    return undefined;
  })();

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    showToast('✨ Uploading & analyzing resume with Gemini AI...', 'info');

    try {
      const res = await api.parseAndUploadResume(file, currentStudent.id);
      setIsParsing(false);

      if (res.success) {
        showToast('✨ Resume uploaded and analyzed successfully!', 'success');
        
        // If client fallback was used, ensure frontend state gets synchronized
        if (res.parsedData && res.parsedData.analysis) {
          updateStudentProfile({
            resumeAnalysis: res.parsedData.analysis
          });
        }
      }
    } catch (err: any) {
      setIsParsing(false);
      showToast(err.message || 'Failed to parse resume', 'error');
    }
  };

  // Find selected job for comparison
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Compare resume skills with selected job description
  const getJobComparison = (job: Job) => {
    const studentSkills = currentStudent.skills || [];
    const jobSkills = job.requiredSkills || [];
    
    const matchingSkills = jobSkills.filter(js => 
      studentSkills.some(ss => ss.toLowerCase() === js.toLowerCase())
    );

    const missingSkills = jobSkills.filter(js => 
      !studentSkills.some(ss => ss.toLowerCase() === js.toLowerCase())
    );

    // Calculate match percentage
    let matchPercentage = 45; // base score
    if (jobSkills.length > 0) {
      const ratio = matchingSkills.length / jobSkills.length;
      matchPercentage += Math.round(ratio * 45); // up to +45
    }
    
    // CGPA weight
    if (currentStudent.cgpa >= job.eligibility.minCgpa) {
      matchPercentage += 10; // +10 for CGPA eligibility
    }
    
    matchPercentage = Math.min(98, matchPercentage);

    // Dynamic suggestions based on missing skills
    const suggestions = [
      `Incorporate projects or certifications related to ${missingSkills.slice(0, 2).join(' or ') || 'required skills'} in your resume.`,
      `Detail your experience working in team environments, focusing on problems relevant to a ${job.title} role.`,
      `Tailor your project descriptions to highlight any exposure to ${job.requiredSkills.slice(0, 3).join(', ')}.`
    ];

    return {
      matchPercentage,
      matchingSkills,
      missingSkills,
      suggestions
    };
  };

  const comparison = selectedJob ? getJobComparison(selectedJob) : null;

  // Helper for completeness rating
  const getCompletenessStatus = (score: number) => {
    if (score >= 85) return { text: 'Strong', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { text: 'Good', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Needs Improvement', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-emerald-500" /> Resume Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-1">Check your resume completeness, identify skill gaps, and match against campus opportunities.</p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all select-none">
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload New Resume
              </>
            )}
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.txt" 
              onChange={handleFileUpload} 
              disabled={isParsing}
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Main Analysis Panels */}
      {!analysis ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-3xs text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Resume Analyzed Yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Upload your resume in PDF, Word, or TXT format. Our Gemini AI will evaluate it to find skill gaps, suggest improvements, and calculate match scores for campus placement drives.
            </p>
          </div>
          <div className="pt-2">
            <label className="inline-flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all select-none">
              <Upload className="w-4 h-4" /> Select Resume to Analyze
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Core Analysis Score & Suggestions */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Scorecard Box */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              
              {/* Score circle */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-slate-100 fill-none" 
                      strokeWidth="8"
                    />
                    <motion.circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-emerald-500 fill-none" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - analysis.completenessScore / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeDasharray={`${2 * Math.PI * 40}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">
                      <AnimatedCounter to={analysis.completenessScore} />%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completeness</span>
                  </div>
                </div>
              </div>

              {/* Status and Summary */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Score</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getCompletenessStatus(analysis.completenessScore).color}`}>
                    {getCompletenessStatus(analysis.completenessScore).text}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Resume Quality Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your resume has been parsed successfully. We found {analysis.detectedSkills.length} skills. You can further optimize your scorecard by fixing the missing sections identified below.
                </p>
              </div>

            </motion.div>

            {/* Missing Sections & Suggested Improvements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-6">
              
              {/* Missing Sections */}
              {analysis.missingSections && analysis.missingSections.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-500" /> Missing Key Resume Sections
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSections.map((sec, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" /> Actionable Suggested Improvements
                </h3>
                <ul className="space-y-2">
                  {analysis.suggestedImprovements.map((imp, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                      <ChevronRight className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Common placement role fit */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#10B981]" /> Career Alignment & Role Fit
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on skills and credentials parsed from your resume, here is your compatibility score across popular campus roles:
              </p>
              
              <div className="space-y-4 pt-2">
                {analysis.roleMatches.map((rm, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800">{rm.roleName}</span>
                      <span className="text-[#10B981]">{rm.matchScore}% Fit</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${rm.matchScore}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                        className="h-full bg-emerald-500 rounded-full" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{rm.matchReason}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Job Match Comparison */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Detected skills card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Parsed Skills Tag Cloud
              </h3>
              <motion.div 
                className="flex flex-wrap gap-1.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.02
                    }
                  }
                }}
              >
                {analysis.detectedSkills.map((sk, i) => (
                  <motion.span 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
                    }}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {sk}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Job Matcher Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#10B981]" /> Compare Against Campus Job
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Select an active campus recruitment drive opportunity to evaluate how well your resume matches its specific requirements.
                </p>
              </div>

              {/* Selector */}
              <div>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#10B981] appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Job Opportunity --</option>
                  {jobs.filter(j => j.status === 'Open').map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.companyName} ({job.salaryPackage})
                    </option>
                  ))}
                </select>
              </div>

              {/* Comparison Results */}
              {selectedJob && comparison ? (
                <div className="space-y-5 pt-3 border-t border-slate-100">
                  
                  {/* Job Match Percentage Bar */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800">Overall Match Score</span>
                      <span className="text-[#10B981]">{comparison.matchPercentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${comparison.matchPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-emerald-500 rounded-full" 
                      />
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-4">
                    
                    {/* Matching skills */}
                    {comparison.matchingSkills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Matching Skills ({comparison.matchingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {comparison.matchingSkills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {comparison.missingSkills.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Missing Skills ({comparison.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {comparison.missingSkills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> You match all key technical skills for this role!
                      </div>
                    )}

                  </div>

                  {/* Recommendations list */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Suggestions to Improve Match
                    </span>
                    <ul className="space-y-2">
                      {comparison.suggestions.map((sug, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex gap-1.5 items-start leading-relaxed">
                          <ArrowRight className="w-3 h-3 text-[#10B981] shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Select a campus job opportunity to see matching percentages, matching skills, and resume recommendations.
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
