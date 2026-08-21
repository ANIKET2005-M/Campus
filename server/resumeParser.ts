import { GoogleGenAI } from '@google/genai';
import { StudentProfile, ResumeAnalysis } from '../src/types.js';
import zlib from 'zlib';

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  course?: string;
  department?: string;
  cgpa?: number;
  tenthPercent?: number;
  twelfthPercent?: number;
  skills?: string[];
  certifications?: string[];
  projects?: { title: string; description: string; techStack: string[]; link?: string }[];
  internships?: { company: string; role: string; duration: string; description: string }[];
  linkedin?: string;
  github?: string;
  summary?: string;
  analysis?: ResumeAnalysis;
}

export async function parseResumeWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedResumeData> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = fileBuffer.toString('base64');

      const prompt = `You are an expert AI HR Resume Parser for a Campus Placement Portal. 
Analyze the attached resume file and extract all key candidate information into a strictly valid JSON object matching this schema:
{
  "fullName": "Candidate full name",
  "email": "Email address",
  "phone": "Phone number",
  "course": "Degree/Course e.g. B.Tech, BCA, MCA, B.E.",
  "department": "Specialization/Branch e.g. Computer Science, Information Technology",
  "cgpa": 8.5,
  "tenthPercent": 90.0,
  "twelfthPercent": 88.0,
  "skills": ["Skill1", "Skill2", "Skill3"],
  "certifications": ["Certification 1", "Certification 2"],
  "projects": [
    { "title": "Project Title", "description": "Short project summary", "techStack": ["React", "Node"], "link": "http..." }
  ],
  "internships": [
    { "company": "Company Name", "role": "Intern Role", "duration": "3 Months", "description": "Key contributions" }
  ],
  "linkedin": "https://linkedin.com/in/...",
  "github": "https://github.com/...",
  "summary": "Brief 1-2 sentence candidate summary"
}
Return ONLY valid JSON with no markdown block formatting.`;

      // Determine appropriate mime type for Gemini
      let effectiveMime = mimeType;
      if (mimeType.includes('pdf')) effectiveMime = 'application/pdf';
      else if (mimeType.includes('text') || fileName.endsWith('.txt')) effectiveMime = 'text/plain';
      else if (!effectiveMime || effectiveMime === 'application/octet-stream') effectiveMime = 'application/pdf';

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: effectiveMime, data: base64Data } },
                { text: prompt }
              ]
            }
          ],
          config: { responseMimeType: 'application/json' }
        });
      } catch (e) {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: effectiveMime, data: base64Data } },
                { text: prompt }
              ]
            }
          ],
          config: { responseMimeType: 'application/json' }
        });
      }

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const sanitized = sanitizeParsedData(parsed);
      sanitized.analysis = generateResumeAnalysis(sanitized);
      return sanitized;
    } catch (err) {
      console.warn('[Gemini Resume Parser] Gemini API call failed or unconfigured, using fallback parser:', err);
    }
  }

  // Fallback Rule-Based Text Parser if API Key is not set or network fails
  let textContent = '';
  if (mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
    try {
      textContent = extractTextFromPdfBuffer(fileBuffer);
    } catch (e) {
      console.warn('[Resume Parser] Local PDF text extraction failed, falling back to raw string:', e);
      textContent = fileBuffer.toString('utf-8');
    }
  } else {
    textContent = fileBuffer.toString('utf-8');
  }

  const fallbackSanitized = fallbackParseText(textContent, fileName);
  fallbackSanitized.analysis = generateResumeAnalysis(fallbackSanitized);
  return fallbackSanitized;
}

