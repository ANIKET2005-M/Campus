import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  User, 
  StudentProfile, 
  Company, 
  Job, 
  Application, 
  Interview, 
  PlacementRecord, 
  Notification,
  ApplicationStage,
  Role,
  PlacementEvent
} from '../src/types.js';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENT_PROFILES, 
  INITIAL_COMPANIES, 
  INITIAL_JOBS, 
  INITIAL_APPLICATIONS, 
  INITIAL_INTERVIEWS, 
  INITIAL_PLACEMENT_RECORDS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_PLACEMENT_EVENTS
} from '../src/data/mockData.js';

export interface DatabaseSchema {
  users: User[];
  studentProfiles: StudentProfile[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  placementRecords: PlacementRecord[];
  notifications: Notification[];
  placementEvents: PlacementEvent[];
}

const prisma = new PrismaClient();

// Helper to map DB models to Frontend TypeScript interfaces
function mapUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role.toLowerCase() as Role,
    avatar: dbUser.avatar || undefined,
    studentId: dbUser.student?.id || undefined,
    companyId: dbUser.recruiter?.companyId || undefined
  };
}

function mapStudent(dbStudent: any): StudentProfile {
  const resume = dbStudent.resume;
  const analysis = resume?.analysis;

  return {
    id: dbStudent.id,
    userId: dbStudent.userId,
    fullName: dbStudent.fullName,
    registrationNumber: dbStudent.registrationNumber,
    email: dbStudent.email,
    phone: dbStudent.phone,
    dateOfBirth: dbStudent.dateOfBirth,
    address: dbStudent.address,
    avatar: dbStudent.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    course: dbStudent.course,
    department: dbStudent.department,
    graduationYear: dbStudent.graduationYear,
    cgpa: dbStudent.cgpa,
    tenthPercent: dbStudent.tenthPercent,
    twelfthPercent: dbStudent.twelfthPercent,
    backlogs: dbStudent.backlogs,
    skills: dbStudent.skills.map((ss: any) => ss.skill.name),
    certifications: (dbStudent.certifications as string[]) || [],
    projects: (dbStudent.projects as any[]) || [],
    internships: (dbStudent.internships as any[]) || [],
    linkedin: dbStudent.linkedin || '',
    github: dbStudent.github || '',
    placementStatus: dbStudent.placementStatus as any,
    resumeName: resume?.fileName || undefined,
    resumeUrl: resume?.filePath || undefined,
    resumeUpdatedAt: resume?.uploadedAt ? resume.uploadedAt.toISOString().split('T')[0] : undefined,
    resumeAnalysis: analysis ? {
      detectedSkills: (analysis.extractedSkills as string[]) || [],
      completenessScore: analysis.matchScore || 0,
      suggestedImprovements: (analysis.suggestions as string[]) || [],
      roleMatches: (analysis.roleMatches as any[]) || []
    } : undefined
  };
}

function mapCompany(dbCompany: any): Company {
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    logo: dbCompany.logo,
    industry: dbCompany.industry,
    website: dbCompany.website,
    location: dbCompany.location,
    description: dbCompany.description,
    recruiterName: dbCompany.recruiterName || undefined,
    recruiterEmail: dbCompany.recruiterEmail || undefined,
    recruiterPhone: dbCompany.recruiterPhone || undefined,
    status: dbCompany.verificationStatus as any,
    totalHired: dbCompany.totalHired,
    avgPackage: dbCompany.avgPackage,
    joinedDate: dbCompany.joinedDate || undefined
  };
}

function mapJob(dbJob: any): Job {
  return {
    id: dbJob.id,
    companyId: dbJob.companyId,
    companyName: dbJob.companyName,
    companyLogo: dbJob.companyLogo,
    title: dbJob.title,
    description: dbJob.description,
    responsibilities: (dbJob.responsibilities as string[]) || [],
    requiredSkills: dbJob.skills.map((js: any) => js.skill.name),
    salaryPackage: dbJob.salaryPackage,
    numericPackageLpa: dbJob.numericPackageLpa,
    location: dbJob.location,
    jobType: dbJob.jobType as any,
    vacancies: dbJob.vacancies,
    applicationDeadline: dbJob.applicationDeadline,
    eligibility: (dbJob.eligibility as any) || {},
    status: dbJob.status as any,
    createdAt: dbJob.createdAt.toISOString().split('T')[0],
    isOffCampus: dbJob.isOffCampus,
    source: dbJob.source || undefined,
    originalJobUrl: dbJob.originalJobUrl || undefined,
    savedByStudentIds: dbJob.savedJobs.map((sj: any) => sj.studentId),
    experienceRequired: dbJob.experienceRequired || undefined
  };
}

function mapApplication(dbApp: any): Application {
  return {
    id: dbApp.id,
    jobId: dbApp.jobId,
    jobTitle: dbApp.jobTitle,
    companyId: dbApp.companyId,
    companyName: dbApp.companyName,
    companyLogo: dbApp.companyLogo,
    studentId: dbApp.studentId,
    studentName: dbApp.studentName,
    studentRegNo: dbApp.studentRegNo,
    studentCourse: dbApp.studentCourse,
    studentDepartment: dbApp.studentDepartment,
    studentCgpa: dbApp.studentCgpa,
    studentSkills: (dbApp.studentSkills as string[]) || [],
    appliedDate: dbApp.appliedDate,
    status: dbApp.status as any,
    remarks: dbApp.remarks || undefined,
    timeline: (dbApp.timeline as any[]) || [],
    aiEvaluation: dbApp.aiEvaluation || undefined
  };
}

function mapInterview(dbInt: any): Interview {
  return {
    id: dbInt.id,
    applicationId: dbInt.applicationId,
    jobId: dbInt.jobId,
    studentId: dbInt.studentId,
    studentName: dbInt.studentName,
    companyName: dbInt.companyName,
    jobTitle: dbInt.jobTitle,
    round: dbInt.round as any,
    date: dbInt.date,
    time: dbInt.time,
    venue: dbInt.venue,
    meetingLink: dbInt.meetingLink || undefined,
    interviewer: dbInt.interviewer,
    status: dbInt.status as any,
    notes: dbInt.notes || undefined
  };
}

function mapPlacementRecord(dbPr: any): PlacementRecord {
  return {
    id: dbPr.id,
    studentId: dbPr.studentId,
    studentName: dbPr.studentName,
    studentRegNo: dbPr.studentRegNo,
    department: dbPr.department,
    course: dbPr.course,
    companyName: dbPr.companyName,
    jobTitle: dbPr.jobTitle,
    packageOffered: dbPr.packageOffered,
    numericPackageLpa: dbPr.numericPackageLpa,
    placementDate: dbPr.placementDate,
    offerStatus: dbPr.offerStatus as any,
    joiningDate: dbPr.joiningDate,
    placementYear: dbPr.placementYear
  };
}

function mapNotification(dbNotif: any): Notification {
  return {
    id: dbNotif.id,
    userId: dbNotif.userId,
    title: dbNotif.title,
    message: dbNotif.message,
    date: dbNotif.date,
    read: dbNotif.read,
    type: dbNotif.type as any,
    linkTab: dbNotif.linkTab || undefined
  };
}

