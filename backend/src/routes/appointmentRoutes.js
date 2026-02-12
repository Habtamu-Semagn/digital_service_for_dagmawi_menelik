const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// Web format endpoints
router.post('/book', authenticateToken, appointmentController.bookAppointment);
router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.get('/slots/:serviceId/:date', authenticateToken, appointmentController.getAvailableSlots);
router.get('/sector/:sectorId', authenticateToken, appointmentController.getSectorAppointments);

// Mobile format aliases (for backward compatibility)
router.post('/', authenticateToken, appointmentController.bookAppointment); // Alias for /book
router.get('/my', authenticateToken, appointmentController.getMyAppointments); // Alias for /my-appointments
router.get('/slots', authenticateToken, appointmentController.getAvailableSlotsQuery); // Query param version
router.delete('/:appointmentId', authenticateToken, appointmentController.cancelAppointment); // New endpoint

module.exports = router;
