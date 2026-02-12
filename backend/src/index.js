const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const prisma = require('./utils/prisma');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const queueRoutes = require('./routes/queueRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Port listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
