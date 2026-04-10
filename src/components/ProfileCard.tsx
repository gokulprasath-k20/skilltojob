'use client';
import { User, Mail, GraduationCap, Github, Linkedin, ExternalLink, Globe, FileText, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
  user: any;
  profile: any;
}

export default function ProfileCard({ user, profile }: ProfileCardProps) {
  const name = profile?.name || user?.name || 'User';
  const initial = name[0]?.toUpperCase();
  const email = profile?.email || user?.email;
  const degree = profile?.degree;
  const bio = profile?.bio;
  const skills = profile?.skills || [];
  const links = profile?.links || {};

  return (
    <div className="card-glass profile-card" style={{ 
      padding: '32px', 
      marginBottom: '28px', 
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--gradient-card)',
    }}>
      {/* Decorative Glows */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {/* Avatar Section */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ 
            width: '110px', 
            height: '110px', 
            borderRadius: '50%', 
            padding: '4px',
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease',
          }} className="avatar-container">
            <div style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              background: 'var(--bg-card)', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="gradient-text">{initial}</span>
              )}
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#4ade80',
            border: '2px solid var(--bg-card)',
            boxShadow: '0 0 10px rgba(74, 222, 128, 0.4)',
          }} />
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '15px' }}>
                <GraduationCap size={16} />
                <span>{degree || 'Ready to Work'}</span>
              </div>
            </div>
            <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit2 size={14} />
                Edit Profile
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} />
              <span>{email}</span>
            </div>
            {links.linkedin && (
              <a href={links.linkedin} target="_blank" rel="noreferrer" className="profile-link">
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {links.github && (
              <a href={links.github} target="_blank" rel="noreferrer" className="profile-link">
                <Github size={14} />
                <span>GitHub</span>
              </a>
            )}
          </div>

          {bio && (
            <p style={{ 
              fontSize: '15px', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6, 
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--accent-primary)',
            }}>
              {bio}
            </p>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {skills.map((skill: string, i: number) => (
                <span key={i} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Additional Links Row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            {links.portfolio && (
              <a href={links.portfolio} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
                <Globe size={14} />
                My Portfolio
              </a>
            )}
            {links.resume && (
              <a href={links.resume} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
                <FileText size={14} />
                View Resume
              </a>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .avatar-container:hover {
          transform: scale(1.05) rotate(2deg);
        }
        .profile-link {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .profile-link:hover {
          color: var(--accent-primary);
        }
        .skill-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: rgba(108, 99, 255, 0.08);
          color: var(--accent-primary);
          border: 1px solid rgba(108, 99, 255, 0.2);
          transition: all 0.2s;
        }
        .skill-tag:hover {
          background: var(--accent-primary);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
