import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentProfile } from '../../types';
import { Modal } from '../common/Modal';

export const StudentManagementView: React.FC = () => {
  const { studentProfiles, addStudentProfile, updateStudentProfile, applications } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New student form
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('BCA');
  const [department, setDepartment] = useState('Computer Science');
  const [cgpa, setCgpa] = useState('8.0');
  const [gradYear, setGradYear] = useState('2026');

  const filteredStudents = studentProfiles.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesCourse = selectedCourse === 'All' || s.course === selectedCourse;
    const matchesStatus = selectedStatus === 'All' || s.placementStatus === selectedStatus;

    return matchesSearch && matchesDept && matchesCourse && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regNo || !email) return;

    addStudentProfile({
      userId: `user_${Date.now()}`,
      fullName,
      registrationNumber: regNo,
      email,
      phone: phone || '+91 98765 00000',
      dateOfBirth: '2003-01-01',
      address: 'University Campus',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      course,
      department,
      graduationYear: parseInt(gradYear) || 2026,
      cgpa: parseFloat(cgpa) || 8.0,
      tenthPercent: 85.0,
      twelfthPercent: 82.0,
      backlogs: 0,
      skills: ['Java', 'SQL', 'Python'],
      certifications: [],
      projects: [],
      internships: [],
      linkedin: '',
      github: ''
    });

    setIsAddModalOpen(false);
    setFullName('');
    setRegNo('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory & Academic Profiles</h2>
          <p className="text-xs text-slate-500">Manage enrolled candidates, academic credentials, and placement records</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name, registration number, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="All">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="B.Tech">B.Tech</option>
              <option value="MCA">MCA</option>
              <option value="M.Tech">M.Tech</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="In Process">In Process</option>
              <option value="Not Placed">Not Placed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Reg Number</th>
                <th className="px-4 py-3.5">Course / Dept</th>
                <th className="px-4 py-3.5">CGPA</th>
                <th className="px-4 py-3.5">10th / 12th %</th>
                <th className="px-4 py-3.5">Backlogs</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={std.avatar}
                        alt={std.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{std.fullName}</p>
                        <p className="text-[10px] text-slate-400">{std.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{std.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{std.course}</p>
                    <p className="text-[10px] text-slate-500">{std.department}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-600">{std.cgpa}</td>
                  <td className="px-4 py-3 text-slate-600">{std.tenthPercent}% / {std.twelfthPercent}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      std.backlogs === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {std.backlogs} Backlogs
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      std.placementStatus === 'Placed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : std.placementStatus === 'In Process'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {std.placementStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedStudent(std)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 inline-flex"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Student Profile */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? `${selectedStudent.fullName} Profile` : ''}
        subtitle="Full academic background and active applications"
        maxWidth="2xl"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Registration No.</span>
                <span className="font-bold text-slate-900">{selectedStudent.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Course & Dept</span>
                <span className="font-bold text-slate-900">{selectedStudent.course} ({selectedStudent.department})</span>
              </div>
              <div>
                <span className="text-slate-400 block">CGPA</span>
                <span className="font-bold text-indigo-600">{selectedStudent.cgpa} / 10</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Resume</span>
                <span className="font-semibold text-indigo-600">{selectedStudent.resumeName || 'Uploaded'}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Technical Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Active Applications ({applications.filter(a => a.studentId === selectedStudent.id).length})</h5>
              <div className="space-y-2">
                {applications.filter(a => a.studentId === selectedStudent.id).map((app) => (
                  <div key={app.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{app.jobTitle}</span>
                      <span className="text-slate-500 block">{app.companyName} • Applied {app.appliedDate}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Add Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Student Record"
        subtitle="Add a new final year student to the campus placement database"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reg Number *</label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="2023BCA108"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campus Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Course</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded-lg bg-white">
                <option value="BCA">BCA</option>
                <option value="B.Tech">B.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded-lg bg-white">
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Tech</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.1"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm mt-3"
          >
            Create Student Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};
