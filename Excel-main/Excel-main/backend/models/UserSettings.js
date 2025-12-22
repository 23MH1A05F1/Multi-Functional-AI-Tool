import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  settings: {
    themeMode: { type: String, default: 'white-black' },
  },
}, { timestamps: true });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
