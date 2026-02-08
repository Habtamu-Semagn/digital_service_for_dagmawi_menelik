const prisma = require('../utils/prisma');

const bookAppointment = async (req, res) => {
    const { serviceId, date, timeSlot } = req.body;
    const userId = req.user.id;

    try {
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                userId,
                date: new Date(date),
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
                date: new Date(date),
                timeSlot,
                status: 'SCHEDULED'
            },
            include: { service: true }
        });

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
                service: { sectorId },
                status: 'SCHEDULED'
            },
            include: { user: true, service: true },
            orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }]
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sector appointments', error: error.message });
    }
};

module.exports = { bookAppointment, getMyAppointments, getAvailableSlots, getSectorAppointments };
