const prisma = require('../utils/prisma');

const takeTicket = async (req, res) => {
    const { serviceId } = req.body;
    const userId = req.user.id;

    try {
        // Check if user already has an active ticket for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingTicket = await prisma.queue.findFirst({
            where: {
                userId,
                createdAt: { gte: startOfDay },
                status: { notIn: ['COMPLETED', 'REJECTED'] }
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'You already have an active queue ticket' });
        }

        // Get the next ticket number for the day
        const ticketCount = await prisma.queue.count({
            where: {
                serviceId,
                createdAt: { gte: startOfDay }
            }
        });

        const ticketNumber = ticketCount + 1;

        const queue = await prisma.queue.create({
            data: {
                ticketNumber,
                userId,
                serviceId,
                status: 'WAITING'
            },
            include: { service: true }
        });

        res.status(201).json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to take ticket', error: error.message });
    }
};

const getMyQueueStatus = async (req, res) => {
    const userId = req.user.id;
    try {
        const queue = await prisma.queue.findFirst({
            where: { userId, status: { in: ['WAITING', 'CALLING', 'PROCESSING'] } },
            include: { service: { include: { sector: true } } },
            orderBy: { createdAt: 'desc' }
        });

        if (!queue) return res.json(null);

        const peopleAhead = await prisma.queue.count({
            where: {
                serviceId: queue.serviceId,
                status: 'WAITING',
                createdAt: { lt: queue.createdAt }
            }
        });

        res.json({ ...queue, peopleAhead });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch queue status', error: error.message });
    }
};

const getQueueList = async (req, res) => {
    const { sectorId } = req.params;
    try {
        const queues = await prisma.queue.findMany({
            where: {
                service: { sectorId },
                status: { notIn: ['COMPLETED', 'REJECTED'] }
            },
            include: { user: true, service: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(queues);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch queue list', error: error.message });
    }
};

const updateQueueStatus = async (req, res) => {
    const { queueId } = req.params;
    const { status } = req.body;
    const officerId = req.user.id;

    try {
        const queue = await prisma.queue.update({
            where: { id: queueId },
            data: { status, officerId }
        });
        res.json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update queue status', error: error.message });
    }
};

const registerWalkIn = async (req, res) => {
    const { name, phoneNumber, serviceId } = req.body;
    const officerId = req.user.id;

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // For walk-ins, we can either use an existing user or create a temporary one
        // Let's see if user exists by phone
        let user = await prisma.user.findUnique({ where: { phoneNumber } });

        if (!user) {
            // Create a placeholder user for walk-in
            user = await prisma.user.create({
                data: {
                    name,
                    phoneNumber,
                    password: 'WALKIN_USER', // Dummy password
                    role: 'CITIZEN'
                }
            });
        }

        // Check if user already has an active ticket today
        const existingTicket = await prisma.queue.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: startOfDay },
                status: { notIn: ['COMPLETED', 'REJECTED'] }
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'User already has an active ticket today' });
        }

        const ticketCount = await prisma.queue.count({
            where: { serviceId, createdAt: { gte: startOfDay } }
        });

        const queue = await prisma.queue.create({
            data: {
                ticketNumber: ticketCount + 1,
                userId: user.id,
                serviceId,
                officerId,
                status: 'WAITING'
            },
            include: { service: true, user: true }
        });

        res.status(201).json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to register walk-in', error: error.message });
    }
};

const getMyQueueHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const history = await prisma.queue.findMany({
            where: { userId },
            include: { service: { include: { sector: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch queue history', error: error.message });
    }
};

const cancelTicket = async (req, res) => {
    const { queueId } = req.params;
    const userId = req.user.id;

    try {
        const queue = await prisma.queue.findFirst({
            where: { id: queueId, userId }
        });

        if (!queue) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (queue.status !== 'WAITING') {
            return res.status(400).json({ message: 'Only waiting tickets can be cancelled' });
        }

        await prisma.queue.delete({
            where: { id: queueId }
        });

        res.json({ message: 'Ticket cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel ticket', error: error.message });
    }
};

const getQueueById = async (req, res) => {
    const { queueId } = req.params;
    const userId = req.user.id;

    try {
        const queue = await prisma.queue.findFirst({
            where: { id: queueId, userId },
            include: { service: { include: { sector: true } } }
        });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: 'Queue not found'
            });
        }

        const peopleAhead = await prisma.queue.count({
            where: {
                serviceId: queue.serviceId,
                status: 'WAITING',
                createdAt: { lt: queue.createdAt }
            }
        });

        res.json({
            success: true,
            data: { ...queue, peopleAhead }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch queue',
            error: error.message
        });
    }
};

module.exports = { takeTicket, getMyQueueStatus, getQueueList, updateQueueStatus, registerWalkIn, cancelTicket, getMyQueueHistory, getQueueById };

