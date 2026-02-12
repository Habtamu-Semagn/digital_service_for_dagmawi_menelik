const prisma = require('../utils/prisma');

const logAction = async (userId, action, details) => {
    try {
        await prisma.systemLog.create({
            data: { action, details, userId }
        });
    } catch (err) {
        console.error('Failed to create system log', err);
    }
};

const getSectors = async (req, res) => {
    try {
        const sectors = await prisma.serviceSector.findMany({
            include: { services: true }
        });
        res.json(sectors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sectors', error: error.message });
    }
};

const createSector = async (req, res) => {
    const { name, description, icon } = req.body;
    try {
        const sector = await prisma.serviceSector.create({
            data: { name, description, icon }
        });
        await logAction(req.user.id, 'CREATE_SECTOR', `Created sector: ${name}`);
        res.status(201).json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create sector', error: error.message });
    }
};

const createService = async (req, res) => {
    const { name, description, mode, availability, icon, sectorId } = req.body;
    try {
        const service = await prisma.service.create({
            data: { name, description, mode, availability, icon, sectorId }
        });
        await logAction(req.user.id, 'CREATE_SERVICE', `Created service: ${name}`);
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create service', error: error.message });
    }
};

const updateSector = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    try {
        const sector = await prisma.serviceSector.update({
            where: { id },
            data: { name, description, icon }
        });
        await logAction(req.user.id, 'UPDATE_SECTOR', `Updated sector: ${name}`);
        res.json(sector);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update sector', error: error.message });
    }
};

const deleteSector = async (req, res) => {
    const { id } = req.params;
    try {
        const sector = await prisma.serviceSector.findUnique({ where: { id } });
        await prisma.serviceSector.delete({ where: { id } });
        await logAction(req.user.id, 'DELETE_SECTOR', `Deleted sector: ${sector.name}`);
        res.json({ message: 'Sector deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete sector', error: error.message });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, mode, availability, icon } = req.body;
    try {
        const service = await prisma.service.update({
            where: { id },
            data: { name, description, mode, availability, icon }
        });
        await logAction(req.user.id, 'UPDATE_SERVICE', `Updated service: ${name}`);
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update service', error: error.message });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await prisma.service.findUnique({ where: { id } });
        await prisma.service.delete({ where: { id } });
        await logAction(req.user.id, 'DELETE_SERVICE', `Deleted service: ${service.name}`);
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
};

const getServiceById = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { sector: true }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service',
            error: error.message
        });
    }
};

module.exports = { getSectors, createSector, createService, updateSector, deleteSector, updateService, deleteService, getServiceById };

