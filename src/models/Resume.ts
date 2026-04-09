import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: string;
  data: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    summary?: string;
    skills: string[];
    education: Array<{
      school: string;
      degree: string;
      field: string;
      year: string;
      gpa?: string;
    }>;
    experience: Array<{
      company: string;
      role: string;
      duration: string;
      description: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      tech: string[];
      link?: string;
    }>;
    certifications?: string[];
    links?: { linkedin?: string; github?: string; website?: string };
  };
  score?: number;
  scoreFeedback?: string[];
  scoreSuggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: String, default: 'modern' },
    data: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      location: String,
      summary: String,
      skills: [String],
      education: [
        {
          school: String,
          degree: String,
          field: String,
          year: String,
          gpa: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: [String],
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          tech: [String],
          link: String,
        },
      ],
      certifications: [String],
      links: {
        linkedin: String,
        github: String,
        website: String,
      },
    },
    score: Number,
    scoreFeedback: [String],
    scoreSuggestions: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);
