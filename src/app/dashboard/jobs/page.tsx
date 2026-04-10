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
  roadmap?: string[];
}

interface ExtractedData {
  skills: string[];
  roles: string[];
  experience: string;
  searchKeywords: string[];
}

type ViewState = 'upload' | 'analyzing' | 'results';

const ROADMAPS: Record<string, string[]> = {
  default: ['Review job description carefully', 'Update resume to match keywords', 'Practice 3 behavioral questions', 'Apply and follow up in 5 days'],
};

function getRoadmap(job: Job): string[] {
  if (job.roadmap && job.roadmap.length > 0) return job.roadmap;
  const missing = job.missingSkills || [];
  const steps: string[] = [];
  if (missing.length > 0) steps.push(`Learn ${missing[0]} basics (1–2 weeks)`);
  if (missing.length > 1) steps.push(`Build a small project using ${missing.slice(0, 2).join(' + ')}`);
  steps.push('Update your resume with new skills');
  steps.push(`Apply to ${job.company} via the Apply button`);
  steps.push('Prepare for technical + behavioral interview');
  return steps.length > 1 ? steps : ROADMAPS.default;
}

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
  const [activeTab, setActiveTab] = useState<'all' | 'greenhouse' | 'lever' | 'demo'>('all');
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);

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
        body: formData,
      });

      const resText = await res.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch {
        const isHtml = resText.toLowerCase().includes('<!doctype html>');
        throw new Error(isHtml
          ? `Server Error (${res.status}). Check server logs.`
          : `Invalid response (${res.status}): ${resText.slice(0, 80)}`);
      }

      if (!res.ok) throw new Error(data?.details || data?.error || 'Failed to analyze');

      setExtractedData(data.extractedData);
      setJobs(data.jobs);
      setUsingMock(data.usingMock || false);
      setView('results');
      setActiveTab('all');

      // Save snapshot for chatbot context
      try {
        localStorage.setItem('s2j_jobs_snapshot', JSON.stringify(data.jobs?.slice(0, 5)));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setView('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const directJobs = jobs.filter(j => j.source === 'Greenhouse' || j.source === 'Lever');
  const otherJobs = jobs.filter(j => j.source !== 'Greenhouse' && j.source !== 'Lever');

  const filteredJobs = activeTab === 'all'
    ? jobs
    : activeTab === 'greenhouse'
    ? jobs.filter(j => j.source === 'Greenhouse')
    : activeTab === 'lever'
    ? jobs.filter(j => j.source === 'Lever')
    : jobs.filter(j => j.source === 'demo' || (!j.source.includes('Greenhouse') && !j.source.includes('Lever')));

  const JobCard = ({ job }: { job: Job }) => {
    const roadmap = getRoadmap(job);
    const isExpanded = expandedRoadmap === job.id;

    return (
      <div
        className="card"
        style={{ padding: '0', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
        onClick={() => setActiveJob(job)}
      >
        {/* Score Bar */}
        {job.matchScore !== undefined && (
          <div style={{ height: '4px', background: `linear-gradient(90deg, ${getScoreColor(job.matchScore)} ${job.matchScore}%, var(--surface-2) ${job.matchScore}%)` }} />
        )}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>{job.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>{job.company}</div>
            </div>
            {job.matchScore !== undefined && (
              <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: getScoreColor(job.matchScore), lineHeight: 1 }}>{job.matchScore}%</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>match</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {job.location}</span>
            {job.salary && <span style={{ fontSize: '12px', color: 'var(--accent-success)' }}>💰 {job.salary}</span>}
            <span
              className={`badge ${job.source === 'Greenhouse' ? 'badge-success' : job.source === 'Lever' ? 'badge-cyan' : 'badge-primary'}`}
              style={{ fontSize: '10px' }}
            >
              {job.source}
            </span>
          </div>

          {/* Why this job suits you */}
          {job.matchReason && (
            <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '3px' }}>✅ WHY THIS SUITS YOU</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{job.matchReason}</p>
            </div>
          )}

          {/* Missing Skills */}
          {job.missingSkills && job.missingSkills.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-warning)', fontWeight: 600 }}>⚠️ Skills to add: </span>
              {job.missingSkills.slice(0, 3).map((s, i) => (
                <span key={i} className="badge badge-warning" style={{ fontSize: '10px', marginLeft: '4px' }}>{s}</span>
              ))}
            </div>
          )}

          {/* Learning Roadmap Toggle */}
          <button
            onClick={e => { e.stopPropagation(); setExpandedRoadmap(isExpanded ? null : job.id); }}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: isExpanded ? '10px' : '12px',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            🗺️ {isExpanded ? 'Hide' : 'Show'} Roadmap
          </button>

          {isExpanded && (
            <div style={{
              padding: '12px',
              background: 'rgba(108,99,255,0.04)',
              border: '1px solid rgba(108,99,255,0.15)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '12px',
              animation: 'fadeIn 0.2s ease',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📋 Your Preparation Roadmap
              </div>
              <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {roadmap.map((step, i) => (
                  <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
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
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🤖 AI Job Matcher
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Upload your resume — get AI-matched jobs from Greenhouse, Lever & more with skill gap analysis and roadmap.
        </p>
      </div>

      {/* UPLOAD VIEW */}
      {view === 'upload' && (
        <div style={{ maxWidth: '700px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>Paste Your Resume</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Our AI extracts your skills, finds matching jobs, identifies skill gaps, and builds a roadmap for each role.
              </p>
            </div>

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
                  placeholder={`Paste your full resume here...\n\nExample:\nJohn Doe | john@email.com\n\nSKILLS\nReact, Node.js, TypeScript, MongoDB...\n\nEXPERIENCE\nSoftware Engineer – Google (2022–2024)\n• Built scalable APIs serving 1M+ users...`}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}
                />
              </div>
            )}

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleSubmit}
              disabled={!resumeText.trim() && !selectedFile}
            >
              🔍 Analyze & Find Jobs
            </button>

            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(108,99,255,0.04)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                🔒 Your data is analyzed securely. We search jobs from <strong>Greenhouse</strong>, <strong>Lever</strong> and top companies in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ANALYZING VIEW */}
      {view === 'analyzing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '24px', animation: 'pulse-glow 2s ease infinite' }}>
            🤖
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Analyzing Your Resume...</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
            AI is extracting your skills, searching Greenhouse & Lever, and building your skill gap roadmap.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', width: '320px' }}>
            {['Extracting skills & experience...', 'Searching Greenhouse & Lever...', 'Calculating match scores...', 'Building skill roadmaps...'].map((step, i) => (
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
          {/* Profile Summary */}
          <div className="card" style={{ marginBottom: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>📊 Your Profile Analysis</h2>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {usingMock && <span className="badge badge-warning">⚠️ Demo Mode</span>}
                <div style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', fontWeight: 600 }}>
                    🏢 Greenhouse: {jobs.filter(j => j.source === 'Greenhouse').length}
                  </span>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-tertiary)', fontWeight: 600 }}>
                    🔀 Lever: {jobs.filter(j => j.source === 'Lever').length}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setView('upload'); setJobs([]); }}>🔄 New Search</button>
              </div>
            </div>
          </div>

          {/* Source Filter Tabs */}
          {!usingMock && (
            <div className="tabs" style={{ marginBottom: '20px', maxWidth: '500px' }}>
              {[
                { key: 'all', label: `All (${jobs.length})` },
                { key: 'greenhouse', label: `🏢 Greenhouse (${jobs.filter(j => j.source === 'Greenhouse').length})` },
                { key: 'lever', label: `🔀 Lever (${jobs.filter(j => j.source === 'Lever').length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Two-section layout if no filtering */}
          {activeTab === 'all' && !usingMock && directJobs.length > 0 ? (
            <div>
              {directJobs.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏢 Direct Company Jobs
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', textTransform: 'none', letterSpacing: 'normal' }}>
                      High Quality
                    </span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {directJobs.map(job => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              )}
              {otherJobs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                    📡 Other Matching Jobs
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {otherJobs.map(job => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}

          {filteredJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
              <p>No jobs found for this filter. Try "All" or add more skills to your resume.</p>
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
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '4px' }}>✅ WHY THIS JOB FITS YOU</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{activeJob.matchReason}</p>
              </div>
            )}

            {activeJob.missingSkills && activeJob.missingSkills.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '8px' }}>⚠️ SKILLS TO LEARN</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {activeJob.missingSkills.map((s, i) => <span key={i} className="badge badge-warning">{s}</span>)}
                </div>
              </div>
            )}

            {/* Roadmap in Modal */}
            <div style={{ padding: '14px 16px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px' }}>🗺️ YOUR PREPARATION ROADMAP</div>
              <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getRoadmap(activeJob).map((step, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
            </div>

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
