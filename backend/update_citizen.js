const prisma = require('./src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.update({
            where: { phoneNumber: '0909090909' },
            data: { password: hashedPassword }
        });
        console.log('Citizen (0909090909) password updated to password123');
    } catch (error) {
        console.error('Error updating citizen password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
