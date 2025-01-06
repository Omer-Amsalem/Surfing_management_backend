import { Schema, model, Document } from 'mongoose';

interface IPost {
  date: Date;
  time: string;
  minimumWaveHeight: number;
  maximumWaveHeight: number;
  averageWindSpeed: number;
  description: string;
  photoUrl?: string;
  createdBy: string;
}

const PostSchema = new Schema<IPost>(
  {
    date: {
      type: Date,
      required: true,
      default: null,
    },
    time: {
      type: String,
      required: true,
    },
    minimumWaveHeight: {
      type: Number,
      required: true,
      default: 0,
    },
    maximumWaveHeight: {
      type: Number,
      required: true,
      default: 0,
    },
    averageWindSpeed: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = model<IPost>('Post', PostSchema);

export default Post;