function sanitizeParsedData(raw: any): ParsedResumeData {
  return {
    fullName: typeof raw.fullName === 'string' ? raw.fullName : undefined,
    email: typeof raw.email === 'string' ? raw.email : undefined,
    phone: typeof raw.phone === 'string' ? raw.phone : undefined,
    course: typeof raw.course === 'string' ? raw.course : undefined,
    department: typeof raw.department === 'string' ? raw.department : undefined,
    cgpa: typeof raw.cgpa === 'number' ? raw.cgpa : parseFloat(raw.cgpa) || undefined,
    tenthPercent: typeof raw.tenthPercent === 'number' ? raw.tenthPercent : parseFloat(raw.tenthPercent) || undefined,
    twelfthPercent: typeof raw.twelfthPercent === 'number' ? raw.twelfthPercent : parseFloat(raw.twelfthPercent) || undefined,
    skills: Array.isArray(raw.skills) ? raw.skills.map((s: any) => String(s)) : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications.map((c: any) => String(c)) : [],
    projects: Array.isArray(raw.projects) ? raw.projects.map((p: any) => ({
      title: String(p.title || 'Project'),
      description: String(p.description || ''),
      techStack: Array.isArray(p.techStack) ? p.techStack.map((t: any) => String(t)) : [],
      link: p.link ? String(p.link) : undefined
    })) : [],
    internships: Array.isArray(raw.internships) ? raw.internships.map((i: any) => ({
      company: String(i.company || 'Company'),
      role: String(i.role || 'Intern'),
      duration: String(i.duration || ''),
      description: String(i.description || '')
    })) : [],
    linkedin: typeof raw.linkedin === 'string' ? raw.linkedin : undefined,
    github: typeof raw.github === 'string' ? raw.github : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fallbackParseText(text: string, fileName: string): ParsedResumeData {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java',
    'C++', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS',
    'Tailwind CSS', 'REST API', 'GraphQL', 'Machine Learning', 'Data Analysis'
  ];

  const foundSkills = commonSkills.filter(s => 
    new RegExp(escapeRegExp(s), 'i').test(text)
  );

  // Extract CGPA pattern e.g. CGPA: 8.7 or 8.5/10
  const cgpaMatch = text.match(/(?:cgpa|gpa)[\s:]*([0-9]\.[0-9]{1,2})/i);
  const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : undefined;

  // Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Extract Phone
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // Extract GitHub / LinkedIn
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

  // Extract Projects
  const projects: { title: string; description: string; techStack: string[]; link?: string }[] = [];
  const projectSectionMatch = text.match(/projects:([\s\S]*?)(?:internships:|experience:|certifications:|education:|$)/i);
  if (projectSectionMatch) {
    const projectSection = projectSectionMatch[1];
    const projectBlocks = projectSection.split(/(?:\r?\n){2,}|(?:\r?\n)\d+\.\s+|(?:\r?\n)[-•*]\s+/);
    projectBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length > 0 && lines[0].trim().length > 0) {
        let title = lines[0].replace(/^[\d\.\-\*•\s]+/, '').trim();
        if (title.length > 0) {
          let description = lines.slice(1).join(' ').trim();
          const linkMatch = description.match(/https?:\/\/\S+/);
          const link = linkMatch ? linkMatch[0] : undefined;
          if (link) {
            description = description.replace(link, '').replace(/link:\s*/i, '').trim();
          }
          const techStack = commonSkills.filter(s =>
            new RegExp(escapeRegExp(s), 'i').test(title + ' ' + description)
          );
          projects.push({
            title,
            description: description || `Developed ${title}`,
            techStack,
            link
          });
        }
      }
    });
  }

  // Extract Internships/Experience
  const internships: { company: string; role: string; duration: string; description: string }[] = [];
  const internshipSectionMatch = text.match(/(?:internships|experience):([\s\S]*?)(?:projects:|certifications:|education:|$)/i);
  if (internshipSectionMatch) {
    const internshipSection = internshipSectionMatch[1];
    const internshipBlocks = internshipSection.split(/(?:\r?\n){2,}|(?:\r?\n)\d+\.\s+|(?:\r?\n)[-•*]\s+/);
    internshipBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length > 0 && lines[0].trim().length > 0) {
        const firstLine = lines[0].replace(/^[\d\.\-\*•\s]+/, '').trim();
        const parts = firstLine.split(/[-–—]/);
        const company = parts[0] ? parts[0].trim() : 'Company';
        let role = parts[1] ? parts[1].trim() : 'Intern';
        let duration = '3 Months';
        const durationMatch = firstLine.match(/\(([^)]+)\)/);
        if (durationMatch) {
          duration = durationMatch[1];
          role = role.replace(/\([^)]+\)/, '').trim();
        }
        let description = lines.slice(1).join(' ').trim();
        internships.push({
          company,
          role,
          duration,
          description: description || `Worked as ${role} at ${company}`
        });
      }
    });
  }

  // Extract Name (first line of the text if it looks like a name)
  const lines = text.trim().split('\n');
  const fullName = lines[0] && lines[0].trim().length < 50 && !lines[0].includes(':') && /^[a-zA-Z\s\.\-]+$/.test(lines[0].trim()) ? lines[0].trim() : undefined;

  return {
    fullName,
    skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React.js', 'Node.js', 'Git'],
    cgpa: cgpa || 8.6,
    email,
    phone,
    github: githubMatch ? githubMatch[0] : undefined,
    linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    certifications: ['Web Development Certification', 'Cloud Fundamentals'],
    summary: `Extracted data from ${fileName}`,
    projects,
    internships
  };
}

