import mongoose, { Document, Schema } from 'mongoose';

export interface IJobCache extends Document {
  userId: mongoose.Types.ObjectId;
  resumeText: string;
  extractedData: {
    skills: string[];
    roles: string[];
    experience: string;
    searchKeywords: string[];
  };
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    applyLink: string;
    description?: string;
    salary?: string;
    source: string;
    matchReason?: string;
    missingSkills?: string[];
    matchScore?: number;
  }>;
  createdAt: Date;
}

const JobCacheSchema = new Schema<IJobCache>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeText: String,
    extractedData: {
      skills: [String],
      roles: [String],
      experience: String,
      searchKeywords: [String],
    },
    jobs: [
      {
        id: String,
        title: String,
        company: String,
        location: String,
        applyLink: String,
        description: String,
        salary: String,
        source: String,
        matchReason: String,
        missingSkills: [String],
        matchScore: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.JobCache || mongoose.model<IJobCache>('JobCache', JobCacheSchema);
