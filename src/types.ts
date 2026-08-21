export type Role = 'guest' | 'student' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  studentId?: string;
  companyId?: string;
  password?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  avatar: string;
  
  // Academic
  course: string; // e.g. B.Tech, BCA, MCA, M.Tech
  department: string; // e.g. Computer Science, Information Technology, Electronics, Mechanical
  graduationYear: number;
  cgpa: number; // e.g. 8.4
  tenthPercent: number; // e.g. 88.5
  twelfthPercent: number; // e.g. 85.0
  backlogs: number;
  
  // Professional
  skills: string[];
  certifications: string[];
  projects: { title: string; description: string; techStack: string[]; link?: string }[];
  internships: { company: string; role: string; duration: string; description: string }[];
  linkedin: string;
  github: string;
  resumeName?: string;
  resumeUrl?: string;
  resumeUpdatedAt?: string;
  
  placementStatus: 'Placed' | 'Not Placed' | 'In Process';
  reminderPreferences?: ReminderPreferences;
  resumeAnalysis?: ResumeAnalysis;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Inactive';
  totalHired: number;
  avgPackage: string;
  joinedDate: string;
  companySize?: string;
  linkedIn?: string;
  foundedYear?: string;
}

export interface EligibilityCriteria {
  minCgpa: number;
  min10thPercent: number;
  min12thPercent: number;
  maxBacklogs: number;
  eligibleCourses: string[];
  eligibleDepartments: string[];
  graduationYear: number;
  requiredSkills: string[];
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  salaryPackage: string; // e.g. "12 LPA"
  numericPackageLpa: number; // e.g. 12.0
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Contract';
  vacancies: number;
  applicationDeadline: string; // YYYY-MM-DD
  eligibility: EligibilityCriteria;
  status: 'Draft' | 'Open' | 'Closed' | 'Completed';
  createdAt: string;
  isOffCampus?: boolean;
  source?: 'LinkedIn' | 'Naukri' | 'Indeed' | 'Glassdoor' | 'Others';
  originalJobUrl?: string;
  savedByStudentIds?: string[];
  experienceRequired?: string;
}

export type ApplicationStage = 
  | 'Applied' 
  | 'Shortlisted' 
  | 'Assessment' 
  | 'Technical Interview' 
  | 'HR Interview' 
  | 'Selected' 
  | 'Rejected';

export interface TimelineEvent {
  stage: ApplicationStage;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
  remarks?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  studentCourse: string;
  studentDepartment: string;
  studentCgpa: number;
  studentSkills: string[];
  appliedDate: string;
  status: ApplicationStage;
  remarks?: string;
  timeline: TimelineEvent[];
  aiEvaluation?: {
    matchScore: number;
    fitSummary: string;
    strengths: string[];
    gaps: string[];
    recommendation: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  studentId: string;
  studentName: string;
  companyName: string;
  jobTitle: string;
  round: 'Aptitude' | 'Coding' | 'Technical' | 'HR' | 'Final';
  date: string;
  time: string;
  venue: string;
  meetingLink?: string;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface PlacementRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  department: string;
  course: string;
  companyName: string;
  jobTitle: string;
  packageOffered: string; // e.g., "14.5 LPA"
  numericPackageLpa: number;
  placementDate: string;
  offerStatus: 'Accepted' | 'Pending' | 'Declined';
  joiningDate: string;
  placementYear: number;
}

export interface Notification {
  id: string;
  userId: string; // 'all', 'student', 'recruiter', or specific ID
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'drive' | 'shortlist' | 'interview' | 'selection' | 'admin' | 'info';
  linkTab?: string;
}

export interface EligibilityCheckResult {
  isEligible: boolean;
  scorePercent: number; // percentage of criteria passed
  failedCriteriaCount: number;
  checks: {
    rule: string;
    passed: boolean;
    studentValue: string | number;
    requiredValue: string | number;
    message: string;
  }[];
}

export type EventType = 'Interview' | 'Assessment' | 'Placement Drive' | 'Deadline' | 'Personal';

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface PlacementEvent {
  id: string;
  title: string;
  eventType: EventType;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  meetingLink?: string;
  description: string;
  instructions?: string;
  status: EventStatus;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  
  // Custom reminder selection
  reminderTime?: '1 day before' | '12 hours before' | '1 hour before' | 'none' | string;
  
  // For filters and access control
  recruiterId?: string; // Created by recruiter (optional)
  eligibleStudentIds?: string[]; // student ids eligible (e.g. ['std_101', ...]) or 'all'
  userId?: string; // If this is a personal reminder created by a specific user/student
  createdAt: string;
}

export interface ReminderPreferences {
  email: boolean;
  push: boolean;
  advanceTime: '1 day before' | '12 hours before' | '1 hour before' | 'none' | string;
}

export interface ResumeAnalysis {
  completenessScore: number;
  detectedSkills: string[];
  missingSections: string[];
  suggestedImprovements: string[];
  roleMatches: {
    roleName: string;
    matchScore: number;
    matchReason: string;
  }[];
}
