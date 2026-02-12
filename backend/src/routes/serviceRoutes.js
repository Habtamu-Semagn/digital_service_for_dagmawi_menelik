const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/sectors', serviceController.getSectors);
router.post('/sectors', authenticateToken, authorizeRoles('ADMIN'), serviceController.createSector);
router.patch('/sectors/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.updateSector);
router.delete('/sectors/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.deleteSector);

router.post('/services', authenticateToken, authorizeRoles('ADMIN'), serviceController.createService);
router.patch('/services/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.updateService);
router.delete('/services/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.deleteService);

// Mobile endpoint - get service by ID
router.get('/:serviceId', authenticateToken, serviceController.getServiceById);

module.exports = router;
