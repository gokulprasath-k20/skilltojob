'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface CoverLetter {
  _id: string;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

export default function CoverLetterPage() {
  const { token } = useAuth();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  
  // Generating State
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit State
  const [activeLetter, setActiveLetter] = useState<CoverLetter | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token) fetchLetters();
  }, [token]);

  const fetchLetters = async () => {
    try {
      const res = await fetch('/api/cover-letter', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.letters) setLetters(data.letters);
    } catch {}
  };

  const generateLetter = async () => {
    if (!jobTitle || !companyName) {
      setErrorMsg('Job title and company name are required.');
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);

    // Grab resume text from snapshot 
    const resumeText = localStorage.getItem('s2j_resume_snapshot') || '{}'; 

    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'generate',
          jobTitle, companyName, resumeData: JSON.parse(resumeText)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLetters([data.letter, ...letters]);
        setActiveLetter(data.letter);
        setEditContent(data.letter.content);
        setView('edit');
        setJobTitle('');
        setCompanyName('');
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEdit = async () => {
    if (!activeLetter) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'save', letterId: activeLetter._id, content: editContent
        })
      });
      if (res.ok) {
        fetchLetters();
        setView('list');
      }
    } catch {}
    setIsSaving(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editContent);
    alert('Copied to clipboard!');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            ✉️ Cover Letters
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Generate AI written cover letters based on your resume data.
          </p>
        </div>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => setView('create')}>
            + New Cover Letter
          </button>
        )}
      </div>

      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {letters.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1', background: 'var(--surface)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✉️</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No cover letters generated yet.</p>
              <button className="btn btn-secondary" onClick={() => setView('create')}>Create Your First</button>
            </div>
          ) : (
            letters.map(l => (
              <div key={l._id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => {
                setActiveLetter(l);
                setEditContent(l.content);
                setView('edit');
              }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{l.jobTitle}</div>
                <div style={{ fontSize: '14px', color: 'var(--accent-primary)', marginBottom: '12px' }}>{l.companyName}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {l.content}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(l.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'create' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }} onClick={() => setView('list')}>← Cancel</button>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Generate Cover Letter</h2>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="label">Target Job Title *</label>
            <input className="input" placeholder="e.g. Frontend Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="label">Company Name *</label>
            <input className="input" placeholder="e.g. Vercel" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>

          {errorMsg && <div style={{ color: 'var(--accent-danger)', fontSize: '13px', marginBottom: '16px' }}>{errorMsg}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={generateLetter} disabled={isGenerating}>
            {isGenerating ? '✨ Writing Draft...' : '✨ Generate with AI'}
          </button>
        </div>
      )}

      {view === 'edit' && activeLetter && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px', alignItems: 'start' }}>
          <div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }} onClick={() => setView('list')}>← Back to List</button>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
               <div style={{ background: 'var(--surface)', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <div style={{ fontSize: '16px', fontWeight: 700 }}>{activeLetter.jobTitle}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{activeLetter.companyName}</div>
                 </div>
                 <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>📋 Copy text</button>
               </div>
               <div style={{ padding: '24px' }}>
                 <textarea 
                   className="textarea"
                   style={{ minHeight: '400px', fontSize: '14px', lineHeight: 1.6, border: 'none', background: 'transparent' }}
                   value={editContent}
                   onChange={e => setEditContent(e.target.value)}
                 />
               </div>
               <div style={{ padding: '16px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                 <button className="btn btn-primary" onClick={saveEdit} disabled={isSaving}>
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </button>
               </div>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', background: 'rgba(108,99,255,0.05)', borderColor: 'rgba(108,99,255,0.2)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>💡 Tips</h3>
            <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Make sure to replace any placeholders if the AI left them.</li>
              <li>Keep it under 1 page.</li>
              <li>Focus on what value you bring to the company, not just what you want.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
