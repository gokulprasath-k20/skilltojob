'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PortfolioData {
  name: string;
  title: string;
  email: string;
  phone: string;
  about: string;
  skills: string[];
  projects: Array<{ title: string; description: string; link: string; github: string; tech: string[] }>;
  experience: Array<{ company: string; role: string; duration: string; description: string }>;
  links: { linkedin: string; github: string; twitter: string; website: string };
}

const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', desc: 'Clean & elegant', color: '#6c63ff', preview: '⬜' },
  { id: 'developer', name: 'Developer', desc: 'Dark code-themed', color: '#10b981', preview: '🖥️' },
  { id: 'creative', name: 'Creative', desc: 'Bold & colorful', color: '#f59e0b', preview: '🎨' },
  { id: 'corporate', name: 'Corporate', desc: 'Professional look', color: '#2563eb', preview: '💼' },
  { id: 'gradient', name: 'Gradient', desc: 'Vibrant gradient', color: '#a855f7', preview: '🌈' },
];

const EMPTY: PortfolioData = {
  name: '', title: '', email: '', phone: '', about: '',
  skills: [],
  projects: [{ title: '', description: '', link: '', github: '', tech: [] }],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  links: { linkedin: '', github: '', twitter: '', website: '' },
};

type StepKey = 'info' | 'content' | 'template' | 'preview';
const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'info', label: 'Personal Info', icon: '👤' },
  { key: 'content', label: 'Content', icon: '✍️' },
  { key: 'template', label: 'Template', icon: '🎨' },
  { key: 'preview', label: 'Deploy', icon: '🚀' },
];

