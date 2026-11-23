import { useState, useEffect } from 'react';

const API_URL = 'https://placemate-ai-tk62.onrender.com'/api;

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegister, setIsRegister] = useState(false);

  // Auth states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Jobs states
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [pkg, setPkg] = useState('');
  const [desc, setDesc] = useState('');

  // AI Analyzer states
  const [skills, setSkills] = useState('');
  const [jd, setJd] = useState('');
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister ? { name, email, password, role } : { email, password };

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) return alert(data.message || 'Authentication failed');

    if (isRegister) {
      alert('Registration successful! Please login now.');
      setIsRegister(false);
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
  };

  const fetchJobs = async () => {
    const res = await fetch(`${API_URL}/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setJobs(data);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ company, role: jobRole, package: pkg, description: desc })
    });
    if (res.ok) {
      alert('Job Drive Posted!');
      setCompany(''); setJobRole(''); setPkg(''); setDesc('');
      fetchJobs();
    }
  };

  const handleApply = async (id) => {
    const res = await fetch(`${API_URL}/jobs/${id}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message);
    fetchJobs();
  };

  const handleAiAnalyze = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skills, jobDescription: jd })
    });
    const data = await res.json();
    if (res.ok) setAiResult(data);
    else alert(data.message);
  };

  const cardStyle = { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
  const btnStyle = { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', fontFamily: 'Arial, sans-serif' }}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', color: '#1e3a8a' }}>PlaceMate AI</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>{isRegister ? 'Create an Account' : 'Login to Campus Portal'}</p>
          <form onSubmit={handleAuth}>
            {isRegister && (
              <>
                <input style={inputStyle} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <select style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Role: Student</option>
                  <option value="admin">Role: Placement Admin (TPO)</option>
                </select>
              </>
            )}
            <input style={inputStyle} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button style={{ ...btnStyle, width: '100%' }} type="submit">{isRegister ? 'Register' : 'Login'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#2563eb' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Login' : 'New user? Register here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: '0 15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...cardStyle, background: '#1e3a8a', color: '#fff' }}>
        <div>
          <h2 style={{ margin: 0 }}>PlaceMate AI</h2>
          <small>Welcome, {user?.name} ({user?.role?.toUpperCase()})</small>
        </div>
        <button onClick={logout} style={{ ...btnStyle, background: '#ef4444' }}>Logout</button>
      </div>

      {user?.role === 'admin' && (
        <div style={cardStyle}>
          <h3>Post New Placement Drive (Admin)</h3>
          <form onSubmit={handleCreateJob}>
            <input style={inputStyle} placeholder="Company Name (e.g., TCS, Google)" value={company} onChange={e => setCompany(e.target.value)} required />
            <input style={inputStyle} placeholder="Job Role (e.g., Full Stack Developer)" value={jobRole} onChange={e => setJobRole(e.target.value)} required />
            <input style={inputStyle} placeholder="Package (e.g., 8 LPA)" value={pkg} onChange={e => setPkg(e.target.value)} required />
            <textarea style={inputStyle} placeholder="Job Description & Required Skills" value={desc} onChange={e => setDesc(e.target.value)} required />
            <button style={btnStyle} type="submit">Post Drive</button>
          </form>
        </div>
      )}

      {user?.role === 'student' && (
        <div style={{ ...cardStyle, borderLeft: '5px solid #10b981' }}>
          <h3>AI Resume & Skill Match Analyzer</h3>
          <form onSubmit={handleAiAnalyze}>
            <input style={inputStyle} placeholder="Your Skills (comma separated, e.g., React, Node, JavaScript, MongoDB)" value={skills} onChange={e => setSkills(e.target.value)} required />
            <textarea style={inputStyle} placeholder="Paste Job Description here to check match score..." value={jd} onChange={e => setJd(e.target.value)} required />
            <button style={{ ...btnStyle, background: '#10b981' }} type="submit">Analyze with AI</button>
          </form>
          {aiResult && (
            <div style={{ marginTop: '15px', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
              <h4>Match Score: <span style={{ color: '#15803d' }}>{aiResult.matchScore}</span></h4>
              <p><strong>Matched Skills:</strong> {aiResult.matchedSkills.join(', ')}</p>
              <p><strong>Missing Skills to Learn:</strong> {aiResult.missingSkills.join(', ')}</p>
              <p><strong>AI Interview Prep Tips:</strong></p>
              <ul>{aiResult.interviewTips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <h3>Active Campus Placement Drives ({jobs.length})</h3>
        {jobs.length === 0 ? <p>No drives posted yet.</p> : jobs.map(job => (
          <div key={job._id} style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>{job.company} — {job.role}</h4>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>{job.package}</span>
            </div>
            <p style={{ color: '#4b5563' }}>{job.description}</p>
            {user?.role === 'student' ? (
              <button onClick={() => handleApply(job._id)} style={btnStyle}>
                {job.applicants?.some(a => a._id === user.id || a === user.id) ? 'Applied ✓' : 'Apply Now'}
              </button>
            ) : (
              <p style={{ color: '#059669', fontWeight: 'bold' }}>Total Applicants: {job.applicants?.length || 0}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
