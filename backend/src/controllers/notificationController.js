const prisma = require('../utils/prisma');

const getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    try {
        const notification = await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });

        if (notification.count === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};

module.exports = { getNotifications, markAsRead };
