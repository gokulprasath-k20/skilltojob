'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Question {
  question: string;
  answer: string;
  feedback?: string;
  score?: number;
}

interface Interview {
  _id: string;
  role: string;
  questions: Question[];
  overallScore?: number;
  overallFeedback?: {
    strengths: string[];
    improvements: string[];
  };
  createdAt: string;
}

export default function InterviewPage() {
  const { token, loading } = useAuth();
  const [history, setHistory] = useState<Interview[]>([]);
  const [view, setView] = useState<'history' | 'setup' | 'active' | 'result'>('history');
  
  // Setup State
  const [roleInput, setRoleInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  
  // Active Interview State
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  
  // UI State
  const [statusMsg, setStatusMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/interview', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (e) {
      console.error(e);
    }
  };

  const startInterview = async () => {
    if (!roleInput.trim() || !skillsInput.trim()) {
      setStatusMsg('Please enter a role and your skills.');
      return;
    }
    setIsProcessing(true);
    setStatusMsg('Generating questions...');
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'start',
          role: roleInput,
          skills: skillsInput.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveInterview(data.interview);
        setCurrentIdx(0);
        setAnswerInput('');
        setView('active');
        fetchHistory(); // Refresh history
      } else {
        setStatusMsg(data.error || 'Failed to start interview.');
      }
    } catch {
      setStatusMsg('Network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerInput.trim() || !activeInterview) return;
    setIsProcessing(true);
    setStatusMsg('Evaluating your answer...');
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'evaluate',
          interviewId: activeInterview._id,
          questionIndex: currentIdx,
          answer: answerInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveInterview(data.interview);
        setStatusMsg('');
        if (currentIdx < activeInterview.questions.length - 1) {
           // Move to next question gracefully. Instead of clearing immediatly, wait to let user see feedback? 
           // Better to let them click 'Next Question' if they want. Let's just update the local object for now.
        } else {
           setView('result');
           fetchHistory();
        }
      } else {
        setStatusMsg(data.error);
      }
    } catch {
      setStatusMsg('Network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPastInterview = (inv: Interview) => {
    setActiveInterview(inv);
    setView('result');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🎤 AI Mock Interviews
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Practice behavioral and technical questions tailored to your skills and get instant feedback.
        </p>
      </div>

      {view === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px', alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '20px', padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(6,182,212,0.04))' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Ready to Practice?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                Simulate a real interview atmosphere. Don't worry about perfect answers, focus on structure and problem solving.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setView('setup')}>
                Start New Interview
              </button>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Past Interviews</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No past interviews found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map(h => (
                  <div key={h._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => loadPastInterview(h)}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{h.role}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                    </div>
                    {h.overallScore !== undefined ? (
                      <div className={`badge ${h.overallScore >= 70 ? 'badge-success' : 'badge-warning'}`}>
                        Score: {h.overallScore}/100
                      </div>
                    ) : (
                      <div className="badge badge-primary">Incomplete</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'setup' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }} onClick={() => setView('history')}>← Back</button>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Setup Interview</h2>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="label">Target Role</label>
            <input className="input" placeholder="e.g. Frontend Engineer" value={roleInput} onChange={e => setRoleInput(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="label">Your Top Skills (comma separated)</label>
            <input className="input" placeholder="e.g. React, Next.js, UI/UX" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} />
          </div>

          {statusMsg && <div style={{ color: 'var(--accent-warning)', fontSize: '13px', marginBottom: '16px' }}>{statusMsg}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={startInterview} disabled={isProcessing}>
            {isProcessing ? 'Generating...' : 'Start Interview'}
          </button>
        </div>
      )}

      {view === 'active' && activeInterview && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>{activeInterview.role}</span>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Question {currentIdx + 1} of {activeInterview.questions.length}</span>
          </div>
          
          <div className="progress-bar" style={{ height: '6px', marginBottom: '24px' }}>
            <div className="progress-fill" style={{ width: `${((currentIdx) / activeInterview.questions.length) * 100}%` }} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.4 }}>
            {activeInterview.questions[currentIdx].question}
          </h2>

          {activeInterview.questions[currentIdx].score === undefined ? (
            <div>
               <div className="form-group">
                 <label className="label">Your Answer</label>
                 <textarea 
                   className="textarea" 
                   style={{ minHeight: '150px' }}
                   placeholder="Type your answer here..."
                   value={answerInput}
                   onChange={e => setAnswerInput(e.target.value)}
                   disabled={isProcessing}
                 />
               </div>
               
               {statusMsg && <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>{statusMsg}</div>}

               <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                 <button className="btn btn-primary" onClick={submitAnswer} disabled={isProcessing || !answerInput.trim()}>
                   {isProcessing ? 'Evaluating...' : 'Submit Answer'}
                 </button>
               </div>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
               <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Answer:</div>
               <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '20px', fontStyle: 'italic' }}>
                 "{activeInterview.questions[currentIdx].answer}"
               </p>
               
               <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                     <span className={`badge ${activeInterview.questions[currentIdx].score! >= 70 ? 'badge-success' : 'badge-warning'}`}>
                       Score: {activeInterview.questions[currentIdx].score}/100
                     </span>
                     <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Feedback</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {activeInterview.questions[currentIdx].feedback}
                  </p>
               </div>

               <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                 <button className="btn btn-primary" onClick={() => {
                   if (currentIdx < activeInterview.questions.length - 1) {
                     setCurrentIdx(c => c + 1);
                     setAnswerInput('');
                   } else {
                     setView('result');
                     fetchHistory();
                   }
                 }}>
                   {currentIdx < activeInterview.questions.length - 1 ? 'Next Question →' : 'Finish Interview'}
                 </button>
               </div>
            </div>
          )}
        </div>
      )}

      {view === 'result' && activeInterview && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }} onClick={() => setView('history')}>← Back to History</button>
          
          <div className="card" style={{ marginBottom: '24px', padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Overall Score
              </div>
              <div style={{ fontSize: '56px', fontWeight: 800, color: (activeInterview.overallScore || 0) >= 70 ? 'var(--accent-success)' : 'var(--accent-warning)', lineHeight: 1 }}>
                {activeInterview.overallScore || 'N/A'}
              </div>
            </div>

            {activeInterview.overallFeedback && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0,1fr)', gap: '20px' }}>
                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '12px' }}>✅ Strengths</h3>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {activeInterview.overallFeedback.strengths.map((s,i) => <li key={i} style={{ marginBottom: '6px' }}>{s}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.05)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '12px' }}>⚠️ Areas to Improve</h3>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {activeInterview.overallFeedback.improvements.map((s,i) => <li key={i} style={{ marginBottom: '6px' }}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Detailed Q&A</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeInterview.questions.map((q, i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4, flex: 1, paddingRight: '20px' }}>
                    Q{i+1}: {q.question}
                  </h4>
                  {q.score && <span className={`badge ${q.score >= 70 ? 'badge-success' : 'badge-warning'}`}>{q.score}/100</span>}
                </div>
                {q.answer ? (
                  <>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <strong>Your Answer:</strong><br/>{q.answer}
                    </div>
                    {q.feedback && (
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '12px' }}>
                        <strong>Feedback:</strong> {q.feedback}
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not answered.</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