function mapCalendarEvent(dbEvt: any): PlacementEvent {
  let uiType: 'Placement Drive' | 'Assessment' | 'Interview' | 'Deadline' | 'Personal' = 'Personal';
  if (dbEvt.eventType === 'PLACEMENT_DRIVE') uiType = 'Placement Drive';
  else if (dbEvt.eventType === 'ASSESSMENT') uiType = 'Assessment';
  else if (dbEvt.eventType === 'INTERVIEW') uiType = 'Interview';
  else if (dbEvt.eventType === 'DEADLINE') uiType = 'Deadline';

  return {
    id: dbEvt.id,
    title: dbEvt.title,
    eventType: uiType,
    companyId: dbEvt.companyId || undefined,
    companyName: dbEvt.companyName || undefined,
    companyLogo: dbEvt.companyLogo || undefined,
    jobId: dbEvt.jobId || undefined,
    jobTitle: dbEvt.jobTitle || undefined,
    applicationId: dbEvt.applicationId || undefined,
    date: dbEvt.date,
    startTime: dbEvt.startTime,
    endTime: dbEvt.endTime,
    location: dbEvt.location,
    meetingLink: dbEvt.meetingLink || undefined,
    description: dbEvt.description,
    instructions: dbEvt.instructions || undefined,
    status: dbEvt.status as any,
    approvalStatus: dbEvt.approvalStatus as any,
    reminderTime: dbEvt.reminderTime || undefined,
    recruiterId: dbEvt.recruiterId || undefined,
    eligibleStudentIds: (dbEvt.eligibleStudentIds as string[]) || [],
    userId: dbEvt.userId || undefined,
    createdAt: dbEvt.createdAt.toISOString()
  };
}

export class Database {
  constructor() {}

  public async getState(): Promise<DatabaseSchema> {
    const [
      dbUsers,
      dbStudents,
      dbCompanies,
      dbJobs,
      dbApps,
      dbInts,
      dbPrs,
      dbNotifs,
      dbEvts
    ] = await Promise.all([
      prisma.user.findMany({
        include: { student: true, recruiter: true }
      }),
      prisma.student.findMany({
        include: {
          user: true,
          skills: { include: { skill: true } },
          resume: { include: { analysis: true } }
        }
      }),
      prisma.company.findMany(),
      prisma.job.findMany({
        include: {
          skills: { include: { skill: true } },
          savedJobs: true
        }
      }),
      prisma.application.findMany(),
      prisma.interview.findMany(),
      prisma.placementRecord.findMany(),
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.calendarEvent.findMany({
        orderBy: { date: 'asc' }
      })
    ]);

    return {
      users: dbUsers.map(mapUser),
      studentProfiles: dbStudents.map(mapStudent),
      companies: dbCompanies.map(mapCompany),
      jobs: dbJobs.map(mapJob),
      applications: dbApps.map(mapApplication),
      interviews: dbInts.map(mapInterview),
      placementRecords: dbPrs.map(mapPlacementRecord),
      notifications: dbNotifs.map(mapNotification),
      placementEvents: dbEvts.map(mapCalendarEvent)
    };
  }

