import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { getAllUsers, deleteUser, getUploadStats, getPlatformStats, getAdminSettings, updateAdminSettings, toggleBlockUser } from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateJWT, authorizeRoles('admin'));

// Get all users
router.get('/users', getAllUsers);

// Toggle block/unblock a user
router.post('/users/:userId/toggle-block', toggleBlockUser);

// Delete a user
router.delete('/users/:userId', deleteUser);

// Get upload stats
router.get('/uploads', getUploadStats);

// Get platform-wide stats for admin dashboard
router.get('/stats', getPlatformStats);

// Get admin settings
router.get('/settings', getAdminSettings);

// Update admin settings
router.post('/settings', updateAdminSettings);

export default router;
