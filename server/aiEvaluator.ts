import { GoogleGenAI } from '@google/genai';
import { StudentProfile, Job } from '../src/types.js';

export interface AiEvaluationResult {
  matchScore: number;
  fitSummary: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'Shortlist' | 'Technical Interview' | 'Review' | 'Reject';
}

export async function evaluateApplicationWithGemini(
  student: StudentProfile,
  job: Job
): Promise<AiEvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a professional HR recruiter and technical screener at ${job.companyName}.
Evaluate candidate ${student.fullName} for the job role: "${job.title}".

### Job Details:
- Title: ${job.title}
- Salary: ${job.salaryPackage}
- Description: ${job.description}
- Responsibilities: ${job.responsibilities.join(', ')}
- Required Skills: ${job.requiredSkills.join(', ')}
- CGPA Requirement: ${job.eligibility.minCgpa}

### Candidate Details:
- Name: ${student.fullName}
- Course & Department: ${student.course} in ${student.department}
- CGPA: ${student.cgpa}
- Skills: ${student.skills.join(', ')}
- Certifications: ${student.certifications.join(', ')}
- Projects: ${JSON.stringify(student.projects)}
- Internships: ${JSON.stringify(student.internships)}

Analyze the match and return a strictly valid JSON object matching this schema:
{
  "matchScore": 85, // integer between 0 and 100 based on skill overlap, projects, academic qualifications
  "fitSummary": "A concise paragraph (2-3 sentences) summarizing how well the candidate's background matches this specific job description.",
  "strengths": ["List 2-3 key strengths of this candidate relative to this job requirements"],
  "gaps": ["List 1-2 skill gaps, missing certifications, or minor weaknesses relative to this job requirements"],
  "recommendation": "One of: Shortlist, Technical Interview, Review, Reject"
}
Return ONLY valid JSON with no markdown formatting.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
      } catch (e) {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
      }

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 75,
        fitSummary: String(parsed.fitSummary || 'Candidate meets most basic eligibility requirements.'),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : ['Good academic profile'],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : ['Requires hands-on training'],
        recommendation: ['Shortlist', 'Technical Interview', 'Review', 'Reject'].includes(parsed.recommendation)
          ? parsed.recommendation
          : 'Review'
      };
    } catch (err) {
      console.warn('[Gemini AI Evaluator] Gemini API evaluation failed, using rule-based fallback:', err);
    }
  }

  // Fallback Rule-Based matching engine if API Key is not set or network fails
  return fallbackEvaluation(student, job);
}

function fallbackEvaluation(student: StudentProfile, job: Job): AiEvaluationResult {
  // Calculate skill overlap
  const studentSkillsLower = student.skills.map(s => s.toLowerCase());
  const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
  
  const overlappingSkills = jobSkillsLower.filter(s => 
    studentSkillsLower.some(ss => ss.includes(s) || s.includes(ss))
  );

  const missingSkills = job.requiredSkills.filter(s => 
    !studentSkillsLower.some(ss => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))
  );

  // Score calculation base:
  // 40% skills match
  // 30% CGPA match (CGPA relative to max 10)
  // 20% Projects & Internships count
  // 10% eligibility checks
  const skillPercent = job.requiredSkills.length > 0 ? (overlappingSkills.length / job.requiredSkills.length) : 1;
  const skillScore = skillPercent * 40;
  
  const cgpaScore = Math.min((student.cgpa / 10) * 30, 30);
  
  const projectScore = Math.min((student.projects.length + student.internships.length * 1.5) * 5, 20);
  
  const backlogPenalty = student.backlogs * 5;
  const baseScore = Math.max(30, Math.min(100, Math.round(skillScore + cgpaScore + projectScore - backlogPenalty + 15)));

  // Strengths
  const strengths: string[] = [];
  if (overlappingSkills.length > 0) {
    strengths.push(`Matches critical core skills: ${overlappingSkills.slice(0, 3).join(', ')}`);
  }
  if (student.cgpa >= 8.5) {
    strengths.push(`Outstanding academic standing with CGPA of ${student.cgpa}`);
  } else if (student.cgpa >= 7.5) {
    strengths.push(`Solid academic record with CGPA of ${student.cgpa}`);
  }
  if (student.internships.length > 0) {
    strengths.push(`Has practical experience with ${student.internships.length} internship(s)`);
  }
  if (student.projects.length > 0) {
    strengths.push(`Demonstrated hands-on skills with ${student.projects.length} project(s)`);
  }
  if (strengths.length === 0) {
    strengths.push('Clean academic history with zero backlogs.');
  }

  // Gaps
  const gaps: string[] = [];
  if (missingSkills.length > 0) {
    gaps.push(`Lacks familiarity/documented skills in: ${missingSkills.slice(0, 2).join(', ')}`);
  }
  if (student.cgpa < job.eligibility.minCgpa) {
    gaps.push(`CGPA (${student.cgpa}) is below the requested threshold of ${job.eligibility.minCgpa}`);
  }
  if (student.internships.length === 0) {
    gaps.push('Lacks formal corporate work experience/internships.');
  }
  if (gaps.length === 0) {
    gaps.push('No critical gaps identified; candidate meets all basic criteria.');
  }

  // Fit Summary
  let fitSummary = `${student.fullName} has a match rating of ${baseScore}% for the ${job.title} role. `;
  if (baseScore >= 80) {
    fitSummary += `They demonstrate high competency in required technical fields, backed by a strong academic profile and relevant practical projects.`;
  } else if (baseScore >= 60) {
    fitSummary += `They possess several matching skills but could benefit from training in certain technology stacks like ${missingSkills.slice(0, 2).join(', ') || 'enterprise architecture'}.`;
  } else {
    fitSummary += `There is a significant mismatch in skill requirements, and the candidate may require extensive upskilling to fit the role's demands.`;
  }

  // Recommendation
  let recommendation: AiEvaluationResult['recommendation'] = 'Review';
  if (baseScore >= 85) {
    recommendation = 'Shortlist';
  } else if (baseScore >= 70) {
    recommendation = 'Technical Interview';
  } else if (baseScore < 50) {
    recommendation = 'Reject';
  }

  return {
    matchScore: baseScore,
    fitSummary,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 2),
    recommendation
  };
}
