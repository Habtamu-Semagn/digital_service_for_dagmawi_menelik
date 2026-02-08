const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const services = await prisma.service.findMany({
        select: { name: true, mode: true }
    });
    console.log(JSON.stringify(services, null, 2));
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
