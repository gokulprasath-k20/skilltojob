'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Palette, 
  Rocket, 
  Bot, 
  Mic, 
  Mail, 
  ExternalLink,
  GraduationCap,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Plus
} from 'lucide-react';

const pipelineSteps = [
  {
    step: 1,
    href: '/dashboard/resume',
    icon: <FileText size={20} />,
    label: 'Build Resume',
    desc: 'Create an ATS-ready resume',
    color: '#6366f1',
    bg: '#eef2ff',
    tip: 'Fill in all sections for a higher score',
  },
  {
    step: 2,
    href: '/dashboard/score-resume',
    icon: <Sparkles size={20} />,
    label: 'Score & Improve',
    desc: 'Audit existing resume and fix weak points',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    tip: 'Aim for a score greater than 80 to pass ATS filters.',
  },
  {
    step: 3,
    href: '/dashboard/portfolio',
    icon: <Palette size={20} />,
    label: 'Build Portfolio',
    desc: 'Generate a stunning portfolio site',
    color: '#06b6d4',
    bg: '#ecfeff',
    tip: 'Choose a template that matches your style',
  },
  {
    step: 4,
    href: '/dashboard/projects',
    icon: <Rocket size={20} />,
    label: 'Project Ideas',
    desc: 'AI suggested projects to bridge the skill gap',
    color: '#ef4444',
    bg: '#fef2f2',
    tip: 'Build at least one of these before you start applying extensively.',
  },
  {
    step: 5,
    href: '/dashboard/jobs',
    icon: <Bot size={20} />,
    label: 'Find Jobs',
    desc: 'AI-matched jobs with skill gap analysis',
    color: '#10b981',
    bg: '#f0fdf4',
    tip: 'Upload your resume to get personalized matches',
  },
  {
    step: 6,
    href: '/dashboard/interview',
    icon: <Mic size={20} />,
    label: 'Mock Interview',
    desc: 'Practice technical & behavioral questions',
    color: '#3b82f6',
    bg: '#eff6ff',
    tip: 'Aim for a score > 80% before a real interview.',
  },
  {
    step: 7,
    href: '/dashboard/cover-letter',
    icon: <Mail size={20} />,
    label: 'Cover Letter',
    desc: 'Generate professional cover letters',
    color: '#6366f1',
    bg: '#eef2ff',
    tip: 'Generate this after analyzing a specific job match.',
  },
];

const tips = [
  '🎯 Upload your resume in AI Job Match to get jobs from Greenhouse, Lever & more.',
  '✨ Use AI Enhancement on your resume to add action verbs and boost ATS score.',
  '🎨 Your portfolio gets a shareable URL — put it on your resume and LinkedIn!',
  '💬 Ask the AI Career Mentor (bottom right) for personalized advice.',
  '📊 Check your Resume Score after saving — aim for 80+ for best results.',
];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  const [greeting, setGreeting] = useState('');
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [hasJobs, setHasJobs] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    try {
      const resumeRaw = localStorage.getItem('s2j_resume_snapshot');
      if (resumeRaw) {
        const rd = JSON.parse(resumeRaw);
        setHasResume(true);
        setResumeScore(rd._score || null);
      }
      setHasPortfolio(!!localStorage.getItem('s2j_portfolio_snapshot'));
      setHasJobs(!!localStorage.getItem('s2j_jobs_snapshot'));
    } catch {}

    if (token) {
      fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.user) setProfile(data.user);
        })
        .catch(() => {});
    }
  }, [token]);

  const completedSteps = [
    hasResume, 
    !!resumeScore && resumeScore >= 70, 
    hasPortfolio, 
    false, 
    hasJobs, 
    false, 
    false, 
  ];

  const totalCompleted = completedSteps.filter(Boolean).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Transforming your career, one step at a time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div className="card-glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Career Progress</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>{Math.round((totalCompleted / 7) * 100)}%</div>
           </div>
        </div>
      </div>

      {/* Profile & Tip Block */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', marginBottom: '48px' }} className="grid-2col">
        {/* Profile Card */}
        <div className="card" style={{ padding: '32px', display: 'flex', gap: '28px', alignItems: 'center', background: 'var(--bg-card)', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '24px', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 800, color: '#fff',
              boxShadow: '0 8px 16px rgba(108, 99, 255, 0.2)'
            }}>
              {profile?.avatar ? <img src={profile.avatar} alt="Avatar" style={{width:'100%', height:'100%', borderRadius:'24px', objectFit:'cover'}}/> : user?.name?.[0]?.toUpperCase()}
            </div>
            <Link href="/dashboard/profile" style={{ position: 'absolute', bottom: '-4px', right: '-4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--surface-2)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <Plus size={14} />
              </div>
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.name || user?.name}</h2>
              {resumeScore !== null && (
                <span className="badge badge-success" style={{ height: '22px' }}>Score: {resumeScore}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '14px' }}>
              <span className="flex items-center gap-2"><GraduationCap size={14} /> {profile?.degree || 'Candidate'}</span>
              <span className="flex items-center gap-2"><MapPin size={14} /> {profile?.location || 'Remote'}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', maxWidth: '500px' }}>
              {profile?.bio || 'Passionate professional looking to leverage skills in a top-tier company. Update your profile to get better advice.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {profile?.links?.linkedin && <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Linkedin size={14} /></a>}
              {profile?.links?.github && <a href={profile.links.github} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Github size={14} /></a>}
              {profile?.links?.portfolio && <a href={profile.links.portfolio} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Globe size={14} /> Portfolio</a>}
              <Link href="/dashboard/profile" className="btn btn-secondary btn-sm" style={{marginLeft: 'auto'}}>Edit Profile</Link>
            </div>
          </div>
        </div>

        {/* Dynamic Tip Card */}
        <div className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-warning)' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Pro Insight</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, fontWeight: 500 }}>
            {tip}
          </p>
        </div>
      </div>

      {/* Main Pipeline Grid */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Career Pipeline — Follow These Steps
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {pipelineSteps.map((item, i) => {
            const done = completedSteps[i];
            const active = totalCompleted === i;
            
            return (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  className="card pipeline-card"
                  style={{
                    height: '100%',
                    padding: '24px',
                    background: 'var(--bg-card)',
                    border: active ? `2px solid var(--accent-primary)` : `1px solid var(--border)`,
                    boxShadow: active ? 'var(--shadow-glow)' : 'none',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Step Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    transition: 'transform 0.3s ease'
                  }}>
                    {item.icon}
                  </div>

                  {/* Step Badge */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      color: item.color, 
                      background: `${item.color}15`, 
                      padding: '4px 10px', 
                      borderRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Step {item.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.label}
                      {done && <span style={{ color: 'var(--accent-success)', fontSize: '16px' }}>✓</span>}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                      {item.desc}
                    </p>
                  </div>

                  {/* Tip Footer */}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '6px' }}>
                    <span style={{flexShrink: 0}}>💡</span>
                    <span>{item.tip}</span>
                  </div>

                  {active && (
                    <div style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--accent-primary)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      CURRENT TASK
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .pipeline-card:hover { transform: translateY(-8px); border-color: var(--accent-primary) !important; box-shadow: var(--shadow-lg); }
        .pipeline-card:hover div:first-child { transform: scale(1.1); }
      `}</style>
    </div>
  );
}