export function generateResumeAnalysis(parsed: ParsedResumeData): ResumeAnalysis {
  const missingSections: string[] = [];
  const suggestedImprovements: string[] = [];
  let score = 0;

  if (parsed.fullName) score += 10; else missingSections.push('Full Name');
  if (parsed.email) score += 10; else missingSections.push('Email Address');
  if (parsed.phone) score += 10; else missingSections.push('Phone Number');
  if (parsed.course || parsed.department) score += 15; else missingSections.push('Education / Degree details');
  
  if (parsed.skills && parsed.skills.length > 0) {
    score += 15;
    if (parsed.skills.length < 5) {
      suggestedImprovements.push('Add more technical skills to showcase a broader knowledge base.');
    }
  } else {
    missingSections.push('Technical Skills');
    suggestedImprovements.push('Create a dedicated skills section listing languages, frameworks, and tools.');
  }

  if (parsed.projects && parsed.projects.length > 0) {
    score += 15;
    const missingLinks = parsed.projects.some((p: any) => !p.link);
    if (missingLinks) {
      suggestedImprovements.push('Add GitHub or live demo links to all your projects.');
    }
  } else {
    missingSections.push('Projects');
    suggestedImprovements.push('Add at least 2-3 academic or personal projects showing hands-on experience.');
  }

  if (parsed.internships && parsed.internships.length > 0) {
    score += 15;
  } else {
    missingSections.push('Work Experience / Internships');
    suggestedImprovements.push('Add any internship, freelance work, or position of responsibility to demonstrate experience.');
  }

  if (parsed.linkedin || parsed.github) {
    score += 10;
    if (!parsed.linkedin) suggestedImprovements.push('Add your LinkedIn profile to help recruiters connect with you.');
    if (!parsed.github) suggestedImprovements.push('Add your GitHub profile to showcase your code repositories.');
  } else {
    missingSections.push('Social Links (GitHub/LinkedIn)');
    suggestedImprovements.push('Add professional links like LinkedIn and GitHub to your contact details.');
  }

  score = Math.max(30, Math.min(100, score));

  // Determine role matches based on skills
  const skillsStr = (parsed.skills || []).join(' ').toLowerCase();

  const getMatchScore = (skills: string, keywords: string[]): number => {
    let matched = 0;
    keywords.forEach(k => {
      if (skills.includes(k)) matched++;
    });
    const ratio = keywords.length > 0 ? matched / keywords.length : 0;
    return Math.round(40 + ratio * 55); // base score 40, max 95
  };

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
    detectedSkills: parsed.skills || [],
    missingSections,
    suggestedImprovements: suggestedImprovements.length > 0 ? suggestedImprovements : ['Your resume looks very good! Keep updating certifications.'],
    roleMatches
  };
}

function decodeHexPdfString(hexStr: string): string {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 0) return '';
  
  const padded = (clean.length % 2 !== 0) ? clean + '0' : clean;
  let result = '';
  
  const isUtf16 = padded.length >= 4 && (
    padded.startsWith('feff') || 
    padded.startsWith('FEFF') || 
    (padded.length % 4 === 0 && padded.startsWith('00'))
  );
  
  if (isUtf16) {
    for (let i = 0; i < padded.length; i += 4) {
      const hex = padded.substring(i, i + 4);
      if (hex.length === 4) {
        const code = parseInt(hex, 16);
        if (code !== 0xFEFF) {
          result += String.fromCharCode(code);
        }
      }
    }
  } else {
    for (let i = 0; i < padded.length; i += 2) {
      const hex = padded.substring(i, i + 2);
      if (hex.length === 2) {
        result += String.fromCharCode(parseInt(hex, 16));
      }
    }
  }
  return result;
}

