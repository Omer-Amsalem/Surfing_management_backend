import { Schema, model, Document } from "mongoose";

// Interface for a single comment
interface IComment {
  userId: string;
  content: string;
  timestamp: Date;
}

// Schema for a single comment
const CommentSchema = new Schema<IComment>({
    userId: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  });  

  const Post = model<IComment>("Comment", CommentSchema);
  export default Comment;