  public async resetToDefaultData(): Promise<DatabaseSchema> {
    console.log('Resetting database to default seed data...');

    // Clear tables
    await prisma.eventParticipant.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.savedJob.deleteMany();
    await prisma.jobRecommendation.deleteMany();
    await prisma.eligibilityResult.deleteMany();
    await prisma.application.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.placementRecord.deleteMany();
    await prisma.resumeAnalysis.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.studentSkill.deleteMany();
    await prisma.jobSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.job.deleteMany();
    await prisma.recruiter.deleteMany();
    await prisma.student.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.externalJob.deleteMany();
    await prisma.placementStatistic.deleteMany();

    // 1. Seed Skills
    const skillNames = new Set<string>();
    INITIAL_STUDENT_PROFILES.forEach(s => s.skills.forEach(sk => skillNames.add(sk.trim())));
    INITIAL_JOBS.forEach(j => j.requiredSkills.forEach(sk => skillNames.add(sk.trim())));
    
    const skillsMap = new Map<string, string>();
    for (const name of skillNames) {
      if (name) {
        const skill = await prisma.skill.create({ data: { name } });
        skillsMap.set(name, skill.id);
      }
    }

    // 2. Seed Companies
    const companiesMap = new Map<string, string>();
    for (const c of INITIAL_COMPANIES) {
      const created = await prisma.company.create({
        data: {
          id: c.id,
          name: c.name,
          logo: c.logo,
          description: c.description,
          industry: c.industry,
          website: c.website,
          location: c.location,
          companySize: c.companySize || null,
          verificationStatus: c.status || 'Verified',
          recruiterName: c.recruiterName || null,
          recruiterEmail: c.recruiterEmail || null,
          recruiterPhone: c.recruiterPhone || null,
          totalHired: c.totalHired,
          avgPackage: c.avgPackage,
          joinedDate: c.joinedDate || null
        }
      });
      companiesMap.set(c.id, created.id);
    }

    // 3. Seed Users & Sub-profiles
    const studentsMap = new Map<string, string>();
    for (const u of INITIAL_USERS) {
      let dbRole: 'STUDENT' | 'RECRUITER' | 'ADMIN' = 'STUDENT';
      if (u.role === 'recruiter') dbRole = 'RECRUITER';
      else if (u.role === 'admin') dbRole = 'ADMIN';

      const passwordHash = await bcrypt.hash('password123', 10);

      const createdUser = await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email.toLowerCase(),
          passwordHash,
          role: dbRole,
          avatar: u.avatar || null
        }
      });

      if (dbRole === 'STUDENT') {
        const profile = INITIAL_STUDENT_PROFILES.find(sp => sp.userId === u.id || sp.id === u.studentId);
        if (profile) {
          const createdStudent = await prisma.student.create({
            data: {
              id: profile.id,
              userId: createdUser.id,
              studentId: profile.studentId || null,
              fullName: profile.fullName,
              registrationNumber: profile.registrationNumber,
              email: profile.email.toLowerCase(),
              phone: profile.phone,
              dateOfBirth: profile.dateOfBirth,
              address: profile.address,
              course: profile.course,
              department: profile.department,
              graduationYear: profile.graduationYear,
              cgpa: profile.cgpa,
              tenthPercent: profile.tenthPercent,
              twelfthPercent: profile.twelfthPercent,
              backlogs: profile.backlogs,
              placementStatus: profile.placementStatus,
              reminderPreferences: (profile.reminderPreferences as any) || {},
              certifications: profile.certifications || [],
              projects: profile.projects || [],
              internships: profile.internships || [],
              linkedin: profile.linkedin || null,
              github: profile.github || null
            }
          });
          studentsMap.set(profile.id, createdStudent.id);

          for (const skName of profile.skills) {
            const skillId = skillsMap.get(skName.trim());
            if (skillId) {
              await prisma.studentSkill.create({
                data: { studentId: createdStudent.id, skillId }
              }).catch(() => {});
            }
          }
        }
      }

      if (dbRole === 'RECRUITER') {
        const rCompanyId = u.companyId || INITIAL_COMPANIES[0]?.id || null;
        await prisma.recruiter.create({
          data: {
            id: `recr_${u.id}`,
            userId: createdUser.id,
            companyId: rCompanyId,
            designation: 'Hiring Manager',
            phone: null,
            verificationStatus: 'Verified'
          }
        });
      }
    }

    // 4. Seed Jobs
    const jobsMap = new Map<string, string>();
    for (const j of INITIAL_JOBS) {
      let jobCompanyId = j.companyId;
      if (!companiesMap.has(jobCompanyId)) {
        if (j.isOffCampus) {
          const stubCompanyId = `comp_ext_${j.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          if (!companiesMap.has(stubCompanyId)) {
            const cCompany = await prisma.company.create({
              data: {
                id: stubCompanyId,
                name: j.companyName,
                logo: j.companyLogo || '',
                description: 'External off-campus hiring organization.',
                industry: 'Various',
                website: '',
                location: j.location || 'Remote',
                verificationStatus: 'Verified'
              }
            });
            companiesMap.set(stubCompanyId, cCompany.id);
          }
          jobCompanyId = stubCompanyId;
        } else {
          jobCompanyId = Array.from(companiesMap.keys())[0] || 'comp_1';
        }
      }

      const createdJob = await prisma.job.create({
        data: {
          id: j.id,
          companyId: jobCompanyId,
          companyName: j.companyName,
          companyLogo: j.companyLogo || '',
          title: j.title,
          description: j.description,
          responsibilities: j.responsibilities || [],
          salaryPackage: j.salaryPackage,
          numericPackageLpa: j.numericPackageLpa,
          location: j.location,
          jobType: j.jobType,
          vacancies: j.vacancies,
          applicationDeadline: j.applicationDeadline,
          eligibility: (j.eligibility as any) || {},
          status: j.status,
          isOffCampus: !!j.isOffCampus,
          source: j.source || null,
          originalJobUrl: j.originalJobUrl || null,
          experienceRequired: j.experienceRequired || null
        }
      });
      jobsMap.set(j.id, createdJob.id);

      for (const skName of j.requiredSkills) {
        const skillId = skillsMap.get(skName.trim());
        if (skillId) {
          await prisma.jobSkill.create({
            data: { jobId: createdJob.id, skillId }
          }).catch(() => {});
        }
      }

      if (Array.isArray(j.savedByStudentIds)) {
        for (const sId of j.savedByStudentIds) {
          if (studentsMap.has(sId)) {
            await prisma.savedJob.create({
              data: { studentId: sId, jobId: createdJob.id }
            }).catch(() => {});
          }
        }
      }
    }

    // 5. Seed Applications
    for (const a of INITIAL_APPLICATIONS) {
      if (studentsMap.has(a.studentId) && jobsMap.has(a.jobId)) {
        await prisma.application.create({
          data: {
            id: a.id,
            jobId: a.jobId,
            studentId: a.studentId,
            jobTitle: a.jobTitle,
            companyId: a.companyId,
            companyName: a.companyName,
            companyLogo: a.companyLogo,
            studentName: a.studentName,
            studentRegNo: a.studentRegNo,
            studentCourse: a.studentCourse,
            studentDepartment: a.studentDepartment,
            studentCgpa: a.studentCgpa,
            studentSkills: a.studentSkills || [],
            appliedDate: a.appliedDate,
            status: a.status,
            remarks: a.remarks || null,
            timeline: a.timeline || [],
            aiEvaluation: a.aiEvaluation || null
          }
        });
      }
    }

    // 6. Seed Interviews
    for (const i of INITIAL_INTERVIEWS) {
      if (studentsMap.has(i.studentId) && jobsMap.has(i.jobId)) {
        let appId = i.applicationId;
        const appExists = await prisma.application.findUnique({ where: { id: appId } });
        if (!appExists) {
          const app = await prisma.application.findFirst({
            where: { studentId: i.studentId, jobId: i.jobId }
          });
          if (app) appId = app.id;
          else continue;
        }

        await prisma.interview.create({
          data: {
            id: i.id,
            applicationId: appId,
            jobId: i.jobId,
            studentId: i.studentId,
            studentName: i.studentName,
            companyName: i.companyName,
            jobTitle: i.jobTitle,
            round: i.round,
            date: i.date,
            time: i.time,
            venue: i.venue,
            meetingLink: i.meetingLink || null,
            interviewer: i.interviewer,
            status: i.status,
            notes: i.notes || null
          }
        });
      }
    }

    // 7. Seed Placement Records
    for (const pr of INITIAL_PLACEMENT_RECORDS) {
      await prisma.placementRecord.create({
        data: {
          id: pr.id,
          studentId: pr.studentId,
          studentName: pr.studentName,
          studentRegNo: pr.studentRegNo,
          department: pr.department,
          course: pr.course,
          companyName: pr.companyName,
          jobTitle: pr.jobTitle,
          packageOffered: pr.packageOffered,
          numericPackageLpa: pr.numericPackageLpa,
          placementDate: pr.placementDate,
          offerStatus: pr.offerStatus,
          joiningDate: pr.joiningDate,
          placementYear: pr.placementYear
        }
      });
    }

    // 8. Seed Notifications
    for (const n of INITIAL_NOTIFICATIONS) {
      await prisma.notification.create({
        data: {
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          date: n.date,
          read: n.read,
          type: n.type,
          linkTab: n.linkTab || null
        }
      });
    }

    // 9. Seed Calendar Events
    for (const e of INITIAL_PLACEMENT_EVENTS) {
      const dbCompanyId = e.companyId && companiesMap.has(e.companyId) ? e.companyId : null;
      const dbJobId = e.jobId && jobsMap.has(e.jobId) ? e.jobId : null;

      let normType = 'PERSONAL';
      if (e.eventType === 'Placement Drive') normType = 'PLACEMENT_DRIVE';
      else if (e.eventType === 'Assessment') normType = 'ASSESSMENT';
      else if (e.eventType === 'Interview') normType = 'INTERVIEW';
      else if (e.eventType === 'Deadline') normType = 'DEADLINE';

      await prisma.calendarEvent.create({
        data: {
          id: e.id,
          title: e.title,
          eventType: normType,
          companyId: dbCompanyId,
          companyName: e.companyName || null,
          companyLogo: e.companyLogo || null,
          jobId: dbJobId,
          jobTitle: e.jobTitle || null,
          applicationId: e.applicationId || null,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
          meetingLink: e.meetingLink || null,
          description: e.description,
          instructions: e.instructions || null,
          status: e.status,
          approvalStatus: e.approvalStatus || 'Approved',
          reminderTime: e.reminderTime || null,
          recruiterId: e.recruiterId || null,
          eligibleStudentIds: e.eligibleStudentIds || [],
          userId: e.userId || null
        }
      });
    }

    // 10. Seed Placement Statistics
    await prisma.placementStatistic.create({
      data: {
        year: 2026,
        totalEligible: 120,
        totalPlaced: 85,
        totalOffers: 94,
        averagePackage: 11.2,
        highestPackage: 32.5,
        placementRate: 70.83
      }
    });

    return this.getState();
  }

  // --- User Authentication & Registration ---
  public async authenticateUser(email: string, password?: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email.toLowerCase() } },
      include: { student: true, recruiter: true }
    });
    if (!user) return null;

    if (password) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return null;
    }
    return mapUser(user);
  }

  public async registerUser(payload: {
    email: string;
    password?: string;
    role: Role;
    name: string;
    studentDetails?: Partial<StudentProfile>;
    companyDetails?: Partial<Company>;
  }): Promise<{ success: boolean; message: string; user?: User; studentProfile?: StudentProfile; company?: Company }> {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: payload.email.toLowerCase() } }
    });
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUserId = `user_${Date.now()}`;
    let newStudentId: string | undefined;
    let newCompanyId: string | undefined;
    let createdStudent: any = undefined;
    let createdCompany: any = undefined;

    const passwordHash = await bcrypt.hash(payload.password || 'password123', 10);

    let dbRole: 'STUDENT' | 'RECRUITER' | 'ADMIN' = 'STUDENT';
    if (payload.role === 'recruiter') dbRole = 'RECRUITER';
    else if (payload.role === 'admin') dbRole = 'ADMIN';

    // Transaction to ensure atomic registration
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: newUserId,
          name: payload.name,
          email: payload.email.toLowerCase(),
          passwordHash,
          role: dbRole,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }
      });

      if (dbRole === 'STUDENT') {
        newStudentId = `std_${Date.now()}`;
        createdStudent = await tx.student.create({
          data: {
            id: newStudentId,
            userId: user.id,
            fullName: payload.name,
            registrationNumber: payload.studentDetails?.registrationNumber || `REG${Date.now().toString().slice(-6)}`,
            email: payload.email.toLowerCase(),
            phone: payload.studentDetails?.phone || '+91 98765 43210',
            dateOfBirth: payload.studentDetails?.dateOfBirth || '2003-01-01',
            address: payload.studentDetails?.address || 'University Campus Hostel',
            course: payload.studentDetails?.course || 'BCA',
            department: payload.studentDetails?.department || 'Computer Science',
            graduationYear: payload.studentDetails?.graduationYear || 2026,
            cgpa: payload.studentDetails?.cgpa || 8.0,
            tenthPercent: payload.studentDetails?.tenthPercent || 85.0,
            twelfthPercent: payload.studentDetails?.twelfthPercent || 82.0,
            backlogs: 0,
            placementStatus: 'In Process',
            certifications: payload.studentDetails?.certifications || ['University Foundations'],
            projects: [],
            internships: [],
            linkedin: payload.studentDetails?.linkedin || '',
            github: payload.studentDetails?.github || ''
          }
        });

        const skillsToLink = payload.studentDetails?.skills || ['JavaScript', 'Python', 'SQL', 'Git'];
        for (const skName of skillsToLink) {
          // Find or create skill
          let skill = await tx.skill.findUnique({ where: { name: skName } });
          if (!skill) {
            skill = await tx.skill.create({ data: { name: skName } });
          }
          await tx.studentSkill.create({
            data: { studentId: createdStudent.id, skillId: skill.id }
          });
        }
      } else if (dbRole === 'RECRUITER') {
        newCompanyId = `comp_${Date.now()}`;
        createdCompany = await tx.company.create({
          data: {
            id: newCompanyId,
            name: payload.companyDetails?.name || `${payload.name}'s Corp`,
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            industry: payload.companyDetails?.industry || 'Information Technology',
            website: payload.companyDetails?.website || 'https://company.example.com',
            location: payload.companyDetails?.location || 'Bangalore / Remote',
            description: payload.companyDetails?.description || 'Registered hiring organization on CampusHire.',
            recruiterName: payload.name,
            recruiterEmail: payload.email.toLowerCase(),
            recruiterPhone: payload.companyDetails?.recruiterPhone || '+91 98000 11122',
            verificationStatus: 'Verified',
            totalHired: 0,
            avgPackage: '12.5 LPA',
            joinedDate: new Date().toISOString().split('T')[0]
          }
        });

        await tx.recruiter.create({
          data: {
            id: `recr_${user.id}`,
            userId: user.id,
            companyId: createdCompany.id,
            designation: 'Hiring Manager',
            phone: payload.companyDetails?.recruiterPhone || null,
            verificationStatus: 'Verified'
          }
        });
      }

      return { user, createdStudent, createdCompany };
    });

    // Re-fetch Student with relations if it was created
    let fullStudentProfile: StudentProfile | undefined;
    if (result.createdStudent) {
      const dbStud = await prisma.student.findUnique({
        where: { id: result.createdStudent.id },
        include: {
          user: true,
          skills: { include: { skill: true } },
          resume: { include: { analysis: true } }
        }
      });
      if (dbStud) fullStudentProfile = mapStudent(dbStud);
    }

    return {
      success: true,
      message: 'User account registered successfully!',
      user: mapUser({
        ...result.user,
        student: result.createdStudent ? { id: result.createdStudent.id } : null,
        recruiter: result.createdCompany ? { companyId: result.createdCompany.id } : null
      }),
      studentProfile: fullStudentProfile,
      company: result.createdCompany ? mapCompany(result.createdCompany) : undefined
    };
  }

  // --- Student Profiles ---
  public async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> {
    const studentExists = await prisma.student.findUnique({ where: { id } });
    if (!studentExists) return null;

    const dataToUpdate: any = {};
    if (updates.fullName !== undefined) dataToUpdate.fullName = updates.fullName;
    if (updates.registrationNumber !== undefined) dataToUpdate.registrationNumber = updates.registrationNumber;
    if (updates.phone !== undefined) dataToUpdate.phone = updates.phone;
    if (updates.dateOfBirth !== undefined) dataToUpdate.dateOfBirth = updates.dateOfBirth;
    if (updates.address !== undefined) dataToUpdate.address = updates.address;
    if (updates.course !== undefined) dataToUpdate.course = updates.course;
    if (updates.department !== undefined) dataToUpdate.department = updates.department;
    if (updates.graduationYear !== undefined) dataToUpdate.graduationYear = updates.graduationYear;
    if (updates.cgpa !== undefined) dataToUpdate.cgpa = updates.cgpa;
    if (updates.tenthPercent !== undefined) dataToUpdate.tenthPercent = updates.tenthPercent;
    if (updates.twelfthPercent !== undefined) dataToUpdate.twelfthPercent = updates.twelfthPercent;
    if (updates.backlogs !== undefined) dataToUpdate.backlogs = updates.backlogs;
    if (updates.certifications !== undefined) dataToUpdate.certifications = updates.certifications;
    if (updates.projects !== undefined) dataToUpdate.projects = updates.projects;
    if (updates.internships !== undefined) dataToUpdate.internships = updates.internships;
    if (updates.linkedin !== undefined) dataToUpdate.linkedin = updates.linkedin;
    if (updates.github !== undefined) dataToUpdate.github = updates.github;
    if (updates.placementStatus !== undefined) dataToUpdate.placementStatus = updates.placementStatus;
    if (updates.reminderPreferences !== undefined) dataToUpdate.reminderPreferences = updates.reminderPreferences;

    // Handle resume updates
    if (updates.resumeName !== undefined || updates.resumeUrl !== undefined || updates.resumeAnalysis !== undefined) {
      const resume = await prisma.resume.upsert({
        where: { studentId: id },
        update: {
          fileName: updates.resumeName || 'Resume.pdf',
          filePath: updates.resumeUrl || '',
          uploadedAt: new Date(),
          analysisScore: updates.resumeAnalysis?.completenessScore || null
        },
        create: {
          studentId: id,
          fileName: updates.resumeName || 'Resume.pdf',
          filePath: updates.resumeUrl || '',
          parsedText: `Parsed resume text of ${updates.fullName || studentExists.fullName}`,
          analysisScore: updates.resumeAnalysis?.completenessScore || null
        }
      });

      if (updates.resumeAnalysis) {
        await prisma.resumeAnalysis.upsert({
          where: { resumeId: resume.id },
          update: {
            extractedSkills: updates.resumeAnalysis.detectedSkills || [],
            matchScore: updates.resumeAnalysis.completenessScore || 0,
            suggestions: updates.resumeAnalysis.suggestedImprovements || [],
            roleMatches: updates.resumeAnalysis.roleMatches || []
          },
          create: {
            resumeId: resume.id,
            extractedSkills: updates.resumeAnalysis.detectedSkills || [],
            matchScore: updates.resumeAnalysis.completenessScore || 0,
            suggestions: updates.resumeAnalysis.suggestedImprovements || [],
            roleMatches: updates.resumeAnalysis.roleMatches || [],
            education: [],
            experience: [],
            projects: [],
            certifications: []
          }
        });
      }
    }

    if (updates.skills !== undefined && Array.isArray(updates.skills)) {
      // Clear skills and insert new ones
      await prisma.studentSkill.deleteMany({ where: { studentId: id } });
      for (const skName of updates.skills) {
        let skill = await prisma.skill.findUnique({ where: { name: skName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skName } });
        }
        await prisma.studentSkill.create({
          data: { studentId: id, skillId: skill.id }
        }).catch(() => {});
      }
    }

    const updated = await prisma.student.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: true,
        skills: { include: { skill: true } },
        resume: { include: { analysis: true } }
      }
    });

    return mapStudent(updated);
  }

  public async addStudentProfile(profileData: Omit<StudentProfile, 'id' | 'placementStatus'>): Promise<StudentProfile> {
    const newId = `std_${Date.now()}`;
    const createdStudent = await prisma.student.create({
      data: {
        id: newId,
        userId: profileData.userId,
        studentId: profileData.studentId || null,
        fullName: profileData.fullName,
        registrationNumber: profileData.registrationNumber,
        email: profileData.email.toLowerCase(),
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        course: profileData.course,
        department: profileData.department,
        graduationYear: profileData.graduationYear,
        cgpa: profileData.cgpa,
        tenthPercent: profileData.tenthPercent,
        twelfthPercent: profileData.twelfthPercent,
        backlogs: profileData.backlogs,
        placementStatus: 'In Process',
        certifications: profileData.certifications || [],
        projects: profileData.projects || [],
        internships: profileData.internships || [],
        linkedin: profileData.linkedin || null,
        github: profileData.github || null
      }
    });

    if (Array.isArray(profileData.skills)) {
      for (const skName of profileData.skills) {
        let skill = await prisma.skill.findUnique({ where: { name: skName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skName } });
        }
        await prisma.studentSkill.create({
          data: { studentId: createdStudent.id, skillId: skill.id }
        }).catch(() => {});
      }
    }

    const fullStud = await prisma.student.findUnique({
      where: { id: createdStudent.id },
      include: {
        user: true,
        skills: { include: { skill: true } },
        resume: { include: { analysis: true } }
      }
    });

    return mapStudent(fullStud);
  }

  // --- Companies ---
  public async addCompany(companyData: Omit<Company, 'id' | 'joinedDate' | 'totalHired'>): Promise<Company> {
    const newId = `comp_${Date.now()}`;
    const created = await prisma.company.create({
      data: {
        id: newId,
        name: companyData.name,
        logo: companyData.logo,
        description: companyData.description,
        industry: companyData.industry,
        website: companyData.website,
        location: companyData.location,
        companySize: companyData.companySize || null,
        verificationStatus: companyData.status || 'Verified',
        recruiterName: companyData.recruiterName || null,
        recruiterEmail: companyData.recruiterEmail || null,
        recruiterPhone: companyData.recruiterPhone || null,
        totalHired: 0,
        avgPackage: companyData.avgPackage || '0 LPA',
        joinedDate: new Date().toISOString().split('T')[0]
      }
    });
    return mapCompany(created);
  }

  public async updateCompanyStatus(companyId: string, status: Company['status']): Promise<Company | null> {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { verificationStatus: status }
    });
    return mapCompany(updated);
  }

  public async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.logo !== undefined) dataToUpdate.logo = updates.logo;
    if (updates.industry !== undefined) dataToUpdate.industry = updates.industry;
    if (updates.website !== undefined) dataToUpdate.website = updates.website;
    if (updates.location !== undefined) dataToUpdate.location = updates.location;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.recruiterName !== undefined) dataToUpdate.recruiterName = updates.recruiterName;
    if (updates.recruiterEmail !== undefined) dataToUpdate.recruiterEmail = updates.recruiterEmail;
    if (updates.recruiterPhone !== undefined) dataToUpdate.recruiterPhone = updates.recruiterPhone;
    if (updates.status !== undefined) dataToUpdate.verificationStatus = updates.status;
    if (updates.totalHired !== undefined) dataToUpdate.totalHired = updates.totalHired;
    if (updates.avgPackage !== undefined) dataToUpdate.avgPackage = updates.avgPackage;

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: dataToUpdate
    });

    // Synchronize company name and logo with jobs and applications
    if (updates.name || updates.logo) {
      await prisma.job.updateMany({
        where: { companyId },
        data: {
          companyName: updates.name || undefined,
          companyLogo: updates.logo || undefined
        }
      });
      await prisma.application.updateMany({
        where: { companyId },
        data: {
          companyName: updates.name || undefined,
          companyLogo: updates.logo || undefined
        }
      });
    }

    return mapCompany(updatedCompany);
  }

  // --- Jobs ---
  public async addJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const newId = `job_${Date.now()}`;
    const createdJob = await prisma.job.create({
      data: {
        id: newId,
        companyId: jobData.companyId,
        companyName: jobData.companyName,
        companyLogo: jobData.companyLogo,
        title: jobData.title,
        description: jobData.description,
        responsibilities: jobData.responsibilities || [],
        salaryPackage: jobData.salaryPackage,
        numericPackageLpa: jobData.numericPackageLpa,
        location: jobData.location,
        jobType: jobData.jobType,
        vacancies: jobData.vacancies,
        applicationDeadline: jobData.applicationDeadline,
        eligibility: (jobData.eligibility as any) || {},
        status: jobData.status || 'Draft',
        isOffCampus: !!jobData.isOffCampus,
        source: jobData.source || null,
        originalJobUrl: jobData.originalJobUrl || null,
        experienceRequired: jobData.experienceRequired || null
      }
    });

    // Add Job Skills
    if (Array.isArray(jobData.requiredSkills)) {
      for (const skName of jobData.requiredSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: skName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skName } });
        }
        await prisma.jobSkill.create({
          data: { jobId: createdJob.id, skillId: skill.id }
        }).catch(() => {});
      }
    }

    // Create notification for all students
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}`,
        userId: 'all',
        title: `New Placement Drive: ${createdJob.companyName}`,
        message: `${createdJob.companyName} posted position '${createdJob.title}' with package ${createdJob.salaryPackage}. Deadline: ${createdJob.applicationDeadline}`,
        date: 'Just now',
        read: false,
        type: 'drive',
        linkTab: 'jobs'
      }
    });

    // Get list of student IDs for calendar drive
    const students = await prisma.student.findMany({ select: { id: true } });
    const studentIds = students.map(s => s.id);

    // Create automatic calendar events
    const driveEvent: PlacementEvent = {
      id: `evt_drive_${Date.now()}`,
      title: `${createdJob.companyName} Placement Drive`,
      eventType: 'Placement Drive',
      companyId: createdJob.companyId,
      companyName: createdJob.companyName,
      companyLogo: createdJob.companyLogo,
      jobId: createdJob.id,
      jobTitle: createdJob.title,
      date: createdJob.createdAt.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '16:00',
      location: createdJob.location || 'Seminar Hall A',
      description: `Placement drive kickoff and pre-placement talk for '${createdJob.title}' by ${createdJob.companyName}.`,
      instructions: 'Formal attire is mandatory. Please carry printed copies of your resume.',
      status: 'Upcoming',
      approvalStatus: 'Approved',
      reminderTime: '1 day before',
      eligibleStudentIds: studentIds,
      createdAt: new Date().toISOString()
    };

    const deadlineEvent: PlacementEvent = {
      id: `evt_dead_${Date.now() + 1}`,
      title: `${createdJob.companyName} - Application Deadline`,
      eventType: 'Deadline',
      companyId: createdJob.companyId,
      companyName: createdJob.companyName,
      companyLogo: createdJob.companyLogo,
      jobId: createdJob.id,
      jobTitle: createdJob.title,
      date: createdJob.applicationDeadline,
      startTime: '23:59',
      endTime: '23:59',
      location: 'NextOffer Portal',
      description: `Deadline to apply for '${createdJob.title}' drive.`,
      instructions: 'Ensure your profile and CGPA details are correct prior to application.',
      status: 'Upcoming',
      approvalStatus: 'Approved',
      reminderTime: '12 hours before',
      eligibleStudentIds: studentIds,
      createdAt: new Date().toISOString()
    };

    // Helper conversion
    const mapType = (uiType: string) => {
      if (uiType === 'Placement Drive') return 'PLACEMENT_DRIVE';
      if (uiType === 'Deadline') return 'DEADLINE';
      return 'PERSONAL';
    };

    await prisma.calendarEvent.create({
      data: {
        id: driveEvent.id,
        title: driveEvent.title,
        eventType: mapType(driveEvent.eventType),
        companyId: driveEvent.companyId || null,
        companyName: driveEvent.companyName || null,
        companyLogo: driveEvent.companyLogo || null,
        jobId: driveEvent.jobId || null,
        jobTitle: driveEvent.jobTitle || null,
        date: driveEvent.date,
        startTime: driveEvent.startTime,
        endTime: driveEvent.endTime,
        location: driveEvent.location,
        description: driveEvent.description,
        instructions: driveEvent.instructions || null,
        status: driveEvent.status || 'Upcoming',
        approvalStatus: driveEvent.approvalStatus || 'Approved',
        reminderTime: driveEvent.reminderTime || null,
        eligibleStudentIds: driveEvent.eligibleStudentIds
      }
    });

    await prisma.calendarEvent.create({
      data: {
        id: deadlineEvent.id,
        title: deadlineEvent.title,
        eventType: mapType(deadlineEvent.eventType),
        companyId: deadlineEvent.companyId || null,
        companyName: deadlineEvent.companyName || null,
        companyLogo: deadlineEvent.companyLogo || null,
        jobId: deadlineEvent.jobId || null,
        jobTitle: deadlineEvent.jobTitle || null,
        date: deadlineEvent.date,
        startTime: deadlineEvent.startTime,
        endTime: deadlineEvent.endTime,
        location: deadlineEvent.location,
        description: deadlineEvent.description,
        instructions: deadlineEvent.instructions || null,
        status: deadlineEvent.status || 'Upcoming',
        approvalStatus: deadlineEvent.approvalStatus || 'Approved',
        reminderTime: deadlineEvent.reminderTime || null,
        eligibleStudentIds: deadlineEvent.eligibleStudentIds
      }
    });

    const fullJob = await prisma.job.findUnique({
      where: { id: createdJob.id },
      include: {
        skills: { include: { skill: true } },
        savedJobs: true
      }
    });

    return mapJob(fullJob);
  }

  public async updateJob(jobId: string, updates: Partial<Job>): Promise<Job | null> {
    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.responsibilities !== undefined) dataToUpdate.responsibilities = updates.responsibilities;
    if (updates.salaryPackage !== undefined) dataToUpdate.salaryPackage = updates.salaryPackage;
    if (updates.numericPackageLpa !== undefined) dataToUpdate.numericPackageLpa = updates.numericPackageLpa;
    if (updates.location !== undefined) dataToUpdate.location = updates.location;
    if (updates.jobType !== undefined) dataToUpdate.jobType = updates.jobType;
    if (updates.vacancies !== undefined) dataToUpdate.vacancies = updates.vacancies;
    if (updates.applicationDeadline !== undefined) dataToUpdate.applicationDeadline = updates.applicationDeadline;
    if (updates.eligibility !== undefined) dataToUpdate.eligibility = updates.eligibility;
    if (updates.status !== undefined) dataToUpdate.status = updates.status;
    if (updates.isOffCampus !== undefined) dataToUpdate.isOffCampus = updates.isOffCampus;
    if (updates.source !== undefined) dataToUpdate.source = updates.source;
    if (updates.originalJobUrl !== undefined) dataToUpdate.originalJobUrl = updates.originalJobUrl;
    if (updates.experienceRequired !== undefined) dataToUpdate.experienceRequired = updates.experienceRequired;

    if (updates.requiredSkills !== undefined && Array.isArray(updates.requiredSkills)) {
      await prisma.jobSkill.deleteMany({ where: { jobId } });
      for (const skName of updates.requiredSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: skName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skName } });
        }
        await prisma.jobSkill.create({
          data: { jobId, skillId: skill.id }
        }).catch(() => {});
      }
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: dataToUpdate,
      include: {
        skills: { include: { skill: true } },
        savedJobs: true
      }
    });

    return mapJob(updated);
  }

  public async saveJob(jobId: string, studentId: string): Promise<Job | null> {
    await prisma.savedJob.upsert({
      where: { studentId_jobId: { studentId, jobId } },
      update: {},
      create: { studentId, jobId }
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
        savedJobs: true
      }
    });

    return job ? mapJob(job) : null;
  }

  public async unsaveJob(jobId: string, studentId: string): Promise<Job | null> {
    await prisma.savedJob.deleteMany({
      where: { studentId, jobId }
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
        savedJobs: true
      }
    });

    return job ? mapJob(job) : null;
  }

  // --- Applications ---
  public async applyForJob(jobId: string, studentProfileId: string): Promise<{ success: boolean; message: string; application?: Application }> {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { success: false, message: 'Job posting not found.' };

    const studentProfile = await prisma.student.findUnique({ where: { id: studentProfileId } });
    if (!studentProfile) return { success: false, message: 'Student profile not found.' };

    const existing = await prisma.application.findUnique({
      where: { studentId_jobId: { studentId: studentProfile.id, jobId: job.id } }
    });
    if (existing) return { success: false, message: 'You have already applied for this placement drive.' };

    const newId = `app_${Date.now()}`;
    const newApp = await prisma.application.create({
      data: {
        id: newId,
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        studentId: studentProfile.id,
        studentName: studentProfile.fullName,
        studentRegNo: studentProfile.registrationNumber,
        studentCourse: studentProfile.course,
        studentDepartment: studentProfile.department,
        studentCgpa: studentProfile.cgpa,
        studentSkills: studentProfile.skills || [], // We can pull from db student profile later if preferred
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        timeline: [
          {
            stage: 'Applied',
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            remarks: 'Application submitted successfully'
          },
          { stage: 'Shortlisted', date: '-', status: 'upcoming' },
          { stage: 'Assessment', date: '-', status: 'upcoming' },
          { stage: 'Technical Interview', date: '-', status: 'upcoming' },
          { stage: 'HR Interview', date: '-', status: 'upcoming' },
          { stage: 'Selected', date: '-', status: 'upcoming' },
        ]
      }
    });

    // Add notification for student
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}`,
        userId: studentProfile.userId,
        title: `Application Confirmed: ${job.companyName}`,
        message: `Your application for ${job.title} at ${job.companyName} was received successfully.`,
        date: 'Just now',
        read: false,
        type: 'info',
        linkTab: 'applications'
      }
    });

    // Also pull current skills from Student Profile to save
    const dbStud = await prisma.student.findUnique({
      where: { id: studentProfileId },
      include: { skills: { include: { skill: true } } }
    });
    if (dbStud) {
      const currentSkills = dbStud.skills.map(ss => ss.skill.name);
      await prisma.application.update({
        where: { id: newApp.id },
        data: { studentSkills: currentSkills }
      });
      newApp.studentSkills = currentSkills;
    }

    return {
      success: true,
      message: `Application submitted for ${job.title} at ${job.companyName}!`,
      application: mapApplication(newApp)
    };
  }

  public async updateApplicationStatus(applicationId: string, newStatus: ApplicationStage, remarks?: string): Promise<Application | null> {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return null;

    const timeline = (app.timeline as any[]) || [];
    const updatedTimeline = timeline.map(t => {
      if (t.stage === newStatus) {
        return {
          ...t,
          date: new Date().toISOString().split('T')[0],
          status: (newStatus === 'Rejected' ? 'rejected' : 'completed') as any,
          remarks: remarks || t.remarks
        };
      }
      if (t.stage === app.status && newStatus !== 'Rejected') {
        return { ...t, status: 'completed' as any };
      }
      return t;
    });

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        remarks: remarks || app.remarks || null,
        timeline: updatedTimeline
      }
    });

    // Handle selection and placement record
    if (newStatus === 'Selected') {
      await prisma.student.update({
        where: { id: app.studentId },
        data: { placementStatus: 'Placed' }
      });

      const job = await prisma.job.findUnique({ where: { id: app.jobId } });
      const pkg = job?.salaryPackage || '10 LPA';
      const numPkg = job?.numericPackageLpa || 10.0;

      await prisma.placementRecord.create({
        data: {
          id: `place_${Date.now()}`,
          studentId: app.studentId,
          studentName: app.studentName,
          studentRegNo: app.studentRegNo,
          department: app.studentDepartment,
          course: app.studentCourse,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          packageOffered: pkg,
          numericPackageLpa: numPkg,
          placementDate: new Date().toISOString().split('T')[0],
          offerStatus: 'Accepted',
          joiningDate: `${new Date().getFullYear()}-07-01`,
          placementYear: new Date().getFullYear()
        }
      });

      // Increment company hired count
      await prisma.company.update({
        where: { id: app.companyId },
        data: { totalHired: { increment: 1 } }
      });
    }

    // Add notification
    const student = await prisma.student.findUnique({ where: { id: app.studentId } });
    if (student) {
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}`,
          userId: student.userId,
          title: `Application Status Updated: ${app.companyName}`,
          message: `Status changed to '${newStatus}' for ${app.jobTitle}.${remarks ? ` Note: ${remarks}` : ''}`,
          date: 'Just now',
          read: false,
          type: newStatus === 'Selected' ? 'selection' : newStatus === 'Shortlisted' ? 'shortlist' : 'info',
          linkTab: 'applications'
        }
      });
    }

    // Automatically generate an Assessment event if status changes to Assessment
    if (newStatus === 'Assessment') {
      const assessmentEvent: PlacementEvent = {
        id: `evt_assess_${Date.now()}`,
        title: `${app.companyName} Coding Assessment`,
        eventType: 'Assessment',
        companyId: app.companyId,
        companyName: app.companyName,
        companyLogo: app.companyLogo,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        applicationId: app.id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        startTime: '14:00',
        endTime: '16:00',
        location: 'Online Test Portal',
        description: `Online coding and technical assessment drive for '${app.jobTitle}' by ${app.companyName}.`,
        instructions: 'Please check your portal profile and system compatibility before starting.',
        status: 'Upcoming',
        approvalStatus: 'Approved',
        reminderTime: '1 day before',
        eligibleStudentIds: [app.studentId],
        createdAt: new Date().toISOString()
      };

      await prisma.calendarEvent.create({
        data: {
          id: assessmentEvent.id,
          title: assessmentEvent.title,
          eventType: 'ASSESSMENT',
          companyId: assessmentEvent.companyId || null,
          companyName: assessmentEvent.companyName || null,
          companyLogo: assessmentEvent.companyLogo || null,
          jobId: assessmentEvent.jobId || null,
          jobTitle: assessmentEvent.jobTitle || null,
          applicationId: assessmentEvent.applicationId || null,
          date: assessmentEvent.date,
          startTime: assessmentEvent.startTime,
          endTime: assessmentEvent.endTime,
          location: assessmentEvent.location,
          description: assessmentEvent.description,
          instructions: assessmentEvent.instructions || null,
          status: assessmentEvent.status || 'Upcoming',
          approvalStatus: assessmentEvent.approvalStatus || 'Approved',
          reminderTime: assessmentEvent.reminderTime || null,
          eligibleStudentIds: assessmentEvent.eligibleStudentIds
        }
      });
    }

    return mapApplication(updatedApp);
  }

  public async updateApplicationAiEvaluation(applicationId: string, aiEvaluation: any): Promise<Application | null> {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { aiEvaluation }
    });
    return mapApplication(updated);
  }

  // --- Interviews ---
  public async scheduleInterview(interviewData: Omit<Interview, 'id' | 'status'>): Promise<Interview> {
    const newId = `int_${Date.now()}`;
    const created = await prisma.interview.create({
      data: {
        id: newId,
        applicationId: interviewData.applicationId,
        jobId: interviewData.jobId,
        studentId: interviewData.studentId,
        studentName: interviewData.studentName,
        companyName: interviewData.companyName,
        jobTitle: interviewData.jobTitle,
        round: interviewData.round,
        date: interviewData.date,
        time: interviewData.time,
        venue: interviewData.venue,
        meetingLink: interviewData.meetingLink || null,
        interviewer: interviewData.interviewer,
        status: 'Scheduled',
        notes: interviewData.notes || null
      }
    });

    const student = await prisma.student.findUnique({ where: { id: interviewData.studentId } });
    if (student) {
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}`,
          userId: student.userId,
          title: `Interview Scheduled: ${created.companyName}`,
          message: `${created.round} round on ${created.date} at ${created.time}. Venue: ${created.venue}`,
          date: 'Just now',
          read: false,
          type: 'interview',
          linkTab: 'interviews'
        }
      });
    }

    // Create automatic calendar event for the scheduled interview
    let startTime = '10:00';
    let endTime = '11:00';
    if (created.time) {
      const parts = created.time.split('-');
      if (parts[0]) {
        const cleanStart = parts[0].trim();
        if (cleanStart.toUpperCase().includes('AM') || cleanStart.toUpperCase().includes('PM')) {
          const ampmParts = cleanStart.split(/\s+/);
          const timeParts = ampmParts[0].split(':');
          let hours = parseInt(timeParts[0]);
          const minutes = timeParts[1] || '00';
          if (cleanStart.toUpperCase().includes('PM') && hours < 12) hours += 12;
          if (cleanStart.toUpperCase().includes('AM') && hours === 12) hours = 0;
          startTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        } else {
          startTime = cleanStart;
        }
      }
      if (parts[1]) {
        const cleanEnd = parts[1].trim();
        if (cleanEnd.toUpperCase().includes('AM') || cleanEnd.toUpperCase().includes('PM')) {
          const ampmParts = cleanEnd.split(/\s+/);
          const timeParts = ampmParts[0].split(':');
          let hours = parseInt(timeParts[0]);
          const minutes = timeParts[1] || '00';
          if (cleanEnd.toUpperCase().includes('PM') && hours < 12) hours += 12;
          if (cleanEnd.toUpperCase().includes('AM') && hours === 12) hours = 0;
          endTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        } else {
          endTime = cleanEnd;
        }
      }
    }

    await prisma.calendarEvent.create({
      data: {
        id: `evt_int_${Date.now()}`,
        title: `${created.companyName} ${created.round} Interview`,
        eventType: 'INTERVIEW',
        companyName: created.companyName,
        jobTitle: created.jobTitle,
        jobId: created.jobId,
        applicationId: created.applicationId,
        date: created.date,
        startTime: startTime,
        endTime: endTime,
        location: created.venue,
        meetingLink: created.meetingLink || null,
        description: `Scheduled interview round with ${created.interviewer}.`,
        instructions: `Please join 5 minutes early. Ensure your camera and microphone are working. Link: ${created.meetingLink || 'N/A'}`,
        status: 'Upcoming',
        approvalStatus: 'Approved',
        reminderTime: '1 hour before',
        eligibleStudentIds: [created.studentId]
      }
    });

    return mapInterview(created);
  }

  // --- Notifications ---
  public async markNotificationRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  public async clearAllNotifications(): Promise<void> {
    await prisma.notification.deleteMany();
  }

  // --- Placement Events ---
  public async addPlacementEvent(eventData: Omit<PlacementEvent, 'id' | 'createdAt'>): Promise<PlacementEvent> {
    const newId = `evt_${Date.now()}`;
    
    let normType = 'PERSONAL';
    if (eventData.eventType === 'Placement Drive') normType = 'PLACEMENT_DRIVE';
    else if (eventData.eventType === 'Assessment') normType = 'ASSESSMENT';
    else if (eventData.eventType === 'Interview') normType = 'INTERVIEW';
    else if (eventData.eventType === 'Deadline') normType = 'DEADLINE';

    const dbCompanyId = eventData.companyId || null;
    const dbJobId = eventData.jobId || null;

    const created = await prisma.calendarEvent.create({
      data: {
        id: newId,
        title: eventData.title,
        eventType: normType,
        companyId: dbCompanyId,
        companyName: eventData.companyName || null,
        companyLogo: eventData.companyLogo || null,
        jobId: dbJobId,
        jobTitle: eventData.jobTitle || null,
        applicationId: eventData.applicationId || null,
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        meetingLink: eventData.meetingLink || null,
        description: eventData.description,
        instructions: eventData.instructions || null,
        status: eventData.status || 'Upcoming',
        approvalStatus: eventData.approvalStatus || 'Approved',
        reminderTime: eventData.reminderTime || null,
        recruiterId: eventData.recruiterId || null,
        eligibleStudentIds: eventData.eligibleStudentIds || [],
        userId: eventData.userId || null
      }
    });

    // If it's approved and eligible for students, create notifications
    if (created.approvalStatus === 'Approved') {
      const targetUser = created.userId || 'all';
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}`,
          userId: targetUser,
          title: `New Calendar Event: ${created.title}`,
          message: `${eventData.eventType} scheduled on ${created.date} at ${created.startTime} (${created.location}).`,
          date: 'Just now',
          read: false,
          type: eventData.eventType === 'Interview' ? 'interview' : 'info',
          linkTab: 'calendar'
        }
      });
    }

    return mapCalendarEvent(created);
  }

  public async updatePlacementEvent(id: string, updates: Partial<PlacementEvent>): Promise<PlacementEvent | null> {
    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.eventType !== undefined) {
      let normType = 'PERSONAL';
      if (updates.eventType === 'Placement Drive') normType = 'PLACEMENT_DRIVE';
      else if (updates.eventType === 'Assessment') normType = 'ASSESSMENT';
      else if (updates.eventType === 'Interview') normType = 'INTERVIEW';
      else if (updates.eventType === 'Deadline') normType = 'DEADLINE';
      dataToUpdate.eventType = normType;
    }
    if (updates.date !== undefined) dataToUpdate.date = updates.date;
    if (updates.startTime !== undefined) dataToUpdate.startTime = updates.startTime;
    if (updates.endTime !== undefined) dataToUpdate.endTime = updates.endTime;
    if (updates.location !== undefined) dataToUpdate.location = updates.location;
    if (updates.meetingLink !== undefined) dataToUpdate.meetingLink = updates.meetingLink;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.instructions !== undefined) dataToUpdate.instructions = updates.instructions;
    if (updates.status !== undefined) dataToUpdate.status = updates.status;
    if (updates.approvalStatus !== undefined) dataToUpdate.approvalStatus = updates.approvalStatus;
    if (updates.reminderTime !== undefined) dataToUpdate.reminderTime = updates.reminderTime;
    if (updates.eligibleStudentIds !== undefined) dataToUpdate.eligibleStudentIds = updates.eligibleStudentIds;

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: dataToUpdate
    });

    // Send notifications if rescheduled or approved or cancelled
    if (updates.date || updates.startTime || updates.location || updates.status === 'Cancelled' || updates.approvalStatus === 'Approved') {
      const targetUser = updated.userId || 'all';
      let title = `Calendar Event Updated: ${updated.title}`;
      let message = `Event has been updated. New schedule: ${updated.date} at ${updated.startTime} (${updated.location}).`;
      
      if (updates.status === 'Cancelled') {
        title = `Calendar Event Cancelled: ${updated.title}`;
        message = `The event scheduled for ${updated.date} has been cancelled.`;
      } else if (updates.approvalStatus === 'Approved') {
        title = `Placement Event Approved: ${updated.title}`;
        message = `Placement Cell has approved the '${updated.title}' scheduled for ${updated.date}.`;
      }

      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}`,
          userId: targetUser,
          title,
          message,
          date: 'Just now',
          read: false,
          type: updated.eventType === 'INTERVIEW' ? 'interview' : 'info',
          linkTab: 'calendar'
        }
      });
    }

    return mapCalendarEvent(updated);
  }

  public async deletePlacementEvent(id: string): Promise<boolean> {
    try {
      await prisma.calendarEvent.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
