const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const register = async (req, res) => {
    const { name, phoneNumber, identificationNumber, password, role } = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber },
                    { identificationNumber: identificationNumber || null }
                ].filter(v => v.identificationNumber !== null || v.phoneNumber)
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this phone number or ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                phoneNumber,
                identificationNumber: identificationNumber || null,
                password: hashedPassword,
                role: role || 'CITIZEN'
            }
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};

const login = async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { phoneNumber }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { name, phoneNumber } = req.body;
    const userId = req.user.id;

    try {
        // Check if phone number is taken by another user
        if (phoneNumber) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phoneNumber,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, phoneNumber },
            select: { id: true, name: true, role: true, phoneNumber: true }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};

module.exports = { register, login, updateProfile, changePassword };
