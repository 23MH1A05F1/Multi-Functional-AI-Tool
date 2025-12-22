import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;
