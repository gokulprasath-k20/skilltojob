'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  applyLink: string;
  description?: string;
  salary?: string;
  source: string;
  matchReason?: string;
  missingSkills?: string[];
  matchScore?: number;
}

interface ExtractedData {
  skills: string[];
  roles: string[];
  experience: string;
  searchKeywords: string[];
}

type ViewState = 'upload' | 'analyzing' | 'results';

export default function JobsPage() {
  const { token } = useAuth();
  const [view, setView] = useState<ViewState>('upload');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const handleSubmit = async () => {
    if (!resumeText.trim() && !selectedFile) {
      setError('Please paste your resume text or upload a file.');
      return;
    }
    setView('analyzing');
    setError('');
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('file', selectedFile);
      if (resumeText.trim()) formData.append('resumeText', resumeText);

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData, // the browser will automatically set the appropriate Content-Type for FormData
      });
      
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Server returned an invalid response (Status: ${res.status}). This could be a timeout or a server error.`);
      }
      
      if (!res.ok) {
        throw new Error(data?.details || data?.error || 'Failed to analyze');
      }
      
      setExtractedData(data.extractedData);
      setJobs(data.jobs);
      setUsingMock(data.usingMock || false);
      setView('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setView('upload');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError('');
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🤖 AI Job Matcher
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Paste your resume and get AI-matched jobs with skill gap analysis.
        </p>
      </div>

      {/* UPLOAD VIEW */}
      {view === 'upload' && (
        <div style={{ maxWidth: '700px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>Paste Your Resume</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Paste the full text of your resume. Our AI will extract your skills and find matching jobs.
              </p>
            </div>

            {/* File Upload */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '20px' }}>📁</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile ? selectedFile.name : 'Upload PDF, TXT, or Image'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {selectedFile ? 'Click to change file' : 'PNG, JPG, PDF, or TXT'}
                </div>
              </div>
              <input type="file" accept=".txt,.pdf,image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>

            {!selectedFile && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="label">Or Paste Text *</label>
                <textarea
                  className="textarea"
                  placeholder={`Paste your full resume here...

Example:
John Doe | john@email.com | +1 234 567 8900

SKILLS
React, Node.js, TypeScript, MongoDB, AWS...

EXPERIENCE
Software Engineer – Google (2022–2024)
• Built scalable APIs serving 1M+ users...`}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                style={{ minHeight: '320px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}
              />
            </div>
            )}

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleSubmit}
                disabled={!resumeText.trim() && !selectedFile}
              >
                🔍 Analyze & Find Jobs
              </button>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                🔒 Your data is analyzed securely and used only to match you with jobs. We don&apos;t store or share your resume with employers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ANALYZING VIEW */}
      {view === 'analyzing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div className="analyzing-orb" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '24px', animation: 'pulse-glow 2s ease infinite' }}>
            🤖
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Analyzing Your Resume...</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
            Our AI is extracting your skills, experience level, and finding the best matching jobs from multiple platforms.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
            {['Extracting skills & experience...', 'Identifying ideal job roles...', 'Searching job databases...', 'Calculating match scores...'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', animation: `fadeIn 0.3s ease ${i * 0.3}s both` }}>
                <span className="animate-spin" style={{ fontSize: '14px' }}>⚙️</span> {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {view === 'results' && extractedData && (
        <div>
          {/* Extracted Profile */}
          <div className="card" style={{ marginBottom: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>📊 Your Profile Analysis</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {extractedData.skills.map((skill, i) => (
                    <span key={i} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Level: <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>{extractedData.experience}</span>
                  {' • '}Matched Roles: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{extractedData.roles.slice(0, 3).join(', ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {usingMock && <span className="badge badge-warning">⚠️ Demo Mode (Add API keys for real jobs)</span>}
                <button className="btn btn-ghost btn-sm" onClick={() => { setView('upload'); setJobs([]); }}>🔄 New Search</button>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ padding: '0', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => setActiveJob(job)}>
                {/* Score Bar */}
                {job.matchScore !== undefined && (
                  <div style={{ height: '4px', background: `linear-gradient(90deg, ${getScoreColor(job.matchScore)} ${job.matchScore}%, var(--surface-2) ${job.matchScore}%)` }} />
                )}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{job.title}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>{job.company}</div>
                    </div>
                    {job.matchScore !== undefined && (
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: getScoreColor(job.matchScore), lineHeight: 1 }}>{job.matchScore}%</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>match</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {job.location}</span>
                    {job.salary && <span style={{ fontSize: '12px', color: 'var(--accent-success)' }}>💰 {job.salary}</span>}
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{job.source}</span>
                  </div>

                  {job.matchReason && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {job.matchReason}
                    </p>
                  )}

                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--accent-warning)', fontWeight: 600 }}>Skills to learn: </span>
                      {job.missingSkills.slice(0, 3).map((s, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '10px', marginLeft: '4px' }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                    onClick={e => e.stopPropagation()}
                  >
                    Apply Now →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
              <p>No jobs found. Try adding more skills to your resume.</p>
            </div>
          )}
        </div>
      )}

      {/* Job Detail Modal */}
      {activeJob && (
        <div className="modal-overlay" onClick={() => setActiveJob(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{activeJob.title}</h2>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{activeJob.company}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveJob(null)} style={{ fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span className="badge badge-primary">📍 {activeJob.location}</span>
              {activeJob.salary && <span className="badge badge-success">💰 {activeJob.salary}</span>}
              {activeJob.matchScore && <span className="badge badge-cyan">🎯 {activeJob.matchScore}% Match</span>}
            </div>
            {activeJob.matchReason && (
              <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '4px' }}>WHY THIS JOB FITS YOU</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{activeJob.matchReason}</p>
              </div>
            )}
            {activeJob.missingSkills && activeJob.missingSkills.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '8px' }}>SKILL GAPS TO ADDRESS</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {activeJob.missingSkills.map((s, i) => <span key={i} className="badge badge-warning">{s}</span>)}
                </div>
              </div>
            )}
            {activeJob.description && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Job Description</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{activeJob.description.slice(0, 500)}{activeJob.description.length > 500 ? '...' : ''}</p>
              </div>
            )}
            <a href={activeJob.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full btn-lg" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Apply Now →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
