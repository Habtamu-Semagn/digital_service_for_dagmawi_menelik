const prisma = require('../utils/prisma');

const bookAppointment = async (req, res) => {
    const { serviceId, date, appointmentDate, timeSlot } = req.body;
    // Mobile app sends appointmentDate, web might send date
    const bookingDate = date || appointmentDate;
    const userId = req.user.id;

    try {
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                userId,
                date: new Date(bookingDate),
                status: 'SCHEDULED'
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'You already have a scheduled appointment for this day' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                date: new Date(bookingDate),
                timeSlot,
                status: 'PENDING'
            },
            include: { service: true }
        });

        // Create notification for user
        const notificationModel = prisma.notification || prisma.notifications;
        if (notificationModel) {
            await notificationModel.create({
                data: {
                    userId,
                    title: 'Appointment Request Received',
                    message: `Your appointment request for ${appointment.service.name} has been received and is pending officer approval.`,
                    type: 'APPOINTMENT_REQUESTED',
                    relatedId: appointment.id
                }
            });
        }

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to book appointment', error: error.message });
    }
};

const getMyAppointments = async (req, res) => {
    const userId = req.user.id;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: { service: { include: { sector: true } } },
            orderBy: { date: 'asc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
};

const getAvailableSlots = async (req, res) => {
    const { serviceId, date } = req.params;
    const slots = ["08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", "14:00 - 15:00", "15:00 - 16:30"];

    try {
        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                serviceId,
                date: new Date(date),
                status: 'SCHEDULED'
            },
            select: { timeSlot: true }
        });

        const bookedSlots = bookedAppointments.map(a => a.timeSlot);
        // Simple logic: allow up to 3 people per slot (mocking capacity)
        const slotCounts = bookedSlots.reduce((acc, slot) => {
            acc[slot] = (acc[slot] || 0) + 1;
            return acc;
        }, {});

        const availableSlots = slots.filter(slot => (slotCounts[slot] || 0) < 3);

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch slots', error: error.message });
    }
};

const getSectorAppointments = async (req, res) => {
    const { sectorId } = req.params;
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                service: { sectorId }
            },
            include: { user: true, service: true },
            orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }]
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sector appointments', error: error.message });
    }
};

const getAvailableSlotsQuery = async (req, res) => {
    // Support query params for mobile app
    const { serviceId, date } = req.query;
    const slots = ["08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", "14:00 - 15:00", "15:00 - 16:30"];

    try {
        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                serviceId,
                date: new Date(date),
                status: 'SCHEDULED'
            },
            select: { timeSlot: true }
        });

        const bookedSlots = bookedAppointments.map(a => a.timeSlot);
        const slotCounts = bookedSlots.reduce((acc, slot) => {
            acc[slot] = (acc[slot] || 0) + 1;
            return acc;
        }, {});

        const availableSlots = slots.map(slot => ({
            slot,
            isAvailable: (slotCounts[slot] || 0) < 3
        }));

        res.json({
            success: true,
            data: availableSlots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch slots',
            error: error.message
        });
    }
};

const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    try {
        const appointment = await prisma.appointment.findFirst({
            where: { id: appointmentId, userId }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (appointment.status !== 'SCHEDULED') {
            return res.status(400).json({
                success: false,
                message: 'Only scheduled appointments can be cancelled'
            });
        }

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CANCELLED' }
        });

        res.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
};

const updateAppointmentStatus = async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
            include: { service: true, user: true }
        });

        // Notify user if status changed to SCHEDULED, COMPLETED, CANCELLED, or REJECTED
        const notificationModel = prisma.notification || prisma.notifications;
        if (notificationModel) {
            let title = '';
            let message = '';
            let type = '';

            switch (status) {
                case 'SCHEDULED':
                    title = 'Appointment Approved';
                    message = `Your appointment for ${appointment.service.name} has been approved for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`;
                    type = 'APPOINTMENT_CONFIRMED';
                    break;
                case 'COMPLETED':
                    title = 'Appointment Completed';
                    message = `Your appointment for ${appointment.service.name} has been marked as completed.`;
                    type = 'APPOINTMENT_COMPLETED';
                    break;
                case 'CANCELLED':
                    title = 'Appointment Cancelled';
                    message = `Your appointment for ${appointment.service.name} has been cancelled.`;
                    type = 'APPOINTMENT_CANCELLED';
                    break;
                case 'REJECTED':
                    title = 'Appointment Rejected';
                    message = `Your appointment for ${appointment.service.name} has been rejected.`;
                    type = 'APPOINTMENT_REJECTED';
                    break;
            }

            if (title) {
                await notificationModel.create({
                    data: {
                        userId: appointment.userId,
                        title,
                        message,
                        type,
                        relatedId: appointment.id
                    }
                });
            }
        }

        res.json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment status',
            error: error.message
        });
    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    getAvailableSlots,
    getSectorAppointments,
    getAvailableSlotsQuery,
    cancelAppointment,
    updateAppointmentStatus
};

