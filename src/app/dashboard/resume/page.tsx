'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ResumePreview from '@/components/ResumePreview';
import { RESUME_TEMPLATES, EMPTY_RESUME, ResumeData, ResumeTemplate } from '@/lib/resumeTemplates';

type StepKey = 'basic' | 'skills' | 'experience' | 'education' | 'projects' | 'preview';
const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'basic', label: 'Basic Info', icon: '👤' },
  { key: 'skills', label: 'Skills', icon: '⚡' },
  { key: 'experience', label: 'Experience', icon: '💼' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'projects', label: 'Projects', icon: '🚀' },
  { key: 'preview', label: 'Preview', icon: '👁️' },
];

export default function ResumePage() {
  const { token } = useAuth();
  const [step, setStep] = useState<StepKey>('basic');
  const [data, setData] = useState<ResumeData>({ ...EMPTY_RESUME });
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(RESUME_TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const currentStepIdx = STEPS.findIndex(s => s.key === step);

  const update = (key: keyof ResumeData, val: unknown) => setData(d => ({ ...d, [key]: val }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const skills = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    update('skills', [...data.skills, ...skills]);
    setSkillInput('');
  };
  const removeSkill = (i: number) => update('skills', data.skills.filter((_, idx) => idx !== i));

  const addCert = () => {
    if (!certInput.trim()) return;
    update('certifications', [...data.certifications, certInput.trim()]);
    setCertInput('');
  };

  const addExp = () => update('experience', [...data.experience, { company: '', role: '', duration: '', description: [''] }]);
  const removeExp = (i: number) => update('experience', data.experience.filter((_, idx) => idx !== i));
  const updateExp = (i: number, key: string, val: string | string[]) => {
    const updated = [...data.experience];
    updated[i] = { ...updated[i], [key]: val };
    update('experience', updated);
  };

  const addEdu = () => update('education', [...data.education, { school: '', degree: '', field: '', year: '', gpa: '' }]);
  const removeEdu = (i: number) => update('education', data.education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, key: string, val: string) => {
    const updated = [...data.education];
    updated[i] = { ...updated[i], [key]: val };
    update('education', updated);
  };

  const addProj = () => update('projects', [...data.projects, { name: '', description: '', tech: [], link: '' }]);
  const removeProj = (i: number) => update('projects', data.projects.filter((_, idx) => idx !== i));
  const updateProj = (i: number, key: string, val: string | string[]) => {
    const updated = [...data.projects];
    updated[i] = { ...updated[i], [key]: val };
    update('projects', updated);
  };

  const handleSave = async (aiEnhance = false) => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data, templateId: selectedTemplate.id, aiEnhance }),
      });
      const json = await res.json();
      if (res.ok) {
        setScore(json.resume.score);
        setSaveMsg('✅ Resume saved successfully!');
      } else {
        setSaveMsg(`❌ ${json.error}`);
      }
    } catch {
      setSaveMsg('❌ Failed to save. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleAiEnhance = async () => {
    setAiLoading(true);
    setSaveMsg('');
    try {
      await handleSave(true);
      setSaveMsg('✨ AI enhancement applied!');
    } finally {
      setAiLoading(false);
    }
  };

  const downloadPDF = async () => {
    const el = document.getElementById('resume-preview');
    if (!el) return;
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.name || 'resume'}.pdf`);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ data, templateId: selectedTemplate.id }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'resume.json'; a.click();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          📄 Resume Builder
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Build an ATS-friendly resume with AI enhancement.
        </p>
      </div>

      {/* Step Progress */}
      <div className="steps-bar">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            className={`step-btn ${step === s.key ? 'active' : ''} ${i < currentStepIdx ? 'done' : ''}`}
            onClick={() => setStep(s.key)}
          >
            <span className="step-icon">{i < currentStepIdx ? '✓' : s.icon}</span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: step === 'preview' ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* FORM PANEL */}
        <div className="card">
          {/* === BASIC === */}
          {step === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="label">Full Name *</label><input className="input" placeholder="John Doe" value={data.name} onChange={e => update('name', e.target.value)} /></div>
                <div className="form-group"><label className="label">Email *</label><input className="input" type="email" placeholder="you@email.com" value={data.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="form-group"><label className="label">Phone</label><input className="input" placeholder="+1 234 567 8900" value={data.phone} onChange={e => update('phone', e.target.value)} /></div>
                <div className="form-group"><label className="label">Location</label><input className="input" placeholder="New York, USA" value={data.location} onChange={e => update('location', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="label">Professional Summary</label><textarea className="textarea" placeholder="A brief summary of your professional background, key achievements, and career goals..." value={data.summary} onChange={e => update('summary', e.target.value)} style={{ minHeight: '100px' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="label">LinkedIn</label><input className="input" placeholder="linkedin.com/in/you" value={data.links.linkedin || ''} onChange={e => update('links', { ...data.links, linkedin: e.target.value })} /></div>
                <div className="form-group"><label className="label">GitHub</label><input className="input" placeholder="github.com/you" value={data.links.github || ''} onChange={e => update('links', { ...data.links, github: e.target.value })} /></div>
                <div className="form-group"><label className="label">Website</label><input className="input" placeholder="yoursite.com" value={data.links.website || ''} onChange={e => update('links', { ...data.links, website: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* === SKILLS === */}
          {step === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Skills & Certifications</h2>
              <div className="form-group">
                <label className="label">Add Skills (comma-separated)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input" placeholder="React, Node.js, Python..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                  <button className="btn btn-primary" onClick={addSkill}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {data.skills.map((skill, i) => (
                    <span key={i} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => removeSkill(i)}>
                      {skill} ✕
                    </span>
                  ))}
                  {data.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No skills added yet. Type above and press Add.</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Certifications</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input" placeholder="AWS Certified Developer..." value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCert()} />
                  <button className="btn btn-secondary" onClick={addCert}>Add</button>
                </div>
                {data.certifications.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{c}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => update('certifications', data.certifications.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === EXPERIENCE === */}
          {step === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Work Experience</h2>
                <button className="btn btn-secondary btn-sm" onClick={addExp}>+ Add</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="card" style={{ padding: '16px', position: 'relative' }}>
                  {data.experience.length > 1 && (
                    <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => removeExp(i)}>✕</button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div className="form-group"><label className="label">Company</label><input className="input" placeholder="Google" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} /></div>
                    <div className="form-group"><label className="label">Role</label><input className="input" placeholder="Software Engineer" value={exp.role} onChange={e => updateExp(i, 'role', e.target.value)} /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Duration</label><input className="input" placeholder="Jan 2022 – Present" value={exp.duration} onChange={e => updateExp(i, 'duration', e.target.value)} /></div>
                  </div>
                  <div className="form-group">
                    <label className="label">Bullet Points (one per line)</label>
                    <textarea className="textarea" placeholder={"• Led a team of 5 engineers to build...\n• Reduced load time by 40%..."} value={exp.description.join('\n')} onChange={e => updateExp(i, 'description', e.target.value.split('\n'))} style={{ minHeight: '120px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === EDUCATION === */}
          {step === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Education</h2>
                <button className="btn btn-secondary btn-sm" onClick={addEdu}>+ Add</button>
              </div>
              {data.education.map((edu, i) => (
                <div key={i} className="card" style={{ padding: '16px', position: 'relative' }}>
                  {data.education.length > 1 && (
                    <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => removeEdu(i)}>✕</button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">School / University</label><input className="input" placeholder="MIT" value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} /></div>
                    <div className="form-group"><label className="label">Degree</label><input className="input" placeholder="B.Tech / B.Sc" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} /></div>
                    <div className="form-group"><label className="label">Field</label><input className="input" placeholder="Computer Science" value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} /></div>
                    <div className="form-group"><label className="label">Graduation Year</label><input className="input" placeholder="2024" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} /></div>
                    <div className="form-group"><label className="label">GPA (optional)</label><input className="input" placeholder="3.8/4.0" value={edu.gpa || ''} onChange={e => updateEdu(i, 'gpa', e.target.value)} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === PROJECTS === */}
          {step === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Projects</h2>
                <button className="btn btn-secondary btn-sm" onClick={addProj}>+ Add</button>
              </div>
              {data.projects.map((proj, i) => (
                <div key={i} className="card" style={{ padding: '16px', position: 'relative' }}>
                  {data.projects.length > 1 && (
                    <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => removeProj(i)}>✕</button>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group"><label className="label">Project Name</label><input className="input" placeholder="E-Commerce Platform" value={proj.name} onChange={e => updateProj(i, 'name', e.target.value)} /></div>
                    <div className="form-group"><label className="label">Description</label><textarea className="textarea" placeholder="A full-stack e-commerce platform with payment integration..." value={proj.description} onChange={e => updateProj(i, 'description', e.target.value)} style={{ minHeight: '80px' }} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group"><label className="label">Tech Stack (comma-sep)</label><input className="input" placeholder="React, Node.js" value={proj.tech.join(', ')} onChange={e => updateProj(i, 'tech', e.target.value.split(',').map(t => t.trim()))} /></div>
                      <div className="form-group"><label className="label">Project Link</label><input className="input" placeholder="https://github.com/..." value={proj.link || ''} onChange={e => updateProj(i, 'link', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === PREVIEW (Select Template) === */}
          {step === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Choose Template</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {RESUME_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${selectedTemplate.id === t.id ? t.accentColor : 'var(--border)'}`,
                      background: selectedTemplate.id === t.id ? `${t.accentColor}10` : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: t.accentColor, marginBottom: '6px' }} />
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.description}</div>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary btn-full" onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? '💾 Saving...' : '💾 Save Resume'}
                </button>
                <button className="btn btn-secondary btn-full" onClick={handleAiEnhance} disabled={aiLoading}>
                  {aiLoading ? '✨ Enhancing...' : '✨ AI Enhance & Save'}
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={downloadPDF}>📥 Download PDF</button>
                  <button className="btn btn-ghost" onClick={downloadJSON}>📦 Download JSON</button>
                </div>
              </div>

              {/* Score */}
              {score !== null && (
                <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Resume Score</span>
                    <span style={{ fontWeight: 800, fontSize: '20px', color: score >= 80 ? 'var(--accent-success)' : score >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{score}/100</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${score}%`, background: score >= 80 ? 'var(--accent-success)' : score >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)' }} /></div>
                </div>
              )}

              {saveMsg && (
                <div style={{ padding: '10px 16px', background: saveMsg.includes('✅') || saveMsg.includes('✨') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveMsg.includes('✅') || saveMsg.includes('✨') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)', fontSize: '13px', color: saveMsg.includes('✅') || saveMsg.includes('✨') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {saveMsg}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setStep(STEPS[currentStepIdx - 1]?.key || 'basic')} disabled={currentStepIdx === 0}>
              ← Back
            </button>
            {step !== 'preview' && (
              <button className="btn btn-primary" onClick={() => setStep(STEPS[currentStepIdx + 1]?.key || 'preview')}>
                Next →
              </button>
            )}
          </div>
        </div>

        {/* PREVIEW PANEL (only visible on preview step) */}
        {step === 'preview' && (
          <div ref={previewRef} style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <ResumePreview data={data} template={selectedTemplate} />
          </div>
        )}
      </div>

      <style jsx>{`
        .steps-bar { display: flex; gap: 4px; background: var(--surface); padding: 4px; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow-x: auto; }
        .step-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Inter', sans-serif; flex-shrink: 0; }
        .step-btn:hover { color: var(--text-primary); background: var(--surface-2); }
        .step-btn.active { background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow-sm); }
        .step-btn.done { color: var(--accent-success); }
        .step-icon { font-size: 15px; }
        .step-label { display: none; }
        @media (min-width: 640px) { .step-label { display: inline; } }
      `}</style>
    </div>
  );
}
