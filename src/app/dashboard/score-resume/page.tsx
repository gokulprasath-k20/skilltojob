'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ScoreData {
  score: number;
  feedback: string[];
  suggestions: string[];
}

export default function ScoreResumePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [textInput, setTextInput] = useState('');
  
  // Drag and Drop 
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    setScoreData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setScoreData({
           score: data.score,
           feedback: data.feedback,
           suggestions: data.suggestions
        });
        localStorage.setItem('s2j_resume_snapshot', JSON.stringify({ ...data.parsedData, _score: data.score }));
      } else {
        setErrorMsg(data.error || 'Failed to process file.');
      }
    } catch {
      setErrorMsg('Network error. Failed to process file.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim() || !token) return;
    setLoading(true);
    setErrorMsg('');
    setScoreData(null);

    const formData = new FormData();
    formData.append('text', textInput);

    try {
      const res = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setScoreData({
           score: data.score,
           feedback: data.feedback,
           suggestions: data.suggestions
        });
        localStorage.setItem('s2j_resume_snapshot', JSON.stringify({ ...data.parsedData, _score: data.score }));
      } else {
        setErrorMsg(data.error || 'Failed to process text.');
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          ✨ Score & Improve
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Upload your existing resume to get an instant AI-powered ATS score and deep-dive improvement suggestions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px' }}>
        
        {/* Upload Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           <div 
             className="card" 
             onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
             style={{ 
               padding: '40px', 
               textAlign: 'center', 
               border: dragActive ? '2px dashed var(--accent-primary)' : '2px dashed var(--border)',
               background: dragActive ? 'rgba(108,99,255,0.05)' : 'var(--surface)',
               transition: 'all 0.2s ease',
               cursor: 'pointer'
             }}
             onClick={() => document.getElementById('file-upload')?.click()}
           >
             <div style={{ fontSize: '48px', marginBottom: '16px' }}>☁️</div>
             <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Upload your Resume File</h3>
             <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
               Drag & drop an image or click to select file.
             </p>
             <input type="file" id="file-upload" accept="image/*,application/pdf,text/plain" style={{ display: 'none' }} onChange={handleChange} />
             <button className="btn btn-primary" disabled={loading} style={{ pointerEvents: 'none' }}>
               {loading ? 'Processing...' : 'Browse Files'}
             </button>
           </div>
           
           <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>OR PASTE TEXT</div>
           
           <div className="card" style={{ padding: '24px' }}>
             <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Paste Resume Text</h3>
             <textarea 
               className="textarea" 
               style={{ minHeight: '150px', marginBottom: '16px' }}
               placeholder="Paste the raw text content of your resume here..."
               value={textInput}
               onChange={(e) => setTextInput(e.target.value)}
             />
             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button className="btn btn-secondary" onClick={handleTextUpload} disabled={loading || !textInput.trim()}>
                 {loading ? 'Analyzing...' : 'Analyze Text'}
               </button>
             </div>
           </div>

           {errorMsg && <div style={{ color: 'var(--accent-danger)', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}
        </div>

        {/* Results Container */}
        {scoreData && (
          <div className="card" style={{ padding: '32px', animation: 'fadeIn 0.5s ease', background: 'linear-gradient(180deg, var(--surface) 0%, rgba(108,99,255,0.03) 100%)' }}>
             <div style={{ textAlign: 'center', marginBottom: '32px' }}>
               <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                 Your ATS Score
               </div>
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '64px', fontWeight: 800, color: scoreData.score >= 80 ? 'var(--accent-success)' : scoreData.score >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)', lineHeight: 1 }}>
                     {scoreData.score}
                  </span>
                  <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>/100</span>
               </div>
             </div>
             
             <div className="progress-bar" style={{ height: '8px', marginBottom: '32px' }}>
               <div className="progress-fill" style={{ width: `${scoreData.score}%`, background: scoreData.score >= 80 ? 'var(--accent-success)' : scoreData.score >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)' }} />
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0,1fr)', gap: '20px' }}>
               <div style={{ background: 'rgba(16,185,129,0.05)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.15)' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '16px' }}>✅ Strengths Detected</h3>
                 <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {scoreData.feedback.map((s,i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               <div style={{ background: 'rgba(245,158,11,0.05)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.15)' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '16px' }}>💡 How to Improve</h3>
                 <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {scoreData.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
             </div>
             
             <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Want to fix these issues immediately? Head over to the Resume Builder.
                </p>
                <a href="/dashboard/resume" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 24px', textDecoration: 'none' }}>
                  Go to Resume Builder →
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
