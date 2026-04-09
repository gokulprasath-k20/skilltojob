'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

const quickLinks = [
  { href: '/dashboard/resume', icon: '📄', label: 'Resume Builder', desc: 'Create ATS-ready resume', color: '#6c63ff', bg: 'rgba(108, 99, 255, 0.1)' },
  { href: '/dashboard/portfolio', icon: '🎨', label: 'Portfolio', desc: 'Build your portfolio site', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  { href: '/dashboard/jobs', icon: '🤖', label: 'AI Job Match', desc: 'Find matching jobs with AI', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
];

const tips = [
  'Upload your resume in the AI Job Match module to get personalized job recommendations.',
  'Use AI Enhancement to improve your resume bullets and make them ATS-friendly.',
  'Select different portfolio templates to see which one fits your style best.',
  'Your portfolio gets a shareable URL that you can put on your resume!',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Welcome */}
      <div className="welcome-banner card-glass" style={{ marginBottom: '28px', padding: '28px 32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.05), rgba(168, 85, 247, 0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              What would you like to build today?
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-success">✓ Pro Account</span>
            <span className="badge badge-primary">AI Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div className="quick-card card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', transition: 'all 0.2s ease' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {link.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '2px' }}>{link.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{link.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: link.color, fontSize: '18px' }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tip + Getting Started */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pro Tip */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Pro Tip</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{tip}</p>
        </div>

        {/* Getting Started Checklist */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            🚀 Getting Started
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Create your resume', link: '/dashboard/resume' },
              { label: 'Build your portfolio', link: '/dashboard/portfolio' },
              { label: 'Find matching jobs', link: '/dashboard/jobs' },
            ].map(item => (
              <Link key={item.link} href={item.link} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', transition: 'all 0.2s' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>→</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
