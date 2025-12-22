import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getUserSettings, updateUserSettings } from '../controllers/userSettingsController.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getUserSettings);
router.post('/', updateUserSettings);

export default router;
