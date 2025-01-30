import { Schema, model, mongo } from "mongoose";

// Interface for a single comment
interface IComment {
  postId: mongo.ObjectId;
  userId: mongo.ObjectId;
  firstName: string;
  lastName: string;
  profilePicture: string;
  content: string;
  timestamp: Date;
}

// Schema for a single comment
const CommentSchema = new Schema<IComment>({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500,
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Comment model
const Comment = model<IComment>("Comment", CommentSchema);

export default Comment;
export { IComment, CommentSchema }
