const prisma = require('../utils/prisma');

const getStats = async (req, res) => {
    try {
        const [users, queues, sectors] = await Promise.all([
            prisma.user.count({ where: { role: 'CITIZEN' } }),
            prisma.queue.count(),
            prisma.serviceSector.count()
        ]);
        res.json({ users, queues, sectors, uptime: '99.9%' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                role: true,
                identificationNumber: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
    }
};

module.exports = { getStats, getUsers, getLogs };
