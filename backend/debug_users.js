const prisma = require('./src/utils/prisma');

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                phoneNumber: {
                    in: ['0911111111', '0900000000', '0909090909']
                }
            }
        });

        console.log('DEBUG_START');
        console.log(JSON.stringify(users, null, 2));
        console.log('DEBUG_END');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
