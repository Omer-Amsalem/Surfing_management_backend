import { Schema, model} from "mongoose";
import {CommentSchema , IComment} from "./commentModel";

// Interface for the post model
interface IPost {
  date: Date; 
  time: string; 
  minimumWaveHeight: number; 
  maximumWaveHeight: number; 
  averageWindSpeed: number; 
  description: string;
  photoUrl?: string; 
  createdBy: string; 
  likes: string[]; 
  likeCount: number; 
  participants: string[];
  participantCount: number; 
  comments: IComment[]; 
  commentCount: number; 
}

// Schema for the post model
const PostSchema = new Schema<IPost>(
    {
      date: { 
        type: Date,
        required: true 
      },
      time: { 
        type: String, 
        required: true 
      },
      minimumWaveHeight: { 
        type: Number, 
        required: true, 
        default: 0 
      },
      maximumWaveHeight: { 
        type: Number, 
        required: true, 
        default: 0 
      },
      averageWindSpeed: { 
        type: Number, 
        default: 0 
      },
      description: { 
        type: String, 
        required: true, 
        trim: true // Removes unnecessary whitespace
      },
      photoUrl: { 
        type: String, 
        default: null 
      },
      createdBy: { 
        type: String, 
        required: true 
      },
      likes: { 
        type: [String], 
        default: [] 
      },
      participants: { 
        type: [String], 
        default: [] 
      },
      comments: { 
        type: [CommentSchema], 
        default: [] 
      },
      likeCount: { 
        type: Number, 
        default: 0 
      },
      commentCount: { 
        type: Number, 
        default: 0 
      },
      participantCount: { 
        type: Number, 
        default: 0 
      },
    },
    {
      timestamps: true,
    }
  );
  
const Post = model<IPost>("Post", PostSchema);

export default Post;