export default function PortfolioPage() {
  const { token } = useAuth();
  const [step, setStep] = useState<StepKey>('info');
  const [data, setData] = useState<PortfolioData>({ ...EMPTY });
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const stepIdx = STEPS.findIndex(s => s.key === step);
  const update = (key: keyof PortfolioData, val: unknown) => setData(d => ({ ...d, [key]: val }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const skills = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    update('skills', [...data.skills, ...skills]);
    setSkillInput('');
  };

  const addProject = () => update('projects', [...data.projects, { title: '', description: '', link: '', github: '', tech: [] }]);
  const addExperience = () => update('experience', [...data.experience, { company: '', role: '', duration: '', description: '' }]);

  const updateProject = (i: number, key: string, val: string | string[]) => {
    const updated = [...data.projects];
    updated[i] = { ...updated[i], [key]: val };
    update('projects', updated);
  };

  const updateExperience = (i: number, key: string, val: string) => {
    const updated = [...data.experience];
    updated[i] = { ...updated[i], [key]: val };
    update('experience', updated);
  };

  const handleSave = async (aiEnhance = false) => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data, templateId: selectedTemplate, aiEnhance }),
      });
      const json = await res.json();
      if (res.ok) {
        setLiveUrl(json.portfolio.liveUrl);
        setSaveMsg('✅ Portfolio saved successfully!');
        setStep('preview');
      } else {
        setSaveMsg(`❌ ${json.error}`);
      }
    } catch {
      setSaveMsg('❌ Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const downloadZip = async () => {
    const html = generatePortfolioHTML(data, selectedTemplate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${data.name || 'portfolio'}.html`; a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ data, templateId: selectedTemplate }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'portfolio.json'; a.click();
  };

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>🎨 Portfolio Generator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Build a stunning dev portfolio with AI-powered content.</p>
      </div>

      {/* Steps */}
      <div className="steps-bar">
        {STEPS.map((s, i) => (
          <button key={s.key} className={`step-btn ${step === s.key ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`} onClick={() => setStep(s.key)}>
            <span>{i < stepIdx ? '✓' : s.icon}</span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: step === 'preview' ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '28px' }}>

          {/* INFO */}
          {step === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="label">Full Name *</label><input className="input" placeholder="Jane Smith" value={data.name} onChange={e => update('name', e.target.value)} /></div>
                <div className="form-group"><label className="label">Professional Title</label><input className="input" placeholder="Full Stack Developer" value={data.title} onChange={e => update('title', e.target.value)} /></div>
                <div className="form-group"><label className="label">Email</label><input className="input" type="email" placeholder="jane@email.com" value={data.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="form-group"><label className="label">Phone</label><input className="input" placeholder="+1 234 567 8900" value={data.phone} onChange={e => update('phone', e.target.value)} /></div>
              </div>
              <div className="form-group">
                <label className="label">About Me</label>
                <textarea className="textarea" placeholder="Describe yourself, your passion, and what drives you professionally..." value={data.about} onChange={e => update('about', e.target.value)} style={{ minHeight: '120px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="label">LinkedIn</label><input className="input" placeholder="linkedin.com/in/jane" value={data.links.linkedin} onChange={e => update('links', { ...data.links, linkedin: e.target.value })} /></div>
                <div className="form-group"><label className="label">GitHub</label><input className="input" placeholder="github.com/jane" value={data.links.github} onChange={e => update('links', { ...data.links, github: e.target.value })} /></div>
                <div className="form-group"><label className="label">Twitter/X</label><input className="input" placeholder="twitter.com/jane" value={data.links.twitter} onChange={e => update('links', { ...data.links, twitter: e.target.value })} /></div>
                <div className="form-group"><label className="label">Website</label><input className="input" placeholder="janesmith.dev" value={data.links.website} onChange={e => update('links', { ...data.links, website: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {step === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Skills */}
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Skills</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input className="input" placeholder="React, TypeScript, Node.js..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                  <button className="btn btn-primary" onClick={addSkill}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.skills.map((s, i) => (
                    <span key={i} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => update('skills', data.skills.filter((_, j) => j !== i))}>{s} ✕</span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Projects</h2>
                  <button className="btn btn-secondary btn-sm" onClick={addProject}>+ Add Project</button>
                </div>
                {data.projects.map((proj, i) => (
                  <div key={i} className="card" style={{ padding: '14px', marginBottom: '12px', position: 'relative' }}>
                    {data.projects.length > 1 && (
                      <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => update('projects', data.projects.filter((_, j) => j !== i))}>✕</button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group"><label className="label">Title</label><input className="input" placeholder="Portfolio Website" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} /></div>
                      <div className="form-group"><label className="label">Tech Stack</label><input className="input" placeholder="Next.js, Tailwind" value={proj.tech.join(', ')} onChange={e => updateProject(i, 'tech', e.target.value.split(',').map(t => t.trim()))} /></div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Description</label><textarea className="textarea" placeholder="What does this project do?" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} style={{ minHeight: '70px' }} /></div>
                      <div className="form-group"><label className="label">Live Link</label><input className="input" placeholder="https://..." value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} /></div>
                      <div className="form-group"><label className="label">GitHub</label><input className="input" placeholder="github.com/..." value={proj.github} onChange={e => updateProject(i, 'github', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Experience</h2>
                  <button className="btn btn-secondary btn-sm" onClick={addExperience}>+ Add</button>
                </div>
                {data.experience.map((exp, i) => (
                  <div key={i} className="card" style={{ padding: '14px', marginBottom: '12px', position: 'relative' }}>
                    {data.experience.length > 1 && (
                      <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => update('experience', data.experience.filter((_, j) => j !== i))}>✕</button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group"><label className="label">Company</label><input className="input" placeholder="Google" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} /></div>
                      <div className="form-group"><label className="label">Role</label><input className="input" placeholder="SWE Intern" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} /></div>
                      <div className="form-group"><label className="label">Duration</label><input className="input" placeholder="Jun 2023 – Aug 2023" value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} /></div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Description</label><textarea className="textarea" placeholder="Key achievements and responsibilities..." value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} style={{ minHeight: '70px' }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEMPLATE */}
          {step === 'template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Choose Template</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedTemplate === t.id ? t.color : 'var(--border)'}`, background: selectedTemplate === t.id ? `${t.color}10` : 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{t.preview}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary btn-full" onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? '💾 Saving...' : '💾 Save Portfolio'}
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => { setAiLoading(true); handleSave(true).finally(() => setAiLoading(false)); }} disabled={aiLoading}>
                  {aiLoading ? '✨ AI enhancing...' : '✨ AI Enhance & Save'}
                </button>
              </div>
              {saveMsg && <div style={{ padding: '10px 16px', background: saveMsg.includes('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveMsg.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)', fontSize: '13px', color: saveMsg.includes('✅') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{saveMsg}</div>}
            </div>
          )}

          {/* DEPLOY / PREVIEW */}
          {step === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>🚀 Portfolio Deployed!</h2>
              {liveUrl && (
                <div style={{ padding: '20px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Your portfolio is live at:</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '14px', wordBreak: 'break-all' }}>{liveUrl}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>🔗 Share this link on your resume, LinkedIn, and email signature!</div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary btn-full" onClick={downloadZip}>📥 Download HTML File</button>
                <button className="btn btn-secondary btn-full" onClick={downloadJSON}>📦 Download JSON Data</button>
                <button className="btn btn-ghost btn-full" onClick={() => { setSaveMsg(''); setStep('info'); }}>✏️ Edit Portfolio</button>
              </div>
            </div>
          )}

          {/* Nav */}
          {step !== 'preview' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary" onClick={() => setStep(STEPS[stepIdx - 1]?.key || 'info')} disabled={stepIdx === 0}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(STEPS[stepIdx + 1]?.key || 'template')}>Next →</button>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {step === 'preview' && liveUrl && (
          <div>
            <PortfolioLivePreview data={data} templateId={selectedTemplate} accentColor={template.color} />
          </div>
        )}
      </div>

      <style jsx>{`
        .steps-bar { display: flex; gap: 4px; background: var(--surface); padding: 4px; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow-x: auto; }
        .step-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; flex-shrink: 0; }
        .step-btn.active { background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow-sm); }
        .step-btn.done { color: var(--accent-success); }
        .step-label { display: none; }
        @media (min-width: 640px) { .step-label { display: inline; } }
      `}</style>
    </div>
  );
}

function PortfolioLivePreview({ data, templateId, accentColor }: { data: PortfolioData; templateId: string; accentColor: string }) {
  const isDark = templateId === 'developer';
  const bg = isDark ? '#0d1117' : templateId === 'gradient' ? `linear-gradient(135deg,${accentColor}20,#06b6d420)` : '#fff';
  return (
    <div style={{ background: isDark ? '#0d1117' : '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: isDark ? `linear-gradient(135deg, ${accentColor}, #06b6d4)` : accentColor, padding: '40px', color: '#fff', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 }}>
          {data.name?.charAt(0) || '?'}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{data.name || 'Your Name'}</h1>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>{data.title || 'Your Title'}</p>
      </div>
      <div style={{ padding: '24px', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#e6edf3' : '#1e293b' }}>
        {data.about && <p style={{ fontSize: '13px', lineHeight: 1.7, color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>{data.about.slice(0, 200)}...</p>}
        {data.skills.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: '10px' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.slice(0, 8).map((s, i) => <span key={i} style={{ fontSize: '11px', padding: '3px 8px', background: `${accentColor}20`, color: accentColor, borderRadius: '4px', fontWeight: 600 }}>{s}</span>)}
            </div>
          </div>
        )}
        {data.projects.filter(p => p.title).length > 0 && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: '10px' }}>Projects</h3>
            {data.projects.filter(p => p.title).slice(0, 2).map((p, i) => (
              <div key={i} style={{ padding: '10px', background: isDark ? '#161b22' : '#f8fafc', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${accentColor}` }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{p.title}</div>
                <div style={{ fontSize: '11px', color: isDark ? '#8b949e' : '#64748b', marginTop: '3px' }}>{p.description?.slice(0, 80)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div id={bg as string} />
    </div>
  );
}

function generatePortfolioHTML(data: PortfolioData, templateId: string): string {
  const template = TEMPLATES.find(t => t.id === templateId);
  const accent = template?.color || '#6c63ff';
  const isDark = templateId === 'developer';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.name} – Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: ${isDark ? '#0d1117' : '#f8fafc'}; color: ${isDark ? '#e6edf3' : '#1e293b'}; }
.hero { background: linear-gradient(135deg, ${accent}, #06b6d4); color: #fff; padding: 80px 40px; text-align: center; }
.avatar { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; }
h1 { font-size: 40px; font-weight: 800; margin-bottom: 8px; }
.subtitle { font-size: 18px; opacity: 0.9; }
section { max-width: 900px; margin: 0 auto; padding: 60px 24px; }
h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${accent}; margin-bottom: 20px; }
.skill-tag { display: inline-block; padding: 4px 12px; background: ${accent}20; color: ${accent}; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 4px; }
.project-card { background: ${isDark ? '#161b22' : '#fff'}; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${accent}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.project-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.project-desc { font-size: 14px; color: ${isDark ? '#8b949e' : '#64748b'}; line-height: 1.6; }
a { color: ${accent}; }
footer { text-align: center; padding: 40px; background: ${isDark ? '#161b22' : '#f1f5f9'}; }
</style>
</head>
<body>
<div class="hero">
  <div class="avatar">${data.name?.charAt(0) || '?'}</div>
  <h1>${data.name || 'Portfolio'}</h1>
  <p class="subtitle">${data.title || ''}</p>
</div>
${data.about ? `<section><h2>About Me</h2><p>${data.about}</p></section>` : ''}
${data.skills.length ? `<section><h2>Skills</h2>${data.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</section>` : ''}
${data.projects.filter(p => p.title).length ? `<section><h2>Projects</h2>${data.projects.filter(p => p.title).map(p => `<div class="project-card"><div class="project-title">${p.title}</div><p class="project-desc">${p.description}</p>${p.link ? `<a href="${p.link}" target="_blank">View Project ↗</a>` : ''}</div>`).join('')}</section>` : ''}
<footer><p>© ${new Date().getFullYear()} ${data.name}. Built with Skill2Jobs.</p></footer>
</body></html>`;
}
