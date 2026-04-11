'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import ProfileCard from '@/components/ProfileCard';

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
    portfolio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Derived profile for preview
  const previewProfile = {
    name: formData.name,
    degree: formData.degree,
    bio: formData.bio,
    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    links: {
      linkedin: formData.linkedin,
      github: formData.github,
      resume: formData.resume,
      portfolio: formData.portfolio
    },
    avatar: formData.avatar
  };

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
            portfolio: data.user.links?.portfolio || '',
            avatar: data.user.avatar || ''
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
      },
      avatar: formData.avatar
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>👤 Your Professional Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>This information is used to match you with jobs and generates your AI brand.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 450px', gap: '32px', alignItems: 'start' }} className="grid-2col">
        {/* FORM */}
        <form onSubmit={handleSave} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Edit Details</h2>
          
          <div className="form-group">
            <label className="label">Display Name</label>
            <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="label">Profile Picture</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                className="input" 
                placeholder="Image URL (https://...)" 
                value={formData.avatar} 
                onChange={e => setFormData({ ...formData, avatar: e.target.value })} 
                style={{ flex: 1 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>OR</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                Upload
              </button>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, avatar: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Upload a landscape/square photo or paste a URL.
            </p>
          </div>
          <div className="form-group">
            <label className="label">Headline / Degree</label>
            <input className="input" placeholder="e.g. B.S. Computer Science / Full-Stack Engineer" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Professional Bio</label>
            <textarea className="textarea" placeholder="A short catchphrase or intro..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={{ minHeight: '100px' }} />
          </div>
          <div className="form-group">
            <label className="label">Top Skills (comma separated)</label>
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="label">Resume Link</label>
              <input className="input" placeholder="Google Drive or deployed link" value={formData.resume} onChange={e => setFormData({ ...formData, resume: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Portfolio URL</label>
              <input className="input" placeholder="Link to your portfolio site" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} />
            </div>
          </div>

          {msg && <div style={{ 
            fontSize: '14px', 
            padding: '12px', 
            borderRadius: 'var(--radius-md)',
            background: msg.includes('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: msg.includes('✅') ? 'var(--accent-success)' : 'var(--accent-danger)' 
          }}>{msg}</div>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => router.push('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* PREVIEW */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Card Preview</h2>
          <ProfileCard user={user} profile={previewProfile} />
          
          <div className="card-glass" style={{ marginTop: '24px', padding: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <p>💡 <strong>Tip:</strong> Keep your bio concise and professional. Your headline should reflect your current role or target career goal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