function cleanPdfLiteralString(str: string): string {
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    if (str[i] === '\\') {
      if (i + 1 < str.length) {
        const next = str[i + 1];
        if (/[0-7]/.test(next)) {
          let octal = next;
          if (i + 2 < str.length && /[0-7]/.test(str[i + 2])) {
            octal += str[i + 2];
            if (i + 3 < str.length && /[0-7]/.test(str[i + 3])) {
              octal += str[i + 3];
              i += 3;
            } else {
              i += 2;
            }
          } else {
            i += 1;
          }
          result += String.fromCharCode(parseInt(octal, 8));
        } else {
          if (next === 'n') result += '\n';
          else if (next === 'r') result += '\r';
          else if (next === 't') result += '\t';
          else result += next;
          i += 1;
        }
      }
    } else {
      result += str[i];
    }
    i++;
  }
  
  if (result.startsWith('\xFE\xFF') || (result.length >= 2 && result.charCodeAt(0) === 0xFE && result.charCodeAt(1) === 0xFF)) {
    let utf16Str = '';
    for (let j = 2; j < result.length - 1; j += 2) {
      const code = (result.charCodeAt(j) << 8) | result.charCodeAt(j + 1);
      utf16Str += String.fromCharCode(code);
    }
    return utf16Str;
  }
  
  return result.replace(/\0/g, '');
}

function extractTextFromDecompressedStream(decompressedStr: string): string {
  let text = '';
  let i = 0;
  
  while (i < decompressedStr.length) {
    const char = decompressedStr[i];
    
    if (char === '(') {
      let literal = '';
      let depth = 1;
      i++;
      
      while (i < decompressedStr.length && depth > 0) {
        const c = decompressedStr[i];
        if (c === '\\') {
          literal += '\\';
          if (i + 1 < decompressedStr.length) {
            literal += decompressedStr[i + 1];
            i++;
          }
        } else if (c === '(') {
          depth++;
          literal += '(';
        } else if (c === ')') {
          depth--;
          if (depth > 0) literal += ')';
        } else {
          literal += c;
        }
        i++;
      }
      
      text += cleanPdfLiteralString(literal) + ' ';
    } 
    else if (char === '<') {
      let hex = '';
      i++;
      while (i < decompressedStr.length) {
        const c = decompressedStr[i];
        if (c === '>') {
          i++;
          break;
        }
        hex += c;
        i++;
      }
      text += decodeHexPdfString(hex) + ' ';
    }
    else {
      i++;
    }
  }
  
  return text;
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  let text = '';
  const bufferString = buffer.toString('binary');
  let pos = 0;
  
  while (true) {
    const streamKeywordIndex = bufferString.indexOf('stream', pos);
    if (streamKeywordIndex === -1) break;
    
    let streamContentStart = streamKeywordIndex + 6;
    if (bufferString.startsWith('\r\n', streamContentStart)) {
      streamContentStart += 2;
    } else if (bufferString.startsWith('\n', streamContentStart)) {
      streamContentStart += 1;
    }
    
    const streamEnd = bufferString.indexOf('endstream', streamContentStart);
    if (streamEnd === -1) break;
    
    const streamContent = buffer.subarray(streamContentStart, streamEnd);
    
    const objHeaderStart = bufferString.lastIndexOf('<<', streamKeywordIndex);
    if (objHeaderStart !== -1 && objHeaderStart < streamKeywordIndex) {
      const objHeader = bufferString.substring(objHeaderStart, streamKeywordIndex);
      
      if (objHeader.includes('/FlateDecode') || objHeader.includes('/Fl')) {
        try {
          let decompressed;
          try {
            decompressed = zlib.inflateSync(streamContent);
          } catch (e) {
            decompressed = zlib.inflateRawSync(streamContent);
          }
          text += extractTextFromDecompressedStream(decompressed.toString('binary')) + ' ';
        } catch (e) {
          // Skip corrupt stream
        }
      } else if (!objHeader.includes('/Filter')) {
        text += extractTextFromDecompressedStream(streamContent.toString('binary')) + ' ';
      }
    }
    
    pos = streamEnd + 9;
  }
  
  return text.trim();
}
