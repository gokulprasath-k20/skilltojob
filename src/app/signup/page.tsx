'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await signup(name, email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob-1" />
        <div className="auth-blob blob-2" />
        <div className="auth-blob blob-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card card-glass">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <div className="logo-icon">S2J</div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Skill2<span className="gradient-text">Jobs</span>
                </span>
              </div>
            </Link>
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginTop: '20px', color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Start building your career with AI
            </p>
          </div>

          {error && (
            <div className="alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: var(--bg-primary); }
        .auth-bg { position: absolute; inset: 0; z-index: 0; }
        .auth-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
        .blob-1 { width: 500px; height: 500px; background: var(--accent-secondary); top: -100px; right: -100px; }
        .blob-2 { width: 400px; height: 400px; background: var(--accent-primary); bottom: -80px; left: -80px; }
        .blob-3 { width: 300px; height: 300px; background: var(--accent-tertiary); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; }
        .auth-container { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 24px; }
        .auth-card { padding: 36px; animation: fadeIn 0.4s ease; }
        .logo-icon { width: 40px; height: 40px; background: var(--gradient-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
        .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--accent-danger); padding: 12px 16px; border-radius: var(--radius-md); font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .auth-link { color: var(--accent-primary); font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
