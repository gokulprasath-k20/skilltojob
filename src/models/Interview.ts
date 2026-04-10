import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  questions: Array<{
    question: string;
    answer: string;
    feedback?: string;
    score?: number;
  }>;
  overallScore?: number;
  overallFeedback?: {
    strengths: string[];
    improvements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    questions: [
      {
        question: String,
        answer: String,
        feedback: String,
        score: Number,
      },
    ],
    overallScore: Number,
    overallFeedback: {
      strengths: [String],
      improvements: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
