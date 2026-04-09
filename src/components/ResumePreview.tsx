'use client';
import { ResumeData, ResumeTemplate } from '@/lib/resumeTemplates';

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplate;
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const accent = template.accentColor;
  const isTwo = template.layout === 'two-column';

  const styles = {
    modern: {
      header: { background: accent, color: '#fff', padding: '32px' },
      name: { fontWeight: 800, fontSize: '28px', marginBottom: '4px' },
      contact: { fontSize: '12px', opacity: 0.85 },
      sectionTitle: { borderBottom: `2px solid ${accent}`, color: accent, paddingBottom: '4px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '12px', marginTop: '20px' },
    },
    executive: {
      header: { borderBottom: `3px solid ${accent}`, padding: '32px 32px 20px' },
      name: { fontWeight: 700, fontSize: '30px', color: accent, marginBottom: '4px' },
      contact: { fontSize: '12px', color: '#555' },
      sectionTitle: { borderLeft: `4px solid ${accent}`, paddingLeft: '10px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '12px', marginTop: '20px', color: '#1a1a2e' },
    },
    minimal: {
      header: { padding: '32px' },
      name: { fontWeight: 700, fontSize: '26px', color: '#0f172a', marginBottom: '4px' },
      contact: { fontSize: '12px', color: '#6b7280' },
      sectionTitle: { fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '10px', marginTop: '18px' },
    },
    creative: {
      header: { background: `linear-gradient(135deg, ${accent}, #06b6d4)`, color: '#fff', padding: '32px' },
      name: { fontWeight: 900, fontSize: '30px', marginBottom: '4px' },
      contact: { fontSize: '12px', opacity: 0.9 },
      sectionTitle: { background: accent, color: '#fff', padding: '4px 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, borderRadius: '4px', marginBottom: '12px', marginTop: '18px', display: 'inline-block' as const },
    },
    classic: {
      header: { borderBottom: `2px solid ${accent}`, padding: '28px' },
      name: { fontWeight: 700, fontSize: '26px', color: '#1e293b', marginBottom: '4px' },
      contact: { fontSize: '12px', color: '#64748b' },
      sectionTitle: { borderBottom: `1px solid #e2e8f0`, fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, paddingBottom: '4px', marginBottom: '12px', marginTop: '18px', color: accent },
    },
  } as const;

  const styleKey = template.style === 'executive' ? 'executive'
    : template.style === 'minimal' ? 'minimal'
    : template.style === 'creative' ? 'creative'
    : template.style === 'classic' ? 'classic'
    : 'modern';

  const s = styles[styleKey];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );

  const mainContent = (
    <>
      {data.summary && (
        <Section title="Professional Summary">
          <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>{data.summary}</p>
        </Section>
      )}

      {data.experience?.length > 0 && data.experience[0].company && (
        <Section title="Experience">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{exp.role}</div>
                  <div style={{ fontSize: '12px', color: accent, fontWeight: 600 }}>{exp.company}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.duration}</div>
              </div>
              <ul style={{ marginTop: '6px', paddingLeft: '16px' }}>
                {exp.description.filter(d => d).map((d, j) => (
                  <li key={j} style={{ fontSize: '11px', color: '#374151', marginBottom: '3px', lineHeight: 1.5 }}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {data.projects?.length > 0 && data.projects[0].name && (
        <Section title="Projects">
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{proj.name}</div>
                {proj.link && <a href={proj.link} style={{ fontSize: '10px', color: accent }}>↗ View</a>}
              </div>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0', lineHeight: 1.5 }}>{proj.description}</p>
              {proj.tech?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {proj.tech.filter(t => t).map((t, j) => (
                    <span key={j} style={{ fontSize: '10px', padding: '1px 6px', background: `${accent}15`, color: accent, borderRadius: '3px', fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.education?.length > 0 && data.education[0].school && (
        <Section title="Education">
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{edu.school}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{edu.year}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#374151' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </Section>
      )}
    </>
  );

  const sideContent = (
    <>
      {data.skills?.length > 0 && (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {data.skills.filter(s => s).map((skill, i) => (
              <span key={i} style={{ fontSize: '10px', padding: '3px 8px', background: `${accent}15`, color: accent, borderRadius: '4px', fontWeight: 600 }}>{skill}</span>
            ))}
          </div>
        </Section>
      )}
      {data.certifications?.length > 0 && data.certifications[0] && (
        <Section title="Certifications">
          {data.certifications.filter(c => c).map((cert, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>• {cert}</div>
          ))}
        </Section>
      )}
      {(data.links?.github || data.links?.linkedin || data.links?.website) && (
        <Section title="Links">
          {data.links.github && <div style={{ fontSize: '11px', color: accent, marginBottom: '3px' }}>⌥ {data.links.github}</div>}
          {data.links.linkedin && <div style={{ fontSize: '11px', color: accent, marginBottom: '3px' }}>in {data.links.linkedin}</div>}
          {data.links.website && <div style={{ fontSize: '11px', color: accent, marginBottom: '3px' }}>🌐 {data.links.website}</div>}
        </Section>
      )}
    </>
  );

  return (
    <div
      id="resume-preview"
      style={{
        width: '100%',
        minHeight: '297mm',
        background: '#fff',
        fontFamily: template.fontFamily,
        color: '#1e293b',
        fontSize: '12px',
        lineHeight: 1.5,
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={styleKey === 'modern' || styleKey === 'creative' ? s.header : { ...s.header, padding: '28px 32px' }}>
        <div style={s.name}>{data.name || 'Your Name'}</div>
        <div style={s.contact}>
          {[data.email, data.phone, data.location].filter(Boolean).join('  •  ')}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', padding: isTwo ? '0' : '0 32px' }}>
        {isTwo ? (
          <>
            <div style={{ width: '35%', background: `${accent}08`, padding: '24px 20px', borderRight: `1px solid ${accent}20` }}>
              {sideContent}
            </div>
            <div style={{ flex: 1, padding: '24px' }}>{mainContent}</div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            {mainContent}
            <div style={{ marginTop: '8px' }}>{sideContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}
