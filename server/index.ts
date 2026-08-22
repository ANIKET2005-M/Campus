import dotenv from 'dotenv';
import path from 'path';

// Load env files in order of priority: .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import { parseResumeWithGemini } from './resumeParser.js';
import { evaluateApplicationWithGemini } from './aiEvaluator.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const RESUMES_DIR = path.resolve(process.cwd(), 'data', 'resumes');
if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
}

// Serve uploaded resume files statically
app.use('/api/resumes', express.static(RESUMES_DIR));

// Serve company logos and other static images
app.use('/image', express.static(path.resolve(process.cwd(), 'image')));

const server = http.createServer(app);

// Initialize WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(event: string, payload: any) {
  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function broadcastFullState() {
  const state = await db.getState();
  broadcast('STATE_UPDATE', state);
}

// WebSocket Connection handling
wss.on('connection', async (ws: WebSocket) => {
  console.log('[WebSocket] Client connected');

  try {
    const state = await db.getState();
    ws.send(JSON.stringify({ 
      event: 'INIT_STATE', 
      payload: state,
      timestamp: new Date().toISOString() 
    }));
  } catch (err) {
    console.error('[WebSocket] Error fetching initial state:', err);
  }

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.action === 'PING') {
        ws.send(JSON.stringify({ event: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch {
      // Ignore invalid client messages
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// --- REST API Endpoints ---

// 1. Health check & Initial State
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/initial-data', async (_req: Request, res: Response) => {
  try {
    const state = await db.getState();
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch state' });
  }
});

// Authentication Endpoints
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required' });
    return;
  }

  try {
    const user = await db.authenticateUser(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid email address or password. Demo accounts password is password123' });
      return;
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, role, name, studentDetails, companyDetails } = req.body;
  if (!email || !name || !role) {
    res.status(400).json({ error: 'Email, name, and role are required for registration' });
    return;
  }

  try {
    const result = await db.registerUser({
      email,
      password: password || 'password123',
      role,
      name,
      studentDetails,
      companyDetails
    });

    if (result.success) {
      await broadcastFullState();
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 2. Resume Upload & AI Parser
app.post('/api/resume/parse-and-upload', async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType, base64Content, studentId } = req.body;
    if (!base64Content || !fileName) {
      res.status(400).json({ error: 'fileName and base64Content are required' });
      return;
    }

    const fileBuffer = Buffer.from(base64Content, 'base64');
    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(RESUMES_DIR, safeFileName);
    
    fs.writeFileSync(filePath, fileBuffer);
    const resumeUrl = `/api/resumes/${safeFileName}`;

    console.log(`[Resume Upload] Saved ${fileName} to ${filePath}`);

    // Parse resume with Gemini AI
    const parsedData = await parseResumeWithGemini(fileBuffer, mimeType || 'application/pdf', fileName);

    // Update database if studentId is provided
    if (studentId) {
      const profileUpdates: any = {
        resumeName: fileName,
        resumeUrl: resumeUrl,
        resumeUpdatedAt: new Date().toISOString().split('T')[0],
        resumeAnalysis: parsedData.analysis
      };

      if (parsedData.fullName) profileUpdates.fullName = parsedData.fullName;
      if (parsedData.email) profileUpdates.email = parsedData.email;
      if (parsedData.phone) profileUpdates.phone = parsedData.phone;
      if (parsedData.course) profileUpdates.course = parsedData.course;
      if (parsedData.department) profileUpdates.department = parsedData.department;
      if (parsedData.cgpa) profileUpdates.cgpa = parsedData.cgpa;
      if (parsedData.tenthPercent) profileUpdates.tenthPercent = parsedData.tenthPercent;
      if (parsedData.twelfthPercent) profileUpdates.twelfthPercent = parsedData.twelfthPercent;
      if (parsedData.skills && parsedData.skills.length > 0) profileUpdates.skills = parsedData.skills;
      if (parsedData.certifications && parsedData.certifications.length > 0) profileUpdates.certifications = parsedData.certifications;
      if (parsedData.projects && parsedData.projects.length > 0) profileUpdates.projects = parsedData.projects;
      if (parsedData.internships && parsedData.internships.length > 0) profileUpdates.internships = parsedData.internships;
      if (parsedData.linkedin) profileUpdates.linkedin = parsedData.linkedin;
      if (parsedData.github) profileUpdates.github = parsedData.github;

      await db.updateStudentProfile(studentId, profileUpdates);
      await broadcastFullState();
    }

    res.json({
      success: true,
      resumeUrl,
      resumeName: fileName,
      parsedData
    });
  } catch (err: any) {
    console.error('Error parsing resume upload:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// 3. Student Profiles
app.put('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updateStudentProfile(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, studentProfile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update student profile' });
  }
});

app.post('/api/students', async (req: Request, res: Response) => {
  try {
    const newProfile = await db.addStudentProfile(req.body);
    await broadcastFullState();
    res.status(201).json({ success: true, studentProfile: newProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add student profile' });
  }
});

// 4. Companies
app.post('/api/companies', async (req: Request, res: Response) => {
  try {
    const company = await db.addCompany(req.body);
    await broadcastFullState();
    res.status(201).json({ success: true, company });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add company' });
  }
});

app.put('/api/companies/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await db.updateCompanyStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, company: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update company status' });
  }
});

app.put('/api/companies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updateCompany(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, company: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update company' });
  }
});

