import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  data: { type: Object, required: true }, // Parsed Excel data stored as JSON
  summary: { type: String }, // AI-generated summary of the data
  createdAt: { type: Date, default: Date.now },
});

const Upload = mongoose.model('Upload', uploadSchema);
export default Upload;
