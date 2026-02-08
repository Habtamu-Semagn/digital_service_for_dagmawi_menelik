const prisma = require('./src/utils/prisma');

async function main() {
    const users = await prisma.user.findMany({
        select: {
            name: true,
            phoneNumber: true,
            role: true
        }
    });
    console.log('Current Users:');
    console.table(users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
