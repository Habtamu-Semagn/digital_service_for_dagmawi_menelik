const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Web format endpoints
router.post('/take', authenticateToken, queueController.takeTicket);
router.get('/my-status', authenticateToken, queueController.getMyQueueStatus);
router.get('/my-history', authenticateToken, queueController.getMyQueueHistory);
router.get('/list/:sectorId', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'ADMIN'), queueController.getQueueList);
router.patch('/status/:queueId', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK'), queueController.updateQueueStatus);
router.delete('/:queueId', authenticateToken, queueController.cancelTicket);
router.post('/register-walkin', authenticateToken, authorizeRoles('HELPDESK', 'ADMIN'), queueController.registerWalkIn);

// Mobile format aliases (for backward compatibility)
router.post('/', authenticateToken, queueController.takeTicket); // Alias for /take
router.get('/active', authenticateToken, queueController.getMyQueueStatus); // Alias for /my-status
router.get('/:queueId', authenticateToken, queueController.getQueueById); // New endpoint for mobile

module.exports = router;
