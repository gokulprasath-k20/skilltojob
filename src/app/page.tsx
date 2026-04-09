'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: '📄',
    title: 'AI Resume Builder',
    desc: 'Create ATS-friendly, professional resumes with AI-powered bullet points and 8+ stunning templates.',
    color: 'var(--accent-primary)',
  },
  {
    icon: '🎨',
    title: 'Portfolio Generator',
    desc: 'Build a stunning developer portfolio with animations, live preview, and instant deploy simulation.',
    color: 'var(--accent-secondary)',
  },
  {
    icon: '🤖',
    title: 'AI Job Matching',
    desc: 'Upload your resume and get AI-matched jobs with skill gap analysis from top job platforms.',
    color: 'var(--accent-tertiary)',
  },
];

const stats = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '12K+', label: 'Portfolios Built' },
  { value: '200K+', label: 'Jobs Matched' },
  { value: '98%', label: 'User Satisfaction' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Nav */}
      <nav className="home-nav card-glass">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="logo-icon-sm">S2J</div>
            <span>Skill2<strong className="gradient-text">Jobs</strong></span>
          </Link>
          <div className="nav-links">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#stats" className="nav-link">Stats</Link>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard →</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link href="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
          <div className="hero-blob b3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge badge badge-primary">
            <span>✨</span> AI-Powered Career Platform
          </div>
          <h1 className="hero-title">
            Build Your Dream Career<br />
            with <span className="gradient-text">AI Intelligence</span>
          </h1>
          <p className="hero-desc">
            Create ATS-ready resumes, stunning portfolios, and get matched with your perfect job — 
            all powered by cutting-edge AI. No templates. No limits.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start for Free — No Credit Card
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="hero-trust">
            🔒 Trusted by 50,000+ professionals worldwide
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats">
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card card">
              <div className="stat-value gradient-text">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Land Your Dream Job</h2>
          <p className="section-desc">Three powerful AI tools, one unified platform.</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon" style={{ background: `${f.color}20`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card card-glass">
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
            Ready to Transform Your Career?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '16px' }}>
            Join thousands of professionals already using Skill2Jobs to land their dream roles.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Get Started Free Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          © 2025 Skill2Jobs. Built with ❤️ using Next.js & AI.
        </p>
      </footer>

      <style jsx>{`
        .home { min-height: 100vh; background: var(--bg-primary); }
        .home-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; border-bottom: 1px solid var(--border); border-radius: 0; }
        .nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .logo-icon-sm { width: 32px; height: 32px; background: var(--gradient-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 8px; }
        .nav-link { color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: var(--radius-sm); transition: color 0.2s; }
        .nav-link:hover { color: var(--text-primary); }
        .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding-top: 64px; }
        .hero-bg { position: absolute; inset: 0; }
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(100px); }
        .b1 { width: 600px; height: 600px; background: var(--accent-primary); opacity: 0.1; top: -100px; left: -100px; }
        .b2 { width: 500px; height: 500px; background: var(--accent-secondary); opacity: 0.08; bottom: -100px; right: -100px; }
        .b3 { width: 400px; height: 400px; background: var(--accent-tertiary); opacity: 0.06; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 60px 60px; opacity: 0.4; }
        .hero-content { position: relative; z-index: 1; text-align: center; padding: 60px 24px; max-width: 800px; }
        .hero-badge { margin-bottom: 20px; font-size: 13px; }
        .hero-title { font-size: clamp(36px, 6vw, 64px); font-weight: 900; line-height: 1.1; margin-bottom: 20px; color: var(--text-primary); font-family: 'Plus Jakarta Sans', sans-serif; }
        .hero-desc { font-size: 18px; color: var(--text-secondary); max-width: 560px; margin: 0 auto 32px; line-height: 1.7; }
        .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
        .hero-trust { font-size: 13px; color: var(--text-muted); }
        .stats-section { padding: 60px 24px; max-width: 1000px; margin: 0 auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { text-align: center; padding: 28px; }
        .stat-value { font-size: 36px; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif; }
        .stat-label { color: var(--text-secondary); font-size: 14px; margin-top: 6px; }
        .features-section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-title { font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .section-desc { font-size: 16px; color: var(--text-secondary); }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { padding: 32px; display: flex; flex-direction: column; gap: 16px; }
        .feature-icon { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .feature-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .feature-desc { color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
        .cta-section { padding: 80px 24px; max-width: 800px; margin: 0 auto; text-align: center; }
        .cta-card { padding: 60px 40px; }
        .home-footer { padding: 24px; text-align: center; border-top: 1px solid var(--border); }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: 1fr; }
          .nav-link { display: none; }
        }
      `}</style>
    </div>
  );
}
