import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: string;
  data: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    about: string;
    avatar?: string;
    skills: string[];
    projects: Array<{
      title: string;
      description: string;
      link?: string;
      github?: string;
      tech: string[];
      image?: string;
    }>;
    experience: Array<{
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
    links?: { linkedin?: string; github?: string; twitter?: string; website?: string };
    theme?: { primaryColor?: string; font?: string };
  };
  liveUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: String, default: 'minimal' },
    data: {
      name: { type: String, required: true },
      title: String,
      email: String,
      phone: String,
      about: String,
      avatar: String,
      skills: [String],
      projects: [
        {
          title: String,
          description: String,
          link: String,
          github: String,
          tech: [String],
          image: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      links: {
        linkedin: String,
        github: String,
        twitter: String,
        website: String,
      },
      theme: {
        primaryColor: String,
        font: String,
      },
    },
    liveUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
