
import UserSettings from '../models/UserSettings.js';

// Get user settings (themeMode)
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      // If no settings found, create default
      userSettings = new UserSettings({
        userId,
        settings: { themeMode: 'white-black' },
      });
      await userSettings.save();
    }
    res.json({ settings: userSettings.settings });
  } catch (err) {
    console.error('Error fetching user settings:', err);
    res.status(500).json({ message: 'Server error fetching user settings' });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    const { themeMode } = req.body;
    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      userSettings = new UserSettings({ userId, settings: { themeMode } });
    } else {
      userSettings.settings.themeMode = themeMode;
    }
    await userSettings.save();
    res.json({ settings: userSettings.settings });
  } catch (err) {
    console.error('Error updating user settings:', err);
    res.status(500).json({ message: 'Server error updating user settings' });
  }
};
