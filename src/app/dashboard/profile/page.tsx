'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    resume: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData({
            name: data.user.name || '',
            degree: data.user.degree || '',
            bio: data.user.bio || '',
            skills: data.user.skills ? data.user.skills.join(', ') : '',
            linkedin: data.user.links?.linkedin || '',
            github: data.user.links?.github || '',
            resume: data.user.links?.resume || '',
            portfolio: data.user.links?.portfolio || ''
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const payload = {
      name: formData.name,
      degree: formData.degree,
      bio: formData.bio,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      links: {
        linkedin: formData.linkedin,
        github: formData.github,
        resume: formData.resume,
        portfolio: formData.portfolio
      }
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg('✅ Profile updated successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setMsg('❌ Failed to update profile');
      }
    } catch {
      setMsg('❌ Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>👤 Edit Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Update your personal details to display on your dashboard.</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="label">Full Name</label>
          <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="label">Degree / Title</label>
          <input className="input" placeholder="e.g. B.S. Computer Science / Full-Stack Engineer" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Short Bio</label>
          <textarea className="textarea" placeholder="A short catchphrase or intro..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={{ minHeight: '80px' }} />
        </div>
        <div className="form-group">
          <label className="label">Skills (comma separated)</label>
          <input className="input" placeholder="React, Node.js, Python" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="label">LinkedIn URL</label>
            <input className="input" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">GitHub URL</label>
            <input className="input" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Resume URL</label>
            <input className="input" placeholder="Google Drive or deployed link" value={formData.resume} onChange={e => setFormData({ ...formData, resume: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Portfolio URL</label>
            <input className="input" placeholder="Link to your portfolio site" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} />
          </div>
        </div>

        {msg && <div style={{ fontSize: '14px', color: msg.includes('✅') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/dashboard')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