// 5. Jobs
app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const job = await db.addJob(req.body);
    await broadcastFullState();
    res.status(201).json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add job' });
  }
});

app.put('/api/jobs/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updateJob(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update job' });
  }
});

app.post('/api/jobs/:id/save', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId } = req.body;
  if (!studentId) {
    res.status(400).json({ error: 'studentId is required' });
    return;
  }
  try {
    const updated = await db.saveJob(id, studentId);
    if (!updated) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save job' });
  }
});

app.post('/api/jobs/:id/unsave', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId } = req.body;
  if (!studentId) {
    res.status(400).json({ error: 'studentId is required' });
    return;
  }
  try {
    const updated = await db.unsaveJob(id, studentId);
    if (!updated) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to unsave job' });
  }
});

// 6. Applications
app.post('/api/applications/apply', async (req: Request, res: Response) => {
  const { jobId, studentId } = req.body;
  if (!jobId || !studentId) {
    res.status(400).json({ error: 'jobId and studentId are required' });
    return;
  }
  try {
    const result = await db.applyForJob(jobId, studentId);
    if (result.success) {
      await broadcastFullState();
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to apply' });
  }
});

app.put('/api/applications/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  try {
    const updated = await db.updateApplicationStatus(id, status, remarks);
    if (!updated) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, application: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

app.post('/api/applications/:id/ai-evaluate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await db.getState();
    const application = state.applications.find(a => a.id === id);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    const student = state.studentProfiles.find(s => s.id === application.studentId);
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    const job = state.jobs.find(j => j.id === application.jobId);
    if (!job) {
      res.status(404).json({ error: 'Job drive not found' });
      return;
    }
    const evaluation = await evaluateApplicationWithGemini(student, job);
    const updatedApplication = await db.updateApplicationAiEvaluation(id, evaluation);
    if (!updatedApplication) {
      res.status(500).json({ error: 'Failed to save evaluation to database' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, application: updatedApplication });
  } catch (err: any) {
    console.error('AI Evaluation error:', err);
    res.status(500).json({ error: err.message || 'AI Evaluation failed' });
  }
});

// 7. Interviews
app.post('/api/interviews', async (req: Request, res: Response) => {
  try {
    const interview = await db.scheduleInterview(req.body);
    await broadcastFullState();
    res.status(201).json({ success: true, interview });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to schedule interview' });
  }
});

// 8. Notifications
app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.markNotificationRead(id);
    await broadcastFullState();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark notification read' });
  }
});

app.delete('/api/notifications', async (_req: Request, res: Response) => {
  try {
    await db.clearAllNotifications();
    await broadcastFullState();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear notifications' });
  }
});

// 8.5. Calendar/Placement Events
app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const event = await db.addPlacementEvent(req.body);
    await broadcastFullState();
    res.status(201).json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add event' });
  }
});

app.put('/api/events/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await db.updatePlacementEvent(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true, event: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event' });
  }
});

app.delete('/api/events/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await db.deletePlacementEvent(id);
    if (!deleted) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    await broadcastFullState();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
});

// 9. Reset Data
app.post('/api/reset-data', async (_req: Request, res: Response) => {
  try {
    const newState = await db.resetToDefaultData();
    await broadcastFullState();
    res.json({ success: true, state: newState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset data' });
  }
});

// 10. Debug PDF Parser endpoint
app.get('/api/test-pdf-parse', async (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(RESUMES_DIR);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      res.json({ error: 'No PDF files found' });
      return;
    }
    const latestPdf = pdfFiles.sort().reverse()[0];
    const filePath = path.join(RESUMES_DIR, latestPdf);
    const buffer = fs.readFileSync(filePath);
    
    const parsedData = await parseResumeWithGemini(buffer, 'application/pdf', latestPdf);
    
    res.json({
      latestPdf,
      parsedData
    });
  } catch (e: any) {
    res.json({ error: e.message });
  }
});

// Serve React frontend
const DIST_DIR = path.resolve(process.cwd(), 'dist');

console.log("[Frontend] DIST_DIR:", DIST_DIR);
console.log(
  "[Frontend] index.html exists:",
  fs.existsSync(path.join(DIST_DIR, "index.html"))
);

app.use(express.static(DIST_DIR));

app.get("/", (_req: Request, res: Response) => {
  console.log("[Frontend] GET /");
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

// Start listening
server.listen(PORT, () => {
  console.log(`[CampusPlacement Backend] Running on http://localhost:${PORT}`);
  console.log(`[CampusPlacement WebSocket] Available at ws://localhost:${PORT}/ws`);
});