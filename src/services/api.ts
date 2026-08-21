import { 
  User,
  Role,
  StudentProfile, 
  Company, 
  Job, 
  Application, 
  Interview, 
  ApplicationStage,
  PlacementEvent
} from '../types';
import { DatabaseSchema } from '../../server/db';
import { ParsedResumeData } from '../../server/resumeParser';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Fetch complete database state
  async getInitialData(): Promise<DatabaseSchema> {
    const res = await fetch(`${API_BASE}/initial-data`);
    return handleResponse<DatabaseSchema>(res);
  },

  // Authentication
  async loginUser(email: string, password?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async registerUser(payload: {
    email: string;
    password?: string;
    role: Role;
    name: string;
    studentDetails?: Partial<StudentProfile>;
    companyDetails?: Partial<Company>;
  }): Promise<{ success: boolean; message: string; user?: User; studentProfile?: StudentProfile; company?: Company }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Resume Upload & AI Parser
  async parseAndUploadResume(file: File, studentId: string): Promise<{
    success: boolean;
    resumeUrl: string;
    resumeName: string;
    parsedData: ParsedResumeData;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Content = btoa(binary);

    const res = await fetch(`${API_BASE}/resume/parse-and-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        base64Content,
        studentId
      })
    });
    return handleResponse(res);
  },

  // Student Profiles
  async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<{ success: boolean; studentProfile: StudentProfile }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async addStudentProfile(profileData: Omit<StudentProfile, 'id' | 'placementStatus'>): Promise<{ success: boolean; studentProfile: StudentProfile }> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Companies
  async addCompany(companyData: Omit<Company, 'id' | 'joinedDate' | 'totalHired'>): Promise<{ success: boolean; company: Company }> {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData),
    });
    return handleResponse(res);
  },

  async updateCompanyStatus(id: string, status: Company['status']): Promise<{ success: boolean; company: Company }> {
    const res = await fetch(`${API_BASE}/companies/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<{ success: boolean; company: Company }> {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Jobs
  async addJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<{ success: boolean; job: Job }> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    return handleResponse(res);
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<{ success: boolean; job: Job }> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async saveJob(id: string, studentId: string): Promise<{ success: boolean; job: Job }> {
    const res = await fetch(`${API_BASE}/jobs/${id}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(res);
  },

  async unsaveJob(id: string, studentId: string): Promise<{ success: boolean; job: Job }> {
    const res = await fetch(`${API_BASE}/jobs/${id}/unsave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(res);
  },

  // Applications
  async applyForJob(jobId: string, studentId: string): Promise<{ success: boolean; message: string; application?: Application }> {
    const res = await fetch(`${API_BASE}/applications/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, studentId }),
    });
    return handleResponse(res);
  },

  async updateApplicationStatus(id: string, status: ApplicationStage, remarks?: string): Promise<{ success: boolean; application: Application }> {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks }),
    });
    return handleResponse(res);
  },

  async evaluateApplicationWithAI(id: string): Promise<{ success: boolean; application: Application }> {
    const res = await fetch(`${API_BASE}/applications/${id}/ai-evaluate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Interviews
  async scheduleInterview(interviewData: Omit<Interview, 'id' | 'status'>): Promise<{ success: boolean; interview: Interview }> {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interviewData),
    });
    return handleResponse(res);
  },

  // Notifications
  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
    });
    return handleResponse(res);
  },

  async clearAllNotifications(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Calendar Placement Events
  async addPlacementEvent(eventData: Omit<PlacementEvent, 'id' | 'createdAt'>): Promise<{ success: boolean; event: PlacementEvent }> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async updatePlacementEvent(id: string, updates: Partial<PlacementEvent>): Promise<{ success: boolean; event: PlacementEvent }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deletePlacementEvent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Reset database
  async resetDatabase(): Promise<{ success: boolean; state: DatabaseSchema }> {
    const res = await fetch(`${API_BASE}/reset-data`, {
      method: 'POST',
    });
    return handleResponse(res);
  }
};
