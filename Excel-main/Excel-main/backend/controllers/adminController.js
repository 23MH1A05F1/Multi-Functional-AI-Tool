
import User from '../models/User.js';
import Upload from '../models/Upload.js';
import Chart from '../models/Chart.js';
import mongoose from 'mongoose';
import AdminSettings from '../models/AdminSettings.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Block or unblock a user (toggle)
export const toggleBlockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blocked = !user.blocked;
    await user.save();
    res.json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error('Error toggling block user:', err);
    res.status(500).json({ message: 'Server error toggling block user' });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Get upload stats
export const getUploadStats = async (req, res) => {
  try {
    // Return only uploads belonging to the logged-in admin user
    const uploads = await Upload.find({ userId: req.user.id }).populate('userId', 'username email').sort({ createdAt: -1 });
    res.json({ uploads });
  } catch (err) {
    console.error('Error fetching upload stats:', err);
    res.status(500).json({ message: 'Server error fetching upload stats' });
  }
};

// Get platform-wide stats for admin dashboard
export const getPlatformStats = async (req, res) => {
  try {
    // Total uploads count for users only (exclude admins)
    const userIds = await User.find({ role: 'user' }).distinct('_id');
    const uploadsCount = await Upload.countDocuments({ userId: { $in: userIds } });
    const chartsCount = await Chart.countDocuments({ userId: { $in: userIds } });

    // Debug: Log counts per user for charts
    for (const userId of userIds) {
      const userChartsCount = await Chart.countDocuments({ userId });
      console.log(`User ${userId} has ${userChartsCount} charts`);
    }

    const totalUploads = uploadsCount + chartsCount;

    // Active users count (users with uploads in last 30 days and not blocked)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUserIds = await Upload.distinct('userId', { createdAt: { $gte: thirtyDaysAgo } });

    // Find unblocked users among activeUserIds
    const activeUsersCount = await User.countDocuments({
      _id: { $in: activeUserIds },
      blocked: { $ne: true },
    });

    // Most-used chart types (aggregate count)
    const chartTypeAggregation = await Chart.aggregate([
      {
        $group: {
          _id: '$chartType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      totalUploads,
      activeUsersCount,
      mostUsedChartTypes: chartTypeAggregation.map(item => ({ chartType: item._id, count: item.count })),
    });
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    res.status(500).json({ message: 'Server error fetching platform stats' });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.find({});
    const settingsMap = {};
    settings.forEach(s => {
      // Filter out creative mode from themeMode
      if (s.key === 'themeMode' && s.value === 'creative') {
        return;
      }
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (err) {
    console.error('Error fetching admin settings:', err);
    res.status(500).json({ message: 'Server error fetching admin settings' });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const updates = req.body; // Expecting { key1: value1, key2: value2, ... }
    // Filter out updates that set themeMode to creative
    if (updates.themeMode === 'creative') {
      delete updates.themeMode;
    }
    const updatePromises = Object.entries(updates).map(async ([key, value]) => {
      await AdminSettings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    });
    await Promise.all(updatePromises);
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating admin settings:', err);
    res.status(500).json({ message: 'Server error updating admin settings' });
  }
};