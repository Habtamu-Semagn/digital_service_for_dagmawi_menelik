const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/book', authenticateToken, appointmentController.bookAppointment);
router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.get('/slots/:serviceId/:date', authenticateToken, appointmentController.getAvailableSlots);
router.get('/sector/:sectorId', authenticateToken, appointmentController.getSectorAppointments);

module.exports = router;
