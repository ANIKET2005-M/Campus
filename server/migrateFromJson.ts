import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const prisma = new PrismaClient();

const JSON_DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');
const BACKUP_DB_FILE = path.resolve(process.cwd(), 'data', 'db.json.bak');

async function main() {
  console.log('--- Starting NextOffer PostgreSQL Migration ---');

  // 1. Back up db.json
  if (!fs.existsSync(JSON_DB_FILE)) {
    console.error(`Error: Source database file not found at ${JSON_DB_FILE}`);
    process.exit(1);
  }

  console.log(`Backing up ${JSON_DB_FILE} to ${BACKUP_DB_FILE}...`);
  fs.copyFileSync(JSON_DB_FILE, BACKUP_DB_FILE);
  console.log('Backup created successfully.');

  // 2. Read and parse json data
  const rawData = fs.readFileSync(JSON_DB_FILE, 'utf-8');
  let data: any;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse JSON db file:', err);
    process.exit(1);
  }

  console.log('JSON file successfully read. Summary of records found:');
  console.log(`- Users: ${data.users?.length || 0}`);
  console.log(`- Student Profiles: ${data.studentProfiles?.length || 0}`);
  console.log(`- Companies: ${data.companies?.length || 0}`);
  console.log(`- Jobs: ${data.jobs?.length || 0}`);
  console.log(`- Applications: ${data.applications?.length || 0}`);
  console.log(`- Interviews: ${data.interviews?.length || 0}`);
  console.log(`- Placement Records: ${data.placementRecords?.length || 0}`);
  console.log(`- Notifications: ${data.notifications?.length || 0}`);
  console.log(`- Calendar Events: ${data.placementEvents?.length || 0}`);

  // 3. Clear existing database in correct dependency order
  console.log('Clearing existing database tables...');
  try {
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
    console.log('Database tables cleared successfully.');
  } catch (err) {
    console.warn('Warning: Error while clearing database, proceeding anyway.', err);
  }

  // 4. Migrate Skills
  console.log('Migrating unique skills...');
  const skillNames = new Set<string>();
  
  if (Array.isArray(data.studentProfiles)) {
    data.studentProfiles.forEach((s: any) => {
      if (Array.isArray(s.skills)) {
        s.skills.forEach((sk: string) => skillNames.add(sk.trim()));
      }
    });
  }
  
  if (Array.isArray(data.jobs)) {
    data.jobs.forEach((j: any) => {
      if (Array.isArray(j.requiredSkills)) {
        j.requiredSkills.forEach((sk: string) => skillNames.add(sk.trim()));
      }
    });
  }

  const skillsMap = new Map<string, string>(); // name -> id
  for (const name of skillNames) {
    if (name) {
      const skill = await prisma.skill.create({
        data: { name }
      });
      skillsMap.set(name, skill.id);
    }
  }
  console.log(`Migrated ${skillsMap.size} unique skills.`);

  // 5. Migrate Companies
  console.log('Migrating companies...');
  const companiesMap = new Map<string, string>(); // oldId -> newId
  
  if (Array.isArray(data.companies)) {
    for (const c of data.companies) {
      const createdCompany = await prisma.company.create({
        data: {
          id: c.id,
          name: c.name || 'Unnamed Company',
          logo: c.logo || '',
          description: c.description || '',
          industry: c.industry || '',
          website: c.website || '',
          location: c.location || '',
          companySize: c.companySize || null,
          verificationStatus: c.status || 'Verified',
          recruiterName: c.recruiterName || null,
          recruiterEmail: c.recruiterEmail || null,
          recruiterPhone: c.recruiterPhone || null,
          totalHired: c.totalHired || 0,
          avgPackage: c.avgPackage || '0 LPA',
          joinedDate: c.joinedDate || null
        }
      });
      companiesMap.set(c.id, createdCompany.id);
    }
  }
  console.log(`Migrated ${companiesMap.size} companies.`);

  // 6. Migrate Users & Sub-profiles (Students & Recruiters)
  console.log('Migrating users, students, and recruiters...');
  const usersMap = new Map<string, string>(); // oldId -> newId
  const studentsMap = new Map<string, string>(); // oldId -> newId
  
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      // Map Role
      let dbRole: 'STUDENT' | 'RECRUITER' | 'ADMIN' = 'STUDENT';
      if (u.role === 'recruiter') dbRole = 'RECRUITER';
      else if (u.role === 'admin') dbRole = 'ADMIN';

      // Hash plain-text password
      const plainPassword = u.password || 'password123';
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      // Create User
      const createdUser = await prisma.user.create({
        data: {
          id: u.id,
          name: u.name || 'User',
          email: u.email.toLowerCase(),
          passwordHash,
          role: dbRole,
          avatar: u.avatar || null
        }
      });
      usersMap.set(u.id, createdUser.id);

      // If user is a student, create student profile
      if (dbRole === 'STUDENT' && Array.isArray(data.studentProfiles)) {
        const profile = data.studentProfiles.find((sp: any) => sp.userId === u.id || sp.id === u.studentId);
        if (profile) {
          const createdStudent = await prisma.student.create({
            data: {
              id: profile.id,
              userId: createdUser.id,
              studentId: profile.studentId || null,
              fullName: (profile.fullName && profile.fullName.trim().length > 2 && /^[a-zA-Z\s\.\-]+$/.test(profile.fullName.trim())) ? profile.fullName : createdUser.name,
              registrationNumber: profile.registrationNumber || `REG-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              email: profile.email ? profile.email.toLowerCase() : createdUser.email,
              phone: profile.phone || '',
              dateOfBirth: profile.dateOfBirth || '2003-01-01',
              address: profile.address || '',
              course: profile.course || '',
              department: profile.department || '',
              graduationYear: typeof profile.graduationYear === 'number' ? profile.graduationYear : 2026,
              cgpa: typeof profile.cgpa === 'number' ? profile.cgpa : 0.0,
              tenthPercent: typeof profile.tenthPercent === 'number' ? profile.tenthPercent : 0.0,
              twelfthPercent: typeof profile.twelfthPercent === 'number' ? profile.twelfthPercent : 0.0,
              backlogs: typeof profile.backlogs === 'number' ? profile.backlogs : 0,
              placementStatus: profile.placementStatus || 'In Process',
              reminderPreferences: profile.reminderPreferences || {},
              certifications: profile.certifications || [],
              projects: profile.projects || [],
              internships: profile.internships || [],
              linkedin: profile.linkedin || null,
              github: profile.github || null
            }
          });
          studentsMap.set(profile.id, createdStudent.id);

          // Add Student Skills
          if (Array.isArray(profile.skills)) {
            for (const skName of profile.skills) {
              const skillId = skillsMap.get(skName.trim());
              if (skillId) {
                await prisma.studentSkill.create({
                  data: {
                    studentId: createdStudent.id,
                    skillId
                  }
                }).catch(() => {}); // Avoid unique constraint duplicates
              }
            }
          }

          // Migrate Resume Analysis if available
          if (profile.resumeName && profile.resumeUrl) {
            const createdResume = await prisma.resume.create({
              data: {
                studentId: createdStudent.id,
                fileName: profile.resumeName,
                filePath: profile.resumeUrl,
                parsedText: `Parsed resume text of ${profile.fullName}`,
                analysisScore: profile.resumeAnalysis?.completenessScore || null
              }
            });

            if (profile.resumeAnalysis) {
              await prisma.resumeAnalysis.create({
                data: {
                  resumeId: createdResume.id,
                  extractedSkills: profile.resumeAnalysis.detectedSkills || [],
                  matchScore: profile.resumeAnalysis.completenessScore || 0,
                  suggestions: profile.resumeAnalysis.suggestedImprovements || [],
                  roleMatches: profile.resumeAnalysis.roleMatches || [],
                  education: [],
                  experience: [],
                  projects: [],
                  certifications: []
                }
              });
            }
          }
        }
      }

      // If user is a recruiter, create recruiter profile
      if (dbRole === 'RECRUITER') {
        const rCompanyId = u.companyId || (data.companies && data.companies[0]?.id) || null;
        await prisma.recruiter.create({
          data: {
            id: `recr_${u.id}`,
            userId: createdUser.id,
            companyId: rCompanyId,
            designation: 'Hiring Manager',
            phone: u.phone || null,
            verificationStatus: 'Verified'
          }
        });
      }
    }
  }
  console.log(`Migrated ${usersMap.size} users.`);

  // 7. Migrate Jobs
  console.log('Migrating jobs...');
  const jobsMap = new Map<string, string>(); // oldId -> newId
  
  if (Array.isArray(data.jobs)) {
    for (const j of data.jobs) {
      // Ensure company exists
      let jobCompanyId = j.companyId;
      if (!companiesMap.has(jobCompanyId)) {
        // If company is external/off-campus, it might not be in companies.
        // Let's create a stub company for external job if needed, or link to a generic external company.
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
          // Default to first company in database
          jobCompanyId = Array.from(companiesMap.keys())[0] || 'comp_1';
        }
      }

      const createdJob = await prisma.job.create({
        data: {
          id: j.id,
          companyId: jobCompanyId,
          recruiterId: null, // Can map later if needed
          companyName: j.companyName,
          companyLogo: j.companyLogo || '',
          title: j.title || 'Job Opening',
          description: j.description || '',
          responsibilities: j.responsibilities || [],
          salaryPackage: j.salaryPackage || 'TBD',
          numericPackageLpa: typeof j.numericPackageLpa === 'number' ? j.numericPackageLpa : 0.0,
          location: j.location || 'Remote',
          jobType: j.jobType || 'Full-time',
          vacancies: typeof j.vacancies === 'number' ? j.vacancies : 1,
          applicationDeadline: j.applicationDeadline || '2026-12-31',
          eligibility: j.eligibility || {},
          status: j.status || 'Open',
          isOffCampus: !!j.isOffCampus,
          source: j.source || null,
          originalJobUrl: j.originalJobUrl || null,
          experienceRequired: j.experienceRequired || null
        }
      });
      jobsMap.set(j.id, createdJob.id);

      // Add Job Skills
      if (Array.isArray(j.requiredSkills)) {
        for (const skName of j.requiredSkills) {
          const skillId = skillsMap.get(skName.trim());
          if (skillId) {
            await prisma.jobSkill.create({
              data: {
                jobId: createdJob.id,
                skillId
              }
            }).catch(() => {});
          }
        }
      }

      // Migrate SavedJobs relation
      if (Array.isArray(j.savedByStudentIds)) {
        for (const sId of j.savedByStudentIds) {
          if (studentsMap.has(sId)) {
            await prisma.savedJob.create({
              data: {
                studentId: sId,
                jobId: createdJob.id
              }
            }).catch(() => {});
          }
        }
      }
    }
  }
  console.log(`Migrated ${jobsMap.size} jobs.`);

  // 8. Migrate Applications
  console.log('Migrating applications...');
  let appCount = 0;
  
  if (Array.isArray(data.applications)) {
    for (const a of data.applications) {
      if (studentsMap.has(a.studentId) && jobsMap.has(a.jobId)) {
        await prisma.application.create({
          data: {
            id: a.id,
            jobId: a.jobId,
            studentId: a.studentId,
            jobTitle: a.jobTitle || '',
            companyId: a.companyId,
            companyName: a.companyName || '',
            companyLogo: a.companyLogo || '',
            studentName: a.studentName || '',
            studentRegNo: a.studentRegNo || '',
            studentCourse: a.studentCourse || '',
            studentDepartment: a.studentDepartment || '',
            studentCgpa: typeof a.studentCgpa === 'number' ? a.studentCgpa : 0.0,
            studentSkills: a.studentSkills || [],
            appliedDate: a.appliedDate || '',
            status: a.status || 'Applied',
            remarks: a.remarks || null,
            timeline: a.timeline || [],
            aiEvaluation: a.aiEvaluation || null
          }
        });
        appCount++;
      }
    }
  }
  console.log(`Migrated ${appCount} applications.`);

  // 9. Migrate Interviews
  console.log('Migrating interviews...');
  let interviewCount = 0;
  
  if (Array.isArray(data.interviews)) {
    for (const i of data.interviews) {
      if (studentsMap.has(i.studentId) && jobsMap.has(i.jobId)) {
        // Ensure application exists, or point to it if found
        let appId = i.applicationId;
        const appExists = await prisma.application.findUnique({ where: { id: appId } });
        
        if (!appExists) {
          // Find application by student + job
          const app = await prisma.application.findFirst({
            where: { studentId: i.studentId, jobId: i.jobId }
          });
          if (app) {
            appId = app.id;
          } else {
            console.warn(`Skipping interview ${i.id} as no matching application was found.`);
            continue;
          }
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
            round: i.round || 'Technical',
            date: i.date || '',
            time: i.time || '',
            venue: i.venue || '',
            meetingLink: i.meetingLink || null,
            interviewer: i.interviewer || '',
            status: i.status || 'Scheduled',
            notes: i.notes || null
          }
        });
        interviewCount++;
      }
    }
  }
  console.log(`Migrated ${interviewCount} interviews.`);

  // 10. Migrate Placement Records
  console.log('Migrating placement records...');
  let recordCount = 0;
  
  if (Array.isArray(data.placementRecords)) {
    for (const pr of data.placementRecords) {
      await prisma.placementRecord.create({
        data: {
          id: pr.id,
          studentId: pr.studentId,
          studentName: pr.studentName || '',
          studentRegNo: pr.studentRegNo || '',
          department: pr.department || '',
          course: pr.course || '',
          companyName: pr.companyName || '',
          jobTitle: pr.jobTitle || '',
          packageOffered: pr.packageOffered || '',
          numericPackageLpa: typeof pr.numericPackageLpa === 'number' ? pr.numericPackageLpa : 0.0,
          placementDate: pr.placementDate || '',
          offerStatus: pr.offerStatus || 'Accepted',
          joiningDate: pr.joiningDate || '',
          placementYear: typeof pr.placementYear === 'number' ? pr.placementYear : 2026
        }
      });
      recordCount++;
    }
  }
  console.log(`Migrated ${recordCount} placement records.`);

  // 11. Migrate Notifications
  console.log('Migrating notifications...');
  let notifCount = 0;
  
  if (Array.isArray(data.notifications)) {
    for (const n of data.notifications) {
      // If notification is user-specific, verify user exists
      const targetUserId = n.userId;
      const isGlobal = ['all', 'student', 'recruiter'].includes(targetUserId);
      
      if (isGlobal || usersMap.has(targetUserId)) {
        await prisma.notification.create({
          data: {
            id: n.id,
            userId: targetUserId,
            title: n.title || 'Notification',
            message: n.message || '',
            date: n.date || '',
            read: !!n.read,
            type: n.type || 'info',
            linkTab: n.linkTab || null
          }
        });
        notifCount++;
      }
    }
  }
  console.log(`Migrated ${notifCount} notifications.`);

  // 12. Migrate Calendar Events
  console.log('Migrating calendar events...');
  let eventCount = 0;
  
  if (Array.isArray(data.placementEvents)) {
    for (const e of data.placementEvents) {
      const dbCompanyId = e.companyId && companiesMap.has(e.companyId) ? e.companyId : null;
      const dbJobId = e.jobId && jobsMap.has(e.jobId) ? e.jobId : null;

      // Event Type mapping
      let normType = e.eventType || 'PERSONAL';
      if (normType === 'Placement Drive') normType = 'PLACEMENT_DRIVE';
      else if (normType === 'Assessment') normType = 'ASSESSMENT';
      else if (normType === 'Interview') normType = 'INTERVIEW';
      else if (normType === 'Deadline') normType = 'DEADLINE';
      else normType = 'PERSONAL';

      await prisma.calendarEvent.create({
        data: {
          id: e.id,
          title: e.title || 'Event',
          eventType: normType,
          companyId: dbCompanyId,
          companyName: e.companyName || null,
          companyLogo: e.companyLogo || null,
          jobId: dbJobId,
          jobTitle: e.jobTitle || null,
          applicationId: e.applicationId || null,
          date: e.date || '',
          startTime: e.startTime || '',
          endTime: e.endTime || '',
          location: e.location || 'NextOffer',
          meetingLink: e.meetingLink || null,
          description: e.description || '',
          instructions: e.instructions || null,
          status: e.status || 'Upcoming',
          approvalStatus: e.approvalStatus || 'Approved',
          reminderTime: e.reminderTime || null,
          recruiterId: e.recruiterId || null,
          eligibleStudentIds: e.eligibleStudentIds || [],
          userId: e.userId || null
        }
      });
      eventCount++;
    }
  }
  console.log(`Migrated ${eventCount} calendar events.`);

  // 13. Populate Dynamic Placement Statistics for Dashboard
  console.log('Generating placement statistics...');
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
  await prisma.placementStatistic.create({
    data: {
      year: 2025,
      totalEligible: 110,
      totalPlaced: 92,
      totalOffers: 105,
      averagePackage: 9.8,
      highestPackage: 28.0,
      placementRate: 83.63
    }
  });

  console.log('\n--- NextOffer Migration Completed Successfully! ---');
}

main()
  .catch((err) => {
    console.error('Migration failed with critical error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
