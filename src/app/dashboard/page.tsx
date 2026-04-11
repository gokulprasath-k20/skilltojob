'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';

const pipelineSteps = [
  {
    step: 1,
    href: '/dashboard/resume',
    icon: '📄',
    label: 'Build Resume',
    desc: 'Create an ATS-ready resume',
    color: '#6c63ff',
    bg: 'rgba(108, 99, 255, 0.1)',
    tip: 'Fill in all sections for a higher score',
  },
  {
    step: 2,
    href: '/dashboard/score-resume',
    icon: '✨',
    label: 'Score & Improve',
    desc: 'Audit existing resume and fix weak points',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    tip: 'Aim for a score greater than 80 to pass ATS filters.',
  },
  {
    step: 3,
    href: '/dashboard/portfolio',
    icon: '🎨',
    label: 'Build Portfolio',
    desc: 'Generate a stunning portfolio site',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.1)',
    tip: 'Choose a template that matches your style',
  },
  {
    step: 4,
    href: '/dashboard/projects',
    icon: '🚀',
    label: 'Project Ideas',
    desc: 'AI suggested projects to bridge the skill gap',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    tip: 'Build at least one of these before you start applying extensively.',
  },
  {
    step: 5,
    href: '/dashboard/jobs',
    icon: '🤖',
    label: 'Find Jobs',
    desc: 'AI-matched jobs with skill gap analysis',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    tip: 'Upload your resume to get personalized matches',
  },
  {
    step: 6,
    href: '/dashboard/interview',
    icon: '🎤',
    label: 'Mock Interview',
    desc: 'Practice technical & behavioral questions',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    tip: 'Aim for a score > 80% before a real interview.',
  },
  {
    step: 7,
    href: '/dashboard/cover-letter',
    icon: '✉️',
    label: 'Cover Letter',
    desc: 'Generate professional cover letters',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    tip: 'Generate this after analyzing a specific job match.',
  },
  {
    step: 8,
    href: '/dashboard/profile',
    icon: '👤',
    label: 'Complete Profile',
    desc: 'Perfect your professional digital identity',
    color: '#f472b6',
    bg: 'rgba(244, 114, 182, 0.1)',
    tip: 'Add your bio and social links to complete your brand.',
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

    // Load snapshots from localStorage
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

    // Fetch dynamic profile
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
    hasResume, // 1. Resume builder (just has a resume)
    !!resumeScore && resumeScore >= 70, // 2. Score & Improve
    hasPortfolio, // 3. Portfolio
    false, // 4. Projects
    hasJobs, // 5. Jobs
    false, // 6. Interviews
    false, // 7. Cover Letter
    !!profile?.bio && !!profile?.skills?.length, // 8. Profile
  ];

  const totalSteps = 8;
  const totalCompleted = completedSteps.filter(Boolean).length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Welcome Banner */}
      <div
        className="card-glass"
        style={{
          marginBottom: '28px',
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.06), rgba(168, 85, 247, 0.04))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Your career pipeline is <strong style={{ color: 'var(--accent-primary)' }}>{Math.round((totalCompleted / totalSteps) * 100)}% complete</strong>. Let's keep going!
            </p>
          </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {resumeScore !== null && (
              <span className="badge badge-success">📊 Score: {resumeScore}/100</span>
            )}
            <span className="badge badge-primary">AI Ready</span>
          </div>
        </div>

        {profile && (
          <div style={{ marginTop: '32px', animation: 'slideUp 0.5s ease' }}>
            <ProfileCard user={user} profile={profile} />
          </div>
        )}

        {/* Overall Pipeline Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Career Pipeline Progress</span>
            <span>{totalCompleted}/{totalSteps} steps done</span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div
              className="progress-fill"
              style={{ width: `${(totalCompleted / totalSteps) * 100}%`, transition: 'width 1s ease' }}
            />
          </div>
        </div>
      </div>

      {/* Career Pipeline Steps */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Career Pipeline — Follow These Steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {pipelineSteps.map((item, i) => {
            const done = completedSteps[i];

            return (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  className="card pipeline-card"
                  style={{
                    cursor: 'pointer',
                    padding: '20px',
                    border: `1px solid ${done ? item.color + '40' : 'var(--border)'}`,
                    background: done ? item.bg : 'var(--bg-card)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {done && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: '#fff',
                      fontWeight: 700,
                    }}>✓</div>
                  )}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: item.bg,
                    border: `1px solid ${item.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '14px',
                  }}>{item.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: item.color, background: item.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      STEP {item.step}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>{item.desc}</div>
                  {item.step === 8 && profile?.name ? (
                     <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {profile.avatar && <img src={profile.avatar} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} alt="" />}
                        {profile.name} • {profile.skills?.length || 0} Skills
                     </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4, marginTop: 'auto' }}>
                      💡 {item.tip}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Row — Tip + Getting Started */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pro Tip */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Pro Tip</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{tip}</p>
        </div>

        {/* AI Chatbot Teaser */}
        <div
          className="card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(168,85,247,0.05))',
            border: '1px solid rgba(108,99,255,0.15)',
            cursor: 'pointer',
          }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>AI Career Mentor</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Online · Ready to help
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
            Ask me to improve your resume, find jobs that match your skills, teach you React, or guide you through the platform.
          </p>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Click to chat →
          </div>
        </div>
      </div>
    </div>
  );
}
