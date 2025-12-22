import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { saveChart, getUserCharts, deleteChart } from '../controllers/chartController.js';

const router = express.Router();

router.use(authenticateJWT);

// Save a new chart
router.post('/', saveChart);

// Get charts for logged-in user
router.get('/', getUserCharts);

// Delete a chart by ID
router.delete('/:id', deleteChart);

export default router;
