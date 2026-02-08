const prisma = require('./src/utils/prisma');

async function main() {
    try {
        console.log("--- SECTORS ---");
        const sectors = await prisma.serviceSector.findMany({
            include: { services: true }
        });
        sectors.forEach(s => {
            console.log(`Sector: ${s.name} (${s.id})`);
            s.services.forEach(svc => console.log(`  - Service: ${svc.name} (${svc.id}) [${svc.mode}]`));
        });

        console.log("\n--- QUEUES ---");
        const queues = await prisma.queue.findMany({
            include: { service: { include: { sector: true } } }
        });
        queues.forEach(q => {
            console.log(`Queue #${q.ticketNumber} - Service: ${q.service.name} - Sector: ${q.service.sector.name} (${q.service.sectorId})`);
        });

        console.log("\n--- APPOINTMENTS ---");
        const appointments = await prisma.appointment.findMany({
            include: { service: { include: { sector: true } } }
        });
        appointments.forEach(a => {
            console.log(`Appt for ${a.date} - Service: ${a.service.name} - Sector: ${a.service.sector.name} (${a.service.sectorId})`);
        });

        console.log("\n--- SERVICE REQUESTS ---");
        const requests = await prisma.serviceRequest.findMany({
            include: { service: { include: { sector: true } } }
        });
        requests.forEach(r => {
            console.log(`Request #${r.id} - Service: ${r.service.name} - Sector: ${r.service.sector.name} (${r.service.sectorId})`);
        });

    } catch (err) {
        console.error("Execution error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
