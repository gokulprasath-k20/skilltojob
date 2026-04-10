'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProjectSuggestion {
  title: string;
  description: string;
  learningOutcomes: string[];
}

export default function ProjectsPage() {
  const { token } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [projects, setProjects] = useState<ProjectSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requirement: userInput })
      });
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🚀 Project Ideas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Get highly relevant portfolio project ideas based on your current skills to impress recruiters.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
           <label className="label" style={{ fontWeight: 600 }}>What kind of project do you want to build?</label>
           <input 
              className="input" 
              placeholder="e.g. UI/UX design, Fullstack ecommerce, Real-time chat..." 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
           />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={fetchProjects} disabled={loading || !userInput.trim()}>
             {loading ? '✨ Generating...' : '✨ Generate Ideas'}
          </button>
        </div>
      </div>

      {projects.length > 0 && (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
           {projects.map((proj, i) => (
             <div key={i} className="card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{proj.title}</h3>
               <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{proj.description}</p>
               
               <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  What you will learn
               </div>
               <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {proj.learningOutcomes?.map((out, idx) => (
                     <li key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{out}</li>
                  ))}
               </ul>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
