import { StudentProfile, EligibilityCriteria, EligibilityCheckResult } from '../types';

export function checkEligibility(
  student: StudentProfile,
  criteria?: EligibilityCriteria
): EligibilityCheckResult {
  if (!criteria) {
    return {
      isEligible: true,
      scorePercent: 100,
      failedCriteriaCount: 0,
      checks: [
        {
          rule: 'Criteria Check',
          passed: true,
          studentValue: '-',
          requiredValue: '-',
          message: 'No eligibility criteria specified for this position.'
        }
      ]
    };
  }

  const minCgpa = criteria.minCgpa ?? 0;
  const min10thPercent = criteria.min10thPercent ?? 0;
  const min12thPercent = criteria.min12thPercent ?? 0;
  const maxBacklogs = criteria.maxBacklogs ?? 99;
  const eligibleCourses = criteria.eligibleCourses ?? [];
  const eligibleDepartments = criteria.eligibleDepartments ?? [];
  const graduationYear = criteria.graduationYear ?? student.graduationYear;

  const checks = [
    {
      rule: 'Minimum CGPA',
      passed: student.cgpa >= minCgpa,
      studentValue: `${student.cgpa.toFixed(1)} / 10`,
      requiredValue: `≥ ${minCgpa.toFixed(1)}`,
      message: student.cgpa >= minCgpa 
        ? `CGPA requirement satisfied (${student.cgpa} ≥ ${minCgpa})`
        : `CGPA (${student.cgpa}) is below required minimum (${minCgpa})`
    },
    {
      rule: 'Class 10th Percentage',
      passed: student.tenthPercent >= min10thPercent,
      studentValue: `${student.tenthPercent}%`,
      requiredValue: `≥ ${min10thPercent}%`,
      message: student.tenthPercent >= min10thPercent 
        ? `10th Grade requirement satisfied (${student.tenthPercent}% ≥ ${min10thPercent}%)`
        : `10th Grade score (${student.tenthPercent}%) is below minimum requirement (${min10thPercent}%)`
    },
    {
      rule: 'Class 12th Percentage',
      passed: student.twelfthPercent >= min12thPercent,
      studentValue: `${student.twelfthPercent}%`,
      requiredValue: `≥ ${min12thPercent}%`,
      message: student.twelfthPercent >= min12thPercent 
        ? `12th Grade requirement satisfied (${student.twelfthPercent}% ≥ ${min12thPercent}%)`
        : `12th Grade score (${student.twelfthPercent}%) is below minimum requirement (${min12thPercent}%)`
    },
    {
      rule: 'Active Backlogs',
      passed: student.backlogs <= maxBacklogs,
      studentValue: `${student.backlogs}`,
      requiredValue: `≤ ${maxBacklogs}`,
      message: student.backlogs <= maxBacklogs 
        ? `Backlog criteria met (${student.backlogs} ≤ ${maxBacklogs})`
        : `Maximum backlogs allowed is ${maxBacklogs}, but candidate has ${student.backlogs}`
    },
    {
      rule: 'Eligible Course',
      passed: eligibleCourses.length === 0 || eligibleCourses.includes(student.course),
      studentValue: student.course,
      requiredValue: eligibleCourses.join(', ') || 'All Courses',
      message: (eligibleCourses.length === 0 || eligibleCourses.includes(student.course))
        ? `Course (${student.course}) is eligible`
        : `Course (${student.course}) is not listed in eligible courses (${eligibleCourses.join(', ')})`
    },
    {
      rule: 'Eligible Department',
      passed: eligibleDepartments.length === 0 || eligibleDepartments.includes(student.department),
      studentValue: student.department,
      requiredValue: eligibleDepartments.join(', ') || 'All Departments',
      message: (eligibleDepartments.length === 0 || eligibleDepartments.includes(student.department))
        ? `Department (${student.department}) is eligible`
        : `Department (${student.department}) is not listed in eligible departments`
    },
    {
      rule: 'Graduation Year',
      passed: student.graduationYear === graduationYear,
      studentValue: `${student.graduationYear}`,
      requiredValue: `${graduationYear}`,
      message: student.graduationYear === graduationYear 
        ? `Graduation year (${student.graduationYear}) matches requirement`
        : `Drive is restricted to ${graduationYear} batch`
    }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const isEligible = passedCount === checks.length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);
  const failedCriteriaCount = checks.length - passedCount;

  return {
    isEligible,
    scorePercent,
    failedCriteriaCount,
    checks
  };
}

export function countEligibleStudents(students: StudentProfile[], criteria?: EligibilityCriteria): number {
  return students.filter(s => checkEligibility(s, criteria).isEligible).length;
}
